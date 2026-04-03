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

module.exports = mongoose.model("savedPost", savedPostSchema);
