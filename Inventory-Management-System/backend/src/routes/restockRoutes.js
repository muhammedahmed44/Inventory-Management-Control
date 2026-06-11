const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
router.use(authenticate, requireRole('owner'));
const restockController = require('../controllers/restockController');

router.post('/', restockController.addRestock);
router.get('/', restockController.getRestockHistory);

module.exports = router;