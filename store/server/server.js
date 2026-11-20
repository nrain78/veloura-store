require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const security = require("./middleware/security");
const rateLimit = require("./middleware/rateLimit");
const requireDb = require("./middleware/requireDb");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");

const isProd = process.env.NODE_ENV === "production";

// Live server par secret ke baghair start hi nahi hona chahiye (warna koi jaali admin token bana sakta hai)
if (!process.env.JWT_SECRET) {
  if (isProd) {
    console.error("JWT_SECRET set nahi hai. Production mein server start nahi hoga.");
    process.exit(1);
  }
  process.env.JWT_SECRET = "dev-secret-change-me";
  console.warn("JWT_SECRET set nahi hai. Development secret use ho raha hai.");
}

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/veloura_store";
const PORT = process.env.PORT || 3000;

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1); // Render/Railway proxy ke peeche asli IP (rate limit ke liye)

// CLIENT_URL mein comma se alag kai addresses ho sakte hain
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // origin nahi (uptime monitor, curl) ya list khali ho to allow
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      cb(null, false);
    },
  })
);
app.use(security);
app.use(express.json({ limit: "200kb" }));

// Health check: uptime monitor yahin ping karta hai. Database ko bhi chhoota hai.
app.get("/api/health", async (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  const db = states[mongoose.connection.readyState] || "unknown";
  let ok = false;

  if (mongoose.connection.readyState === 1) {
    try {
      await mongoose.connection.db.admin().ping();
      ok = true;
    } catch {
      ok = false;
    }
  }

  res.status(ok ? 200 : 503).json({
    status: ok ? "ok" : "degraded",
    db,
    uptime: Math.round(process.uptime()),
  });
});

app.use("/api", rateLimit({ windowMs: 60 * 1000, max: 600 }));
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many login attempts. Please try again in 15 minutes.",
  }),
  authRoutes
);
app.use("/api/products", requireDb, productRoutes);
app.use("/api/orders", requireDb, orderRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid request." });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: "Request too large." });
  }
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

// ---------- Database: connect na ho to bhi server zinda rehta hai aur dobara koshish karta hai ----------
let retryTimer = null;

async function connectWithRetry(attempt = 1) {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log("MongoDB connected");
  } catch (err) {
    const waitMs = Math.min(30000, 2000 * attempt);
    console.error(
      `MongoDB connection failed (attempt ${attempt}): ${err.message}. Retrying in ${waitMs / 1000}s...`
    );
    retryTimer = setTimeout(() => connectWithRetry(attempt + 1), waitMs);
  }
}

mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected. Driver reconnect karne ki koshish karega."));
mongoose.connection.on("reconnected", () => console.log("MongoDB reconnected"));
mongoose.connection.on("error", (err) => console.error("MongoDB error:", err.message));

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
connectWithRetry();

// ---------- Optional: free hosting par server ko jagaye rakhna ----------
// SELF_URL=https://your-backend.onrender.com set karein. Behtar tareeqa: bahar se uptime monitor lagana (README dekhein).
const selfUrl = (process.env.SELF_URL || "").replace(/\/$/, "");
if (selfUrl) {
  const pinger = setInterval(() => {
    fetch(`${selfUrl}/api/health`).catch((e) => console.warn("Keep-alive ping failed:", e.message));
  }, 13 * 60 * 1000);
  pinger.unref();
  console.log(`Keep-alive ping enabled for ${selfUrl}`);
}

if (isProd && (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === "admin12345")) {
  console.warn("ADMIN_PASSWORD default ya khali hai. Admin login band rahega jab tak mazboot password set na ho.");
}

// ---------- Saaf band hona ----------
function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  clearTimeout(retryTimer);
  server.close(async () => {
    try {
      await mongoose.connection.close();
    } catch {
      /* ignore */
    }
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => console.error("Unhandled rejection:", reason));
