import React, { useState } from "react";
import "./Login.css";
import { loginApi } from "../services/auth";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const { token, user } = await loginApi(payload);
      login(user, token);
      navigate("/feed");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap container">
      <div className="card auth-card">
        <h2>Welcome back</h2>
        <p className="mute">Log in to continue</p>
        {error && <div className="card mt-12" style={{borderColor: "#663", background:"#1b1414"}}>{error}</div>}
        <form className="mt-16" onSubmit={submit}>
          <input className="input mb-12" name="email" placeholder="Email" type="email" required />
          <input className="input mb-12" name="password" placeholder="Password" type="password" required />
          <button className="btn" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        </form>
        <p className="mute mt-16">No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}
