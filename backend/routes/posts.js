const express = require("express");
const Post = require("../models/Post");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Middleware to check token
function authMiddleware(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "No token" });

  jwt.verify(token, "secretkey", (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
}

// Create post
router.post("/", authMiddleware, async (req, res) => {
  try {
    const post = new Post({
      author: req.userId,
      title: req.body.title,
      content: req.body.content,
    });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all posts
router.get("/", async (req, res) => {
  const posts = await Post.find().populate("author", "username");
  res.json(posts);
});

// Like post
router.put("/:id/like", authMiddleware, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post.likes.includes(req.userId)) {
    post.likes.push(req.userId);
  }
  await post.save();
  res.json(post);
});

// Comment
router.post("/:id/comment", authMiddleware, async (req, res) => {
  const post = await Post.findById(req.params.id);
  post.comments.push({ user: req.userId, text: req.body.text });
  await post.save();
  res.json(post);
});

module.exports = router;
