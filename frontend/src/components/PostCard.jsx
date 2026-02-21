import React from "react";
import { useNavigate } from "react-router-dom";
import "./PostCard.css";

export default function PostCard({
  post,
  currentUser,
  onLike,
  onDelete,
  onEdit,
}) {
  const navigate = useNavigate();

  const isOwner = currentUser?._id === post.author?._id;

  return (
    <div className="post-card">
      {/* HEADER */}
      <div className="post-header">
        <div className="post-user">
          <div className="avatar">
            {post.author?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="username">{post.author?.username}</div>
            <div className="time">
              {new Date(post.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="post-actions">
          {isOwner && (
            <>
              <button onClick={() => onEdit(post)}>Edit</button>
              <button className="danger" onClick={() => onDelete(post._id)}>
                Delete
              </button>
            </>
          )}
          <button onClick={() => navigate(`/profile/${post.author?._id}`)}>
            View Profile
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <h3 className="post-title">{post.title}</h3>
      <p className="post-content">{post.content}</p>

      {/* ✅ IMAGE FIX (THIS WAS YOUR BUG) */}
      {post.image && typeof post.image === "string" && (
        <div className="post-image">
          <img
            src={post.image}
            alt="Post"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
              console.error("Image failed:", post.image);
            }}
          />
        </div>
      )}

      {/* FOOTER */}
      <div className="post-footer">
        <button onClick={() => onLike(post._id)}>
          ❤️ {post.likes?.length || 0}
        </button>
        <span>{post.comments?.length || 0} comments</span>
      </div>
    </div>
  );
}