import React, { useEffect, useState } from "react";
import "./Profile.css";
import { useParams } from "react-router-dom";
import { getProfile, followUser, checkIsFollowing, updateProfile } from "../services/users";
import { fetchPosts, commentOnPost, deleteComment } from "../services/posts";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    username: "",
    bio: "",
    currentPassword: "",
    newPassword: ""
  });

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
      
      // Initialize edit form with current data
      setEditForm({
        username: userData.username || "",
        bio: userData.bio || "",
        currentPassword: "",
        newPassword: ""
      });
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

  // Edit profile functions
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setEditLoading(true);
      
      const updatedProfile = await updateProfile(editForm);
      
      // Update local state
      setProfile(updatedProfile);
      
      // Update current user in context if editing own profile
      if (currentUser._id === id) {
        setUser(updatedProfile);
      }
      
      setIsEditing(false);
      alert("Profile updated successfully!");
      
      // Reset password fields
      setEditForm(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: ""
      }));
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + error.message);
    } finally {
      setEditLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    // Reset form to current profile data
    setEditForm({
      username: profile.username || "",
      bio: profile.bio || "",
      currentPassword: "",
      newPassword: ""
    });
  };

  // Post interaction handlers
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

  if (loading) {
    return <div className="card" style={{textAlign: 'center', padding: '40px'}}>Loading profile...</div>;
  }

  if (error) {
    return <div className="card" style={{borderColor:"#663", background:"#1b1414"}}>{error}</div>;
  }

  if (!profile) {
    return <div className="card">Profile not found</div>;
  }

  const isOwnProfile = currentUser && currentUser._id === id;

  return (
    <div className="profile-layout">
      {/* PROFILE HEADER CARD */}
      <section className="card profile-header">
        <div className="profile-info">
          {isEditing ? (
            // EDIT MODE
            <div className="edit-profile-form">
              <div className="avatar-section">
                <div className="avatar-large" data-letter={getInitial(editForm.username)}>
                  {profile.profilePicture?.url && (
                    <img 
                      src={`http://localhost:5000${profile.profilePicture.url}`} 
                      alt="Profile" 
                      className="avatar-preview"
                    />
                  )}
                </div>
                <div className="avatar-note">
                  <small>Profile picture uses first letter of username</small>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="edit-form-fields">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={editForm.username}
                    onChange={handleEditChange}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={editForm.bio}
                    onChange={handleEditChange}
                    className="textarea"
                    rows="3"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="form-group">
                  <label>Current Password (to change password)</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={editForm.currentPassword}
                    onChange={handleEditChange}
                    className="input"
                    placeholder="Enter current password to change it"
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={editForm.newPassword}
                    onChange={handleEditChange}
                    className="input"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="edit-actions">
                  <button 
                    type="submit" 
                    className="btn"
                    disabled={editLoading}
                  >
                    {editLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button 
                    type="button" 
                    onClick={cancelEdit}
                    className="btn secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // VIEW MODE
            <>
              <div className="avatar-large" data-letter={getInitial(profile.username)}>
                {profile.profilePicture?.url && (
                  <img 
                    src={`http://localhost:5000${profile.profilePicture.url}`} 
                    alt="Profile" 
                    className="avatar-preview"
                  />
                )}
              </div>
              
              <div className="profile-details">
                <h2>{profile.username}</h2>
                <div className="profile-email">{profile.email}</div>
                
                {profile.bio && (
                  <div className="profile-bio">{profile.bio}</div>
                )}
                
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
              
              {isOwnProfile ? (
                <div className="profile-actions">
                  <button 
                    className="btn"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <div className="follow-section">
                  <button 
                    className={`btn ${isFollowing ? 'secondary' : ''}`}
                    onClick={handleFollow}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* POSTS SECTION */}
      {!isEditing && (
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
                  {isOwnProfile 
                    ? "You haven't posted anything yet. Start sharing your thoughts!" 
                    : "This user hasn't posted anything yet."
                  }
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}