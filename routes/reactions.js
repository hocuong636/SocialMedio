const express = require('express');
const router = express.Router();
const reactionController = require('../controllers/reactions');
const { CheckLogin } = require('../utils/authHandler');

// Thêm hoặc cập nhật cảm xúc (reaction)
// POST /api/v1/reactions
// Body: { post, type }
router.post('/', CheckLogin, reactionController.addOrUpdateReaction);

// Lấy danh sách cảm xúc của một bài viết (có phân trang)
// GET /api/v1/reactions/post/:postId
router.get('/post/:postId', CheckLogin, reactionController.getReactionsByPost);

// Lấy tóm tắt thống kê cảm xúc của một bài viết
// GET /api/v1/reactions/:postId/summary
router.get('/:postId/summary', CheckLogin, reactionController.getReactionSummary);

// Xóa cảm xúc của người dùng
// DELETE /api/v1/reactions/:reactionId
router.delete('/:reactionId', CheckLogin, reactionController.deleteReaction);

module.exports = router;