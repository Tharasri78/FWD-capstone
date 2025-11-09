const express = require("express");
const Post = require("../models/Post");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Middleware to check token
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  
  if (!authHeader) {
    return res.status(401).json({ error: "No authorization header" });
  }

  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : authHeader;

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  jwt.verify(token, "secretkey", (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.userId = decoded.id;
    next();
  });
}

// Helper function to populate post data
const populatePost = (postId) => {
  return Post.findById(postId)
    .populate("author", "username")
    .populate("comments.user", "username");
};

// Create post
router.post("/", authMiddleware, async (req, res) => {
  try {
    const post = new Post({
      author: req.userId,
      title: req.body.title,
      content: req.body.content,
    });
    await post.save();
    
    const populatedPost = await populatePost(post._id);
    res.json(populatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username")
      .populate("comments.user", "username");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like post
router.put("/:id/like", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.userId)) {
      post.likes.push(req.userId);
    }
    await post.save();
    
    const populatedPost = await populatePost(req.params.id);
    res.json(populatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Comment
router.post("/:id/comment", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.comments.push({ user: req.userId, text: req.body.text });
    await post.save();
    
    const populatedPost = await populatePost(req.params.id);
    res.json(populatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;