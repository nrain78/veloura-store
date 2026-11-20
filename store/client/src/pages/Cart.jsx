import { Link, useNavigate } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import { useCart } from "../context/CartContext.jsx";
import ProductImage from "../components/ProductImage.jsx";
import { formatPrice, FREE_SHIPPING_MIN } from "../config.js";

export default function Cart() {
  const { items, setQty, remove, subtotal, shipping, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container page empty-state">
        <h1>Your cart is empty</h1>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="btn btn--primary">Start shopping</Link>
      </div>
    );
  }

  const remaining = FREE_SHIPPING_MIN - subtotal;

  return (
    <div className="container page">
      <h1 className="page__title">Your cart</h1>

      <div className="cart">
        <div className="cart__items">
          {items.map((item) => (
            <div key={item.key} className="cart-item">
              <Link to={`/product/${item.slug}`} className="cart-item__img">
                <ProductImage
                  product={{ name: item.name, type: item.type, imageUrl: item.imageUrl }}
                  color={item.hex}
                />
              </Link>
              <div className="cart-item__info">
                <Link to={`/product/${item.slug}`}><h3>{item.name}</h3></Link>
                <p className="muted">
                  {[item.color, item.size].filter(Boolean).join(" · ")}
                </p>
                <div className="qty qty--sm">
                  <button onClick={() => setQty(item.key, item.qty - 1)}>−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => setQty(item.key, item.qty + 1)}>+</button>
                </div>
              </div>
              <div className="cart-item__right">
                <strong>{formatPrice(item.price * item.qty)}</strong>
                <button
                  className="icon-btn"
                  aria-label="Remove item"
                  onClick={() => remove(item.key)}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="summary">
          <h3>Order summary</h3>
          <div className="summary__row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="summary__row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
          </div>
          {remaining > 0 && (
            <p className="muted small">
              Add {formatPrice(remaining)} more for free shipping.
            </p>
          )}
          <div className="summary__row summary__total">
            <span>Total</span><span>{formatPrice(total)}</span>
          </div>
          <button className="btn btn--primary btn--block" onClick={() => navigate("/checkout")}>
            Proceed to checkout
          </button>
          <Link to="/shop" className="link-arrow center">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
