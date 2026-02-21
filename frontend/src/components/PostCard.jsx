import React, { useState } from "react";
import "./PostCard.css";
import {
  likePost,
  deletePost,
  editPost
} from "../services/posts";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PostCard({
  post,
  onLike,
  onComment,
  onDelete,
  onEdit,
  onDeleteComment
}) {
  const { user: currentUser } = useAuth();

  const [commentText, setCommentText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const postAuthor = post.author || {};
  const postComments = post.comments || [];

  const getInitial = (name) =>
    name ? name.charAt(0).toUpperCase() : "U";

  const isPostAuthor =
    currentUser && postAuthor._id === currentUser._id;

  const handleLike = async () => {
    const updated = await likePost(post._id);
    onLike(updated);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    await deletePost(post._id);
    onDelete(post._id);
  };

  const handleEdit = async () => {
    const updated = await editPost(post._id, {
      title: editTitle,
      content: editContent
    });
    onEdit(updated);
    setIsEditing(false);
  };

  return (
    <article className="card post" id={`post-${post._id}`}>
      {/* HEADER */}
      <header className="post-head spaced">
        <div
          className="post-avatar"
          data-letter={getInitial(postAuthor.username)}
        />

        <div>
          <div className="author">
            {postAuthor.username}
          </div>
          <div className="mute">
            {new Date(post.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="grow" />

        {isPostAuthor && (
          <>
            <button
              className="btn small secondary"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>

            <button
              className="btn small danger"
              onClick={handleDelete}
            >
              Delete
            </button>
          </>
        )}

        <Link
          className="view-profile-glass"
          to={`/profile/${postAuthor._id}`}
        >
          View Profile
        </Link>
      </header>

      {/* BODY */}
      {isEditing ? (
        <div className="edit-form">
          <input
            className="input mb-8"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <textarea
            className="textarea mb-8"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          <button className="btn" onClick={handleEdit}>
            Save
          </button>
        </div>
      ) : (
        <>
          <h3 className="post-title">{post.title}</h3>
          <p className="post-body">{post.content}</p>

          {/* ✅ IMAGE FIX */}
          {post.image && (
            <div className="post-image">
              <img
                src={post.image}
                alt="Post"
                className="post-image-content"
                loading="lazy"
              />
            </div>
          )}
        </>
      )}

      {/* ACTIONS */}
      <div className="spaced mt-12">
        <button className="btn secondary" onClick={handleLike}>
          ❤️ {post.likes?.length || 0}
        </button>
        <span className="mute">
          {postComments.length} comments
        </span>
      </div>

      {/* COMMENTS */}
      <div className="comments mt-12">
        {postComments.map((c) => (
          <div key={c._id} className="comment">
            <div
              className="comment-avatar"
              data-letter={getInitial(c.user?.username)}
            />
            <div>
              <strong>{c.user?.username}</strong>
              <p>{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}