const db = require('../config/db');

exports.getAdminStats = async (req, res) => {
  try {
    const [[{ users_count }]] = await db.query('SELECT COUNT(*) as users_count FROM users');
    const [[{ products_count }]] = await db.query('SELECT COUNT(*) as products_count FROM products');
    const [[{ orders_count }]] = await db.query('SELECT COUNT(*) as orders_count FROM orders');
    const [[{ reviews_count }]] = await db.query('SELECT COUNT(*) as reviews_count FROM reviews');
    
    const [[{ total_revenue }]] = await db.query(
      "SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE status != 'Cancelled'"
    );

    const [latestOrders] = await db.query(
      `SELECT o.*, u.username as customer_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 5`
    );

    const [latestReviews] = await db.query(
      `SELECT r.*, p.name as product_name
       FROM reviews r
       JOIN products p ON r.product_id = p.id
       ORDER BY r.created_at DESC
       LIMIT 5`
    );

    res.json({
      summary: {
        users: users_count,
        products: products_count,
        orders: orders_count,
        reviews: reviews_count,
        revenue: total_revenue
      },
      latestOrders,
      latestReviews
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAnalyticsStats = async (req, res) => {
  try {
    const [revenueTimeline] = await db.query(
      `SELECT DATE_FORMAT(created_at, '%b %Y') as month, SUM(total_amount) as revenue
       FROM orders
       WHERE status != 'Cancelled'
       GROUP BY DATE_FORMAT(created_at, '%Y-%m'), month
       ORDER BY DATE_FORMAT(created_at, '%Y-%m') ASC
       LIMIT 6`
    );

    const [categoryDistribution] = await db.query(
      `SELECT c.name as category, COUNT(p.id) as count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id
       GROUP BY c.id, c.name`
    );

    const [topSelling] = await db.query(
      `SELECT p.name as product, SUM(oi.quantity) as sales_count
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       GROUP BY p.id, p.name
       ORDER BY sales_count DESC
       LIMIT 5`
    );

    const [highestRated] = await db.query(
      `SELECT p.name as product, AVG(r.rating) as average_rating
       FROM reviews r
       JOIN products p ON r.product_id = p.id
       GROUP BY p.id, p.name
       ORDER BY average_rating DESC
       LIMIT 5`
    );

    res.json({
      revenueTimeline,
      categoryDistribution,
      topSelling,
      highestRated
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

