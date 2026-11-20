import { Link } from "react-router-dom";
import ProductImage from "./ProductImage.jsx";
import { formatPrice } from "../config.js";

export default function ProductCard({ product }) {
  const sale = product.comparePrice > product.price;
  const soldOut = product.stock <= 0;

  return (
    <Link to={`/product/${product.slug}`} className="pcard">
      <div className="pcard__media">
        <ProductImage product={product} />
        {sale && !soldOut && <span className="badge badge--sale">Sale</span>}
        {soldOut && <span className="badge badge--out">Sold out</span>}
      </div>
      <div className="pcard__body">
        <h3>{product.name}</h3>
        <div className="pcard__meta">
          <p className="price">
            {formatPrice(product.price)}
            {sale && <s>{formatPrice(product.comparePrice)}</s>}
          </p>
          <div className="dots">
            {product.colors?.slice(0, 4).map((c) => (
              <i key={c.name} title={c.name} style={{ background: c.hex }} />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
