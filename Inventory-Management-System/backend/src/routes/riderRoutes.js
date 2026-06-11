const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { getRiderOrders, deliverOrder, cancelOrder } = require('../controllers/riderOrderController');

router.use(authenticate, requireRole('rider'));

router.get('/orders',             getRiderOrders);
router.put('/orders/:id/deliver', deliverOrder);
router.put('/orders/:id/cancel',  cancelOrder);

module.exports = router;