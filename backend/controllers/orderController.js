const db = require('../config/db');

exports.checkout = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const userId = req.user.id;
    const { shipping_address, payment_method } = req.body;

    if (!shipping_address) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    await connection.beginTransaction();

    const [cart] = await connection.query('SELECT id FROM cart WHERE user_id = ?', [userId]);
    if (cart.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'No cart found for this user' });
    }
    const cartId = cart[0].id;

    const [cartItems] = await connection.query(
      'SELECT ci.*, p.price, p.stock, p.name FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ?',
      [cartId]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    let totalAmount = 0;
    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        await connection.rollback();
        return res.status(400).json({ message: `Insufficient stock for product: ${item.name}. Available: ${item.stock}` });
      }
      totalAmount += item.quantity * item.price;
    }

    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_method) VALUES (?, ?, ?, ?, ?)',
      [userId, totalAmount, 'Pending', shipping_address, payment_method || 'Cash on Delivery']
    );
    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    await connection.query(
      'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
      [userId, `Your order #${orderId} for ₹${totalAmount.toFixed(2)} has been placed successfully!`]
    );

    await connection.commit();
    res.status(201).json({ message: 'Order placed successfully', orderId });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const [orders] = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    if (order.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [items] = await db.query(
      `SELECT oi.*, p.name,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) as primary_image
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    order.items = items;
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, u.username as customer_name, u.email as customer_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    await db.query(
      'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
      [orders[0].user_id, `Your order #${id} status has been updated to: ${status}.`]
    );

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

