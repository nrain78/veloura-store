import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { getError } from "../api.js";
import { formatPrice } from "../config.js";

const STEPS = [
  { status: "Pending", label: "Order placed" },
  { status: "Confirmed", label: "Confirmed" },
  { status: "Shipped", label: "Shipped" },
  { status: "Delivered", label: "Delivered" },
];

export default function TrackOrder() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ orderNumber: params.get("order") || "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await api.get("/orders/track", {
        params: { orderNumber: form.orderNumber.trim(), phone: form.phone.trim() },
      });
      setOrder(res.data);
    } catch (err) {
      setError(getError(err, "Could not look up your order. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = order ? STEPS.findIndex((s) => s.status === order.status) : -1;

  const when = (status) => {
    const h = order.statusHistory?.find((x) => x.status === status);
    if (h) return new Date(h.at).toLocaleDateString("en-GB");
    if (status === "Pending") return new Date(order.createdAt).toLocaleDateString("en-GB");
    return "";
  };

  return (
    <div className="container page track">
      <h1 className="page__title">Track your order</h1>
      <p className="muted track__intro">
        Enter your order number and the phone number you used at checkout.
      </p>

      <form className="form-card" onSubmit={onSubmit}>
        <div className="form-row">
          <div className="field">
            <label htmlFor="orderNumber">Order number</label>
            <input
              id="orderNumber"
              name="orderNumber"
              placeholder="VL-XXXXXXXX"
              value={form.orderNumber}
              onChange={onChange}
              required
            />
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

        {error && <p className="form-error">{error}</p>}

        <button className="btn btn--primary btn--block" disabled={loading}>
          {loading ? "Looking up..." : "Track order"}
        </button>
      </form>

      {order && (
        <div className="summary track__result">
          <h3>Order {order.orderNumber}</h3>

          {order.status === "Cancelled" ? (
            <p className="form-error">This order was cancelled.</p>
          ) : (
            <ol className="timeline">
              {STEPS.map((s, i) => (
                <li
                  key={s.status}
                  className={i < currentIndex ? "is-done" : i === currentIndex ? "is-current" : ""}
                >
                  <strong>{s.label}</strong>
                  <span>{when(s.status)}</span>
                </li>
              ))}
            </ol>
          )}

          {order.items.map((i, idx) => (
            <div key={idx} className="summary__item">
              <span>
                {i.name} × {i.qty}
                <small className="muted">
                  {" "}({[i.color, i.size].filter(Boolean).join(", ")})
                </small>
              </span>
              <span>{formatPrice(i.price * i.qty)}</span>
            </div>
          ))}
          <div className="summary__row">
            <span>Shipping</span>
            <span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span>
          </div>
          <div className="summary__row summary__total">
            <span>Total ({order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod})</span>
            <span>{formatPrice(order.total)}</span>
          </div>
          <p className="muted small">Delivering to {order.city}</p>
        </div>
      )}
    </div>
  );
}
