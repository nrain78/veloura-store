import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";
import { brand } from "../brand.js";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <Logo light />
          <p className="footer__text">{brand.tagline}</p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/shop?category=Men">Men</Link>
          <Link to="/shop?category=Women">Women</Link>
          <Link to="/shop?category=Kids">Kids</Link>
          <Link to="/shop?category=Accessories">Accessories</Link>
        </div>
        <div>
          <h4>Contact</h4>
          <p>{brand.email}</p>
          <p>{brand.phone}</p>
          <p>{brand.instagram}</p>
        </div>
        <div>
          <h4>Help</h4>
          <Link to="/track">Track your order</Link>
          <Link to="/policies/shipping">Shipping</Link>
          <Link to="/policies/returns">Returns and exchange</Link>
          <Link to="/policies/privacy">Privacy policy</Link>
          <Link to="/policies/terms">Terms of service</Link>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} {brand.name}. All rights reserved.</span>
        <Link to="/admin/login">Admin</Link>
      </div>
    </footer>
  );
}
