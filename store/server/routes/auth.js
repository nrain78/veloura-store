const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Constant-time comparison (hash karke taake length leak na ho)
function safeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

const DEFAULT_PASSWORD = "admin12345";

// POST /api/auth/login  (sirf admin)
router.post("/login", (req, res) => {
  const isProd = process.env.NODE_ENV === "production";

  // Live server par default ya khali credentials se login band
  if (
    isProd &&
    (!process.env.ADMIN_EMAIL ||
      !process.env.ADMIN_PASSWORD ||
      process.env.ADMIN_PASSWORD === DEFAULT_PASSWORD)
  ) {
    return res.status(503).json({
      message: "Admin login is not configured. Set a strong ADMIN_EMAIL and ADMIN_PASSWORD on the server.",
    });
  }

  const { email, password } = req.body || {};
  const adminEmail = process.env.ADMIN_EMAIL || "admin@veloura.com";
  const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;

  const emailOk = safeEqual(String(email || "").toLowerCase(), adminEmail.toLowerCase());
  const passOk = safeEqual(password || "", adminPassword);

  if (!email || !password || !emailOk || !passOk) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = jwt.sign({ role: "admin", email: adminEmail }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.json({ token });
});

module.exports = router;
