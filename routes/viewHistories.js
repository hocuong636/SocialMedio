var express = require('express');
var router = express.Router();
let viewHistoryModel = require('../schemas/viewHistories');
let postModel = require('../schemas/posts');
let { CheckLogin } = require('../utils/authHandler');

// Ghi nhận lịch sử xem bài viết
// POST /api/v1/view-histories
router.post('/', CheckLogin, async function (req, res, next) {
    try {
        let { postId } = req.body;
        if (!postId) {
            return res.status(400).send({ message: "postId khong duoc de trong" });
        }

        // Kiểm tra bài viết tồn tại
        let post = await postModel.findOne({ _id: postId, isDeleted: false });
        if (!post) {
            return res.status(404).send({ message: "Bai viet khong ton tai" });
        }

        // Cập nhật hoặc tạo mới bản ghi lịch sử xem (upsert)
        let viewHistory = await viewHistoryModel.findOneAndUpdate(
            { user: req.user._id, post: postId },
            { user: req.user._id, post: postId },
            { upsert: true, new: true }
        );

        res.status(200).send(viewHistory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Lấy danh sách lịch sử xem của người dùng hiện tại
// GET /api/v1/view-histories
router.get('/', CheckLogin, async function (req, res, next) {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        if (page < 1) page = 1;
        if (limit < 1) limit = 10;
        let skip = (page - 1) * limit;

        let total = await viewHistoryModel.countDocuments({ user: req.user._id });
        let viewHistories = await viewHistoryModel
            .find({ user: req.user._id })
            .populate({
                path: 'post',
                match: { isDeleted: false },
                populate: { path: 'author', select: 'username email' }
            })
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit);

        // Lọc bỏ những bản ghi mà bài viết gốc đã bị xóa (populate trả về null)
        viewHistories = viewHistories.filter(item => item.post !== null);

        res.status(200).send({
            data: viewHistories,
            page,
            limit,
            total
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Xóa một mục lịch sử xem cụ thể
// DELETE /api/v1/view-histories/:id
router.delete('/:id', CheckLogin, async function (req, res, next) {
    try {
        let result = await viewHistoryModel.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });
        if (!result) {
            return res.status(404).send({ message: "Khong tim thay lich su xem" });
        }
        res.status(200).send({ message: "Xoa thanh cong" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Xóa toàn bộ lịch sử xem của người dùng hiện tại
// DELETE /api/v1/view-histories
router.delete('/', CheckLogin, async function (req, res, next) {
    try {
        await viewHistoryModel.deleteMany({ user: req.user._id });
        res.status(200).send({ message: "Xoa toan bo lich su thanh cong" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;