import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css"; // ✅ FIXED - Use Navbar.css, not Notifications.css
import { useAuth } from "../context/AuthContext";
import { fetchPosts } from "../services/posts";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch notifications count - only count UNREAD ones
  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      const posts = await fetchPosts();
      const myPosts = posts.filter(p => p.author?._id === user._id);
      const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      
      let newNotificationCount = 0;
      
      myPosts.forEach(post => {
        // Check likes
        if (post.likes?.length) {
          post.likes.forEach(likeUserId => {
            const notificationId = `like-${post._id}-${likeUserId}`;
            if (!readNotifications.includes(notificationId)) {
              newNotificationCount++;
            }
          });
        }
        
        // Check comments
        if (post.comments?.length) {
          post.comments.forEach(comment => {
            const notificationId = `comment-${post._id}-${comment._id || comment.date}`;
            if (!readNotifications.includes(notificationId)) {
              newNotificationCount++;
            }
          });
        }
      });
      
      setNotificationCount(newNotificationCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

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
              <Link to="/notifications" className="notification-link">
                Notifications
                {notificationCount > 0 && (
                  <span className="notification-badge">{notificationCount}</span>
                )}
              </Link>
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