const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  throw new Error("❌ VITE_API_URL is not defined");
}

export default BASE_URL;