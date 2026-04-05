const Comment = require('../schemas/comments');
const Post = require('../schemas/posts');
const User = require('../schemas/users');
const mongoose = require('mongoose');
const { validateCommentContent } = require('../utils/validator');

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE - Tạo bình luận mới
// ═══════════════════════════════════════════════════════════════════════════════
exports.createComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { post, content, parentComment } = req.body;

    // Validate input
    if (!post || !content) {
      return res.status(400).json({
        success: false,
        message: 'Post ID và comment content là bắt buộc',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(post)) {
      return res.status(400).json({
        success: false,
        message: 'Post ID không hợp lệ',
      });
    }

    if (parentComment && !mongoose.Types.ObjectId.isValid(parentComment)) {
      return res.status(400).json({
        success: false,
        message: 'Parent comment ID không hợp lệ',
      });
    }

    // Validate comment content
    const validation = validateCommentContent(content);
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

    // If parentComment, check nó tồn tại
    if (parentComment) {
      const parentCommentExists = await Comment.findById(parentComment);
      if (!parentCommentExists) {
        return res.status(404).json({
          success: false,
          message: 'Bình luận cha không tồn tại',
        });
      }
    }

    // Tạo comment
    const comment = new Comment({
      post,
      author: userId,
      content: content.trim(),
      parentComment: parentComment || null,
      isDeleted: false,
    });

    await comment.save();

    // Populate author info
    await comment.populate('author', 'username fullName avatarUrl');

    // Update post.commentsCount
    await Post.findByIdAndUpdate(post, {
      $inc: { commentsCount: 1 },
    });

    return res.status(201).json({
      success: true,
      message: 'Bình luận được tạo thành công',
      data: comment,
    });
  } catch (error) {
    console.error('Create comment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo bình luận',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// READ - Lấy bình luận của 1 bài viết (có phân trang)
// ═══════════════════════════════════════════════════════════════════════════════
exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check post exists
    const postExists = await Post.findById(postId);
    if (!postExists) {
      return res.status(404).json({
        success: false,
        message: 'Bài viết không tồn tại',
      });
    }

    // Lấy comments (chỉ top-level, không nested)
    const comments = await Comment.find({
      post: postId,
      parentComment: null,
      isDeleted: false,
    })
      .populate('author', 'username fullName avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Total count
    const total = await Comment.countDocuments({
      post: postId,
      parentComment: null,
      isDeleted: false,
    });

    // For each comment, count replies
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const repliesCount = await Comment.countDocuments({
          parentComment: comment._id,
          isDeleted: false,
        });
        return {
          ...comment.toObject(),
          repliesCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: commentsWithReplies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy bình luận',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// READ - Lấy bình luận con (replies) của 1 bình luận
// ═══════════════════════════════════════════════════════════════════════════════
exports.getReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Check parent comment exists
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: 'Bình luận cha không tồn tại',
      });
    }

    // Lấy replies
    const replies = await Comment.find({
      parentComment: commentId,
      isDeleted: false,
    })
      .populate('author', 'username fullName avatarUrl')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    // Total count
    const total = await Comment.countDocuments({
      parentComment: commentId,
      isDeleted: false,
    });

    return res.status(200).json({
      success: true,
      data: replies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get replies error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy bình luận con',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// UPDATE - Cập nhật bình luận (chỉ author mới cập nhật được)
// ═══════════════════════════════════════════════════════════════════════════════
exports.updateComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { commentId } = req.params;
    const { content } = req.body;

    // Validate input
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Comment content là bắt buộc',
      });
    }

    // Validate comment content
    const validation = validateCommentContent(content);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Bình luận không tồn tại',
      });
    }

    // Check authorization
    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật bình luận này',
      });
    }

    // Check if already deleted
    if (comment.isDeleted) {
      return res.status(410).json({
        success: false,
        message: 'Bình luận này đã bị xóa',
      });
    }

    // Update
    comment.content = content.trim();
    await comment.save();

    // Populate author info
    await comment.populate('author', 'username fullName avatarUrl');

    return res.status(200).json({
      success: true,
      message: 'Bình luận được cập nhật thành công',
      data: comment,
    });
  } catch (error) {
    console.error('Update comment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật bình luận',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE - Xóa bình luận (soft delete)
// ═══════════════════════════════════════════════════════════════════════════════
exports.deleteComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { commentId } = req.params;

    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Bình luận không tồn tại',
      });
    }

    // Check authorization (author hoặc post owner)
    const post = await Post.findById(comment.post);
    const isAuthor = comment.author.toString() === userId.toString();
    const isPostOwner = post?.author?.toString() === userId.toString();

    if (!isAuthor && !isPostOwner) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bình luận này',
      });
    }

    // Check if already deleted
    if (comment.isDeleted) {
      return res.status(410).json({
        success: false,
        message: 'Bình luận này đã bị xóa',
      });
    }

    // Soft delete
    comment.isDeleted = true;
    await comment.save();

    // Update post.commentsCount (giảm đi)
    await Post.findByIdAndUpdate(comment.post, {
      $inc: { commentsCount: -1 },
    });

    return res.status(200).json({
      success: true,
      message: 'Bình luận được xóa thành công',
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa bình luận',
      error: error.message,
    });
  }
};
