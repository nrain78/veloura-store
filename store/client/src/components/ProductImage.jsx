import GarmentArt from "./GarmentArt.jsx";

// Agar imageUrl hai to asli photo, warna kapre ki illustration
export default function ProductImage({ product, color, className = "" }) {
  if (product.imageUrl) {
    return (
      <img
        src={product.imageUrl}
        alt={product.name}
        className={`pimg ${className}`}
        loading="lazy"
      />
    );
  }
  const hex = color || product.colors?.[0]?.hex || "#d6d3d1";
  return (
    <div className={`pimg pimg--art ${className}`}>
      <GarmentArt type={product.type} color={hex} />
    </div>
  );
}
