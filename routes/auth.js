var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
let { RegisterValidator, validatedResult, ChangePasswordValidator } = require('../utils/validator');
let { CheckLogin } = require('../utils/authHandler');
let roleModel = require('../schemas/roles');
let userProfileModel = require('../schemas/userProfiles');
let mongoose = require('mongoose');

// login
router.post('/login', async function (req, res, next) {
    let { username, password } = req.body;
    let result = await userController.QueryLogin(username, password);
    if (!result) {
        res.status(404).send("Thong tin dang nhap khong dung");
    } else {
        res.cookie("TOKEN_SOCIAL_MEDIA", result, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: false
        });
        res.send(result);
    }
});

// register
router.post('/register', RegisterValidator, validatedResult, async function (req, res, next) {
    try {
        let { username, password, email } = req.body;
        let userRole = await roleModel.findOne({ name: 'user' });
        if (!userRole) {
            throw new Error("Role 'user' chua ton tai trong he thong");
        }
        let newUser = await userController.CreateAnUser(
            username,
            password,
            email,
            userRole._id,
            undefined,
        );
        newUser = await newUser.populate('role');
        let profile = await userProfileModel.findOne({ user: newUser._id }).populate('user');
        res.send(profile);
    } catch (error) {
        res.status(404).send(error.message);
    }
});

// get current user
router.get('/me', CheckLogin, function (req, res, next) {
    res.send(req.user);
});

// change password
router.post('/changepassword', CheckLogin, ChangePasswordValidator, validatedResult, async function (req, res, next) {
    let { oldpassword, newpassword } = req.body;
    let user = req.user;
    let result = await userController.ChangePassword(user, oldpassword, newpassword);
    if (!result) {
        res.status(404).send("Thong tin dang nhap khong dung");
    } else {
        res.send("Doi mat khau thanh cong");
    }
});

// logout
router.post('/logout', CheckLogin, async function (req, res, next) {
    res.cookie("TOKEN_SOCIAL_MEDIA", null, {
        maxAge: 0
    });
    res.send("Logout thanh cong");
});

module.exports = router;