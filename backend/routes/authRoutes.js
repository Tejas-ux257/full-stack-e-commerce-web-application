const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);
router.get('/profile', protect, controller.getProfile);

module.exports = router;
