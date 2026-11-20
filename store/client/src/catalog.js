// Products lane ke hooks.
// Pehle static snapshot turant dikhta hai, saath hi asli server se data mangta hai.
// Server jaag jaye to live data snapshot ki jagah le leta hai. Server band ho to
// customer ko khali page nahi dikhta (browse kar sakta hai, order nahi).
import { useEffect, useState } from "react";
import api from "./api.js";
import { filterProducts } from "./utils/filterProducts.js";

let snapshotPromise = null;

function loadSnapshot() {
  if (!snapshotPromise) {
    snapshotPromise = fetch("/products-snapshot.json")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => (Array.isArray(data) ? data : []))
      .catch(() => []);
  }
  return snapshotPromise;
}

export function useProducts(params) {
  const key = JSON.stringify(params || {});
  const [state, setState] = useState({
    products: [],
    loading: true, // abhi kuch bhi nahi aaya
    offline: true, // jo dikh raha hai wo snapshot hai ya kuch nahi
    failed: false, // live request fail ho gayi
  });

  useEffect(() => {
    let cancelled = false;
    let gotLive = false;
    const p = JSON.parse(key);

    setState((s) => ({ ...s, loading: true, failed: false }));

    loadSnapshot().then((snap) => {
      if (cancelled || gotLive) return;
      setState((s) => ({ ...s, products: filterProducts(snap, p), loading: false, offline: true }));
    });

    api
      .get("/products", { params: p })
      .then((res) => {
        gotLive = true;
        if (!cancelled) {
          setState({ products: res.data, loading: false, offline: false, failed: false });
        }
      })
      .catch(() => {
        if (!cancelled) setState((s) => ({ ...s, loading: false, failed: true }));
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return state;
}

export function useProduct(slug) {
  const [state, setState] = useState({ product: null, status: "loading", offline: false });

  useEffect(() => {
    let cancelled = false;
    let settled = false; // live server ne jawab de diya (data ya 404)

    setState({ product: null, status: "loading", offline: false });

    loadSnapshot().then((snap) => {
      if (cancelled || settled) return;
      const found = snap.find((p) => p.slug === slug);
      if (found) setState({ product: found, status: "ok", offline: true });
    });

    api
      .get(`/products/${slug}`)
      .then((res) => {
        settled = true;
        if (!cancelled) setState({ product: res.data, status: "ok", offline: false });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.response?.status === 404) {
          settled = true;
          setState({ product: null, status: "notfound", offline: false });
        } else {
          setState((s) => (s.product ? s : { product: null, status: "error", offline: true }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return state;
}
