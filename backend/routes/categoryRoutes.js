const express = require('express');
const router = express.Router();
const controller = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.get('/', controller.getCategories);
router.post('/', protect, adminOnly, controller.createCategory);
router.put('/:id', protect, adminOnly, controller.updateCategory);
router.delete('/:id', protect, adminOnly, controller.deleteCategory);

module.exports = router;
