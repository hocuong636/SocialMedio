const mongoose = require("mongoose");
const Notification = require("./notifications.js");
const Post = require("./posts.js");
const User = require("./users.js");
const notifications = require("./notifications.js");
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
followSchema.post('save', async function (doc, next) {
  try {
    const senderInfo = await User.findById(doc.follower);
    const senderName = senderInfo ? senderInfo.username : 'Ai đó';
    const newNotif = await Notification.create({
      recipient: doc.following,
      sender: doc.follower,
      type: 'follow',
      content: `${senderName} đã follow bạn`,
      refModel: 'user',
      refId: doc.follower
    });
    if (global.io) {
      global.io.to(doc.following.toString()).emit('new_notification', newNotif);
    }
    next();
  } catch (err) {
    console.error("Lỗi khi tạo thông báo follow:", err);
    next(err);
  }
})
module.exports = mongoose.model("follow", followSchema);
