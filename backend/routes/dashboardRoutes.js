const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboardController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.get('/stats', protect, adminOnly, controller.getAdminStats);
router.get('/analytics', protect, adminOnly, controller.getAnalyticsStats);

module.exports = router;
