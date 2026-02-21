const express = require("express");
const Notification = require("../models/Notification");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Auth middleware
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

// GET notifications for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.userId,
    })
      .populate("sender", "username")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;