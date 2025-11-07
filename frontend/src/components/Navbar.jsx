import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="nav">
      <div className="nav-wrap container">
        <Link to={user ? "/feed" : "/"} className="brand">MERN Blog</Link>
        <nav className="links">
          {user ? (
            <>
              <Link to="/feed">Feed</Link>
              <Link to={`/profile/${user._id}`}>Profile</Link>
              <Link to="/notifications">Notifications</Link>
              <button className="btn small" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
