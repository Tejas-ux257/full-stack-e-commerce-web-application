const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', controller.getProducts);
router.get('/:id/images', controller.getProductImages);
router.get('/:id', controller.getProductById);
router.post('/', protect, adminOnly, upload.array('images', 5), controller.createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 5), controller.updateProduct);
router.delete('/:id', protect, adminOnly, controller.deleteProduct);
router.post('/like/:id', controller.likeProduct);

module.exports = router;

