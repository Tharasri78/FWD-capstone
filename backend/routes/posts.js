const express = require("express");
const Post = require("../models/Post");
const jwt = require("jsonwebtoken");
const upload = require("../middleware/upload");
const fs = require("fs");

const router = express.Router();

/* ================= AUTH MIDDLEWARE ================= */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No authorization header" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  // ✅ JWT FIX HERE
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.userId = decoded.id;
    next();
  });
}

/* ================= HELPERS ================= */
const populatePost = (postId) => {
  return Post.findById(postId)
    .populate("author", "username")
    .populate("comments.user", "username");
};

/* ================= ROUTES ================= */

// Create post (with image)
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const postData = {
      author: req.userId,
      title: req.body.title,
      content: req.body.content,
    };

    if (req.file) {
      postData.image = {
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
      };
    }

    const post = new Post(postData);
    await post.save();

    const populatedPost = await populatePost(post._id);
    res.json(populatedPost);
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
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
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (!post.likes.includes(req.userId)) {
      post.likes.push(req.userId);
      await post.save();
    }

    const populatedPost = await populatePost(req.params.id);
    res.json(populatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Comment on post
router.post("/:id/comment", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    post.comments.push({
      user: req.userId,
      text: req.body.text,
    });

    await post.save();
    const populatedPost = await populatePost(req.params.id);
    res.json(populatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete post
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.author.toString() !== req.userId) {
      return res
        .status(403)
        .json({ error: "You can only delete your own posts" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit post
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.author.toString() !== req.userId) {
      return res
        .status(403)
        .json({ error: "You can only edit your own posts" });
    }

    post.title = req.body.title ?? post.title;
    post.content = req.body.content ?? post.content;

    await post.save();
    const populatedPost = await populatePost(req.params.id);
    res.json(populatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete comment
router.delete(
  "/:postId/comment/:commentId",
  authMiddleware,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      const comment = post.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      if (
        comment.user.toString() !== req.userId &&
        post.author.toString() !== req.userId
      ) {
        return res
          .status(403)
          .json({ error: "You can only delete your own comments" });
      }

      post.comments.pull(req.params.commentId);
      await post.save();

      const populatedPost = await populatePost(req.params.postId);
      res.json(populatedPost);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;