import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import Trending from "./pages/Trending"; // Add this import


export default function App() {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/feed" /> : <Navigate to="/login" />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/feed" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/feed" />} />

          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
  path="/trending"
  element={
    <ProtectedRoute>
      <Trending />
    </ProtectedRoute>
  }
/>

          <Route path="*" element={<div style={{padding: 24}}>404 – Page Not Found</div>} />
        </Routes>
      </main>
    </div>
  );
}
