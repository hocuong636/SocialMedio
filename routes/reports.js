var express = require('express');
var router = express.Router();
const reportController = require('../controllers/reports');
const { CheckLogin, checkRole } = require('../utils/authHandler');

router.post('/', CheckLogin, reportController.createReport);

router.get('/', CheckLogin, checkRole('admin'), reportController.getReports);

router.patch('/:id/status', CheckLogin, checkRole('admin'), reportController.updateReportStatus);

module.exports = router;