import React, { useEffect, useState } from "react";
import { fetchPosts } from "../services/posts";
import PostCard from "../components/PostCard";
import "./Trending.css";

export default function Trending() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTrendingPosts = async () => {
    try {
      setLoading(true);
      const data = await fetchPosts();
      
      // Calculate engagement score and sort
      const trendingPosts = data
        .map(post => ({
          ...post,
          engagement: (post.likes?.length || 0) + (post.comments?.length || 0)
        }))
        .sort((a, b) => b.engagement - a.engagement);
      
      setPosts(trendingPosts);
    } catch (e) {
      setError("Failed to load trending posts");
      console.error("Load trending error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadTrendingPosts(); 
  }, []);

  const handleLikeUpdate = (updated) => {
    setPosts((prev) => prev.map(post => post._id === updated._id ? updated : post));
  };

  const handleComment = async (postId, text) => {
    try {
      const updated = await commentOnPost(postId, text);
      setPosts((prev) => prev.map(post => post._id === updated._id ? updated : post));
      return updated;
    } catch (error) {
      console.error('Error commenting:', error);
      throw error;
    }
  };

  const handleDeletePost = (deletedPostId) => {
    setPosts((prev) => prev.filter(post => post._id !== deletedPostId));
  };

  const handleEditPost = (updatedPost) => {
    setPosts((prev) => prev.map(post => post._id === updatedPost._id ? updatedPost : post));
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const updated = await deleteComment(postId, commentId);
      setPosts((prev) => prev.map(post => post._id === updated._id ? updated : post));
      return updated;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  };

  return (
    <div className="trending-page">
      <div className="trending-header card">
        <h1>🔥 Trending Posts</h1>
        <p className="muted">Most engaging posts based on likes and comments</p>
      </div>

      {loading && <div className="card mt-16">Loading trending posts...</div>}
      {error && <div className="card mt-16 error">{error}</div>}
      
      <div className="trending-grid">
        {posts.map((post, index) => (
          <div key={post._id} className="trending-post-card">
            <div className="trending-badge">
              #{index + 1} Trending
            </div>
            <div className="engagement-stats">
              <span>❤️ {post.likes?.length || 0}</span>
              <span>💬 {post.comments?.length || 0}</span>
              <span>🔥 {post.engagement || 0}</span>
            </div>
            <PostCard 
              post={post} 
              onLike={handleLikeUpdate} 
              onComment={handleComment}
              onDelete={handleDeletePost}
              onEdit={handleEditPost}
              onDeleteComment={handleDeleteComment}
            />
          </div>
        ))}
      </div>
      
      {!loading && posts.length === 0 && (
        <div className="card mt-16 center">
          <h3>No trending posts yet</h3>
          <p className="muted">Be the first to create engaging content!</p>
        </div>
      )}
    </div>
  );
}