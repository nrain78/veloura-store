import axios from "axios";

const TOKEN_KEY = "veloura_admin_token";

export const adminToken = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* ignore */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

// Local mein "/api" (vite proxy). Live karte waqt client/.env mein VITE_API_URL set karein,
// jaise https://your-backend.onrender.com/api
export const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

// Free hosting par soya hua server jagne mein takreeban ek minute leta hai, isliye lamba timeout.
const api = axios.create({ baseURL: API_URL, timeout: 70000 });

api.interceptors.request.use((config) => {
  const token = adminToken.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getError = (err, fallback = "Something went wrong. Please try again.") => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (!err?.response) {
    return "We couldn't reach the store right now. Please check your internet and try again in a moment.";
  }
  return fallback;
};

// Network ka masla ya server abhi jaag raha ho: dobara koshish karna theek hai
const isTransient = (err) =>
  !err.response || [502, 503, 504].includes(err.response.status);

// POST jo atakne par khud dobara koshish kare. Order ke saath idempotencyKey jati hai,
// isliye retry se double order nahi banta.
export async function postWithRetry(url, data, { retries = 2, delayMs = 4000 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await api.post(url, data);
    } catch (err) {
      lastErr = err;
      if (!isTransient(err) || attempt === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }
  throw lastErr;
}

export default api;
