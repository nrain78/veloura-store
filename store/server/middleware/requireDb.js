const mongoose = require("mongoose");

// Database connected na ho to saaf 503 jawab do (10 second latka kar 500 nahi).
module.exports = function requireDb(req, res, next) {
  if (mongoose.connection.readyState === 1) return next();
  res.status(503).json({
    message: "The store is reconnecting to its database. Please try again in a few seconds.",
  });
};
