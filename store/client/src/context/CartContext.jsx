import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { shippingFor } from "../config.js";

const CartContext = createContext(null);
const STORAGE_KEY = "veloura_cart";

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const value = useMemo(() => {
    const add = (item) =>
      setItems((prev) => {
        const key = `${item.productId}-${item.size}-${item.color}`;
        const found = prev.find((i) => i.key === key);
        if (found) {
          return prev.map((i) =>
            i.key === key ? { ...i, qty: Math.min(i.qty + item.qty, 10) } : i
          );
        }
        return [...prev, { ...item, key }];
      });

    const remove = (key) => setItems((prev) => prev.filter((i) => i.key !== key));

    const setQty = (key, qty) =>
      setItems((prev) =>
        prev.map((i) =>
          i.key === key ? { ...i, qty: Math.max(1, Math.min(10, qty)) } : i
        )
      );

    const clear = () => setItems([]);

    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shipping = shippingFor(subtotal);

    return {
      items,
      add,
      remove,
      setQty,
      clear,
      count,
      subtotal,
      shipping,
      total: subtotal + shipping,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
