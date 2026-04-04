var express = require('express');
var router = express.Router();

let savedPostModel = require('../schemas/savedPosts');
let postModel = require('../schemas/posts');
let { CheckLogin } = require('../utils/authHandler');

// Lưu & Bỏ lưu bài viết
// POST /api/v1/saved-posts
router.post('/', CheckLogin, async function (req, res, next) {
    try {
        let { postId } = req.body;

        // Kiểm tra xem bài viết đó có tồn tại thật không
        let post = await postModel.findOne({ _id: postId, isDeleted: false });
        if (!post) {
            return res.status(404).send({ message: "Bài viết không tồn tại hoặc đã bị xóa" });
        }
        // Kiểm tra xem User hiện tại (req.user._id) đã lưu bài này chưa
        let existingSave = await savedPostModel.findOne({
            user: req.user._id,
            post: postId
        });
        if (existingSave) {
            // Trường hợp đã lưu rồi -> Thực hiện bỏ lưu 
            await savedPostModel.deleteOne({ _id: existingSave._id });
            res.status(200).send({ message: "Đã bỏ lưu bài viết", isSaved: false });
        } else {
            // Trường hợp chưa lưu -> Thực hiện lưu 
            let newSave = await savedPostModel.create({
                user: req.user._id,
                post: postId
            });
            res.status(201).send({ message: "Đã lưu bài viết thành công", isSaved: true, data: newSave });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Lấy danh sách các bài viết mà User hiện tại đã lưu
// GET /api/v1/saved-posts
router.get('/', CheckLogin, async function (req, res, next) {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        let skip = (page - 1) * limit;
        // Lấy danh sách bài đã lưu của User
        let savedItems = await savedPostModel
            .find({ user: req.user._id })
            // 'Populate' để lấy toàn bộ thông tin bài viết từ ID bài viết
            .populate({
                path: 'post',
                match: { isDeleted: false }, // Chỉ lấy bài nào chưa bị tác giả xóa
                populate: { path: 'author', select: 'username fullName avatarUrl' } // Lấy thêm info tác giả của bài đó
            })
            .sort({ createdAt: -1 }) // Bài mới lưu nhất hiện lên đầu
            .skip(skip)
            .limit(limit)
        // Lọc bỏ những Item mà bài gốc đã bị xóa (post: null)
        savedItems = savedItems.filter(item => item.post !== null);
        let total = await savedPostModel.countDocuments({ user: req.user._id });
        res.status(200).send({
            data: savedItems,
            page,
            limit,
            total
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;