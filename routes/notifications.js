var express = require('express');
var router = express.Router();

const notificationController = require('../controllers/notifications.js');
let { CheckLogin } = require('../utils/authHandler');

//lay so luong thong bao chua doc
router.get('/unread-count', CheckLogin, notificationController.getUnreadCount);

//lay danh sach thong bao
router.get('/', CheckLogin, notificationController.getAllNotifications);

//danh dau tat ca la da doc
router.patch('/read-all', CheckLogin, notificationController.markAllAsRead);

//danh dau 1 thong bao la da doc
router.patch('/:id/read', CheckLogin, notificationController.markAsRead);

//xoa tat ca thong bao da doc
router.delete('/all', CheckLogin, notificationController.deleteAllNotification);

//xoa 1 thong bao
router.delete('/:id', CheckLogin, notificationController.deleteNotification);

module.exports = router;