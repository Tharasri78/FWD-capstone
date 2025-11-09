// services/users.js
const API_URL = 'http://localhost:5000/api'; // Add this line

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