const mongoose = require("mongoose");
const { ORDER_STATUSES } = require("../config");

const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    size: { type: String, default: "" },
    color: { type: String, default: "" },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const historySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    // Browser har checkout ke liye ek random key bhejta hai. Network atakne par retry
    // ho to bhi ek hi order banta hai (double order nahi).
    idempotencyKey: { type: String, unique: true, sparse: true },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, default: "", trim: true, lowercase: true },
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      notes: { type: String, default: "", trim: true },
    },
    items: { type: [itemSchema], required: true },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentMethod: { type: String, default: "COD" },
    status: { type: String, enum: ORDER_STATUSES, default: "Pending" },
    statusHistory: { type: [historySchema], default: [] },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
