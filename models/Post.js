const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  caption: { type: String, required: true },
  mediaUrl: { type: String, required: true }, // image or video URL
  mediaType: { type: String, enum: ["image", "video"], required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Post", PostSchema);
