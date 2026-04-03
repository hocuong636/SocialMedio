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
      required: true
    },
    type: {
      type: String,
      enum: [
        "reaction",       // ai đó react bài viết của bạn
        "comment",        // ai đó comment bài viết của bạn
        "follow",         // ai đó follow bạn
        "message",        // ai đó gửi tin nhắn
        "post",           // ai bạn follow đăng bài mới
        "report_resolved" // report được xử lý
      ],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    refModel: {
      type: String,
      enum: ["post", "comment", "user", "message", null]
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId
      // ObjectId liên kết tới post/comment/user tương ứng
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("notification", notificationSchema);
