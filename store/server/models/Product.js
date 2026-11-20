const mongoose = require("mongoose");
const { CATEGORIES, TYPES } = require("../config");

const colorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    hex: { type: String, default: "#cccccc" },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "", trim: true },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, default: 0, min: 0 }, // purani qeemat (cut price)
    category: { type: String, required: true, enum: CATEGORIES },
    type: { type: String, required: true, enum: TYPES }, // illustration ke liye
    sizes: [{ type: String, trim: true }],
    colors: [colorSchema],
    imageUrl: { type: String, default: "", trim: true }, // asli photo ka link
    stock: { type: Number, default: 50, min: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
