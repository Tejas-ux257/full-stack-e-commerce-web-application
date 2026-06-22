const express = require('express');
const router = express.Router();
const controller = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, controller.getCart);
router.post('/add', protect, controller.addToCart);
router.put('/update', protect, controller.updateCartQuantity);
router.delete('/remove/:productId', protect, controller.removeFromCart);
router.delete('/clear', protect, controller.clearCart);

module.exports = router;
