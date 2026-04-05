const mongoose = require("mongoose");
const Notifications = require('./notifications.js');
const Post = require('./posts.js');
const User = require('./users.js');

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

reactionSchema.post('save', async function (doc) {
  try {
    // 1. Tìm lấy bài viết để biết ai là tác giả
    const post = await Post.findById(doc.post);

    // 2. Không tự thông báo nếu tự react bài của chính mình
    if (post && post.author.toString() !== doc.user.toString()) {

      // Lấy username của người ném react
      const senderInfo = await User.findById(doc.user);
      const senderName = senderInfo ? senderInfo.username : 'Ai đó';

      // Dịch loại Reaction sang Tiếng Việt để thông báo thân thiện hơn
      const reactionMap = {
        like: "thích",
        love: "yêu thích",
        haha: "bày tỏ haha về",
        wow: "bày tỏ wow về",
        sad: "bày tỏ cảm xúc buồn về",
        angry: "bày tỏ phẫn nộ về"
      };
      const reactionText = reactionMap[doc.type] || "bày tỏ cảm xúc về";

      const newNotif = await Notifications.create({
        recipient: post.author,
        sender: doc.user,
        type: 'reaction',
        content: `${senderName} vừa ${reactionText} bài viết của bạn.`,
        refModel: 'post',
        refId: doc.post
      });

      // 3. Đang có io global thì bắn sự kiện thẳng về phía frontend của tác giả
      if (global.io) {
        global.io.to(post.author.toString()).emit('new_notification', newNotif);
      }
    }
  } catch (error) {
    console.error("Lỗi khi tự tạo thông báo reaction:", error);
  }
});

module.exports = mongoose.model("reaction", reactionSchema);
