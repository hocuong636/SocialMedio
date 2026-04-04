var express = require('express');
var router = express.Router();
let userModel = require('../schemas/users');
let { CheckLogin } = require('../utils/authHandler');
let { uploadImage, uploadDocument } = require('../utils/uploadHandler');

// Upload avatar
router.post('/avatar', CheckLogin, uploadImage.single('avatar'), async function (req, res, next) {
    try {
        if (!req.file) return res.status(400).send({ message: "Vui lòng chọn file ảnh" });
        let avatarUrl = `/uploads/${req.file.filename}`;
        let user = await userModel.findByIdAndUpdate(
            req.user._id,
            { avatarUrl: avatarUrl },
            { new: true }
        ).select('-password -forgotPasswordToken -forgotPasswordTokenExp -loginCount -lockTime').populate('role');
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Upload cover
router.post('/cover', CheckLogin, uploadImage.single('cover'), async function (req, res, next) {
    try {
        if (!req.file) return res.status(400).send({ message: "Vui lòng chọn file ảnh" });
        let coverUrl = `/uploads/${req.file.filename}`;
        let user = await userModel.findByIdAndUpdate(
            req.user._id,
            { coverUrl: coverUrl },
            { new: true }
        ).select('-password -forgotPasswordToken -forgotPasswordTokenExp -loginCount -lockTime').populate('role');
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Upload ảnh dùng chung (Chat/Post)
router.post('/image', CheckLogin, uploadImage.single('image'), async function (req, res, next) {
    try {
        if (!req.file) return res.status(400).send({ message: "Vui lòng chọn ảnh" });
        res.status(200).send({ url: `/uploads/${req.file.filename}` });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Upload tài liệu dùng chung (Chat)
router.post('/document', CheckLogin, uploadDocument.single('document'), async function (req, res, next) {
    try {
        if (!req.file) return res.status(400).send({ message: "Vui lòng chọn tài liệu" });
        res.status(200).send({ url: `/uploads/${req.file.filename}` });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;