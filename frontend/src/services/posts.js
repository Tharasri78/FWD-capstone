// services/posts.js
import BASE_URL from "./base";

const API_URL = `${BASE_URL}/api`;

// Get token function
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function for API calls
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Fetch all posts
export const fetchPosts = async () => {
  return await apiRequest(`${API_URL}/posts`);
};

// Create post with image upload
export const createPost = async (postData) => {
  return await apiRequest(`${API_URL}/posts`, {
    method: 'POST',
    body: postData,
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      // Don't set Content-Type for FormData - let browser set it
    },
  });
};

// Like a post
export const likePost = async (postId) => {
  return await apiRequest(`${API_URL}/posts/${postId}/like`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
};

// Comment on a post
export const commentOnPost = async (postId, text) => {
  return await apiRequest(`${API_URL}/posts/${postId}/comment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
};

// Delete a post
export const deletePost = async (postId) => {
  return await apiRequest(`${API_URL}/posts/${postId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
};

// Edit a post
export const editPost = async (postId, postData) => {
  return await apiRequest(`${API_URL}/posts/${postId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });
};

// Delete a comment
export const deleteComment = async (postId, commentId) => {
  return await apiRequest(`${API_URL}/posts/${postId}/comment/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
};

// Get single post by ID
export const fetchPostById = async (postId) => {
  return await apiRequest(`${API_URL}/posts/${postId}`);
};

// Get posts by user ID
export const fetchPostsByUser = async (userId) => {
  return await apiRequest(`${API_URL}/posts?author=${userId}`);
};