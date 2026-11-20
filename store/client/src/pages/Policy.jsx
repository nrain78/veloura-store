import { Link, useParams } from "react-router-dom";
import { brand } from "../brand.js";
import { FREE_SHIPPING_MIN, SHIPPING_FEE, formatPrice } from "../config.js";

// Ye demo text hai. Asli brand apni policy ke mutabiq badle.
const pages = {
  shipping: {
    title: "Shipping policy",
    sections: [
      {
        h: "Delivery charges",
        p: `Orders above ${formatPrice(FREE_SHIPPING_MIN)} ship free. Below that, a flat delivery charge of ${formatPrice(SHIPPING_FEE)} applies.`,
      },
      {
        h: "Dispatch and delivery time",
        p: "Orders are usually dispatched within 1 to 2 working days. Delivery typically takes 3 to 5 working days depending on your city.",
      },
      {
        h: "Payment",
        p: "We currently accept Cash on Delivery. Please keep the exact amount ready when the courier arrives.",
      },
      {
        h: "Order confirmation",
        p: "We may call you to confirm your order and address before dispatch. You can follow your order any time on the Track Order page.",
      },
    ],
  },
  returns: {
    title: "Returns and exchange",
    sections: [
      {
        h: "7-day exchange",
        p: "If your size doesn't fit or the item arrives damaged or incorrect, contact us within 7 days of delivery and we will arrange an exchange.",
      },
      {
        h: "Condition of items",
        p: "Items must be unworn, unwashed and have their original tags attached.",
      },
      {
        h: "How to request",
        p: `Email ${brand.email} or message ${brand.instagram} with your order number and a short description. We will guide you through the next steps.`,
      },
    ],
  },
  privacy: {
    title: "Privacy policy",
    sections: [
      {
        h: "What we collect",
        p: "When you place an order we collect your name, phone number, delivery address, city, order notes and, if you provide it, your email address.",
      },
      {
        h: "How we use it",
        p: "We use this information only to confirm, pack and deliver your order and to contact you about it. We do not sell your personal information.",
      },
      {
        h: "Sharing",
        p: "Your delivery details are shared with our courier partners only as needed to deliver your order.",
      },
      {
        h: "Your choices",
        p: `You can ask us to correct or delete your information at any time by contacting ${brand.email}.`,
      },
    ],
  },
  terms: {
    title: "Terms of service",
    sections: [
      {
        h: "Orders",
        p: "Placing an order is an offer to buy. We may cancel an order if an item is out of stock, a price was shown incorrectly, or we cannot reach you to confirm.",
      },
      {
        h: "Prices",
        p: "All prices are in Pakistani Rupees (Rs) and may change without notice. The price at the time you place your order is the price you pay.",
      },
      {
        h: "Product images",
        p: "We try to show colors accurately, but they may look slightly different on your screen.",
      },
      {
        h: "Contact",
        p: `Questions about these terms? Contact us at ${brand.email}.`,
      },
    ],
  },
};

export default function Policy() {
  const { slug } = useParams();
  const page = pages[slug];

  if (!page) {
    return (
      <div className="container page empty-state">
        <h1>Page not found</h1>
        <Link to="/" className="btn btn--primary">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="container page policy">
      <h1 className="page__title">{page.title}</h1>
      {page.sections.map((s) => (
        <section key={s.h}>
          <h2>{s.h}</h2>
          <p>{s.p}</p>
        </section>
      ))}
    </div>
  );
}
