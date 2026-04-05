const Reaction = require('../schemas/reactions');
const Post = require('../schemas/posts');
const mongoose = require('mongoose');
const { validateReactionType } = require('../utils/validator');

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE/UPDATE - Thêm hoặc cập nhật reaction (one user, one reaction per post)
// ═══════════════════════════════════════════════════════════════════════════════
exports.addOrUpdateReaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { post, type } = req.body;

    // Validate input
    if (!post || !type) {
      return res.status(400).json({
        success: false,
        message: 'Post ID và reaction type là bắt buộc',
      });
    }

    // Validate reaction type
    const validation = validateReactionType(type);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    // Check post exists
    const postExists = await Post.findById(post);
    if (!postExists) {
      return res.status(404).json({
        success: false,
        message: 'Bài viết không tồn tại',
      });
    }

    // Check if user already has reaction on this post
    let reaction = await Reaction.findOne({ user: userId, post });

    if (reaction) {
      // UPDATE existing reaction
      if (reaction.type === type) {
        // Same type, delete it (toggle off)
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
        // Different type, update reaction
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
      // CREATE new reaction
      reaction = new Reaction({
        user: userId,
        post,
        type,
      });

      await reaction.save();

      // Populate user info
      await reaction.populate('user', 'username fullName avatarUrl');

      // Update post.reactionsCount
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

// ═══════════════════════════════════════════════════════════════════════════════
// READ - Lấy tất cả reactions của 1 bài viết (có phân trang)
// ═══════════════════════════════════════════════════════════════════════════════
exports.getReactionsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Check post exists
    const postExists = await Post.findById(postId);
    if (!postExists) {
      return res.status(404).json({
        success: false,
        message: 'Bài viết không tồn tại',
      });
    }

    // Lấy reactions
    const reactions = await Reaction.find({ post: postId })
      .populate('user', 'username fullName avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Total count
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

// ═══════════════════════════════════════════════════════════════════════════════
// READ - Lấy thống kê reactions của 1 bài viết + reaction của current user (nếu có)
// ═══════════════════════════════════════════════════════════════════════════════
exports.getReactionSummary = async (req, res) => {
  try {
    const userId = req.user?._id || null;
    const { postId } = req.params;

    // Check post exists
    const postExists = await Post.findById(postId);
    if (!postExists) {
      return res.status(404).json({
        success: false,
        message: 'Bài viết không tồn tại',
      });
    }

    // Group reactions by type
    const reactions = await Reaction.find({ post: postId }).select('type');

    // Initialize summary
    const summary = {
      like: 0,
      haha: 0,
      love: 0,
      wow: 0,
      sad: 0,
      angry: 0,
      userReaction: null,
    };

    // Fill in counts
    reactions.forEach((r) => {
      if (summary.hasOwnProperty(r.type)) {
        summary[r.type]++;
      }
    });

    // Get user's reaction (if logged in)
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

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE - Xóa reaction của user
// ═══════════════════════════════════════════════════════════════════════════════
exports.deleteReaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { reactionId } = req.params;

    // Find reaction
    const reaction = await Reaction.findById(reactionId);
    if (!reaction) {
      return res.status(404).json({
        success: false,
        message: 'Reaction không tồn tại',
      });
    }

    // Check authorization
    if (reaction.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa reaction này',
      });
    }

    // Delete reaction
    const postId = reaction.post;
    await Reaction.findByIdAndDelete(reactionId);

    // Update post.reactionsCount
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
