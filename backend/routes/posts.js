const express = require("express");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const jwt = require("jsonwebtoken");

const router = express.Router();

/* ================= AUTH ================= */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
};

/* ================= GET ALL POSTS (FIX) ================= */
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username")
      .populate("comments.user", "username")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Fetch posts error:", err);
    res.status(500).json({ error: "Failed to load posts" });
  }
});

/* ================= CREATE POST ================= */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const post = await Post.create({
      title: req.body.title,
      content: req.body.content,
      author: req.userId,
    });

    const populatedPost = await Post.findById(post._id)
      .populate("author", "username");

    res.json(populatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= LIKE POST ================= */
router.put("/:id/like", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (!post.likes.includes(req.userId)) {
      post.likes.push(req.userId);

      if (post.author.toString() !== req.userId) {
        await Notification.create({
          recipient: post.author,
          sender: req.userId,
          type: "like",
          text: "liked your post",
        });
      }
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= COMMENT ================= */
router.post("/:id/comment", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.comments.push({
      user: req.userId,
      text: req.body.text,
      date: new Date(),
    });

    if (post.author.toString() !== req.userId) {
      await Notification.create({
        recipient: post.author,
        sender: req.userId,
        type: "comment",
        text: "commented on your post",
      });
    }

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate("author", "username")
      .populate("comments.user", "username");

    res.json(populatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;