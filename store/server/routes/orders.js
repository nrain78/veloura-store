const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const adminAuth = require("../middleware/adminAuth");
const rateLimit = require("../middleware/rateLimit");
const { notifyNewOrder } = require("../utils/notify");
const { SHIPPING_FEE, FREE_SHIPPING_MIN, ORDER_STATUSES } = require("../config");

const router = express.Router();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const keyRegex = /^[A-Za-z0-9_-]{8,64}$/;

const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: "Too many orders from this connection. Please try again later.",
});
const trackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many attempts. Please try again in a few minutes.",
});

const bad = (res, message) => res.status(400).json({ message });
const digits = (s) => String(s || "").replace(/\D/g, "");

function makeOrderNumber() {
  const rand = crypto.randomBytes(1).toString("hex").toUpperCase();
  return "VL-" + Date.now().toString(36).toUpperCase() + rand;
}

const publicOrder = (o) => ({
  orderNumber: o.orderNumber,
  subtotal: o.subtotal,
  shipping: o.shipping,
  total: o.total,
  items: o.items,
  customer: { name: o.customer.name, city: o.customer.city },
});

async function releaseStock(reserved) {
  for (const [productId, qty] of reserved) {
    await Product.updateOne({ _id: productId }, { $inc: { stock: qty } });
  }
}

// POST /api/orders  (customer, login ki zaroorat nahi)
// Qeematein hamesha database se li jati hain, client ki bheji hui nahi.
router.post("/", createLimiter, async (req, res, next) => {
  const reserved = []; // [productId, qty]: stock jo is request ne rok liya hai

  try {
    const body = req.body || {};
    const customer = body.customer || {};
    const items = body.items;

    // Same request dobara aaye (retry) to purana order hi wapas do
    let idempotencyKey;
    if (body.idempotencyKey !== undefined && body.idempotencyKey !== null && body.idempotencyKey !== "") {
      if (typeof body.idempotencyKey !== "string" || !keyRegex.test(body.idempotencyKey)) {
        return bad(res, "Invalid request key.");
      }
      idempotencyKey = body.idempotencyKey;
      const existing = await Order.findOne({ idempotencyKey });
      if (existing) return res.status(200).json(publicOrder(existing));
    }

    const name = String(customer.name || "").trim().slice(0, 100);
    const phone = String(customer.phone || "").trim().slice(0, 30);
    const email = String(customer.email || "").trim().toLowerCase().slice(0, 120);
    const address = String(customer.address || "").trim().slice(0, 300);
    const city = String(customer.city || "").trim().slice(0, 80);
    const notes = String(customer.notes || "").trim().slice(0, 500);

    if (!name || !phone || !address || !city) {
      return bad(res, "Please fill in your name, phone, address and city.");
    }
    if (digits(phone).length < 10) {
      return bad(res, "Please enter a valid phone number.");
    }
    if (email && !emailRegex.test(email)) {
      return bad(res, "Please enter a valid email address.");
    }
    if (!Array.isArray(items) || items.length === 0 || items.length > 30) {
      return bad(res, "Your cart is empty.");
    }

    const orderItems = [];
    const used = new Map(); // productId -> total qty
    let subtotal = 0;

    for (const it of items) {
      if (!it || typeof it !== "object") return bad(res, "Invalid item in cart.");

      const qty = Number.parseInt(it.qty, 10);
      if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
        return bad(res, "Invalid quantity.");
      }
      if (!mongoose.isValidObjectId(it.productId)) {
        return bad(res, "Invalid product in cart.");
      }

      const product = await Product.findById(it.productId);
      if (!product) {
        return bad(res, "A product in your cart is no longer available.");
      }

      const size = String(it.size || "");
      const color = String(it.color || "");

      if (product.sizes.length && !product.sizes.includes(size)) {
        return bad(res, `Please choose a valid size for ${product.name}.`);
      }
      if (product.colors.length && !product.colors.some((c) => c.name === color)) {
        return bad(res, `Please choose a valid color for ${product.name}.`);
      }

      const key = String(product._id);
      const totalQty = (used.get(key) || 0) + qty;
      if (product.stock < totalQty) {
        return bad(
          res,
          product.stock > 0
            ? `Sorry, only ${product.stock} left of ${product.name}.`
            : `Sorry, ${product.name} is sold out.`
        );
      }
      used.set(key, totalQty);

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        size,
        color,
        qty,
      });
      subtotal += product.price * qty;
    }

    // Stock atomically rok lo. Do log ek saath aakhri piece order karein to sirf ek ko milta hai.
    for (const [productId, qty] of used) {
      const r = await Product.updateOne(
        { _id: productId, stock: { $gte: qty } },
        { $inc: { stock: -qty } }
      );
      if (r.modifiedCount !== 1) {
        await releaseStock(reserved);
        reserved.length = 0;
        const item = orderItems.find((i) => String(i.product) === productId);
        return bad(res, `Sorry, ${item ? item.name : "an item"} just sold out or has less stock than you asked for.`);
      }
      reserved.push([productId, qty]);
    }

    const shipping = subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
    const total = subtotal + shipping;

    let order = null;
    for (let attempt = 0; attempt < 3 && !order; attempt++) {
      try {
        order = await Order.create({
          orderNumber: makeOrderNumber(),
          ...(idempotencyKey ? { idempotencyKey } : {}),
          customer: { name, phone, email, address, city, notes },
          items: orderItems,
          subtotal,
          shipping,
          total,
          paymentMethod: "COD",
          status: "Pending",
          statusHistory: [{ status: "Pending" }],
        });
      } catch (err) {
        if (err && err.code === 11000) {
          if (idempotencyKey && err.keyPattern && err.keyPattern.idempotencyKey) {
            // Wahi request ek saath do baar pahunchi: pehla order wapas bhej do
            await releaseStock(reserved);
            reserved.length = 0;
            const existing = await Order.findOne({ idempotencyKey });
            if (existing) return res.status(200).json(publicOrder(existing));
            throw err;
          }
          if (err.keyPattern && err.keyPattern.orderNumber) continue; // naya number try karo
        }
        throw err;
      }
    }
    if (!order) throw new Error("Could not create order");

    reserved.length = 0; // order ban gaya, stock wapas nahi karna

    // Order save ho chuka hai. Notification background mein, jawab ko nahi rokti.
    notifyNewOrder(order.toObject());

    res.status(201).json(publicOrder(order));
  } catch (err) {
    try {
      await releaseStock(reserved);
    } catch (e) {
      console.error("Could not release stock after failed order:", e.message);
    }
    if (err.name === "ValidationError") return bad(res, err.message);
    next(err);
  }
});

// GET /api/orders/track?orderNumber=&phone=  (customer: apna order dekhne ke liye)
router.get("/track", trackLimiter, async (req, res, next) => {
  try {
    const orderNumber = String(req.query.orderNumber || "").trim().toUpperCase();
    const phone = digits(req.query.phone);

    if (!orderNumber || phone.length < 10) {
      return bad(res, "Please enter your order number and the phone number you used.");
    }

    const order = await Order.findOne({ orderNumber });
    const match = order && digits(order.customer.phone).slice(-10) === phone.slice(-10);
    if (!match) {
      return res.status(404).json({ message: "We couldn't find an order with those details." });
    }

    res.json({
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      statusHistory: order.statusHistory,
      items: order.items.map((i) => ({
        name: i.name,
        qty: i.qty,
        size: i.size,
        color: i.color,
        price: i.price,
      })),
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      paymentMethod: order.paymentMethod,
      city: order.customer.city,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders  (admin)
router.get("/", adminAuth, async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(300);
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/export  (admin: saare orders, backup/CSV ke liye)
router.get("/export", adminAuth, async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orders/:id/status  (admin)
router.patch("/:id/status", adminAuth, async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!ORDER_STATUSES.includes(status)) return bad(res, "Invalid status.");
    if (!mongoose.isValidObjectId(req.params.id)) return bad(res, "Invalid order id.");

    const current = await Order.findById(req.params.id);
    if (!current) return res.status(404).json({ message: "Order not found" });
    if (current.status === status) return res.json(current);
    if (current.status === "Cancelled") {
      return bad(res, "Cancelled orders can't be reopened. Please ask the customer to place a new order.");
    }

    // Filter mein purana status: do admin ek saath badlein to sirf ek kamyab hota hai
    const updated = await Order.findOneAndUpdate(
      { _id: current._id, status: current.status },
      { $set: { status }, $push: { statusHistory: { status, at: new Date() } } },
      { new: true }
    );
    if (!updated) {
      return res.status(409).json({ message: "This order was just updated. Please refresh and try again." });
    }

    // Cancel hone par stock wapas
    if (status === "Cancelled") {
      for (const it of updated.items) {
        if (it.product) {
          await Product.updateOne({ _id: it.product }, { $inc: { stock: it.qty } });
        }
      }
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
