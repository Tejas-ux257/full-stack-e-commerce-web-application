const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, controller.getNotifications);
router.put('/:id', protect, controller.markAsRead);
router.put('/read/all', protect, controller.markAllAsRead);

module.exports = router;
