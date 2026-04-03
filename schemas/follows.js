const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Một user chỉ có thể follow 1 user khác 1 lần
followSchema.index({ follower: 1, following: 1 }, { unique: true });

module.exports = mongoose.model("follow", followSchema);
