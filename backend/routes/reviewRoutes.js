const express = require('express');
const router = express.Router();
const controller = require('../controllers/reviewController');
const { optionalProtect } = require('../middlewares/authMiddleware');

router.post('/', optionalProtect, controller.addReview);
router.get('/:productId', controller.getReviewsByProduct);

module.exports = router;
