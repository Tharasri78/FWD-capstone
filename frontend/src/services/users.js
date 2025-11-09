import api from "./api";

export const followUser = async (userId) => {
  const { data } = await api.put(`/api/users/${userId}/follow`);
  return data;
};

export const checkIsFollowing = async (userId) => {
  const { data } = await api.get(`/api/users/${userId}/is-following`);
  return data;
};

export const getProfile = async (userId) => {
  const { data } = await api.get(`/api/users/${userId}`);
  return data;
};