const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

// Create new post (image or video)
router.post("/", protect, async (req, res) => {
  try {
    const { caption, mediaUrl, mediaType } = req.body;

    if (!caption || !mediaUrl || !mediaType) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const post = new Post({
      user: req.user.userId,
      caption,
      mediaUrl,
      mediaType
    });

    await post.save();
    res.status(201).json({ msg: "Post created successfully", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all public posts + followed user's private posts
router.get("/all", protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);

    const followedIds = currentUser.following;
    const allUsers = await User.find({});

    const publicUserIds = allUsers
      .filter((u) => !u.isPrivate || followedIds.includes(u._id))
      .map((u) => u._id);

    const posts = await Post.find({ user: { $in: publicUserIds } })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get only followed user's posts
router.get("/followed", protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    const posts = await Post.find({ user: { $in: currentUser.following } })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
