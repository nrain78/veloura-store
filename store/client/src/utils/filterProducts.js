// Server ki tarah hi filter/sort, lekin browser mein (snapshot ke liye)
export function filterProducts(list, { category, search, sort, featured } = {}) {
  let out = [...list];

  if (category) out = out.filter((p) => p.category === category);
  if (featured) out = out.filter((p) => p.featured);
  if (search) {
    const q = String(search).toLowerCase();
    out = out.filter(
      (p) =>
        String(p.name || "").toLowerCase().includes(q) ||
        String(p.description || "").toLowerCase().includes(q)
    );
  }

  if (sort === "price-asc") out.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") out.sort((a, b) => b.price - a.price);

  return out;
}
