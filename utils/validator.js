let { body, validationResult } = require('express-validator');

module.exports = {
    validatedResult: function (req, res, next) {
        let result = validationResult(req);
        if (result.errors.length > 0) {
            res.status(400).send(result.errors.map(
                function (e) {
                    return {
                        [e.path]: e.msg
                    };
                }
            ));
            return;
        }
        next();
    },
    CreateAnUserValidator: [
        body('email').notEmpty().withMessage("email khong duoc de trong").bail().isEmail().withMessage("email sai dinh dang").normalizeEmail(),
        body('username').notEmpty().withMessage("username khong duoc de trong").bail().isAlphanumeric().withMessage("username khong duoc chua ki tu dac biet"),
        body('password').notEmpty().withMessage("password khong duoc de trong").bail().isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            minUppercase: 1
        }).withMessage("password phai co it nhat 8 ki tu (1 hoa, 1 thuong, 1 so, 1 dac biet)"),
        body('role').notEmpty().withMessage("role khong duoc de trong").bail().isMongoId().withMessage("role phai la ID"),
    ],
    RegisterValidator: [
        body('email').notEmpty().withMessage("email khong duoc de trong").bail().isEmail().withMessage("email sai dinh dang").normalizeEmail(),
        body('username').notEmpty().withMessage("username khong duoc de trong").bail().isAlphanumeric().withMessage("username khong duoc chua ki tu dac biet"),
        body('password').notEmpty().withMessage("password khong duoc de trong").bail().isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            minUppercase: 1
        }).withMessage("password phai co it nhat 8 ki tu (1 hoa, 1 thuong, 1 so, 1 dac biet)"),
    ],
    ChangePasswordValidator: [
        body('oldpassword').notEmpty().withMessage("mat khau cu khong duoc de trong"),
        body('newpassword').notEmpty().withMessage("mat khau moi khong duoc de trong").bail().isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            minUppercase: 1
        }).withMessage("password phai co it nhat 8 ki tu (1 hoa, 1 thuong, 1 so, 1 dac biet)"),
    ],
    ModifyAnUserValidator: [
        body('email').isEmpty().withMessage("email khong duoc thay doi"),
        body('username').isEmpty().withMessage("username khong duoc thay doi"),
        body('password').isEmpty().withMessage("password khong duoc thay doi o day"),
        body('role').isEmpty().withMessage("role khong duoc thay doi"),
    ],
    CreatePostValidator: [
        body('content').optional().isString().withMessage("content phai la chuoi"),
        body('visibility').optional().isIn(["public", "friends", "private"]).withMessage("visibility phai la public, friends hoac private"),
    ],
    CreateCommentValidator: [
        body('content').notEmpty().withMessage("noi dung comment khong duoc de trong"),
    ],
    
    // ─────────────────────────────────────────────────────────────────────────────
    // Validation functions für Comment content
    // ─────────────────────────────────────────────────────────────────────────────
    validateCommentContent: function(content) {
        // Trim whitespace
        if (typeof content !== 'string') {
            return {
                isValid: false,
                message: 'Comment content phải là string',
            };
        }
        
        const trimmed = content.trim();
        
        // Min length: 1
        if (trimmed.length < 1) {
            return {
                isValid: false,
                message: 'Comment không được để trống',
            };
        }
        
        // Max length: 500
        if (trimmed.length > 500) {
            return {
                isValid: false,
                message: 'Comment tối đa 500 ký tự',
            };
        }
        
        return {
            isValid: true,
        };
    },
    
    // ─────────────────────────────────────────────────────────────────────────────
    // Validation function für Reaction type
    // ─────────────────────────────────────────────────────────────────────────────
    validateReactionType: function(type) {
        const validTypes = ['like', 'haha', 'love', 'wow', 'sad', 'angry'];
        
        if (!type || typeof type !== 'string') {
            return {
                isValid: false,
                message: 'Reaction type là bắt buộc và phải là string',
            };
        }
        
        if (!validTypes.includes(type.toLowerCase())) {
            return {
                isValid: false,
                message: `Reaction type phải là một trong: ${validTypes.join(', ')}`,
            };
        }
        
        return {
            isValid: true,
        };
    },
};
