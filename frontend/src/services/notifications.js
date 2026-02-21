import BASE_URL from "./base";

const API_URL = `${BASE_URL}/api`;

const getToken = () => localStorage.getItem("token");

export const getNotifications = async () => {
  const res = await fetch(`${API_URL}/notifications`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return await res.json();
};