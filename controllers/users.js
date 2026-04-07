let userModel = require("../schemas/users");
let userProfileModel = require("../schemas/userProfiles");
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');

module.exports = {
    // Tạo tài khoản người dùng mới cùng với hồ sơ (profile) trống
    CreateAnUser: async function (username, password, email, role, session) {
        // Khởi tạo model User mới
        let newItem = new userModel({
            username: username,
            password: password,
            email: email,
            role: role
        });
        await newItem.save({ session });

        // Tự động tạo hồ sơ trống đi kèm cho User vừa tạo
        let newProfile = new userProfileModel({
            user: newItem._id
        });
        await newProfile.save({ session });
        return newItem;
    },

    // Lấy danh sách tất cả người dùng chưa bị xóa
    GetAllUser: async function () {
        return await userModel.find({ isDeleted: false });
    },

    // Tìm kiếm thông tin người dùng theo ID
    GetUserById: async function (id) {
        try {
            return await userModel
                .findOne({ isDeleted: false, _id: id })
                .populate('role');
        } catch (error) {
            return false;
        }
    },

    // Tìm kiếm thông tin người dùng theo địa chỉ email
    GetUserByEmail: async function (email) {
        try {
            return await userModel
                .findOne({ isDeleted: false, email: email });
        } catch (error) {
            return false;
        }
    },

    // Xác thực đăng nhập và trả về mã thông báo (JWT token)
    QueryLogin: async function (username, password) {
        if (!username || !password) {
            return false;
        }
        // Tìm user theo username
        let user = await userModel.findOne({
            username: username,
            isDeleted: false
        });
        if (user) {
            // Kiểm tra xem tài khoản có đang bị khóa không
            if (user.lockTime && user.lockTime > Date.now()) {
                return false;
            } else {
                // Kiểm tra mật khẩu (đã mã hóa) bằng bcrypt
                if (bcrypt.compareSync(password, user.password)) {
                    // Đăng nhập thành công: reset số lần sai và tạo token
                    user.loginCount = 0;
                    await user.save();
                    let token = jwt.sign({
                        id: user.id
                    }, require('../utils/authHandler').JWT_SECRET, {
                        expiresIn: '1d'
                    });
                    return token;
                } else {
                    // Đăng nhập thất bại: tăng số lần nhập sai
                    user.loginCount++;
                    // Nếu sai 3 lần thì khóa tài khoản trong 1 giờ
                    if (user.loginCount == 3) {
                        user.loginCount = 0;
                        user.lockTime = Date.now() + 3_600_000;
                    }
                    await user.save();
                    return false;
                }
            }
        } else {
            return false;
        }
    },

    // Thực hiện đổi mật khẩu cho người dùng
    ChangePassword: async function (user, oldPassword, newPassword) {
        // Kiểm tra mật khẩu cũ trước khi cho phép đổi
        if (bcrypt.compareSync(oldPassword, user.password)) {
            user.password = newPassword;
            await user.save();
            return true;
        } else {
            return false;
        }
    }
};
