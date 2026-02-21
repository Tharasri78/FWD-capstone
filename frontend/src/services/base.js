const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";
if (!BASE_URL) {
  throw new Error("VITE_API_URL missing");
}

export default BASE_URL;