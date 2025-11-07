import api from "./api";

export const fetchPosts = async () => {
  const { data } = await api.get("/api/posts");
  return data;
};

export const createPost = async (payload) => {
  const { data } = await api.post("/api/posts", payload);
  return data;
};

export const likePost = async (postId) => {
  const { data } = await api.put(`/api/posts/${postId}/like`);
  return data;
};

export const commentOnPost = async (postId, text) => {
  const { data } = await api.post(`/api/posts/${postId}/comment`, { text });
  return data;
};
