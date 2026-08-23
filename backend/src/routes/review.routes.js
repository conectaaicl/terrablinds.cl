const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/review.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

router.get('/public', ctrl.getActive);
router.get('/', protect, restrictTo('admin'), ctrl.getAll);
router.post('/', protect, restrictTo('admin'), ctrl.create);
router.put('/:id', protect, restrictTo('admin'), ctrl.update);
router.delete('/:id', protect, restrictTo('admin'), ctrl.remove);

module.exports = router;
