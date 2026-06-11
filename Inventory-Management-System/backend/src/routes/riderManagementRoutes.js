const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  listRiders, createRider, updateRider,
  deleteRider, regenerateCredentials
} = require('../controllers/riderController');

router.use(authenticate, requireRole('owner'));

router.get('/',                listRiders);
router.post('/',               createRider);
router.put('/:id',             updateRider);
router.delete('/:id',          deleteRider);
router.post('/:id/regenerate', regenerateCredentials);

module.exports = router;