import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { adminToken, getError } from "../api.js";
import Logo from "../components/Logo.jsx";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (adminToken.get()) navigate("/admin", { replace: true });
  }, [navigate]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", form);
      adminToken.set(res.data.token);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(getError(err, "Could not log in. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="form-card admin-login__card" onSubmit={onSubmit}>
        <Link to="/" className="admin-login__logo"><Logo /></Link>
        <h2>Admin login</h2>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={onChange} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" value={form.password} onChange={onChange} required />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button className="btn btn--primary btn--block" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
    </div>
  );
}
