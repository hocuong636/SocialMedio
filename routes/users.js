var express = require('express');
var router = express.Router();
let userModel = require('../schemas/users');
let userProfileModel = require('../schemas/userProfiles');
let { CheckLogin } = require('../utils/authHandler');

// Lay thong tin profile (user + userProfile)
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

// Lay thong tin user theo username (public)
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

// Cap nhat thong tin user (fullName, bio)
router.put('/info', CheckLogin, async function (req, res, next) {
    try {
        let { fullName, bio } = req.body;
        let updateData = {};
        if (fullName !== undefined) updateData.fullName = fullName;
        if (bio !== undefined) {
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

// Cap nhat thong tin profile mo rong (phone, dateOfBirth, gender, address, website)
router.put('/profile', CheckLogin, async function (req, res, next) {
    try {
        let { phone, dateOfBirth, gender, address, website } = req.body;
        let updateData = {};
        if (phone !== undefined) updateData.phone = phone;
        if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
        if (gender !== undefined) {
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

module.exports = router;