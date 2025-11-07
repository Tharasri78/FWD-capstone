import api from "./api";

export const register = async (payload) => {
  const { data } = await api.post("/api/auth/register", payload);
  return data;
};

export const loginApi = async (payload) => {
  const { data } = await api.post("/api/auth/login", payload);
  // returns { token, user }
  return data;
};
