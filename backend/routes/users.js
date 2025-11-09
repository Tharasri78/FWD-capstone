const express = require("express");
const User = require("../models/User");
const Notification = require("../models/Notification");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Auth middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No authorization header" });
  
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (!token) return res.status(401).json({ error: "No token" });

  jwt.verify(token, "secretkey", (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
}

// Follow user
router.put("/:id/follow", authMiddleware, async (req, res) => {
  try {
    if (req.userId === req.params.id) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const isFollowing = userToFollow.followers.includes(req.userId);

    if (!isFollowing) {
      // Follow
      userToFollow.followers.push(req.userId);
      currentUser.following.push(req.params.id);
      
      // Create notification
      const notification = new Notification({
        recipient: req.params.id,
        sender: req.userId,
        type: "follow",
        text: "started following you"
      });
      await notification.save();
      
    } else {
      // Unfollow
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== req.userId
      );
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== req.params.id
      );
    }

    await userToFollow.save();
    await currentUser.save();

    res.json({ 
      message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
      isFollowing: !isFollowing 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check if following
router.get("/:id/is-following", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const isFollowing = user.followers.includes(req.userId);
    res.json({ isFollowing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get profile
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "username")
      .populate("following", "username");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;