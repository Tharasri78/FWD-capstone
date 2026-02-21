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

/* ================= LIKE POST ================= */
router.put("/:id/like", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (!post.likes.includes(req.userId)) {
      post.likes.push(req.userId);

      // 🔔 CREATE NOTIFICATION
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

    // 🔔 CREATE NOTIFICATION
    if (post.author.toString() !== req.userId) {
      await Notification.create({
        recipient: post.author,
        sender: req.userId,
        type: "comment",
        text: "commented on your post",
      });
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;