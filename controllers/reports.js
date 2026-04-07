const Report = require("../schemas/reports");
const Notification = require("../schemas/notifications");
module.exports = {
    // Gửi báo cáo vi phạm mới (dành cho người dùng)
    createReport: async (req, res) => {
        try {
            const { targetType, targetId, reason } = req.body;

            // Xác định Schema tương ứng dựa trên loại đối tượng bị báo cáo (bài viết, bình luận, người dùng)
            const target = targetType === "post"
                ? require("../schemas/posts")
                : targetType === "comment"
                    ? require("../schemas/comments")
                    : require("../schemas/users");
            
            // Kiểm tra đối tượng bị báo cáo có tồn tại không
            const targetExists = await target.findById(targetId);
            if (!targetExists) {
                return res.status(404).json({ message: `Không tìm thấy ${targetType} mà bạn muốn báo cáo.` });
            }

            // Người dùng không được phép tự báo cáo chính mình
            if (targetType === "user" && targetId === req.user._id.toString()) {
                return res.status(400).json({ message: "Bạn không thể tự báo cáo chính mình!" });
            }

            // Kiểm tra xem người dùng đã báo cáo nội dung này chưa (tránh spam báo cáo)
            const existing = await Report.findOne({
                reporter: req.user._id,
                targetId
            });
            if (existing) return res.status(400).json({ message: "Bạn đã báo cáo nội dung này rồi!" });

            // Lưu báo cáo mới vào DB với trạng thái chờ xử lý (pending)
            const newReport = await Report.create({
                reporter: req.user._id,
                targetType,
                targetId,
                reason,
                status: "pending"
            });
            res.status(201).json({ success: true, data: newReport });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // Lấy danh sách tất cả các báo cáo (dành cho Admin)
    getReports: async (req, res) => {
        try {
            const reports = await Report.find().populate("reporter", "username avatarUrl").sort({ createdAt: -1 });
            res.status(200).json({ success: true, data: reports });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // Cập nhật trạng thái xử lý của báo cáo (dành cho Admin)
    updateReportStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const report = await Report.findByIdAndUpdate(id, { status }, { new: true });

            // Gửi thông báo kết quả xử lý cho người đã báo cáo (reporter)
            if (status === "resolved" || status === "rejected") {
                const content = status === "resolved"
                    ? "Báo cáo của bạn đã được xử lý. Cảm ơn bạn đã đóng góp!"
                    : "Báo cáo của bạn đã bị từ chối do không vi phạm tiêu chuẩn cộng đồng.";

                const newNotif = await Notification.create({
                    recipient: report.reporter,
                    sender: req.user._id,
                    type: "report_resolved",
                    content: content,
                    refModel: null,
                    refId: null
                });

                // Emit thông báo qua Socket.io nếu có kết nối
                if (global.io) {
                    global.io.to(report.reporter.toString()).emit('new_notification', newNotif);
                }
            }

            // Xử lý hệ quả nếu báo cáo được chấp nhận (resolved)
            if (status === "resolved") {
                const targetId = report.targetId;
                const targetType = report.targetType;

                // Nếu báo cáo bài viết hoặc bình luận: thực hiện ẩn nội dung đó
                if (targetType === "post" || targetType === "comment") {
                    const TargetModel = targetType === "post"
                        ? require("../schemas/posts")
                        : require("../schemas/comments");

                    const targetContent = await TargetModel.findById(targetId);
                    if (targetContent) {
                        // Ẩn nội dung vi phạm bằng cách đánh dấu đã xóa (soft delete)
                        targetContent.isDeleted = true;
                        await targetContent.save();

                        // Gửi thông báo cảnh cáo cho người vi phạm (author)
                        const violatorId = targetContent.author;
                        const warnNotif = await Notification.create({
                            recipient: violatorId,
                            sender: req.user._id,
                            type: "report_resolved",
                            content: `Nội dung của bạn (${targetType === "post" ? "bài viết" : "bình luận"}) đã bị gỡ bỏ do vi phạm tiêu chuẩn cộng đồng.`,
                            refModel: null,
                            refId: null
                        });

                        if (global.io) {
                            global.io.to(violatorId.toString()).emit('new_notification', warnNotif);
                        }
                    }
                } else if (targetType === "user") {
                    // Nếu báo cáo người dùng: gửi thông báo cảnh cáo trực tiếp cho người dùng đó
                    const warnNotif = await Notification.create({
                        recipient: targetId,
                        sender: req.user._id,
                        type: "report_resolved",
                        content: `Tài khoản của bạn vừa bị báo cáo. Hãy tuân thủ tiêu chuẩn cộng đồng để tránh bị khóa.`,
                        refModel: null,
                        refId: null
                    });

                    if (global.io) {
                        global.io.to(targetId.toString()).emit('new_notification', warnNotif);
                    }
                }
            }

            res.status(200).json({ success: true, data: report });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

