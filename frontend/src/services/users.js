// services/users.js
import BASE_URL from "./base";

const API_URL = `${BASE_URL}/api`;

const getToken = () => {
  return localStorage.getItem("token");
};

/* ================= PUBLIC PROFILE (OTHER USERS) ================= */
export const getProfile = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}`);
  return await response.json();
};

/* ================= MY PROFILE (LOGGED-IN USER) ================= */
export const getMyProfile = async () => {
  const response = await fetch(`${API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return await response.json();
};

/* ================= FOLLOW / UNFOLLOW ================= */
export const followUser = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}/follow`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return await response.json();
};

export const checkIsFollowing = async (userId) => {
  const response = await fetch(
    `${API_URL}/users/${userId}/is-following`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  return await response.json();
};

/* ================= UPDATE PROFILE ================= */
export const updateProfile = async (profileData) => {
  const formData = new FormData();

  if (profileData.username)
    formData.append("username", profileData.username);
  if (profileData.bio !== undefined)
    formData.append("bio", profileData.bio);
  if (profileData.currentPassword)
    formData.append("currentPassword", profileData.currentPassword);
  if (profileData.newPassword)
    formData.append("newPassword", profileData.newPassword);

  if (profileData.profilePicture) {
    formData.append("profilePicture", profileData.profilePicture);
  }

  const response = await fetch(`${API_URL}/users/profile`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update profile");
  }

  return await response.json();
};