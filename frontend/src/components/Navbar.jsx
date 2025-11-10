import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../context/AuthContext";
import { fetchPosts } from "../services/posts";
import { getProfile } from "../services/users";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch notifications count - including follow notifications
  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      const [posts, userProfile] = await Promise.all([
        fetchPosts(),
        getProfile(user._id)
      ]);

      const myPosts = posts.filter(p => p.author?._id === user._id);
      const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      
      let newNotificationCount = 0;
      
      // Check for new followers
      if (userProfile.followers?.length) {
        userProfile.followers.forEach(followerId => {
          const notificationId = `follow-${followerId}-${user._id}`;
          if (!readNotifications.includes(notificationId)) {
            newNotificationCount++;
          }
        });
      }
      
      // Check likes on your posts
      myPosts.forEach(post => {
        if (post.likes?.length) {
          post.likes.forEach(likeUserId => {
            const notificationId = `like-${post._id}-${likeUserId}`;
            if (!readNotifications.includes(notificationId)) {
              newNotificationCount++;
            }
          });
        }
        
        // Check comments on your posts
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
              <Link to="/trending">🔥 Trending</Link>
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