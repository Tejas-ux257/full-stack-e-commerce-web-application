const express = require('express');
const router = express.Router();
const controller = require('../controllers/wishlistController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, controller.getWishlist);
router.post('/add', protect, controller.addToWishlist);
router.delete('/remove/:productId', protect, controller.removeFromWishlist);

module.exports = router;
