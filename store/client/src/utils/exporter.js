// Admin panel se data download karne ke helpers (CSV / JSON)

export const todayStamp = () => new Date().toISOString().slice(0, 10);

// Excel mein "=cmd..." jaise customer-likhe text se formula na chal jaye
const guard = (s) => (/^[=+\-@\t\r]/.test(s) ? `'${s}` : s);

const cell = (value) => {
  const s = guard(String(value ?? ""));
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function toCsv(rows) {
  // BOM taake Excel UTF-8 sahi parhe
  return "﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n");
}

export function ordersToCsv(orders) {
  const header = [
    "Order number",
    "Date",
    "Status",
    "Customer",
    "Phone",
    "Email",
    "City",
    "Address",
    "Items",
    "Subtotal",
    "Shipping",
    "Total",
    "Payment",
    "Notes",
  ];

  const rows = orders.map((o) => [
    o.orderNumber,
    new Date(o.createdAt).toLocaleString("en-GB"),
    o.status,
    o.customer?.name,
    o.customer?.phone,
    o.customer?.email,
    o.customer?.city,
    o.customer?.address,
    (o.items || [])
      .map((i) => {
        const variant = [i.color, i.size].filter(Boolean).join(", ");
        return `${i.name} x${i.qty}${variant ? ` (${variant})` : ""}`;
      })
      .join(" | "),
    o.subtotal,
    o.shipping,
    o.total,
    o.paymentMethod,
    o.customer?.notes,
  ]);

  return toCsv([header, ...rows]);
}

export function downloadFile(filename, content, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
