const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const reportController = require('../controllers/reportController');

router.use(authenticate, requireRole('owner')); // ← added auth

router.get('/products/csv', reportController.exportProductsCSV);
router.get('/daily/csv',    reportController.exportDailyReportCSV);
router.get('/custom/csv',   reportController.exportCustomReportCSV);

module.exports = router;