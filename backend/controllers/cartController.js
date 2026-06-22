const db = require('../config/db');

// Helper to get or create cart ID for a user
const getOrCreateCartId = async (userId) => {
  const [carts] = await db.query('SELECT id FROM cart WHERE user_id = ?', [userId]);
  if (carts.length > 0) {
    return carts[0].id;
  }
  const [result] = await db.query('INSERT INTO cart (user_id) VALUES (?)', [userId]);
  return result.insertId;
};

// Get cart items
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartId = await getOrCreateCartId(userId);

    const [items] = await db.query(
      `SELECT ci.*, p.name, p.price, p.stock,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) as primary_image
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = ?`,
      [cartId]
    );

    res.json({ cartId, items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    const qty = parseInt(quantity) || 1;

    if (!product_id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const [product] = await db.query('SELECT stock FROM products WHERE id = ?', [product_id]);
    if (product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const cartId = await getOrCreateCartId(userId);

    // Check if item already in cart
    const [existing] = await db.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, product_id]
    );

    if (existing.length > 0) {
      const newQty = existing[0].quantity + qty;
      if (newQty > product[0].stock) {
        return res.status(400).json({ message: `Cannot add. Only ${product[0].stock} items in stock.` });
      }
      await db.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQty, existing[0].id]
      );
    } else {
      if (qty > product[0].stock) {
        return res.status(400).json({ message: `Cannot add. Only ${product[0].stock} items in stock.` });
      }
      await db.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
        [cartId, product_id, qty]
      );
    }

    res.json({ message: 'Added to cart successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update cart item quantity
exports.updateCartQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;
    const qty = parseInt(quantity);

    if (!product_id || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: 'Valid Product ID and Quantity are required' });
    }

    const [product] = await db.query('SELECT stock FROM products WHERE id = ?', [product_id]);
    if (product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (qty > product[0].stock) {
      return res.status(400).json({ message: `Cannot update. Only ${product[0].stock} items in stock.` });
    }

    const cartId = await getOrCreateCartId(userId);

    await db.query(
      'UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?',
      [qty, cartId, product_id]
    );

    res.json({ message: 'Cart updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const cartId = await getOrCreateCartId(userId);

    await db.query('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, productId]);

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartId = await getOrCreateCartId(userId);

    await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
