const express = require("express");
const Product = require("../models/Product");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function uniqueSlug(base) {
  const root = base || "product";
  let slug = root;
  let n = 1;
  while (await Product.exists({ slug })) {
    n += 1;
    slug = `${root}-${n}`;
  }
  return slug;
}

function sendError(err, res, next) {
  if (err.name === "ValidationError" || err.name === "CastError") {
    return res.status(400).json({ message: err.message });
  }
  next(err);
}

// GET /api/products?category=&search=&sort=&featured=
router.get("/", async (req, res, next) => {
  try {
    const { category, search, sort, featured } = req.query;
    const filter = {};

    if (category) filter.category = String(category);
    if (featured === "true") filter.featured = true;
    if (search) {
      const safe = String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(safe, "i");
      filter.$or = [{ name: rx }, { description: rx }];
    }

    const sorts = {
      newest: { createdAt: -1 },
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
    };

    const products = await Product.find(filter).sort(sorts[sort] || sorts.newest);
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:slug
router.get("/:slug", async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: String(req.params.slug).toLowerCase() });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// POST /api/products  (admin)
router.post("/", adminAuth, async (req, res, next) => {
  try {
    const body = { ...req.body };
    body.slug = await uniqueSlug(slugify(body.name));
    const product = await Product.create(body);
    res.status(201).json(product);
  } catch (err) {
    sendError(err, res, next);
  }
});

// PUT /api/products/:id  (admin)
router.put("/:id", adminAuth, async (req, res, next) => {
  try {
    const body = { ...req.body };
    delete body.slug; // URL na badle
    delete body._id;
    const product = await Product.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    sendError(err, res, next);
  }
});

// DELETE /api/products/:id  (admin)
router.delete("/:id", adminAuth, async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    sendError(err, res, next);
  }
});

module.exports = router;
