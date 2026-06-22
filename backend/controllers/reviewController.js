const db = require('../config/db');

// Add a product review
exports.addReview = async (req, res) => {
  try {
    const { product_id, review, rating } = req.body;
    
    // Auth support (check if token was verified, else set Guest)
    let userId = null;
    let reviewerName = 'Guest';

    if (req.user) {
      userId = req.user.id;
      reviewerName = req.user.username;
    }

    // Validation
    if (!product_id || !review || !rating) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    await db.query(
      'INSERT INTO reviews (product_id, user_id, reviewer_name, review, rating) VALUES (?, ?, ?, ?, ?)',
      [product_id, userId, reviewerName, review, rating]
    );

    res.json({ message: "Review added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get reviews for a product
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const [rows] = await db.query(
      `SELECT r.*, COALESCE(u.username, r.reviewer_name) as reviewer_name 
       FROM reviews r 
       LEFT JOIN users u ON r.user_id = u.id 
       WHERE r.product_id = ? 
       ORDER BY r.created_at DESC`,
      [productId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
