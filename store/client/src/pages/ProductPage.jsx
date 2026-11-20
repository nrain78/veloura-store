import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { useProduct } from "../catalog.js";
import ProductImage from "../components/ProductImage.jsx";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice } from "../config.js";

export default function ProductPage() {
  const { slug } = useParams();
  const cart = useCart();
  const { product, status, offline } = useProduct(slug);

  const [pickedColor, setPickedColor] = useState(null); // color ka naam
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setPickedColor(null);
    setSize("");
    setQty(1);
    setError("");
    setAdded(false);
  }, [slug]);

  if (status === "loading") {
    return <div className="container page"><p className="notice">Loading...</p></div>;
  }
  if (!product) {
    return (
      <div className="container page empty-state">
        <h1>{status === "notfound" ? "Product not found" : "Something went wrong"}</h1>
        <p>
          {status === "notfound"
            ? "This product may have been removed."
            : "We couldn't reach the store right now. Please try again in a moment."}
        </p>
        <Link to="/shop" className="btn btn--primary">Back to shop</Link>
      </div>
    );
  }

  const color = product.colors?.find((c) => c.name === pickedColor) || product.colors?.[0] || null;
  const sale = product.comparePrice > product.price;
  const soldOut = product.stock <= 0;
  const maxQty = Math.max(1, Math.min(10, product.stock));

  const handleAdd = () => {
    if (offline) {
      setError("The store is still connecting. Please try again in a moment.");
      return;
    }
    if (product.sizes?.length && !size) {
      setError("Please select a size.");
      return;
    }
    setError("");
    cart.add({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      type: product.type,
      imageUrl: product.imageUrl,
      size,
      color: color?.name || "",
      hex: color?.hex || "",
      qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="container page">
      <p className="crumbs">
        <Link to="/shop">Shop</Link> / <Link to={`/shop?category=${product.category}`}>{product.category}</Link> / {product.name}
      </p>

      <div className="pdp">
        <div className="pdp__media">
          <ProductImage product={product} color={color?.hex} />
        </div>

        <div className="pdp__info">
          <h1>{product.name}</h1>
          <p className="price price--lg">
            {formatPrice(product.price)}
            {sale && <s>{formatPrice(product.comparePrice)}</s>}
          </p>
          <p className="pdp__desc">{product.description}</p>

          {product.colors?.length > 0 && (
            <div className="field">
              <label>Color: <strong>{color?.name}</strong></label>
              <div className="swatches">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    title={c.name}
                    aria-label={c.name}
                    className={`swatch ${color?.name === c.name ? "is-active" : ""}`}
                    style={{ background: c.hex }}
                    onClick={() => setPickedColor(c.name)}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="field">
              <label>Size</label>
              <div className="sizes">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`size ${size === s ? "is-active" : ""}`}
                    onClick={() => {
                      setSize(s);
                      setError("");
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="field">
            <label>Quantity</label>
            <div className="qty">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))}>+</button>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            className="btn btn--primary btn--block"
            onClick={handleAdd}
            disabled={soldOut || offline}
          >
            {soldOut
              ? "Sold out"
              : offline
              ? "Connecting to store..."
              : added
              ? (<><FiCheck /> Added to cart</>)
              : "Add to cart"}
          </button>

          {offline && !soldOut && (
            <p className="hint">The store is waking up. Ordering will unlock automatically in a moment.</p>
          )}

          {added && (
            <Link to="/cart" className="link-arrow pdp__go">View cart →</Link>
          )}

          <ul className="pdp__perks">
            <li>Cash on Delivery available</li>
            <li>Free shipping over Rs 5,000</li>
            <li>Easy 7-day exchange</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
