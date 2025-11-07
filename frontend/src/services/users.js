import api from "./api";

export const getProfile = async (id) => {
  const { data } = await api.get(`/api/users/${id}`);
  return data;
};

export const followUser = async (id, currentUserId) => {
  const { data } = await api.put(`/api/users/${id}/follow`, { userId: currentUserId });
  return data;
};
