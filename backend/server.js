const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const contactRoutes = require('./routes/contactRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on port ${PORT}`);
});
