const db = require('../config/db');

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const [items] = await db.query(
      `SELECT w.id as wishlist_id, p.*,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) as primary_image
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ?`,
      [userId]
    );

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const [product] = await db.query('SELECT id FROM products WHERE id = ?', [product_id]);
    if (product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const [existing] = await db.query(
      'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
      [userId, product_id]
    );

    if (existing.length === 0) {
      await db.query('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [userId, product_id]);
    }

    res.json({ message: 'Product added to wishlist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    await db.query('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [userId, productId]);

    res.json({ message: 'Product removed from wishlist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

