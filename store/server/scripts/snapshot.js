// Products ki ek static copy client/public/products-snapshot.json mein likhta hai.
//   npm run snapshot
// Backend so raha ho ya band ho, website ye copy turant dikha deti hai (sirf dekhne ke liye).
// Frontend deploy karne se pehle ye chalate rahein taake copy taza rahe.
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const fs = require("fs");
const mongoose = require("mongoose");
const Product = require("../models/Product");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/veloura_store", {
      serverSelectionTimeoutMS: 15000,
    });

    const products = await Product.find().sort({ createdAt: -1 }).lean();
    const out = products.map((p) => ({
      _id: String(p._id),
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      comparePrice: p.comparePrice,
      category: p.category,
      type: p.type,
      sizes: p.sizes,
      colors: p.colors,
      imageUrl: p.imageUrl,
      stock: p.stock,
      featured: p.featured,
    }));

    const dir = path.join(__dirname, "..", "..", "client", "public");
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, "products-snapshot.json");
    fs.writeFileSync(file, JSON.stringify(out));
    console.log(`Snapshot saved: ${file} (${out.length} products)`);
  } catch (err) {
    console.error("Snapshot failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
