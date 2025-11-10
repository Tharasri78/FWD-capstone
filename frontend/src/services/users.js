// services/users.js
const API_URL = "http://localhost:5000/api";

const getToken = () => {
  return localStorage.getItem('token');
};

export const getProfile = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}`);
  return await response.json();
};

export const followUser = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}/follow`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  return await response.json();
};

export const checkIsFollowing = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}/is-following`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  return await response.json();
};

// Update user profile
export const updateProfile = async (profileData) => {
  const formData = new FormData();
  
  // Append text fields
  if (profileData.username) formData.append('username', profileData.username);
  if (profileData.bio !== undefined) formData.append('bio', profileData.bio);
  if (profileData.currentPassword) formData.append('currentPassword', profileData.currentPassword);
  if (profileData.newPassword) formData.append('newPassword', profileData.newPassword);
  
  // Append profile picture if provided
  if (profileData.profilePicture) {
    formData.append('profilePicture', profileData.profilePicture);
  }

  const response = await fetch(`${API_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      // Don't set Content-Type for FormData - let browser set it
    },
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update profile');
  }
  
  return await response.json();
};