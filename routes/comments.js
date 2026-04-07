const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comments');
const { CheckLogin } = require('../utils/authHandler');

// Tạo bình luận mới
// POST /api/v1/comments
// Body: { post, content, parentComment? }
router.post('/', CheckLogin, commentController.createComment);

// Lấy danh sách bình luận của một bài viết (có phân trang)
// GET /api/v1/comments/post/:postId
router.get('/post/:postId', CheckLogin, commentController.getCommentsByPost);

// Lấy danh sách câu trả lời cho một bình luận
// GET /api/v1/comments/:commentId/replies
router.get('/:commentId/replies', CheckLogin, commentController.getReplies);

// Cập nhật nội dung bình luận
// PATCH /api/v1/comments/:commentId
router.patch('/:commentId', CheckLogin, commentController.updateComment);

// Xóa bình luận (soft delete)
// DELETE /api/v1/comments/:commentId
router.delete('/:commentId', CheckLogin, commentController.deleteComment);

module.exports = router;