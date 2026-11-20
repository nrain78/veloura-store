import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiShoppingBag, FiMenu, FiX } from "react-icons/fi";
import Logo from "./Logo.jsx";
import { useCart } from "../context/CartContext.jsx";
import { FREE_SHIPPING_MIN, formatPrice } from "../config.js";

export default function Navbar() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <div className="announce">
        Free shipping over {formatPrice(FREE_SHIPPING_MIN)} &nbsp;·&nbsp; Cash on Delivery available
      </div>
      <header className="nav">
        <div className="container nav__inner">
          <Link to="/" onClick={close} aria-label="Home">
            <Logo />
          </Link>

          <nav className={`nav__links ${open ? "is-open" : ""}`}>
            <Link to="/shop" onClick={close}>Shop All</Link>
            <Link to="/shop?category=Men" onClick={close}>Men</Link>
            <Link to="/shop?category=Women" onClick={close}>Women</Link>
            <Link to="/shop?category=Kids" onClick={close}>Kids</Link>
            <Link to="/shop?category=Accessories" onClick={close}>Accessories</Link>
            <Link to="/track" onClick={close}>Track order</Link>
          </nav>

          <div className="nav__actions">
            <Link to="/cart" className="cart-btn" aria-label="Cart" onClick={close}>
              <FiShoppingBag />
              {count > 0 && (
                <motion.span
                  key={count}
                  className="cart-btn__badge"
                  initial={{ scale: 1.7 }}
                  animate={{ scale: 1 }}
                >
                  {count}
                </motion.span>
              )}
            </Link>
            <button
              className="nav__toggle"
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
            >
              {open ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
