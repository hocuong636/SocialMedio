var express = require('express');
var router = express.Router();
const postModel = require('../schemas/posts');
const { CheckLogin } = require('../utils/authHandler');
const { CreatePostValidator, validatedResult } = require('../utils/validator');

// GET /api/v1/posts - Lấy feed (bài viết public hoặc của bạn bè)
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

// GET /api/v1/posts/user/:userId - Lấy bài viết của 1 user
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

// GET /api/v1/posts/:id - Lấy chi tiết 1 bài viết
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

// POST /api/v1/posts - Tạo bài viết mới
router.post('/', CheckLogin, CreatePostValidator, validatedResult, async (req, res) => {
    try {
        const { content, visibility, images } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Nội dung bài viết không được để trống' });
        }
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

// PUT /api/v1/posts/:id - Cập nhật bài viết
router.put('/:id', CheckLogin, CreatePostValidator, validatedResult, async (req, res) => {
    try {
        const post = await postModel.findOne({ _id: req.params.id, isDeleted: false });
        if (!post) {
            return res.status(404).json({ message: "Không tìm thấy bài viết" });
        }
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

// DELETE /api/v1/posts/:id - Xóa bài viết (soft delete)
router.delete('/:id', CheckLogin, async (req, res) => {
    try {
        const post = await postModel.findOne({ _id: req.params.id, isDeleted: false });
        if (!post) {
            return res.status(404).json({ message: "Không tìm thấy bài viết" });
        }
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền xóa bài viết này" });
        }
        post.isDeleted = true;
        await post.save();
        res.json({ message: 'Đã xóa bài viết' });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
});

module.exports = router;