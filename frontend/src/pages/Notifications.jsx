import React, { useEffect, useState } from "react";
import "./Notifications.css";
import { fetchPosts } from "../services/posts";
import { useAuth } from "../context/AuthContext";

export default function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      const posts = await fetchPosts();
      const mine = posts.filter(p => p.author?._id === user._id);
      const notifs = [];
      
      mine.forEach(p => {
        // Likes notifications
        if (p.likes?.length) {
          p.likes.forEach(likeUserId => {
            const liker = posts.find(post => post.author?._id === likeUserId)?.author;
            notifs.push({
              id: `like-${p._id}-${likeUserId}`, // Unique ID for each notification
              type: "like",
              text: `${liker?.username || 'Someone'} liked your post "${p.title}"`,
              time: p.updatedAt || p.createdAt,
              postId: p._id
            });
          });
        }
        
        // Comments notifications
        if (p.comments?.length) {
          p.comments.forEach(comment => {
            notifs.push({
              id: `comment-${p._id}-${comment._id || comment.date}`, // Unique ID
              type: "comment",
              text: `${comment.user?.username || 'Someone'} commented: "${comment.text}"`,
              time: comment.date || p.createdAt,
              postId: p._id
            });
          });
        }
      });
      
      setItems(notifs.sort((a,b) => new Date(b.time) - new Date(a.time)));
      
      // ✅ MARK ALL CURRENT NOTIFICATIONS AS READ
      const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      const currentNotificationIds = notifs.map(n => n.id);
      const updatedReadNotifications = [...new Set([...readNotifications, ...currentNotificationIds])];
      localStorage.setItem('readNotifications', JSON.stringify(updatedReadNotifications));
    };
    load();
  }, [user._id]);

  return (
    <div className="card">
      <h3>Your Notifications</h3>
      <div className="notif-list mt-12">
        {items.length === 0 && <div className="mute">No activity yet.</div>}
        {items.map((n, idx) => (
          <div key={idx} className="notif">
            <span className={`tag ${n.type === 'like' ? 'tag-like' : 'tag-comment'}`}>
              {n.type}
            </span>
            <div>{n.text}</div>
            <div className="mute" style={{fontSize:"12px"}}>
              {new Date(n.time).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}