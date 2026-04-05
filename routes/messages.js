var express = require('express');
var router = express.Router();

let messageModel = require('../schemas/messages');
let conversationModel = require('../schemas/conversations');
let { CheckLogin } = require('../utils/authHandler');

//Gửi một tin nhắn mới
//POST /api/v1/messages
router.post('/', CheckLogin, async function (req, res, next) {
    try {
        let { conversationId, type, text } = req.body;
        // Tạo tin nhắn mới trong DB
        let newMessage = await messageModel.create({
            conversation: conversationId,
            from: req.user._id,
            messageContent: { type, text }
        });
        // Cập nhật tin nhắn cuối cùng (lastMessage) vào cuộc hội thoại
        await conversationModel.findByIdAndUpdate(conversationId, {
            lastMessage: newMessage._id
        });
        res.status(201).send(newMessage);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

//Lấy lịch sử tin nhắn của một cuộc hội thoại
//GET /api/v1/messages/:conversationId
router.get('/:conversationId', CheckLogin, async function (req, res, next) {
    try {
        let messages = await messageModel
            .find({ conversation: req.params.conversationId })
            .populate('from', 'username fullName avatarUrl')
            .sort({ createdAt: 1 }); // Tin nhắn cũ trước, mới sau
        res.status(200).send(messages);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;