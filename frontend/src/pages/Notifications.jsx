import React, { useEffect, useState } from "react";
import "./Notifications.css";
import { getNotifications } from "../services/notifications";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

      {items.length === 0 && (
        <div className="mute">No activity yet.</div>
      )}

      <div className="notif-list mt-12">
        {items.map((n) => (
          <div key={n._id} className="notif">
            <span className={`tag tag-${n.type}`}>
              {n.type}
            </span>

            <div className="notif-content">
              <div className="notif-text">
                <strong>{n.sender?.username}</strong> {n.text}
              </div>
              <div className="mute notif-time">
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}