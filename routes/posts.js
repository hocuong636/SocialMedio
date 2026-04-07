var express = require('express');
var router = express.Router();
const postModel = require('../schemas/posts');
const { CheckLogin } = require('../utils/authHandler');
const { CreatePostValidator, validatedResult } = require('../utils/validator');

// Lấy danh sách bài viết cho feed (bài viết công khai)
// GET /api/v1/posts
router.get('/', CheckLogin, async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
        const skip = (page - 1) * limit;

        const filter = { isDeleted: false, visibility: 'public' };
        const total = await postModel.countDocuments(filter);
        const posts = await postModel.find(filter)
            .populate('author', '-password -forgotPasswordToken -forgotPasswordTokenExp -loginCount -lockTime')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({ data: posts, page, limit, total });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
});

// Lấy danh sách bài viết của một người dùng cụ thể
// GET /api/v1/posts/user/:userId
router.get('/user/:userId', CheckLogin, async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
        const skip = (page - 1) * limit;

        const filter = { author: req.params.userId, isDeleted: false };
        // Nếu không phải chính chủ, chỉ hiện bài public
        if (req.user._id.toString() !== req.params.userId) {
            filter.visibility = 'public';
        }

        const total = await postModel.countDocuments(filter);
        const posts = await postModel.find(filter)
            .populate('author', '-password -forgotPasswordToken -forgotPasswordTokenExp -loginCount -lockTime')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({ data: posts, page, limit, total });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
});

// Lấy thông tin chi tiết của một bài viết
// GET /api/v1/posts/:id
router.get('/:id', CheckLogin, async (req, res) => {
    try {
        const post = await postModel.findOne({ _id: req.params.id, isDeleted: false })
            .populate('author', '-password -forgotPasswordToken -forgotPasswordTokenExp -loginCount -lockTime');
        if (!post) {
            return res.status(404).json({ message: "Không tìm thấy bài viết" });
        }
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
});

// Tạo một bài viết mới
// POST /api/v1/posts
router.post('/', CheckLogin, CreatePostValidator, validatedResult, async (req, res) => {
    try {
        const { content, visibility, images } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Nội dung bài viết không được để trống' });
        }
        // Tạo bài viết mới trong DB
        const newPost = new postModel({
            author: req.user._id,
            content: content.trim(),
            images: Array.isArray(images) ? images : [],
            visibility: visibility || 'public'
        });
        const savedPost = await newPost.save();
        const populated = await savedPost.populate('author', '-password -forgotPasswordToken -forgotPasswordTokenExp -loginCount -lockTime');
        res.status(201).json({
            message: 'Đăng bài viết thành công',
            data: populated
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
});

// Cập nhật thông tin bài viết
// PUT /api/v1/posts/:id
router.put('/:id', CheckLogin, CreatePostValidator, validatedResult, async (req, res) => {
    try {
        const post = await postModel.findOne({ _id: req.params.id, isDeleted: false });
        if (!post) {
            return res.status(404).json({ message: "Không tìm thấy bài viết" });
        }
        // Kiểm tra quyền sở hữu
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa bài viết này" });
        }
        const { content, visibility, images } = req.body;
        if (content !== undefined) post.content = content.trim();
        if (visibility !== undefined) post.visibility = visibility;
        if (images !== undefined) post.images = Array.isArray(images) ? images : [];

        await post.save();
        const populated = await post.populate('author', '-password -forgotPasswordToken -forgotPasswordTokenExp -loginCount -lockTime');
        res.json({ message: 'Cập nhật bài viết thành công', data: populated });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
});

// Xóa bài viết (soft delete)
// DELETE /api/v1/posts/:id
router.delete('/:id', CheckLogin, async (req, res) => {
    try {
        const post = await postModel.findOne({ _id: req.params.id, isDeleted: false });
        if (!post) {
            return res.status(404).json({ message: "Không tìm thấy bài viết" });
        }
        // Kiểm tra quyền sở hữu
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền xóa bài viết này" });
        }
        // Đánh dấu là đã xóa
        post.isDeleted = true;
        await post.save();
        res.json({ message: 'Đã xóa bài viết' });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
});

module.exports = router;