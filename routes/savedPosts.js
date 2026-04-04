var express = require('express');
var router = express.Router();
const savedPostModel = require('../schemas/savedPosts');
// Lưu bài viết
router.post('/', async (req, res) => {
    try {
        const { user, post } = req.body;

        const newSavedPost = new savedPostModel({ user, post });
        await newSavedPost.save();

        res.status(201).json({ message: "Đã lưu bài viết!" });
 } catch (error) {
        // Lỗi này thường xảy ra nếu User đã lưu bài viết này rồi (do mình đặt unique index)
        res.status(400).json({ message: "Bạn đã lưu bài viết này hoặc có lỗi xảy ra" });
}
});

module.exports = router;
