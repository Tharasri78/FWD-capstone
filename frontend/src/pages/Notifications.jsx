import React, { useEffect, useState } from "react";
import "./Notifications.css";
import { fetchPosts } from "../services/posts";
import { useAuth } from "../context/AuthContext";

/*
  Basic "fake" notifications derived from recent activity:
  - If someone liked your post
  - If someone commented on your post
  (Because backend doesn't store notifications in a separate collection)
*/
export default function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      const posts = await fetchPosts();
      const mine = posts.filter(p => p.author?._id === user._id);
      const notifs = [];
      mine.forEach(p => {
        if (p.likes?.length) {
          notifs.push({
            type: "like",
            text: `${p.likes.length} user(s) liked your post "${p.title}"`,
            time: p.updatedAt || p.createdAt
          });
        }
        if (p.comments?.length) {
          notifs.push({
            type: "comment",
            text: `${p.comments.length} new comment(s) on "${p.title}"`,
            time: p.updatedAt || p.createdAt
          });
        }
      });
      setItems(notifs.sort((a,b)=> new Date(b.time)-new Date(a.time)));
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
            <span className="tag">{n.type}</span>
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
