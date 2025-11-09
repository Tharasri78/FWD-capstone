// services/posts.js
const API_URL = 'http://localhost:5000/api'; // Add this line

// Get token function (make sure this exists)
const getToken = () => {
  return localStorage.getItem('token');
};

// Create post function (updated for FormData)
export const createPost = async (postData) => {
  const response = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    body: postData,
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      // Don't set Content-Type for FormData
    },
  });
  return await response.json();
};

// Your other post functions...
export const fetchPosts = async () => {
  const response = await fetch(`${API_URL}/posts`);
  return await response.json();
};

export const likePost = async (postId) => {
  const response = await fetch(`${API_URL}/posts/${postId}/like`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

export const commentOnPost = async (postId, text) => {
  const response = await fetch(`${API_URL}/posts/${postId}/comment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  return await response.json();
};

export const deletePost = async (postId) => {
  const response = await fetch(`${API_URL}/posts/${postId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  return await response.json();
};

export const editPost = async (postId, postData) => {
  const response = await fetch(`${API_URL}/posts/${postId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });
  return await response.json();
};

export const deleteComment = async (postId, commentId) => {
  const response = await fetch(`${API_URL}/posts/${postId}/comment/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  return await response.json();
};