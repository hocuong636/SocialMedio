var express = require('express');
var router = express.Router();
const savedPostModel = require('../schemas/savedPosts');
const postModel = require('../schemas/posts');
const { CheckLogin } = require('../utils/authHandler');

// Lấy danh sách bài viết đã lưu của người dùng hiện tại
// GET /api/v1/saved-posts
router.get('/', CheckLogin, async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
        const skip = (page - 1) * limit;

        const filter = { user: req.user._id };
        const total = await savedPostModel.countDocuments(filter);
        const savedPosts = await savedPostModel.find(filter)
            .populate({
                path: 'post',
                match: { isDeleted: false },
                populate: {
                    path: 'author',
                    select: '-password -forgotPasswordToken -forgotPasswordTokenExp -loginCount -lockTime'
                }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Lọc bỏ những saved post mà post đã bị xóa (populate trả null)
        const filtered = savedPosts.filter(sp => sp.post !== null);

        res.json({ data: filtered, page, limit, total });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
});

// Lưu một bài viết vào danh sách đã lưu
// POST /api/v1/saved-posts
router.post('/', CheckLogin, async (req, res) => {
    try {
        const { postId } = req.body;
        if (!postId) {
            return res.status(400).json({ message: "Thiếu postId" });
        }

        // Kiểm tra bài viết tồn tại và chưa bị xóa
        const post = await postModel.findOne({ _id: postId, isDeleted: false });
        if (!post) {
            return res.status(404).json({ message: "Không tìm thấy bài viết" });
        }

        const newSavedPost = new savedPostModel({
            user: req.user._id,
            post: postId
        });
        await newSavedPost.save();

        const populated = await newSavedPost.populate({
            path: 'post',
            populate: {
                path: 'author',
                select: '-password -forgotPasswordToken -forgotPasswordTokenExp -loginCount -lockTime'
            }
        });

        res.status(201).json({ message: "Đã lưu bài viết!", data: populated });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Bạn đã lưu bài viết này rồi" });
        }
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
});

// Bỏ lưu một bài viết cụ thể
// DELETE /api/v1/saved-posts/:postId
router.delete('/:postId', CheckLogin, async (req, res) => {
    try {
        const result = await savedPostModel.findOneAndDelete({
            user: req.user._id,
            post: req.params.postId
        });
        if (!result) {
            return res.status(404).json({ message: "Không tìm thấy bài viết đã lưu" });
        }
        res.json({ message: "Đã bỏ lưu bài viết" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
});

module.exports = router;
