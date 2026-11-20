import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postWithRetry, getError } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice } from "../config.js";

const newKey = () =>
  window.crypto?.randomUUID
    ? window.crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

export default function Checkout() {
  const { items, subtotal, shipping, total, clear } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Ek cart ke liye ek hi key. Network atakne par retry ho to server wahi order wapas deta hai,
  // double order nahi banta. Cart badle to nayi key.
  const keyRef = useRef({ sig: "", key: "" });
  const sig = JSON.stringify(items.map((i) => [i.productId, i.size, i.color, i.qty]));
  if (keyRef.current.sig !== sig) keyRef.current = { sig, key: newKey() };

  if (items.length === 0) {
    return (
      <div className="container page empty-state">
        <h1>Your cart is empty</h1>
        <p>Add something to your cart before checking out.</p>
        <Link to="/shop" className="btn btn--primary">Go to shop</Link>
      </div>
    );
  }

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await postWithRetry("/orders", {
        customer: form,
        paymentMethod: "COD",
        idempotencyKey: keyRef.current.key,
        items: items.map((i) => ({
          productId: i.productId,
          size: i.size,
          color: i.color,
          qty: i.qty,
        })),
      });
      clear();
      navigate(`/order-success/${res.data.orderNumber}`, { state: { order: res.data } });
    } catch (err) {
      setError(getError(err, "Could not place your order. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page">
      <h1 className="page__title">Checkout</h1>

      <div className="cart">
        <form className="form-card" onSubmit={onSubmit}>
          <h3>Delivery details</h3>

          <div className="form-row">
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" value={form.name} onChange={onChange} required />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="03XX XXXXXXX"
                value={form.phone}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="email">Email (optional)</label>
            <input id="email" name="email" type="email" value={form.email} onChange={onChange} />
          </div>

          <div className="field">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              rows="3"
              placeholder="House no., street, area"
              value={form.address}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="city">City</label>
              <input id="city" name="city" value={form.city} onChange={onChange} required />
            </div>
            <div className="field">
              <label htmlFor="notes">Order notes (optional)</label>
              <input id="notes" name="notes" value={form.notes} onChange={onChange} />
            </div>
          </div>

          <h3>Payment</h3>
          <label className="radio is-active">
            <input type="radio" checked readOnly /> Cash on Delivery
          </label>
          <p className="muted small">Pay in cash when your order arrives.</p>

          {error && <p className="form-error">{error}</p>}

          <button className="btn btn--primary btn--block" disabled={loading}>
            {loading ? "Placing order..." : `Place order · ${formatPrice(total)}`}
          </button>
          {loading && (
            <p className="hint">
              Please don't close this page. If the store is waking up, this can take up to a minute.
            </p>
          )}
        </form>

        <aside className="summary">
          <h3>Your order</h3>
          {items.map((i) => (
            <div key={i.key} className="summary__item">
              <span>
                {i.name} × {i.qty}
                <small className="muted">
                  {" "}({[i.color, i.size].filter(Boolean).join(", ")})
                </small>
              </span>
              <span>{formatPrice(i.price * i.qty)}</span>
            </div>
          ))}
          <div className="summary__row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="summary__row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
          </div>
          <div className="summary__row summary__total">
            <span>Total</span><span>{formatPrice(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
