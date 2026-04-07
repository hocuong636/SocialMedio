var express = require('express');
var router = express.Router();
let userModel = require('../schemas/users');
let userProfileModel = require('../schemas/userProfiles');
let { CheckLogin } = require('../utils/authHandler');

// Lấy thông tin hồ sơ của người dùng hiện tại (bao gồm profile mở rộng)
// GET /api/v1/users/profile
router.get('/profile', CheckLogin, async function (req, res, next) {
    try {
        let profile = await userProfileModel.findOne({ user: req.user._id })
            .populate({
                path: 'user',
                select: '-password -forgotPasswordToken -forgotPasswordTokenExp -loginCount -lockTime',
                populate: { path: 'role' }
            });
        if (!profile) {
            return res.status(404).send({ message: "Khong tim thay profile" });
        }
        res.status(200).send(profile);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Lấy thông tin người dùng theo tên tài khoản (username)
// GET /api/v1/users/by-username/:username
router.get('/by-username/:username', CheckLogin, async function (req, res, next) {
    try {
        let user = await userModel.findOne({
            username: req.params.username,
            isDeleted: false
        })
        .select('-password -forgotPasswordToken -forgotPasswordTokenExp -loginCount -lockTime')
        .populate('role');

        if (!user) {
            return res.status(404).send({ message: "Nguoi dung khong ton tai" });
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Cập nhật thông tin cơ bản của người dùng (fullName, bio)
// PUT /api/v1/users/info
router.put('/info', CheckLogin, async function (req, res, next) {
    try {
        let { fullName, bio } = req.body;
        let updateData = {};
        if (fullName !== undefined) updateData.fullName = fullName;
        if (bio !== undefined) {
            // Giới hạn độ dài bio
            if (bio.length > 500) {
                return res.status(400).send({ message: "Bio khong duoc qua 500 ky tu" });
            }
            updateData.bio = bio;
        }

        let user = await userModel.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password -forgotPasswordToken -forgotPasswordTokenExp -loginCount -lockTime')
         .populate('role');

        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Cập nhật thông tin hồ sơ mở rộng (phone, ngày sinh, giới tính, địa chỉ, website)
// PUT /api/v1/users/profile
router.put('/profile', CheckLogin, async function (req, res, next) {
    try {
        let { phone, dateOfBirth, gender, address, website } = req.body;
        let updateData = {};
        if (phone !== undefined) updateData.phone = phone;
        if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
        if (gender !== undefined) {
            // Kiểm tra giá trị giới tính hợp lệ
            if (!['male', 'female', 'other', ''].includes(gender)) {
                return res.status(400).send({ message: "Gender khong hop le" });
            }
            updateData.gender = gender;
        }
        if (address !== undefined) updateData.address = address;
        if (website !== undefined) updateData.website = website;

        let profile = await userProfileModel.findOneAndUpdate(
            { user: req.user._id },
            updateData,
            { new: true, runValidators: true }
        ).populate({
            path: 'user',
            select: '-password -forgotPasswordToken -forgotPasswordTokenExp -loginCount -lockTime',
            populate: { path: 'role' }
        });

        res.status(200).send(profile);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Tìm kiếm người dùng theo username hoặc fullName
// GET /api/v1/users/search
router.get('/search', CheckLogin, async function (req, res, next) {
    try {
        let { q } = req.query;
        if (!q) {
            return res.status(400).send({ message: "Vui long nhap tu khoa tim kiem" });
        }

        // Tìm kiếm theo username hoặc fullName (không phân biệt hoa thường)
        let users = await userModel.find({
            $and: [
                { isDeleted: false },
                {
                    $or: [
                        { username: { $regex: q, $options: 'i' } },
                        { fullName: { $regex: q, $options: 'i' } }
                    ]
                },
                { _id: { $ne: req.user._id } } // Không bao gồm chính mình trong kết quả
            ]
        })
        .select('-password -forgotPasswordToken -forgotPasswordTokenExp -loginCount -lockTime')
        .limit(20);

        res.status(200).send(users);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;