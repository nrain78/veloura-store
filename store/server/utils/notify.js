// Naye order ki khabar owner tak pahunchana (email aur/ya Telegram).
// Dono optional hain. Setting na ho to chup chap skip ho jata hai.
//
// Order pehle database mein save hota hai, phir ye chalta hai. Ye fail bhi ho jaye
// to order par koi asar nahi parta.
//
// Email HTTPS API (Resend) se jati hai, SMTP se nahi: Render ka free plan
// SMTP ports (25, 465, 587) block karta hai.

const money = (n) => "Rs " + Number(n || 0).toLocaleString("en-US");

function buildText(order) {
  const items = (order.items || []).map((i) => {
    const variant = [i.color, i.size].filter(Boolean).join(", ");
    return `- ${i.name} x${i.qty}${variant ? ` (${variant})` : ""}: ${money(i.price * i.qty)}`;
  });

  const c = order.customer || {};
  return [
    `New order ${order.orderNumber}`,
    "",
    ...items,
    "",
    `Subtotal: ${money(order.subtotal)}`,
    `Shipping: ${order.shipping === 0 ? "Free" : money(order.shipping)}`,
    `Total (Cash on Delivery): ${money(order.total)}`,
    "",
    `Customer: ${c.name}`,
    `Phone: ${c.phone}`,
    `Address: ${c.address}, ${c.city}`,
    c.notes ? `Note: ${c.notes}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

async function sendEmail(order, text) {
  const key = process.env.RESEND_API_KEY;
  const to = (process.env.NOTIFY_EMAIL || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!key || to.length === 0) return;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.NOTIFY_FROM || "Store Orders <onboarding@resend.dev>",
      to,
      subject: `New order ${order.orderNumber} - ${money(order.total)}`,
      text,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`email service answered ${res.status}`);
}

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`telegram answered ${res.status}`);
}

async function notifyNewOrder(order) {
  try {
    const text = buildText(order);
    const results = await Promise.allSettled([sendEmail(order, text), sendTelegram(text)]);
    const names = ["email", "telegram"];
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.warn(`Order notification (${names[i]}) failed:`, r.reason && r.reason.message);
      }
    });
  } catch (err) {
    console.warn("Order notification failed:", err.message);
  }
}

module.exports = { notifyNewOrder, buildText };
