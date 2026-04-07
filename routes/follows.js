var express = require('express');
var router = express.Router();
let followModel = require('../schemas/follows');
let userModel = require('../schemas/users');
let { CheckLogin } = require('../utils/authHandler');

// Theo dõi một người dùng
// POST /api/v1/follows/:userId
router.post('/:userId', CheckLogin, async function (req, res, next) {
    try {
        let followingId = req.params.userId;

        // Không thể tự theo dõi chính mình
        if (req.user._id.toString() === followingId) {
            return res.status(400).send({ message: "Ban khong the tu follow chinh minh" });
        }

        // Kiểm tra người dùng cần theo dõi có tồn tại không
        let targetUser = await userModel.findOne({ _id: followingId, isDeleted: false });
        if (!targetUser) {
            return res.status(404).send({ message: "Nguoi dung khong ton tai" });
        }

        // Kiểm tra xem đã theo dõi chưa
        let existingFollow = await followModel.findOne({
            follower: req.user._id,
            following: followingId
        });
        if (existingFollow) {
            return res.status(400).send({ message: "Ban da follow nguoi dung nay roi" });
        }

        let follow = await followModel.create({
            follower: req.user._id,
            following: followingId
        });

        follow = await follow.populate('following', 'username email fullName');

        res.status(201).send(follow);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Hủy theo dõi một người dùng
// DELETE /api/v1/follows/:userId
router.delete('/:userId', CheckLogin, async function (req, res, next) {
    try {
        let followingId = req.params.userId;

        let result = await followModel.findOneAndDelete({
            follower: req.user._id,
            following: followingId
        });

        if (!result) {
            return res.status(404).send({ message: "Ban chua follow nguoi dung nay" });
        }

        res.status(200).send({ message: "Unfollow thanh cong" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Lấy danh sách người dùng mà mình đang theo dõi
// GET /api/v1/follows/following
router.get('/following', CheckLogin, async function (req, res, next) {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        if (page < 1) page = 1;
        if (limit < 1) limit = 10;
        let skip = (page - 1) * limit;

        let total = await followModel.countDocuments({ follower: req.user._id });
        let followings = await followModel
            .find({ follower: req.user._id })
            .populate('following', 'username email fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).send({
            data: followings,
            page,
            limit,
            total
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Lấy danh sách người dùng đang theo dõi mình
// GET /api/v1/follows/followers
router.get('/followers', CheckLogin, async function (req, res, next) {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        if (page < 1) page = 1;
        if (limit < 1) limit = 10;
        let skip = (page - 1) * limit;

        let total = await followModel.countDocuments({ following: req.user._id });
        let followers = await followModel
            .find({ following: req.user._id })
            .populate('follower', 'username email fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).send({
            data: followers,
            page,
            limit,
            total
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Kiểm tra trạng thái theo dõi đối với một người dùng
// GET /api/v1/follows/check/:userId
router.get('/check/:userId', CheckLogin, async function (req, res, next) {
    try {
        let follow = await followModel.findOne({
            follower: req.user._id,
            following: req.params.userId
        });

        res.status(200).send({ isFollowing: !!follow });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Lấy danh sách người đang theo dõi của một user bất kỳ
// GET /api/v1/follows/:userId/following
router.get('/:userId/following', CheckLogin, async function (req, res, next) {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        if (page < 1) page = 1;
        if (limit < 1) limit = 10;
        let skip = (page - 1) * limit;

        let total = await followModel.countDocuments({ follower: req.params.userId });
        let followings = await followModel
            .find({ follower: req.params.userId })
            .populate('following', 'username email fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).send({
            data: followings,
            page,
            limit,
            total
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Lấy danh sách người theo dõi của một user bất kỳ
// GET /api/v1/follows/:userId/followers
router.get('/:userId/followers', CheckLogin, async function (req, res, next) {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        if (page < 1) page = 1;
        if (limit < 1) limit = 10;
        let skip = (page - 1) * limit;

        let total = await followModel.countDocuments({ following: req.params.userId });
        let followers = await followModel
            .find({ following: req.params.userId })
            .populate('follower', 'username email fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).send({
            data: followers,
            page,
            limit,
            total
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;