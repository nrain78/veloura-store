const mongoose = require("mongoose");

// Serverless (Vercel) mein process har request par naya nahi banta, ek hi instance kai requests
// sambhalta hai. Isliye connection ko global mein cache karte hain taake har request naya
// connection na khole (Atlas free cluster ki connection limit hoti hai).
if (!global.__mongoConn) global.__mongoConn = { promise: null };
const cache = global.__mongoConn;

function connectDb() {
  const state = mongoose.connection.readyState;
  if (state === 1) return Promise.resolve(mongoose);

  // Pehle connect ho chuka tha aur ab toot gaya: purana promise bekaar hai, naya connect karo.
  // (Jo connect abhi chal raha hai usay nahi chheda jata.)
  if (state === 0 && cache.promise && cache.connected) {
    cache.promise = null;
    cache.connected = false;
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/veloura_store", {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
      })
      .then((m) => {
        cache.connected = true;
        return m;
      })
      .catch((err) => {
        cache.promise = null; // agli request dobara koshish kare
        cache.connected = false;
        throw err;
      });
  }
  return cache.promise;
}

module.exports = { connectDb };
