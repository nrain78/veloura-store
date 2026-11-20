import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { useProducts } from "../catalog.js";
import ProductCard from "../components/ProductCard.jsx";

const CATEGORIES = ["All", "Men", "Women", "Kids", "Accessories"];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "All";
  const sort = params.get("sort") || "newest";
  const search = params.get("search") || "";

  const [searchInput, setSearchInput] = useState(search);

  const { products, loading, offline, failed } = useProducts({
    category: category === "All" ? undefined : category,
    sort,
    search: search || undefined,
  });

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value && value !== "All" && value !== "newest") next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const onSearch = (e) => {
    e.preventDefault();
    update("search", searchInput.trim());
  };

  // Snapshot mein kuch na mile aur live jawab abhi na aaya ho to "no products" mat dikhao
  const waiting = loading || (offline && !failed && products.length === 0);
  const showError = failed && products.length === 0;

  return (
    <div className="container page">
      <h1 className="page__title">{category === "All" ? "All products" : category}</h1>

      <div className="toolbar">
        <div className="chips">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`chip ${category === c ? "is-active" : ""}`}
              onClick={() => update("category", c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="toolbar__right">
          <form className="search" onSubmit={onSearch}>
            <FiSearch />
            <input
              type="search"
              placeholder="Search products"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>
          <select value={sort} onChange={(e) => update("sort", e.target.value)} aria-label="Sort">
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to high</option>
            <option value="price-desc">Price: High to low</option>
          </select>
        </div>
      </div>

      {waiting && <p className="notice">Loading products...</p>}
      {showError && (
        <p className="notice notice--error">
          Could not load products right now. Please try again in a moment.
        </p>
      )}

      {!waiting && !showError && products.length === 0 && (
        <div className="empty-state">
          <h3>No products found</h3>
          <p>Try a different category or search term.</p>
        </div>
      )}

      <div className="grid-products">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}
