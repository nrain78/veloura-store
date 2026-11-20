import { Fragment, useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { adminToken, getError } from "../api.js";
import Logo from "../components/Logo.jsx";
import { formatPrice } from "../config.js";
import { downloadFile, ordersToCsv, todayStamp } from "../utils/exporter.js";

const STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
const CATEGORIES = ["Men", "Women", "Kids", "Accessories"];
const TYPES = ["tshirt", "hoodie", "kurta", "jeans", "jacket", "dress", "cap"];

const colorsToText = (colors = []) => colors.map((c) => `${c.name}:${c.hex}`).join(", ");

const textToColors = (text) =>
  text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const [name, hex] = s.split(":").map((x) => x.trim());
      return { name, hex: hex || "#cccccc" };
    });

const textToList = (text) =>
  text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // null | {} (naya) | product

  const handleAuthError = useCallback(
    (err) => {
      if (err.response?.status === 401) {
        adminToken.clear();
        navigate("/admin/login", { replace: true });
        return true;
      }
      return false;
    },
    [navigate]
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [o, p] = await Promise.all([api.get("/orders"), api.get("/products")]);
      setOrders(o.data);
      setProducts(p.data);
    } catch (err) {
      if (!handleAuthError(err)) setError(getError(err, "Could not load data."));
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    if (!adminToken.get()) {
      navigate("/admin/login", { replace: true });
      return;
    }
    loadAll();
  }, [loadAll, navigate]);

  const logout = () => {
    adminToken.clear();
    navigate("/admin/login", { replace: true });
  };

  const changeStatus = async (id, status) => {
    try {
      const res = await api.patch(`/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? res.data : o)));
    } catch (err) {
      if (!handleAuthError(err)) alert(getError(err, "Could not update status."));
    }
  };

  const deleteProduct = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      await api.delete(`/products/${p._id}`);
      setProducts((prev) => prev.filter((x) => x._id !== p._id));
    } catch (err) {
      if (!handleAuthError(err)) alert(getError(err, "Could not delete product."));
    }
  };

  const [exporting, setExporting] = useState(false);

  const runExport = async (fn) => {
    setExporting(true);
    try {
      await fn();
    } catch (err) {
      if (!handleAuthError(err)) alert(getError(err, "Could not export data."));
    } finally {
      setExporting(false);
    }
  };

  const exportOrdersCsv = () =>
    runExport(async () => {
      const res = await api.get("/orders/export");
      downloadFile(`orders-${todayStamp()}.csv`, ordersToCsv(res.data), "text/csv;charset=utf-8");
    });

  const exportBackup = () =>
    runExport(async () => {
      const [o, p] = await Promise.all([api.get("/orders/export"), api.get("/products")]);
      downloadFile(
        `store-backup-${todayStamp()}.json`,
        JSON.stringify(
          { exportedAt: new Date().toISOString(), products: p.data, orders: o.data },
          null,
          2
        ),
        "application/json"
      );
    });

  const pending = orders.filter((o) => o.status === "Pending").length;
  const revenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="admin">
      <header className="admin__bar">
        <div className="container admin__bar-inner">
          <Link to="/"><Logo /></Link>
          <div className="admin__bar-actions">
            <Link to="/" className="link-arrow">View store</Link>
            <button className="btn btn--ghost btn--sm" onClick={logout}>Log out</button>
          </div>
        </div>
      </header>

      <div className="container admin__body">
        <div className="stats">
          <div className="stat-card"><p>Total orders</p><h3>{orders.length}</h3></div>
          <div className="stat-card"><p>Pending</p><h3>{pending}</h3></div>
          <div className="stat-card"><p>Revenue</p><h3>{formatPrice(revenue)}</h3></div>
          <div className="stat-card"><p>Products</p><h3>{products.length}</h3></div>
        </div>

        <div className="admin__exports">
          <button className="btn btn--ghost btn--sm" onClick={exportOrdersCsv} disabled={exporting}>
            Download orders (CSV)
          </button>
          <button className="btn btn--ghost btn--sm" onClick={exportBackup} disabled={exporting}>
            Download full backup (JSON)
          </button>
        </div>

        <div className="tabs">
          <button className={tab === "orders" ? "is-active" : ""} onClick={() => setTab("orders")}>
            Orders
          </button>
          <button className={tab === "products" ? "is-active" : ""} onClick={() => setTab("products")}>
            Products
          </button>
        </div>

        {loading && <p className="notice">Loading...</p>}
        {error && <p className="notice notice--error">{error}</p>}

        {!loading && tab === "orders" && (
          <OrdersTable orders={orders} onStatus={changeStatus} />
        )}

        {!loading && tab === "products" && (
          <ProductsTable
            products={products}
            onAdd={() => setEditing({})}
            onEdit={setEditing}
            onDelete={deleteProduct}
          />
        )}
      </div>

      {editing && (
        <ProductForm
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            loadAll();
          }}
          onAuthError={handleAuthError}
        />
      )}
    </div>
  );
}

function OrdersTable({ orders, onStatus }) {
  const [open, setOpen] = useState(null);

  if (orders.length === 0) {
    return <div className="empty-state"><h3>No orders yet</h3><p>New orders will show up here.</p></div>;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <Fragment key={o._id}>
              <tr>
                <td><strong>{o.orderNumber}</strong></td>
                <td>{new Date(o.createdAt).toLocaleString()}</td>
                <td>
                  {o.customer.name}
                  <br />
                  <small className="muted">{o.customer.phone} · {o.customer.city}</small>
                </td>
                <td>{formatPrice(o.total)}</td>
                <td>
                  <select
                    className={`status status--${o.status.toLowerCase()}`}
                    value={o.status}
                    onChange={(e) => onStatus(o._id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    className="link-btn"
                    onClick={() => setOpen(open === o._id ? null : o._id)}
                  >
                    {open === o._id ? "Hide" : "Details"}
                  </button>
                </td>
              </tr>
              {open === o._id && (
                <tr className="table__details">
                  <td colSpan="6">
                    <div className="details">
                      <div>
                        <h4>Items</h4>
                        {o.items.map((i, idx) => (
                          <p key={idx}>
                            {i.name} × {i.qty}{" "}
                            <span className="muted">
                              ({[i.color, i.size].filter(Boolean).join(", ")})
                            </span>{" "}
                            — {formatPrice(i.price * i.qty)}
                          </p>
                        ))}
                        <p className="muted">
                          Shipping: {o.shipping === 0 ? "Free" : formatPrice(o.shipping)} · Payment: {o.paymentMethod}
                        </p>
                      </div>
                      <div>
                        <h4>Delivery</h4>
                        <p>{o.customer.name}</p>
                        <p>{o.customer.address}, {o.customer.city}</p>
                        <p>{o.customer.phone}</p>
                        {o.customer.email && <p>{o.customer.email}</p>}
                        {o.customer.notes && <p className="muted">Note: {o.customer.notes}</p>}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductsTable({ products, onAdd, onEdit, onDelete }) {
  return (
    <>
      <div className="admin__toolbar">
        <h3>All products</h3>
        <button className="btn btn--primary btn--sm" onClick={onAdd}>+ Add product</button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Featured</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td><strong>{p.name}</strong></td>
                <td>{p.category}</td>
                <td>{formatPrice(p.price)}</td>
                <td className={p.stock <= 5 ? "text-warn" : ""}>{p.stock}</td>
                <td>{p.featured ? "Yes" : "—"}</td>
                <td className="table__actions">
                  <button className="link-btn" onClick={() => onEdit(p)}>Edit</button>
                  <button className="link-btn link-btn--danger" onClick={() => onDelete(p)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ProductForm({ product, onClose, onSaved, onAuthError }) {
  const isEdit = Boolean(product._id);
  const [form, setForm] = useState({
    name: product.name || "",
    description: product.description || "",
    price: product.price ?? "",
    comparePrice: product.comparePrice || "",
    category: product.category || "Men",
    type: product.type || "tshirt",
    sizes: (product.sizes?.length ? product.sizes : ["S", "M", "L", "XL"]).join(", "),
    colors: colorsToText(
      product.colors?.length ? product.colors : [{ name: "Black", hex: "#1f1f1f" }]
    ),
    stock: product.stock ?? 50,
    imageUrl: product.imageUrl || "",
    featured: Boolean(product.featured),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      comparePrice: Number(form.comparePrice) || 0,
      category: form.category,
      type: form.type,
      sizes: textToList(form.sizes),
      colors: textToColors(form.colors),
      stock: Number(form.stock),
      imageUrl: form.imageUrl.trim(),
      featured: form.featured,
    };

    try {
      if (isEdit) await api.put(`/products/${product._id}`, payload);
      else await api.post("/products", payload);
      onSaved();
    } catch (err) {
      if (!onAuthError(err)) setError(getError(err, "Could not save product."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal__card" onSubmit={onSubmit}>
        <div className="modal__head">
          <h3>{isEdit ? "Edit product" : "Add product"}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="field">
          <label>Name</label>
          <input name="name" value={form.name} onChange={onChange} required />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea name="description" rows="3" value={form.description} onChange={onChange} />
        </div>

        <div className="form-row">
          <div className="field">
            <label>Price (Rs)</label>
            <input name="price" type="number" min="0" value={form.price} onChange={onChange} required />
          </div>
          <div className="field">
            <label>Old price (optional)</label>
            <input name="comparePrice" type="number" min="0" value={form.comparePrice} onChange={onChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label>Category</label>
            <select name="category" value={form.category} onChange={onChange}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Type (illustration)</label>
            <select name="type" value={form.type} onChange={onChange}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="field">
          <label>Sizes (comma separated)</label>
          <input name="sizes" value={form.sizes} onChange={onChange} placeholder="S, M, L, XL" />
        </div>
        <div className="field">
          <label>Colors (name:hex, comma separated)</label>
          <input name="colors" value={form.colors} onChange={onChange} placeholder="Black:#1f1f1f, White:#ffffff" />
        </div>

        <div className="form-row">
          <div className="field">
            <label>Stock</label>
            <input name="stock" type="number" min="0" value={form.stock} onChange={onChange} required />
          </div>
          <div className="field">
            <label>Image URL (optional)</label>
            <input name="imageUrl" value={form.imageUrl} onChange={onChange} placeholder="https://..." />
          </div>
        </div>

        <label className="check">
          <input name="featured" type="checkbox" checked={form.featured} onChange={onChange} />
          Show in Bestsellers on home page
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" disabled={saving}>
            {saving ? "Saving..." : "Save product"}
          </button>
        </div>
      </form>
    </div>
  );
}
