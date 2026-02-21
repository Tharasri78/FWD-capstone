// src/services/posts.js
import BASE_URL from "./base";  // keep your existing import

const API_URL = `${BASE_URL}/api`;

// Get token
const getToken = () => localStorage.getItem('token');

// Helper for JSON-based requests
const apiRequest = async (url, options = {}) => {
  try {
    const headers = {
      ...options.headers,
      Authorization: getToken() ? `Bearer ${getToken()}` : '',
    };

    // Only set Content-Type for JSON requests
    if (options.body && typeof options.body === 'string') {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

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
  return apiRequest(`${API_URL}/posts`);
};

// Critical fix: createPost with FormData (multipart upload)
export const createPost = async (formData) => {
  try {
    const token = getToken();

    // Debug logs – very important for diagnosing
    console.log('[createPost] Sending to URL:', `${API_URL}/posts`);

    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`[createPost] File attached: ${key} → ${value.name} (${(value.size / 1024).toFixed(1)} KB)`);
      } else {
        console.log(`[createPost] Field: ${key} → ${value}`);
      }
    }

    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        // NO Content-Type here – browser adds multipart/form-data + boundary automatically
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[createPost] Error response:', response.status, errorData);
      throw new Error(errorData.error || `Failed to create post (status ${response.status})`);
    }

    const data = await response.json();
    console.log('[createPost] Success – returned post:', data);
    return data;
  } catch (err) {
    console.error('[createPost] Full error:', err);
    throw err;
  }
};

// Like post
export const likePost = async (postId) => {
  return apiRequest(`${API_URL}/posts/${postId}/like`, {
    method: 'PUT',
  });
};

// Comment on post
export const commentOnPost = async (postId, text) => {
  return apiRequest(`${API_URL}/posts/${postId}/comment`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
};

// Delete post
export const deletePost = async (postId) => {
  return apiRequest(`${API_URL}/posts/${postId}`, {
    method: 'DELETE',
  });
};

// Edit post
export const editPost = async (postId, postData) => {
  return apiRequest(`${API_URL}/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(postData),
  });
};

// Delete comment
export const deleteComment = async (postId, commentId) => {
  return apiRequest(`${API_URL}/posts/${postId}/comment/${commentId}`, {
    method: 'DELETE',
  });
};

// Optional extras you had
export const fetchPostById = async (postId) => {
  return apiRequest(`${API_URL}/posts/${postId}`);
};

export const fetchPostsByUser = async (userId) => {
  return apiRequest(`${API_URL}/posts?author=${userId}`);
};