const express = require("express");
const Post = require("../models/Post");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// @route    POST /api/posts
// @desc     Create a new post (image or video)
// @access   Private
router.post("/", auth, async (req, res) => {
  const { caption, mediaUrl, mediaType } = req.body;

  if (!caption || !mediaUrl || !mediaType) {
    return res.status(400).json({ msg: "Caption, media URL, and media type are required" });
  }

  if (!["image", "video"].includes(mediaType)) {
    return res.status(400).json({ msg: "mediaType must be either 'image' or 'video'" });
  }

  try {
    const post = new Post({
      caption,
      mediaUrl,
      mediaType,
      user: req.user.userId,
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route    GET /api/posts
// @desc     Get all posts (latest first)
// @access   Public
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route    GET /api/posts/:id
// @desc     Get single post by ID
// @access   Public
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("user", "name email");

    if (!post) return res.status(404).json({ msg: "Post not found" });

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route    DELETE /api/posts/:id
// @desc     Delete a post (only if user is owner)
// @access   Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ msg: "Post not found" });

    if (post.user.toString() !== req.user.userId) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await post.deleteOne();
    res.status(200).json({ msg: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
