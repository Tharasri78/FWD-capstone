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

  const load = async () => {
    try {
      const data = await fetchPosts();
      setPosts(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (e) {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };
// Add this useEffect to your Feed.jsx
useEffect(() => {
  // Check if URL has hash for specific post
  const hash = window.location.hash;
  if (hash && hash.startsWith('#post-')) {
    const postId = hash.replace('#post-', '');
    setTimeout(() => {
      const element = document.getElementById(`post-${postId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        // Add highlight effect
        element.style.backgroundColor = 'rgba(246, 177, 122, 0.1)';
        setTimeout(() => {
          element.style.backgroundColor = '';
        }, 2000);
      }
    }, 500);
  }
}, [posts]);z
  useEffect(() => { load(); }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview("");
  };

  const newPost = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      console.log('Creating post...'); // Debug
      const created = await createPost(formData);
      console.log('Post created:', created); // Debug
      
      if (created && created._id) {
        setPosts([created, ...posts]);
        setTitle("");
        setContent("");
        setImage(null);
        setImagePreview("");
        console.log('Post added to feed'); // Debug
      } else {
        alert('Failed to create post: ' + (created?.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Create post error:', err);
      alert('Failed to create post: ' + (err.response?.data?.error || err.message));
    }
  };

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
  // Add this to your Feed.jsx
useEffect(() => {
  // Check if URL has hash for specific post (from shared link)
  const hash = window.location.hash;
  if (hash && hash.startsWith('#post-')) {
    const postId = hash.replace('#post-', '');
    
    // Wait for posts to load
    const timer = setTimeout(() => {
      const element = document.getElementById(`post-${postId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        // Add highlight effect
        element.style.backgroundColor = 'rgba(246, 177, 122, 0.1)';
        element.style.transition = 'background-color 0.3s ease';
        
        setTimeout(() => {
          element.style.backgroundColor = '';
        }, 3000);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }
}, [posts]);

  return (
    <div className="grid grid-2">
      <section className="card">
        <h3>Create Post</h3>
        <form className="mt-12" onSubmit={newPost} encType="multipart/form-data">
          <input 
            className="input mb-12" 
            name="title" 
            placeholder="Title" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea 
            className="textarea mb-12" 
            name="content" 
            placeholder="Share something..." 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows="4"
          />
          
          {/* Image Upload Section */}
          <div className="image-upload-section mb-12">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              className="image-input"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="btn secondary">
              📷 Add Image
            </label>
            
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button type="button" onClick={removeImage} className="btn small danger">
                  Remove Image
                </button>
              </div>
            )}
          </div>
          
          <button className="btn" type="submit">Publish</button>
        </form>
      </section>

      

      <section className="feed col-span-2">
        {loading && <div className="card mt-16">Loading feed...</div>}
        {error && <div className="card mt-16" style={{borderColor:"#663", background:"#1b1414"}}>{error}</div>}
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
          {!loading && posts.length === 0 && <div className="card">No posts yet. Be the first to post!</div>}
        </div>
      </section>
    </div>
  );
}