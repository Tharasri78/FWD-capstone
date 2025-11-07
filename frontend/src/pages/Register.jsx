import React, { useState } from "react";
import "./Register.css";
import { register as registerApi, loginApi } from "../services/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
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
      await registerApi(payload);
      const { token, user } = await loginApi({ email: payload.email, password: payload.password });
      login(user, token);
      navigate("/feed");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap container">
      <div className="card auth-card">
        <h2>Create account</h2>
        <p className="mute">It’s quick and easy</p>
        {error && <div className="card mt-12" style={{borderColor: "#663", background:"#1b1414"}}>{error}</div>}
        <form className="mt-16" onSubmit={submit}>
          <input className="input mb-12" name="username" placeholder="Username" required />
          <input className="input mb-12" name="email" placeholder="Email" type="email" required />
          <input className="input mb-12" name="password" placeholder="Password" type="password" required />
          <button className="btn" disabled={loading}>{loading ? "Creating..." : "Register"}</button>
        </form>
        <p className="mute mt-16">Have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}
