const Notification = require("../schemas/notifications.js");

module.exports = {
    // Lấy danh sách thông báo của người dùng (tối đa 20 thông báo mới nhất)
    getAllNotifications: async (req, res) => {
        try {
            const userId = req.user._id;
            const notifications = await Notification.find({
                recipient: userId
            })
                .populate('sender', 'username avatarUrl')
                .sort({ createdAt: -1 })
                .limit(20);
            res.status(200).json({
                success: true,
                count: notifications.length,
                data: notifications
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    },

    // Đánh dấu một thông báo cụ thể là đã đọc
    markAsRead: async (req, res) => {
        try {
            // Lấy ID thông báo từ tham số URL
            const notifId = req.params.id;
            const userId = req.user._id;
            const notif = await Notification.findOneAndUpdate(
                { _id: notifId, recipient: userId },
                { isRead: true },
                { new: true }
            );
            if (!notif) {
                return res.status(404).json({ success: false, message: "Thông báo không tồn tại" });
            }
            res.status(200).json({ success: true, data: notif });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // Đánh dấu tất cả thông báo chưa đọc của người dùng là đã đọc
    markAllAsRead: async (req, res) => {
        try {
            const userId = req.user._id;
            await Notification.updateMany(
                { recipient: userId, isRead: false },
                { isRead: true }
            );
            res.status(200).json({ success: true, message: "Đã đánh dấu đọc tất cả thông báo" });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // Lấy số lượng thông báo chưa đọc
    getUnreadCount: async (req, res) => {
        try {
            const userId = req.user._id;
            const count = await Notification.countDocuments({
                recipient: userId,
                isRead: false
            });
            res.status(200).json({ success: true, count });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // Xóa một thông báo cụ thể
    deleteNotification: async (req, res) => {
        try {
            const notifId = req.params.id;
            const userId = req.user._id;
            await Notification.findOneAndDelete({
                _id: notifId,
                recipient: userId
            });

            res.status(200).json({ success: true, message: "Đã xóa thông báo" });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message })
        }
    },

    // Xóa tất cả các thông báo đã được đọc
    deleteAllNotification: async (req, res) => {
        try {
            const userId = req.user._id;
            await Notification.deleteMany({
                recipient: userId,
                isRead: true
            });
            res.status(200).json({ success: true, message: "Đã xóa tất cả thông báo đã đọc" });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}