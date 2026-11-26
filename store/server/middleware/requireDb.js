const { connectDb } = require("../db");

// Database se judne ka intezar karta hai. Na jud paye to saaf 503 jawab (500 nahi).
module.exports = async function requireDb(req, res, next) {
  try {
    await connectDb();
    next();
  } catch (err) {
    console.error("Database unavailable:", err.message);
    res.status(503).json({
      message: "The store is reconnecting to its database. Please try again in a few seconds.",
    });
  }
};
