import React, { useEffect, useState } from "react";
import "./Feed.css";
import { fetchPosts, createPost, commentOnPost } from "../services/posts";
import PostCard from "../components/PostCard";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const load = async () => {
    try {
      const data = await fetchPosts();
      setPosts(data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (e) {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const newPost = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    
    try {
      const created = await createPost({ title, content });
      setPosts([created, ...posts]);
      // Clear form fields
      setTitle("");
      setContent("");
    } catch (err) {
      console.error('Create post error:', err);
      alert('Failed to create post: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleLikeUpdate = (updated) => {
    setPosts((prev) => prev.map(p => p._id === updated._id ? updated : p));
  };

  const handleComment = async (postId, text) => {
    const updated = await commentOnPost(postId, text);
    setPosts((prev) => prev.map(p => p._id === updated._id ? updated : p));
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
          />
          <textarea 
            className="textarea mb-12" 
            name="content" 
            placeholder="Share something..." 
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button className="btn">Publish</button>
        </form>
      </section>

      <aside className="card">
        <h3>Tips</h3>
        <p className="mute">Keep posts concise. Use simple language. Be kind 🙂</p>
      </aside>

      <section className="feed col-span-2">
        {loading && <div className="card mt-16">Loading feed...</div>}
        {error && <div className="card mt-16" style={{borderColor:"#663", background:"#1b1414"}}>{error}</div>}
        <div className="stack mt-16">
          {posts.map((p) => (
            <PostCard key={p._id} post={p} onLike={handleLikeUpdate} onComment={handleComment} />
          ))}
          {!loading && posts.length === 0 && <div className="card">No posts yet. Be the first to post!</div>}
        </div>
      </section>
    </div>
  );
}