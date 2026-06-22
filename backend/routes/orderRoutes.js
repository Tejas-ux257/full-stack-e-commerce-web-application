const express = require('express');
const router = express.Router();
const controller = require('../controllers/orderController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.post('/checkout', protect, controller.checkout);
router.get('/my-orders', protect, controller.getMyOrders);
router.get('/detail/:id', protect, controller.getOrderById);
router.get('/all', protect, adminOnly, controller.getAllOrders);
router.put('/status/:id', protect, adminOnly, controller.updateOrderStatus);

module.exports = router;
