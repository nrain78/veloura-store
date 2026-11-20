require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const ADULT = ["S", "M", "L", "XL"];
const KIDS = ["2-3Y", "4-5Y", "6-7Y"];

const c = {
  black: { name: "Black", hex: "#1f1f1f" },
  white: { name: "Off White", hex: "#f2eee6" },
  sage: { name: "Sage", hex: "#9caf88" },
  navy: { name: "Navy", hex: "#27374d" },
  clay: { name: "Clay", hex: "#c0714f" },
  sand: { name: "Sand", hex: "#d8c3a5" },
  indigo: { name: "Indigo", hex: "#3b5b8c" },
  wash: { name: "Light Wash", hex: "#9db7d5" },
  rose: { name: "Rose", hex: "#d99aa5" },
  mustard: { name: "Mustard", hex: "#d6a23a" },
  grey: { name: "Heather Grey", hex: "#b6b3ae" },
  olive: { name: "Olive", hex: "#6b705c" },
  sky: { name: "Sky", hex: "#9ec5e0" },
  maroon: { name: "Maroon", hex: "#6d2e3a" },
};

const products = [
  {
    name: "Essential Cotton Tee",
    slug: "essential-cotton-tee",
    description: "Soft, breathable 100% cotton tee with a relaxed everyday fit. Pre-washed so it feels great from day one.",
    price: 1799,
    comparePrice: 2199,
    category: "Men",
    type: "tshirt",
    sizes: ADULT,
    colors: [c.white, c.black, c.sage, c.navy],
    stock: 80,
    featured: true,
  },
  {
    name: "Cloud Fleece Hoodie",
    slug: "cloud-fleece-hoodie",
    description: "Heavyweight brushed fleece hoodie with a roomy hood and kangaroo pocket. Warm without the bulk.",
    price: 4499,
    category: "Men",
    type: "hoodie",
    sizes: ADULT,
    colors: [c.grey, c.black, c.olive],
    stock: 45,
    featured: true,
  },
  {
    name: "Classic Straight Jeans",
    slug: "classic-straight-jeans",
    description: "Mid-rise straight-leg jeans in durable stretch denim. A wardrobe staple that goes with everything.",
    price: 3999,
    category: "Men",
    type: "jeans",
    sizes: ["30", "32", "34", "36"],
    colors: [c.indigo, c.black],
    stock: 60,
  },
  {
    name: "Urban Bomber Jacket",
    slug: "urban-bomber-jacket",
    description: "Lightweight bomber with a full zip and ribbed cuffs. Perfect layering piece for cooler evenings.",
    price: 6999,
    comparePrice: 7999,
    category: "Men",
    type: "jacket",
    sizes: ADULT,
    colors: [c.olive, c.navy, c.black],
    stock: 30,
    featured: true,
  },
  {
    name: "Linen Blend Kurta",
    slug: "linen-blend-kurta",
    description: "Breathable linen-blend kurta with a button placket and straight cut. Smart enough for occasions, easy enough for every day.",
    price: 3499,
    category: "Men",
    type: "kurta",
    sizes: ADULT,
    colors: [c.sand, c.white, c.sky],
    stock: 50,
  },
  {
    name: "Floral Midi Dress",
    slug: "floral-midi-dress",
    description: "Flowy midi dress with a flattering waistline and soft drape. Light fabric that moves with you.",
    price: 4999,
    comparePrice: 5799,
    category: "Women",
    type: "dress",
    sizes: ADULT,
    colors: [c.rose, c.maroon, c.sage],
    stock: 40,
    featured: true,
  },
  {
    name: "Embroidered Lawn Kurta",
    slug: "embroidered-lawn-kurta",
    description: "Soft lawn kurta with delicate neckline embroidery. Comfortable all day, even in the heat.",
    price: 4299,
    category: "Women",
    type: "kurta",
    sizes: ADULT,
    colors: [c.mustard, c.sky, c.rose],
    stock: 55,
    featured: true,
  },
  {
    name: "Wide-Leg Jeans",
    slug: "wide-leg-jeans",
    description: "High-rise wide-leg jeans with a clean, easy silhouette. Comfortable stretch and a flattering fit.",
    price: 4199,
    category: "Women",
    type: "jeans",
    sizes: ["26", "28", "30", "32"],
    colors: [c.wash, c.indigo],
    stock: 45,
  },
  {
    name: "Cozy Oversized Hoodie",
    slug: "cozy-oversized-hoodie",
    description: "Oversized hoodie in ultra-soft fleece with dropped shoulders. Your new favorite for lazy days.",
    price: 4299,
    category: "Women",
    type: "hoodie",
    sizes: ADULT,
    colors: [c.clay, c.white, c.grey],
    stock: 50,
  },
  {
    name: "Cropped Denim Jacket",
    slug: "cropped-denim-jacket",
    description: "Cropped denim jacket with a vintage wash. Throw it over dresses, tees, or kurtas.",
    price: 5499,
    category: "Women",
    type: "jacket",
    sizes: ADULT,
    colors: [c.wash, c.indigo],
    stock: 25,
  },
  {
    name: "Kids Cotton Tee",
    slug: "kids-cotton-tee",
    description: "Gentle, soft cotton tee made for play. Easy to wash and built to last.",
    price: 1299,
    category: "Kids",
    type: "tshirt",
    sizes: KIDS,
    colors: [c.mustard, c.sky, c.white],
    stock: 70,
  },
  {
    name: "Kids Zip Hoodie",
    slug: "kids-zip-hoodie",
    description: "Cozy zip-up hoodie in soft fleece. Easy on, easy off, and warm for school mornings.",
    price: 2999,
    category: "Kids",
    type: "hoodie",
    sizes: KIDS,
    colors: [c.navy, c.sage, c.rose],
    stock: 40,
  },
  {
    name: "Kids Summer Dress",
    slug: "kids-summer-dress",
    description: "Light, twirl-ready summer dress in breathable cotton.",
    price: 2499,
    category: "Kids",
    type: "dress",
    sizes: KIDS,
    colors: [c.rose, c.sky, c.mustard],
    stock: 35,
  },
  {
    name: "Classic Cotton Cap",
    slug: "classic-cotton-cap",
    description: "Six-panel cotton cap with an adjustable strap. Simple, clean, and goes with everything.",
    price: 999,
    category: "Accessories",
    type: "cap",
    sizes: ["One Size"],
    colors: [c.black, c.sand, c.navy],
    stock: 100,
  },
];

module.exports = { products };

if (require.main === module) (async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/veloura_store"
    );
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`${products.length} products seeded`);
  } catch (err) {
    console.error(err.message);
  } finally {
    await mongoose.disconnect();
  }
})();
