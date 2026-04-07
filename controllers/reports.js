const Report = require("../schemas/reports");
const Notification = require("../schemas/notifications");
module.exports = {
    // gui bao cao moi (danh cho user)
    createReport: async (req, res) => {
        try {
            const { targetType, targetId, reason } = req.body;

            //kiem tra model report coi co ton tai ko
            const target = targetType === "post"
                ? require("../schemas/posts")
                : targetType === "comment"
                    ? require("../schemas/comments")
                    : require("../schemas/users");
            const targetExists = await target.findById(targetId);
            if (!targetExists) {
                return res.status(404).json({ message: `Không tìm thấy ${targetType} mà bạn muốn báo cáo.` });
            }
            //kiem tra user co tu report chinh no ko
            if (targetType === "user" && targetId === req.user._id.toString()) {
                return res.status(400).json({ message: "Bạn không thể tự báo cáo chính mình!" });
            }
            //kiem tra user da report no chua
            const existing = await Report.findOne({
                reporter: req.user._id,
                targetId
            });
            if (existing) return res.status(400).json({ message: "Bạn đã báo cáo nội dung này rồi!" });
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
    //lay danh sach report (admin)
    getReports: async (req, res) => {
        try {
            const reports = await Report.find().populate("reporter", "username avatarUrl").sort({ createdAt: -1 });
            res.status(200).json({ success: true, data: reports });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    //update trang thai report
    updateReportStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const report = await Report.findByIdAndUpdate(id, { status }, { new: true });

            //Gui thong bao cho reporter
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

                if (global.io) {
                    global.io.to(report.reporter.toString()).emit('new_notification', newNotif);
                }
            }

            if (status === "resolved") {
                const targetId = report.targetId;
                const targetType = report.targetType;

                if (targetType === "post" || targetType === "comment") {
                    const TargetModel = targetType === "post"
                        ? require("../schemas/posts")
                        : require("../schemas/comments");

                    const targetContent = await TargetModel.findById(targetId);
                    if (targetContent) {
                        //an noi dung vi pham
                        targetContent.isDeleted = true;
                        await targetContent.save();
                        //thong bao cho nguoi vi pham
                        const violatorId = targetType === "post" ? targetContent.author : targetContent.author;
                        const warnNotif = await Notification.create({
                            recipient: violatorId,
                            sender: req.user._id,
                            type: "report_resolved",
                            content: `Bài viết của bạn đã bị gỡ bỏ do vi phạm tiêu chuẩn cộng đồng.`,
                            refModel: null,
                            refId: null
                        });

                        if (global.io) {
                            global.io.to(violatorId.toString()).emit('new_notification', warnNotif);
                        }
                    }
                } else if (targetType === "user") {
                    const User = require("../schemas/users");
                    const warnNotif = await Notification.create({
                        recipient: targetId,
                        sender: req.user._id,
                        type: "report_resolved",
                        content: `Tài khoản của bạn vừa bị người dùng báo cáo. Hãy tuân thủ tiêu chuẩn cộng đồng để tránh bị khóa.`,
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

