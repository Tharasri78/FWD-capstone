const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const userRoutes = require("./routes/users");

dotenv.config();

/* ================= ENV VALIDATION ================= */
if (!process.env.MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is not defined");
}

if (!process.env.JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is not defined");
}

/* ================= APP INIT ================= */
const app = express();

/* ================= MIDDLEWARE ================= */
app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:5173",
        process.env.FRONTEND_URL
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

app.use("/uploads", express.static("uploads"));

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);

/* ================= DATABASE ================= */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});