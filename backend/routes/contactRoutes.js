const express = require('express');
const router = express.Router();
const controller = require('../controllers/contactController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.post('/', controller.addContact);
router.get('/', protect, adminOnly, controller.getContacts);

module.exports = router;
