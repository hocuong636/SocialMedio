const mongoose = require("mongoose");

const savedPostSchema = new mongoose.Schema(
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
    }
  },
  {
    timestamps: true
  }
);

// Một user chỉ save 1 post 1 lần
savedPostSchema.index({ user: 1, post: 1 }, { unique: true });

module.exports = mongoose.model("savedPost", savedPostSchema);
