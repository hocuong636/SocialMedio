const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
      required: true
    },
    type: {
      type: String,
      enum: ["like", "haha", "love", "wow", "sad", "angry"],
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Một user chỉ có 1 reaction trên 1 post
reactionSchema.index({ user: 1, post: 1 }, { unique: true });

module.exports = mongoose.model("reaction", reactionSchema);
