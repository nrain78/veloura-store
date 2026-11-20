// Server ki server/config.js mein bhi yehi values hain. Dono ko same rakhein.
export const SHIPPING_FEE = 250;
export const FREE_SHIPPING_MIN = 5000;

export const formatPrice = (n) => "Rs " + Number(n || 0).toLocaleString("en-US");

export const shippingFor = (subtotal) =>
  subtotal === 0 || subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
