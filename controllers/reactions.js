const Reaction = require('../schemas/reactions');
const Post = require('../schemas/posts');
const mongoose = require('mongoose');
const { validateReactionType } = require('../utils/validator');

// Thêm mới hoặc cập nhật cảm xúc (reaction) của người dùng cho bài viết
exports.addOrUpdateReaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { post, type } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!post || !type) {
      return res.status(400).json({
        success: false,
        message: 'Post ID và reaction type là bắt buộc',
      });
    }

    // Kiểm tra loại cảm xúc có hợp lệ không
    const validation = validateReactionType(type);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    // Kiểm tra bài viết có tồn tại không
    const postExists = await Post.findById(post);
    if (!postExists) {
      return res.status(404).json({
        success: false,
        message: 'Bài viết không tồn tại',
      });
    }

    // Kiểm tra xem người dùng đã thả cảm xúc cho bài viết này chưa
    let reaction = await Reaction.findOne({ user: userId, post });

    if (reaction) {
      // CẬP NHẬT: Nếu loại cảm xúc giống hệt cũ thì thực hiện gỡ bỏ (toggle off)
      if (reaction.type === type) {
        await Reaction.findByIdAndDelete(reaction._id);
        await Post.findByIdAndUpdate(post, {
          $inc: { reactionsCount: -1 },
        });

        return res.status(200).json({
          success: true,
          message: 'Reaction được gỡ bỏ thành công',
          data: null,
        });
      } else {
        // CẬP NHẬT: Nếu loại cảm xúc khác thì thay đổi sang loại mới
        reaction.type = type;
        await reaction.save();

        await reaction.populate('user', 'username fullName avatarUrl');

        return res.status(200).json({
          success: true,
          message: 'Reaction được cập nhật thành công',
          data: reaction,
        });
      }
    } else {
      // TẠO MỚI: Nếu chưa có thì tạo bản ghi cảm xúc mới
      reaction = new Reaction({
        user: userId,
        post,
        type,
      });

      await reaction.save();

      // Lấy thông tin user để trả về Client
      await reaction.populate('user', 'username fullName avatarUrl');

      // Tăng số lượng cảm xúc của bài viết
      await Post.findByIdAndUpdate(post, {
        $inc: { reactionsCount: 1 },
      });

      return res.status(201).json({
        success: true,
        message: 'Reaction được tạo thành công',
        data: reaction,
      });
    }
  } catch (error) {
    console.error('Add/Update reaction error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật reaction',
      error: error.message,
    });
  }
};

// Lấy danh sách chi tiết các cảm xúc của một bài viết (phân trang)
exports.getReactionsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Kiểm tra bài viết tồn tại
    const postExists = await Post.findById(postId);
    if (!postExists) {
      return res.status(404).json({
        success: false,
        message: 'Bài viết không tồn tại',
      });
    }

    // Lấy danh sách reactions
    const reactions = await Reaction.find({ post: postId })
      .populate('user', 'username fullName avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Đếm tổng số reactions để phân trang
    const total = await Reaction.countDocuments({ post: postId });

    return res.status(200).json({
      success: true,
      data: reactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get reactions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy reactions',
      error: error.message,
    });
  }
};

// Lấy tóm tắt các loại cảm xúc của một bài viết và cảm xúc của user hiện tại
exports.getReactionSummary = async (req, res) => {
  try {
    const userId = req.user?._id || null;
    const { postId } = req.params;

    // Kiểm tra bài viết tồn tại
    const postExists = await Post.findById(postId);
    if (!postExists) {
      return res.status(404).json({
        success: false,
        message: 'Bài viết không tồn tại',
      });
    }

    // Lấy tất cả reactions để thống kê
    const reactions = await Reaction.find({ post: postId }).select('type');

    // Khởi tạo các nhóm cảm xúc
    const summary = {
      like: 0,
      haha: 0,
      love: 0,
      wow: 0,
      sad: 0,
      angry: 0,
      userReaction: null,
    };

    // Cộng dồn số lượng cho từng loại
    reactions.forEach((r) => {
      if (summary.hasOwnProperty(r.type)) {
        summary[r.type]++;
      }
    });

    // Lấy cảm xúc hiện tại của user đang đăng nhập (nếu có)
    if (userId) {
      const userReaction = await Reaction.findOne({
        user: userId,
        post: postId,
      });
      if (userReaction) {
        summary.userReaction = userReaction.type;
      }
    }

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Get reaction summary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê reactions',
      error: error.message,
    });
  }
};

// Xóa cảm xúc của người dùng khỏi bài viết
exports.deleteReaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { reactionId } = req.params;

    // Tìm reaction cần xóa
    const reaction = await Reaction.findById(reactionId);
    if (!reaction) {
      return res.status(404).json({
        success: false,
        message: 'Reaction không tồn tại',
      });
    }

    // Kiểm tra quyền sở hữu reaction
    if (reaction.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa reaction này',
      });
    }

    // Xóa reaction thực tế
    const postId = reaction.post;
    await Reaction.findByIdAndDelete(reactionId);

    // Giảm số lượng reaction của bài viết
    await Post.findByIdAndUpdate(postId, {
      $inc: { reactionsCount: -1 },
    });

    return res.status(200).json({
      success: true,
      message: 'Reaction được xóa thành công',
    });
  } catch (error) {
    console.error('Delete reaction error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa reaction',
      error: error.message,
    });
  }
};
