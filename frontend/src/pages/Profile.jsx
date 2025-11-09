import React, { useEffect, useState } from "react";
import "./Profile.css";
import { useParams } from "react-router-dom";
import { getProfile, followUser, checkIsFollowing } from "../services/users";
import { fetchPosts } from "../services/posts";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import { commentOnPost, deleteComment } from "../services/posts";

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Function to get first letter of username
  // Add these functions inside the Profile component
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
  const getInitial = (username) => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [userData, isFollowingData, allPosts] = await Promise.all([
        getProfile(id),
        currentUser && currentUser._id !== id ? checkIsFollowing(id) : { isFollowing: false },
        fetchPosts()
      ]);
      
      setProfile(userData);
      setIsFollowing(isFollowingData.isFollowing);
      setPosts(allPosts.filter(p => p.author?._id === id));
    } catch (error) {
      console.error('Error loading profile:', error);
      setError("Failed to load profile: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (id) {
      loadProfile();
    }
  }, [id]);

  const handleFollow = async () => {
    try {
      const result = await followUser(id);
      setIsFollowing(result.isFollowing);
      await loadProfile(); // Reload to get updated follower count
    } catch (error) {
      console.error('Error following user:', error);
      alert('Failed to follow user: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return <div className="card" style={{textAlign: 'center', padding: '40px'}}>Loading profile...</div>;
  }

  if (error) {
    return <div className="card" style={{borderColor:"#663", background:"#1b1414"}}>{error}</div>;
  }

  if (!profile) {
    return <div className="card">Profile not found</div>;
  }

  return (
    <div className="profile-layout">
      {/* PROFILE HEADER CARD */}
      <section className="card profile-header">
        <div className="profile-info">
        
<div className="avatar-large" data-letter={getInitial(profile.username)}>
  {/* REMOVE THIS TEXT: {getInitial(profile.username)} */}
</div>
          
          <div className="profile-details">
            <h2>{profile.username}</h2>
            <div className="profile-email">{profile.email}</div>
            
            <div className="profile-stats">
              <div className="stat">
                <strong>{profile.followers?.length || 0}</strong>
                <span>Followers</span>
              </div>
              <div className="stat">
                <strong>{profile.following?.length || 0}</strong>
                <span>Following</span>
              </div>
              <div className="stat">
                <strong>{posts.length}</strong>
                <span>Posts</span>
              </div>
            </div>
          </div>
          
          {currentUser && currentUser._id !== id && (
  <div className="follow-section">
    <button 
      className={`btn ${isFollowing ? 'secondary' : ''}`}
      onClick={handleFollow}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </button>
  </div>
)}
        </div>
      </section>

      {/* POSTS SECTION */}
      <section className="posts-section">
  <div className="card">
    <h3>Recent Posts</h3>
    <div className="stack mt-12">
      {posts.map(p => (
        <PostCard 
          key={p._id} 
          post={p} 
          onLike={handleLikeUpdate}
          onComment={handleComment}
          onDelete={handleDeletePost}
          onEdit={handleEditPost}
          onDeleteComment={handleDeleteComment}
        />
      ))}
      {posts.length === 0 && (
        <div className="no-posts">
          {currentUser && currentUser._id === id 
            ? "You haven't posted anything yet. Start sharing your thoughts!" 
            : "This user hasn't posted anything yet."
          }
        </div>
      )}
    </div>
  </div>
</section>
    </div>
  );
}