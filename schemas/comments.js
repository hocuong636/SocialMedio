const mongoose = require("mongoose");
const Notification = require("./notifications.js");
const Post = require("./posts.js");
const User = require("./users.js");

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
      required: true
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },

    content: {
      type: String,
      required: [true, "Comment content is required"]
    },

    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment",
      default: null
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);
commentSchema.post('save', async function (doc) {
  try {
    const senderInfo = await User.findById(doc.author);
    const senderName = senderInfo ? senderInfo.username : 'Ai đó';

    const post = await Post.findById(doc.post);
    //neu khong phai tw comment post cua minh
    if (post && post.author.toString() !== doc.author.toString()) {
      const newNotif = await Notification.create({
        recipient: post.author,
        sender: doc.author,
        type: 'comment',
        content: `${senderName} đã bình luận bài viết của bạn`,
        refModel: 'comment',
        refId: doc._id
      });
      if (global.io) {
        global.io.to(post.author.toString()).emit('new_notification', newNotif);
      }
    }
  } catch (err) {
    console.error("Lỗi khi tự tạo thông báo comment:", err);
  }
})
module.exports = mongoose.model("comment", commentSchema);

