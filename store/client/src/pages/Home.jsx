import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiTruck, FiRefreshCw, FiShield } from "react-icons/fi";
import { useProducts } from "../catalog.js";
import GarmentArt from "../components/GarmentArt.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Reveal from "../components/Reveal.jsx";
import { brand } from "../brand.js";

const heroCards = [
  { type: "hoodie", color: "#9caf88", delay: 0 },
  { type: "dress", color: "#d99aa5", delay: 0.6 },
  { type: "jacket", color: "#27374d", delay: 1.2 },
];

const tiles = [
  { label: "Men", type: "hoodie", color: "#9caf88", bg: "#e9efe3" },
  { label: "Women", type: "dress", color: "#d99aa5", bg: "#f7e6e9" },
  { label: "Kids", type: "tshirt", color: "#d6a23a", bg: "#f7eed6" },
];

export default function Home() {
  const { products, failed } = useProducts({ featured: true });
  const featured = products.slice(0, 8);
  const error = failed && products.length === 0;

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <motion.div
            className="hero__text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="eyebrow">New season</span>
            <h1>{brand.tagline}</h1>
            <p>
              Soft fabrics, clean cuts and colors that work with everything. Made for real
              life, delivered to your door.
            </p>
            <div className="hero__actions">
              <Link to="/shop" className="btn btn--primary">Shop the collection</Link>
              <Link to="/shop?category=Women" className="btn btn--ghost">Women's edit</Link>
            </div>
          </motion.div>

          <div className="hero__art">
            {heroCards.map((c) => (
              <motion.div
                key={c.type}
                className="hero__card"
                animate={{ y: [0, -14, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, delay: c.delay, ease: "easeInOut" }}
              >
                <GarmentArt type={c.type} color={c.color} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <h2 className="section__title">Shop by category</h2>
          </Reveal>
          <div className="tiles">
            {tiles.map((t, i) => (
              <Reveal key={t.label} delay={i * 0.08}>
                <Link
                  to={`/shop?category=${t.label}`}
                  className="tile"
                  style={{ background: t.bg }}
                >
                  <GarmentArt type={t.type} color={t.color} />
                  <span>{t.label}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <Reveal>
            <div className="section__head">
              <h2 className="section__title">Bestsellers</h2>
              <Link to="/shop" className="link-arrow">View all →</Link>
            </div>
          </Reveal>

          {error && (
            <p className="notice">
              Could not load products. Please make sure the server is running.
            </p>
          )}

          <div className="grid-products">
            {featured.map((p, i) => (
              <Reveal key={p._id} delay={(i % 4) * 0.06}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container perks">
          <Reveal className="perk">
            <FiTruck />
            <h3>Fast delivery</h3>
            <p>Free shipping on orders over Rs 5,000.</p>
          </Reveal>
          <Reveal delay={0.08} className="perk">
            <FiShield />
            <h3>Cash on Delivery</h3>
            <p>Pay when your order arrives at your door.</p>
          </Reveal>
          <Reveal delay={0.16} className="perk">
            <FiRefreshCw />
            <h3>Easy exchange</h3>
            <p>Wrong size? Exchange within 7 days.</p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
