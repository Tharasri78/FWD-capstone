import React, { useState } from "react";
import "./Login.css";
import { login as loginService } from '../services/auth'; // ✅ Rename this import
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // ✅ This is from AuthContext
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const { email, password } = Object.fromEntries(form.entries());
    
    try {
      // ✅ Use the renamed import: loginService (from auth.js)
      const result = await loginService(email, password);
      
      if (result.token && result.user) {
        // ✅ This login is from AuthContext
        login(result.user, result.token);
        navigate("/feed");
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap container">
      <div className="login-container">
        <div className="login-left">
          <h2>Welcome Back</h2>
          <p>Log in to continue</p>

          {error && <div className="card mt-12" style={{borderColor: "#663", background:"#1b1414"}}>{error}</div>}

          <form className="mt-16" onSubmit={submit}>
            <input className="input" name="email" placeholder="Email" type="email" required />
            <input className="input" name="password" placeholder="Password" type="password" required />
            <button className="btn" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
          </form>

          <p className="mute mt-16">No account? <Link to="/register">Register</Link></p>
        </div>

        <div className="login-right">
          <h1>Blogging</h1>
          <p>Your thoughts matter. Share them with the world.</p>
        </div>
      </div>
    </div>
  );
}