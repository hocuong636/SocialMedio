var express = require('express');
var router = express.Router();

let conversationModel = require('../schemas/conversations');
let { CheckLogin } = require('../utils/authHandler');

//Tìm hoặc Tạo một cuộc hội thoại 1-1 với user khác
//POST /api/v1/conversations
router.post('/', CheckLogin, async function (req, res, next) {
    try {
        let { recipientId } = req.body;
        let senderId = req.user._id;
        // Kiểm tra xem cuộc hội thoại giữa 2 người này đã tồn tại chưa
        let conversation = await conversationModel.findOne({
            participants: { $all: [senderId, recipientId] }
        });
        if (!conversation) {
            // Nếu chưa có, tạo mới cuộc hội thoại
            conversation = await conversationModel.create({
                participants: [senderId, recipientId]
            });
        }
        // Trả về thông tin cuộc hội thoại (kèm thông tin user để hiển thị)
        conversation = await conversation.populate('participants', 'username fullName avatarUrl');
        res.status(200).send(conversation);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

//Lấy danh sách các cuộc hội thoại của User hiện tại
//GET /api/v1/conversations
router.get('/', CheckLogin, async function (req, res, next) {
    try {
        let conversations = await conversationModel
            .find({ participants: req.user._id })
            .populate('participants', 'username fullName avatarUrl')
            .populate('lastMessage') // Lấy tin nhắn cuối cùng để hiển thị ở danh sách chat
            .sort({ updatedAt: -1 });
        res.status(200).send(conversations);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});
module.exports = router;