const express = require('express');
const router = express.Router();
const reactionController = require('../controllers/reactions');
const { CheckLogin } = require('../utils/authHandler');

// ─────────────────────────────────────────────────────────────────────────────
// CREATE/UPDATE - Thêm hoặc cập nhật reaction
// POST /reactions
// Body: { post, type } 
// type: "like" | "haha" | "love" | "wow" | "sad" | "angry"
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', CheckLogin, reactionController.addOrUpdateReaction);

// ─────────────────────────────────────────────────────────────────────────────
// READ - Lấy tất cả reactions của 1 bài viết (có phân trang)
// GET /reactions/post/:postId?page=1&limit=20
// ─────────────────────────────────────────────────────────────────────────────
router.get('/post/:postId', CheckLogin, reactionController.getReactionsByPost);

// ─────────────────────────────────────────────────────────────────────────────
// READ - Lấy thống kê reactions của 1 bài viết
// GET /reactions/:postId/summary
// Response: { like: 10, haha: 2, love: 5, wow: 1, sad: 0, angry: 0, userReaction: "like" }
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:postId/summary', CheckLogin, reactionController.getReactionSummary);

// ─────────────────────────────────────────────────────────────────────────────
// DELETE - Xóa reaction của user
// DELETE /reactions/:reactionId
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:reactionId', CheckLogin, reactionController.deleteReaction);

module.exports = router;