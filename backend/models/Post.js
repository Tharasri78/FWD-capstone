// models/Post.js
const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,
  date: { type: Date, default: Date.now },
  replies: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
    date: { type: Date, default: Date.now },
    repliedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  }]
});

const PostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: {
    url: String,
    filename: String
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [CommentSchema],
}, { timestamps: true });

module.exports = mongoose.model("Post", PostSchema);