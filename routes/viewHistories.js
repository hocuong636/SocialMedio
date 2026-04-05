var express = require('express');
var router = express.Router();
let viewHistoryModel = require('../schemas/viewHistories');
let postModel = require('../schemas/posts');
let { CheckLogin } = require('../utils/authHandler');

// Ghi nhan lich su xem bai viet
router.post('/', CheckLogin, async function (req, res, next) {
    try {
        let { postId } = req.body;
        if (!postId) {
            return res.status(400).send({ message: "postId khong duoc de trong" });
        }

        let post = await postModel.findOne({ _id: postId, isDeleted: false });
        if (!post) {
            return res.status(404).send({ message: "Bai viet khong ton tai" });
        }

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

// Lay danh sach lich su xem cua user hien tai
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

        // Loc bo nhung record ma post da bi xoa (populate tra ve null)
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

// Xoa 1 muc lich su xem
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

// Xoa toan bo lich su xem cua user hien tai
router.delete('/', CheckLogin, async function (req, res, next) {
    try {
        await viewHistoryModel.deleteMany({ user: req.user._id });
        res.status(200).send({ message: "Xoa toan bo lich su thanh cong" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;