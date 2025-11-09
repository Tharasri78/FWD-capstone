import React, { useEffect, useState } from "react";
import "./Profile.css";
import { useParams } from "react-router-dom";
import { getProfile, followUser, checkIsFollowing } from "../services/users";
import { fetchPosts } from "../services/posts";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Function to get first letter of username
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
      await loadProfile();
    } catch (error) {
      console.error('Error following user:', error);
      alert('Failed to follow user: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return <div className="card">Loading profile...</div>;
  }

  if (error) {
    return <div className="card" style={{borderColor:"#663", background:"#1b1414"}}>{error}</div>;
  }

  if (!profile) {
    return <div className="card">Profile not found</div>;
  }

  return (
    <div className="profile-layout">
      {/* PROFILE CARD - TOP */}
      <section className="card profile-header">
        <div className="profile-info">
          // In the profile section, update the avatar:
<div className="avatar-large" data-letter={getInitial(profile.username)}>
  {getInitial(profile.username)}
</div>
          <div className="profile-details">
            <h2>{profile.username}</h2>
            <div className="mute">{profile.email}</div>
            <p className="profile-bio">{profile.bio || "No bio yet."}</p>
            <div className="profile-stats">
              <span className="stat">
                <strong>{profile.followers?.length || 0}</strong> Followers
              </span>
              <span className="stat">
                <strong>{profile.following?.length || 0}</strong> Following
              </span>
              <span className="stat">
                <strong>{posts.length}</strong> Posts
              </span>
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

      {/* POSTS SECTION - MIDDLE/CENTER */}
      <section className="posts-section">
        <div className="card">
          <h3>Recent Posts</h3>
          <div className="stack mt-12">
            {posts.map(p => (
              <PostCard key={p._id} post={p} onLike={() => {}} onComment={() => {}} />
            ))}
            {posts.length === 0 && <div className="mute">No posts yet.</div>}
          </div>
        </div>
      </section>
    </div>
  );
}