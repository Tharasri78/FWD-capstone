// backend/middleware/upload.js

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

/* ================= CLOUDINARY CONFIG ================= */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ================= MULTER STORAGE ================= */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "microblog_posts",       // folder in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [
      { width: 1200, crop: "limit" } // optional optimization
    ],
  },
});

/* ================= MULTER INSTANCE ================= */
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;