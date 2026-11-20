import { Link, useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import { formatPrice } from "../config.js";

export default function OrderSuccess() {
  const { orderNumber } = useParams();
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="container page success">
      <motion.div
        className="success__icon"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 16 }}
      >
        <FiCheck />
      </motion.div>

      <h1>Thank you{order?.customer?.name ? `, ${order.customer.name.split(" ")[0]}` : ""}!</h1>
      <p className="muted">Your order has been placed successfully.</p>
      <p className="success__number">
        Order number: <strong>{orderNumber}</strong>
      </p>

      {order && (
        <div className="summary success__summary">
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
            <span>Total (Cash on Delivery)</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      )}

      <p className="muted">Please keep your order number for reference. We'll call you to confirm delivery.</p>
      <p>
        <Link to={`/track?order=${encodeURIComponent(orderNumber)}`} className="link-arrow">
          Track your order →
        </Link>
      </p>
      <Link to="/shop" className="btn btn--primary">Continue shopping</Link>
    </div>
  );
}
