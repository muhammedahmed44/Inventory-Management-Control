const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  getDailySummary,
  getRevenue,
  getTopProducts,
  downloadPDF
} = require('../controllers/analyticsController');

router.use(authenticate, requireRole('owner'));

router.get('/summary',      getDailySummary);
router.get('/revenue',      getRevenue);
router.get('/top-products', getTopProducts);
router.get('/report/pdf',   downloadPDF);

module.exports = router;