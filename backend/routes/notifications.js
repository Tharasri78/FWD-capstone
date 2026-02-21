const express = require("express");
const Notification = require("../models/Notification");
const jwt = require("jsonwebtoken");

const router = express.Router();

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
};

router.get("/", authMiddleware, async (req, res) => {
  const notifications = await Notification.find({
    recipient: req.userId,
  })
    .populate("sender", "username")
    .sort({ createdAt: -1 });

  res.json(notifications);
});

module.exports = router;