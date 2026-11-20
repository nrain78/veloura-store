// Simple in-memory rate limiter (koi extra package nahi chahiye).
// Note: server restart par counters reset ho jate hain. Ek instance ke liye kaafi hai.
function rateLimit({ windowMs, max, message = "Too many requests. Please try again later." }) {
  const hits = new Map(); // ip -> { count, resetAt }

  const cleaner = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, Math.min(windowMs, 60 * 1000));
  cleaner.unref();

  return function limiter(req, res, next) {
    const key = req.ip || (req.socket && req.socket.remoteAddress) || "unknown";
    const now = Date.now();

    if (hits.size > 50000) hits.clear(); // memory ki hifazat

    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;

    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - entry.count)));

    if (entry.count > max) {
      res.setHeader("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ message });
    }
    next();
  };
}

module.exports = rateLimit;
