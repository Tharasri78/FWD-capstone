const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Follow
router.put("/:id/follow", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const current = await User.findById(req.body.userId);

    if (!user.followers.includes(req.body.userId)) {
      user.followers.push(req.body.userId);
      current.following.push(req.params.id);
    }
    await user.save();
    await current.save();
    res.json({ message: "Followed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get profile
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  res.json(user);
});

module.exports = router;
