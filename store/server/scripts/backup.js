// Poore database ki copy (products + orders) JSON file mein.
//   npm run backup
// File server/backups/ mein banti hai. Isme customers ka naam, phone aur address hota hai,
// isliye isay private rakhein (GitHub par upload na karein).
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const fs = require("fs");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/veloura_store", {
      serverSelectionTimeoutMS: 15000,
    });

    const [products, orders] = await Promise.all([Product.find().lean(), Order.find().lean()]);

    const dir = path.join(__dirname, "..", "backups");
    fs.mkdirSync(dir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const file = path.join(dir, `backup-${stamp}.json`);

    fs.writeFileSync(
      file,
      JSON.stringify({ exportedAt: new Date().toISOString(), products, orders }, null, 2)
    );
    console.log(`Backup saved: ${file}`);
    console.log(`${products.length} products, ${orders.length} orders`);
  } catch (err) {
    console.error("Backup failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
