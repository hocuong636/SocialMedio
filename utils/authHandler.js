let userModel = require('../schemas/users');
let jwt = require('jsonwebtoken');

module.exports = {
    CheckLogin: async function (req, res, next) {
        try {
            let token;
            const cookieName = process.env.COOKIE_NAME || 'TOKEN_SOCIAL_MEDIA';
            if (req.cookies[cookieName]) {
                token = req.cookies[cookieName];
            } else {
                token = req.headers.authorization;
                if (!token || !token.startsWith("Bearer")) {
                    res.status(403).send({ message: "Ban chua dang nhap" });
                    return;
                }
                token = token.split(' ')[1];
            }
            let result = jwt.verify(token, process.env.JWT_SECRET || 'secret');
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
