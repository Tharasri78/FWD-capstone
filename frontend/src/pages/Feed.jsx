import React, { useEffect, useState } from "react";
import "./Feed.css";
import { fetchPosts, createPost, commentOnPost, deleteComment } from "../services/posts";
import PostCard from "../components/PostCard";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [publishing, setPublishing] = useState(false); // ← new: prevent double-click

  const load = async () => {
    try {
      const data = await fetchPosts();
      setPosts(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (e) {
      setError("Failed to load posts");
      console.error("Load posts error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Scroll to specific post if hash in URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#post-')) {
      const postId = hash.replace('#post-', '');
      setTimeout(() => {
        const element = document.getElementById(`post-${postId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          element.style.backgroundColor = 'rgba(246, 177, 122, 0.15)';
          setTimeout(() => {
            element.style.backgroundColor = '';
          }, 2500);
        }
      }, 600);
    }
  }, [posts]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit - match backend
        alert("Image too large (max 5MB)");
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview("");
  };

  const newPost = async (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim() && !image) {
      alert("Please add a title, content, or image");
      return;
    }

    setPublishing(true);
    setError(""); // clear previous errors

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      
      if (image) {
        formData.append("image", image);
        console.log("[UPLOAD] Selected image:", image.name, (image.size / 1024).toFixed(1) + " KB");
      }

      console.log("[UPLOAD] Sending post to backend...");

      const created = await createPost(formData);

      console.log("[UPLOAD] Backend response:", created);

      if (created && created._id) {
        setPosts([created, ...posts]);
        // Reset form
        setTitle("");
        setContent("");
        setImage(null);
        setImagePreview("");
        console.log("[UPLOAD] Success - post added to feed");
      } else {
        throw new Error("No valid post returned from server");
      }
    } catch (err) {
      console.error("[UPLOAD] Failed:", err);
      setError(err.message || "Failed to publish post. Check console for details.");
      alert("Error publishing: " + (err.message || "Check console"));
    } finally {
      setPublishing(false);
    }
  };

  const handleLikeUpdate = (updated) => {
    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
  };

  const handleComment = async (postId, text) => {
    try {
      const updated = await commentOnPost(postId, text);
      setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      return updated;
    } catch (err) {
      console.error("Comment error:", err);
      throw err;
    }
  };

  const handleDeletePost = (deletedPostId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
  };

  const handleEditPost = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const updated = await deleteComment(postId, commentId);
      setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      return updated;
    } catch (err) {
      console.error("Delete comment error:", err);
      throw err;
    }
  };

  return (
    <div className="grid grid-2">
      <section className="card">
        <h3>Create Post</h3>
        <form className="mt-12" onSubmit={newPost}>
          <input
            className="input mb-12"
            name="title"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={publishing}
          />
          <textarea
            className="textarea mb-12"
            name="content"
            placeholder="Share something..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="4"
            disabled={publishing}
          />

          {/* Image Upload */}
          <div className="image-upload-section mb-12">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="image-input"
              id="image-upload"
              disabled={publishing}
            />
            <label htmlFor="image-upload" className={`btn secondary ${publishing ? 'disabled' : ''}`}>
              📷 Add Image
            </label>

            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" style={{ maxHeight: "180px" }} />
                <button
                  type="button"
                  onClick={removeImage}
                  className="btn small danger"
                  disabled={publishing}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {error && <div className="error mb-12" style={{ color: "#ff6666" }}>{error}</div>}

          <button
            className="btn"
            type="submit"
            disabled={publishing || (!title.trim() && !content.trim() && !image)}
          >
            {publishing ? "Publishing..." : "Publish"}
          </button>
        </form>
      </section>

      <section className="feed col-span-2">
        {loading && <div className="card mt-16">Loading feed...</div>}
        {error && !publishing && (
          <div className="card mt-16" style={{ borderColor: "#663", background: "#1b1414" }}>
            {error}
          </div>
        )}

        <div className="stack mt-16">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLike={handleLikeUpdate}
              onComment={handleComment}
              onDelete={handleDeletePost}
              onEdit={handleEditPost}
              onDeleteComment={handleDeleteComment}
            />
          ))}
          {!loading && posts.length === 0 && (
            <div className="card">No posts yet. Be the first to post!</div>
          )}
        </div>
      </section>
    </div>
  );
}