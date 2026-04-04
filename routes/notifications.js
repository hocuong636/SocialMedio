var express = require('express');
var router = express.Router();

const notificationController = require('../controllers/notifications');
let { CheckLogin } = require('../utils/authHandler'); // Kéo middleware CheckLogin vào để bảo mật

/* =======================================
   CÁC API LIÊN QUAN ĐẾN THÔNG BÁO (NOTIFICATION)
   ======================================= */

// 1. Lấy số lượng thông báo chưa đọc (để đếm số hiển thị trên chuông)
router.get('/unread-count', CheckLogin, notificationController.getUnreadCount);

// 2. Lấy danh sách thông báo
router.get('/', CheckLogin, notificationController.getAllNotifications);

// 3. Đánh dấu tất cả là đã đọc
router.patch('/read-all', CheckLogin, notificationController.markAllAsRead);

// 4. Đánh dấu MỘT thông báo là đã đọc (Khi click vào cái nào thì đánh dấu cái đó)
router.patch('/:id/read', CheckLogin, notificationController.markAsRead);

// 5. Xóa tất cả thông báo đã đọc
router.delete('/all', CheckLogin, notificationController.deleteAllNotification);

// 6. Xóa MỘT thông báo
router.delete('/:id', CheckLogin, notificationController.deleteNotification);

module.exports = router;