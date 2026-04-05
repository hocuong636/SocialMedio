const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comments');
const { CheckLogin } = require('../utils/authHandler');

// ─────────────────────────────────────────────────────────────────────────────
// CREATE - Tạo bình luận mới
// POST /comments
// Body: { post, content, parentComment? }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', CheckLogin, commentController.createComment);

// ─────────────────────────────────────────────────────────────────────────────
// READ - Lấy bình luận của 1 bài viết (có phân trang)
// GET /comments/post/:postId?page=1&limit=10
// ─────────────────────────────────────────────────────────────────────────────
router.get('/post/:postId', CheckLogin, commentController.getCommentsByPost);

// ─────────────────────────────────────────────────────────────────────────────
// READ - Lấy bình luận con (replies)
// GET /comments/:commentId/replies?page=1&limit=5
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:commentId/replies', CheckLogin, commentController.getReplies);

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE - Cập nhật bình luận của chính user
// PATCH /comments/:commentId
// Body: { content }
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:commentId', CheckLogin, commentController.updateComment);

// ─────────────────────────────────────────────────────────────────────────────
// DELETE - Xóa bình luận (soft delete)
// DELETE /comments/:commentId
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:commentId', CheckLogin, commentController.deleteComment);

module.exports = router;