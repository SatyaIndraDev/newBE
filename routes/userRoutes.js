const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password, isPrivate } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, isPrivate });
    await newUser.save();

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET CURRENT USER
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FOLLOW or SEND FOLLOW REQUEST
router.post("/follow/:id", protect, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.userId);

    if (!targetUser) return res.status(404).json({ msg: "User not found" });
    if (currentUser.following.includes(targetUser._id))
      return res.status(400).json({ msg: "Already following" });

    if (targetUser.isPrivate) {
      if (targetUser.followRequests.includes(currentUser._id)) {
        return res.status(400).json({ msg: "Follow request already sent" });
      }
      targetUser.followRequests.push(currentUser._id);
      await targetUser.save();
      return res.json({ msg: "Follow request sent" });
    }

    currentUser.following.push(targetUser._id);
    targetUser.followers.push(currentUser._id);
    await currentUser.save();
    await targetUser.save();

    res.json({ msg: "Now following user" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ACCEPT FOLLOW REQUEST
router.post("/accept/:requestId", protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    const requesterId = req.params.requestId;

    if (!currentUser.followRequests.includes(requesterId)) {
      return res.status(400).json({ msg: "No such follow request" });
    }

    currentUser.followRequests = currentUser.followRequests.filter(
      id => id.toString() !== requesterId
    );
    currentUser.followers.push(requesterId);

    const requester = await User.findById(requesterId);
    requester.following.push(currentUser._id);

    await currentUser.save();
    await requester.save();

    res.json({ msg: "Follow request accepted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
