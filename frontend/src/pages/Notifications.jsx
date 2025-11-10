import React, { useEffect, useState } from "react";
import "./Notifications.css";
import { fetchPosts } from "../services/posts";
import { useAuth } from "../context/AuthContext";
import { getProfile } from "../services/users";

export default function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      
      try {
        const [posts, userProfile] = await Promise.all([
          fetchPosts(),
          getProfile(user._id)
        ]);

        const mine = posts.filter(p => p.author?._id === user._id);
        const notifs = [];
        
        // 1. Follow notifications - check new followers
        if (userProfile.followers?.length) {
          userProfile.followers.forEach(followerId => {
            const follower = posts.find(post => post.author?._id === followerId)?.author;
            notifs.push({
              id: `follow-${followerId}-${user._id}`,
              type: "follow",
              text: `${follower?.username || 'Someone'} started following you`,
              time: new Date().toISOString(), // You might want to store actual follow time in your backend
              userId: followerId
            });
          });
        }

        // 2. Likes notifications
        mine.forEach(p => {
          if (p.likes?.length) {
            p.likes.forEach(likeUserId => {
              const liker = posts.find(post => post.author?._id === likeUserId)?.author;
              notifs.push({
                id: `like-${p._id}-${likeUserId}`,
                type: "like",
                text: `${liker?.username || 'Someone'} liked your post "${p.title}"`,
                time: p.updatedAt || p.createdAt,
                postId: p._id
              });
            });
          }
        });
        
        // 3. Comments notifications
        mine.forEach(p => {
          if (p.comments?.length) {
            p.comments.forEach(comment => {
              notifs.push({
                id: `comment-${p._id}-${comment._id || comment.date}`,
                type: "comment",
                text: `${comment.user?.username || 'Someone'} commented: "${comment.text}"`,
                time: comment.date || p.createdAt,
                postId: p._id
              });
            });
          }
        });

        // Sort by time (newest first)
        const sortedNotifs = notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
        setItems(sortedNotifs);

        // Mark current notifications as read
        const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
        const currentNotificationIds = notifs.map(n => n.id);
        const updatedReadNotifications = [...new Set([...readNotifications, ...currentNotificationIds])];
        localStorage.setItem('readNotifications', JSON.stringify(updatedReadNotifications));

      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="card">
        <h3>Your Notifications</h3>
        <div className="mute">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Your Notifications</h3>
      <div className="notif-list mt-12">
        {items.length === 0 && <div className="mute">No activity yet.</div>}
        {items.map((n, idx) => (
          <div key={`${n.id}-${idx}`} className="notif">
            <span className={`tag ${n.type === 'like' ? 'tag-like' : n.type === 'comment' ? 'tag-comment' : 'tag-follow'}`}>
              {n.type}
            </span>
            <div className="notif-content">
              <div className="notif-text">{n.text}</div>
              <div className="mute notif-time">
                {new Date(n.time).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}