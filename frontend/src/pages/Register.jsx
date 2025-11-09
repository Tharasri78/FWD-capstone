import React, { useState } from "react";
import "./Register.css";
import { register, login } from "../services/auth"; // ✅ FIXED IMPORT
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth(); // ✅ Renamed to avoid conflict
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const { username, email, password } = Object.fromEntries(form.entries());
    
    try {
      // ✅ Use the correct function names
      await register(username, email, password);
      const result = await login(email, password);
      
      if (result.token && result.user) {
        authLogin(result.user, result.token); // ✅ Use the renamed authLogin
        navigate("/feed");
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap container">
      <div className="register-container">
        <div className="register-left">
          <h2>Create account</h2>
          <p>It's quick and easy</p>
          {error && <div className="card mt-12" style={{borderColor: "#663", background:"#1b1414"}}>{error}</div>}
          <form className="mt-16" onSubmit={submit}>
            <input className="input" name="username" placeholder="Username" required />
            <input className="input" name="email" placeholder="Email" type="email" required />
            <input className="input" name="password" placeholder="Password" type="password" required />
            <button className="btn" disabled={loading}>{loading ? "Creating..." : "Register"}</button>
          </form>
          <p className="mute mt-16">Have an account?<Link to="/login">Login</Link></p>
        </div>

        <div className="register-right">
          <h1>Welcome to MERN Blog</h1>
          <p>Your journey begins here. Create your account and start sharing.</p>
        </div>
      </div>
    </div>
  );
}