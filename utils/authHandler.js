let userController = require('../controllers/users');
let userModel = require('../schemas/users');
let jwt = require('jsonwebtoken');

module.exports = {
    CheckLogin: async function (req, res, next) {
        try {
            let token;
            if (req.cookies.TOKEN_SOCIAL_MEDIA) {
                token = req.cookies.TOKEN_SOCIAL_MEDIA;
            } else {
                token = req.headers.authorization;
                if (!token || !token.startsWith("Bearer")) {
                    res.status(403).send({ message: "Ban chua dang nhap" });
                    return;
                }
                token = token.split(' ')[1];
            }
            let result = jwt.verify(token, 'secret');
            if (result.exp * 1000 < Date.now()) {
                res.status(403).send({ message: "Ban chua dang nhap" });
                return;
            }
            let getUser = await userModel
                .findOne({ isDeleted: false, _id: result.id })
                .populate('role');
            if (!getUser) {
                res.status(403).send({ message: "Ban chua dang nhap" });
            } else {
                req.user = getUser;
                next();
            }
        } catch (error) {
            res.status(403).send({ message: "Ban chua dang nhap" });
        }
    },
    checkRole: function (...requiredRoles) {
        return function (req, res, next) {
            let roleOfUser = req.user.role.name;
            if (requiredRoles.includes(roleOfUser)) {
                next();
            } else {
                res.status(403).send({ message: "Ban khong co quyen" });
            }
        };
    }
};
