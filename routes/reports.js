var express = require('express');
var router = express.Router();
const reportController = require('../controllers/reports');
const { CheckLogin, checkRole } = require('../utils/authHandler');

// Tạo báo cáo (report) mới
// POST /api/v1/reports
router.post('/', CheckLogin, reportController.createReport);

// Lấy danh sách các báo cáo (dành cho Admin)
// GET /api/v1/reports
router.get('/', CheckLogin, checkRole('admin'), reportController.getReports);

// Cập nhật trạng thái của báo cáo
// PATCH /api/v1/reports/:id/status
router.patch('/:id/status', CheckLogin, checkRole('admin'), reportController.updateReportStatus);

module.exports = router;