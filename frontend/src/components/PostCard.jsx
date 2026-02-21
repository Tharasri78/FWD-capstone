import React, { useState } from "react";
import "./PostCard.css";
import { likePost, commentOnPost, deletePost, editPost } from "../services/posts";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PostCard({ post, onLike, onComment, onDelete, onEdit, onDeleteComment }) {
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const { user: currentUser } = useAuth();
 
  const getInitial = (username) => {
    if (!username || typeof username !== "string" || username.trim() === "") return "U";
    return username.charAt(0).toUpperCase();
  };

  const handleLike = async () => {
    try {
      const updated = await likePost(post._id);
      onLike(updated);
    } catch (error) {
      console.error("Error liking post:", error);
      alert("Failed to like post");
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;

    setCommentLoading(true);
    try {
      await onComment(post._id, text);
      setCommentText("");
    } catch (error) {
      console.error("Error commenting:", error);
      alert("Failed to post comment: " + (error.response?.data?.error || error.message));
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    setDeletingCommentId(commentId);
    try {
      await onDeleteComment(post._id, commentId);
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment: " + (error.response?.data?.error || error.message));
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    setIsDeleting(true);
    try {
      await deletePost(post._id);
      if (onDelete) onDelete(post._id);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post: " + (error.response?.data?.error || error.message));
    } finally {
      setIsDeleting(false);
    }
  };
  const handleEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert("Title and content cannot be empty");
      return;
    }

    try {
      const updated = await editPost(post._id, {
        title: editTitle,
        content: editContent,
      });
      if (onEdit) onEdit(updated);
      setIsEditing(false);
    } catch (error) {
      console.error("Error editing post:", error);
      alert("Failed to edit post: " + (error.response?.data?.error || error.message));
    }
  };

  // Share functionality
  const getPostUrl = () => {
    return `${window.location.origin}/feed#post-${post._id}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getPostUrl());
      alert("Post link copied to clipboard!");
      setShowShareOptions(false);
    } catch (err) {
      console.error("Failed to copy: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = getPostUrl();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Post link copied to clipboard!");
      setShowShareOptions(false);
    }
  };

  const shareOnTwitter = () => {
    const text = `Check out this post: "${post.title}"`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(getPostUrl())}`;
    window.open(url, "_blank");
    setShowShareOptions(false);
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getPostUrl())}`;
    window.open(url, "_blank");
    setShowShareOptions(false);
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getPostUrl())}`;
    window.open(url, "_blank");
    setShowShareOptions(false);
  };

  const isPostAuthor = currentUser && post.author && post.author._id === currentUser._id;

  const postAuthor = post.author || {};
  const postComments = post.comments || [];

  return (
    <article className="card post" id={`post-${post._id}`}>
      {/* Post Header */}
      <header className="post-head spaced">
        <div className="post-avatar" data-letter={getInitial(postAuthor.username)}></div>
        <div>
          <div className="author">{postAuthor.username || "Loading..."}</div>
          <div className="mute">{new Date(post.createdAt).toLocaleString()}</div>
        </div>

        <div className="grow" />

        {isPostAuthor && (
          <div className="post-actions">
            <button
              className="btn small secondary"
              onClick={() => setIsEditing(!isEditing)}
              disabled={isDeleting}
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
            <button
              className="btn small danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}  <Link className="view-profile-glass" to={`/profile/${postAuthor._id || ""}`}>
          View Profile
        </Link>
      </header>

      {isEditing ? (
        <div className="edit-form">
          <input
            className="input mb-8"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Post title"
          />
          <textarea
            className="textarea mb-8"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Post content"
            rows="4"
          />
          <div className="row">
            <button className="btn" onClick={handleEdit}>
              Save Changes
            </button>
            <button
              className="btn secondary"
              onClick={() => {
                setIsEditing(false);
                setEditTitle(post.title);
                setEditContent(post.content);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="post-title">{post.title}</h3>
          <p className="post-body">{post.content}</p>
          
          {/* Post Image */}
          {post.image && post.image.url && (
            <div className="post-image">
              <img 
              src={`http://localhost:5000${post.image.url}`}
                alt="Post image" 
                className="post-image-content"
              />
            </div>
          )}
        </>
      )}

      {/* Post Actions */}
      <div className="spaced mt-12">
        <div className="post-actions-left">
          <button className="btn secondary" onClick={handleLike}>
            ❤️ {post.likes?.length || 0}
          </button>
          <div className="mute">{postComments.length} comments</div>
        </div>
        
        {/* Share Button */}
<div className="share-container">
  <button 
    className="share-btn glass"
    onClick={() => setShowShareOptions(!showShareOptions)}
  >
    🔗 Share
  </button>
  
  {showShareOptions && (
    <div className="share-dropdown">
      <button onClick={copyToClipboard} className="share-option">
        📋 Copy Link
      </button>
      <button onClick={shareOnTwitter} className="share-option">
        🐦 Twitter
      </button>
      <button onClick={shareOnFacebook} className="share-option">
        📘 Facebook
      </button>
      <button onClick={shareOnLinkedIn} className="share-option">
        💼 LinkedIn
      </button>
    </div>
  )}
</div>
      </div>

      {/* Comment Form */}
      <form className="row mt-12" onSubmit={handleComment}>
        <input
          className="input"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={commentLoading}
        />
        <button className="btn" type="submit" disabled={commentLoading}>
          {commentLoading ? "Posting..." : "Comment"}
        </button>
      </form>

      {/* Comments Section */}
      <div className="comments mt-12">
        {postComments.slice().reverse().map((c, i) => {
          const commentUser = c.user || {};
          const isCommentAuthor = currentUser && commentUser._id === currentUser._id;

          return (
            <div key={i} className="comment">
              <div className="comment-avatar" data-letter={getInitial(commentUser.username)}></div>
              <div className="comment-content">
                <div className="comment-header">
                  <span className="author">{commentUser.username || "Loading..."}</span>

                  <Link
                    to={`/profile/${commentUser._id || ""}`}
                    className="view-profile-glass"
                  >
                    View Profile
                  </Link>

                  {isCommentAuthor && (
                    <button
                      className="delete-comment-btn"
                      onClick={() => handleDeleteComment(c._id)}
                      disabled={deletingCommentId === c._id}
                    >
                      {deletingCommentId === c._id ? "..." : "Delete Comment"}
                    </button>
                  )}
                </div>

                <div className="comment-text">{c.text}</div>
                <div className="comment-time">
                  {new Date(c.date || post.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}