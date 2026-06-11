const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  getOrders, createOrder, completeOrder,
  assignRider, dispatchOrder, restockProduct, getProducts
} = require('../controllers/orderController');

router.use(authenticate, requireRole('owner')); // ← added auth

router.get('/products', getProducts);
router.get('/',         getOrders);
router.post('/',        createOrder);
router.post('/restock', restockProduct);
router.put('/:id/complete', completeOrder);
router.put('/:id/assign',   assignRider);
router.put('/:id/dispatch', dispatchOrder);

module.exports = router;