var express = require('express');
var router = express.Router();

const notificationController = require('../controllers/notifications.js');
let { CheckLogin } = require('../utils/authHandler');

// Lấy số lượng thông báo chưa đọc
// GET /api/v1/notifications/unread-count
router.get('/unread-count', CheckLogin, notificationController.getUnreadCount);

// Lấy danh sách thông báo
// GET /api/v1/notifications
router.get('/', CheckLogin, notificationController.getAllNotifications);

// Đánh dấu tất cả thông báo là đã đọc
// PATCH /api/v1/notifications/read-all
router.patch('/read-all', CheckLogin, notificationController.markAllAsRead);

// Đánh dấu một thông báo cụ thể là đã đọc
// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', CheckLogin, notificationController.markAsRead);

// Xóa tất cả thông báo
// DELETE /api/v1/notifications/all
router.delete('/all', CheckLogin, notificationController.deleteAllNotification);

// Xóa một thông báo cụ thể
// DELETE /api/v1/notifications/:id
router.delete('/:id', CheckLogin, notificationController.deleteNotification);

module.exports = router;