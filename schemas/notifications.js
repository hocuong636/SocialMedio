const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    type: {
      type: String, // ví dụ: "post_like", "comment", "follow"
      required: true
    },
    content: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    link: {
      type: String // đường link tới bài viết/profile liên quan
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("notification", notificationSchema);
