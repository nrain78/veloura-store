// Backup file se data wapas database mein (naye cluster mein bhi chalta hai).
//   npm run restore -- backups/backup-XXXX.json
// Jo document pehle se maujood ho wo skip hota hai, kuch overwrite nahi hota.
// Admin panel ki "Download full backup" file bhi isi tarah chalti hai.
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const fs = require("fs");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");

async function restoreCollection(label, Model, docs) {
  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const d of docs) {
    try {
      if (await Model.exists({ _id: d._id })) {
        skipped++;
        continue;
      }
      await new Model(d).save({ timestamps: false }); // purani tareekhein wahi rehti hain
      inserted++;
    } catch (err) {
      failed++;
      console.warn(`  ${label} ${d._id}: ${err.message}`);
    }
  }
  console.log(`${label}: ${inserted} restored, ${skipped} already existed, ${failed} failed`);
}

(async () => {
  const file = process.argv[2];
  if (!file) {
    console.log("Usage: npm run restore -- backups/backup-XXXX.json");
    process.exit(1);
  }

  try {
    const data = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/veloura_store", {
      serverSelectionTimeoutMS: 15000,
    });

    await restoreCollection("products", Product, data.products || []);
    await restoreCollection("orders", Order, data.orders || []);
  } catch (err) {
    console.error("Restore failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
