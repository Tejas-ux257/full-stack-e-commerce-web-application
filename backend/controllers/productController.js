const db = require('../config/db');
const { uploadToCloudinary } = require('../config/cloudinary');

exports.getProducts = async (req, res) => {
  try {
    let { search, category_id, min_price, max_price, sort, page, limit } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.name as category_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) as primary_image,
             COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = p.id), 0) as average_rating,
             (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as reviews_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    let countQuery = `SELECT COUNT(*) as total FROM products p WHERE 1=1`;
    let queryParams = [];
    let countParams = [];

    if (search) {
      const searchWild = `%${search}%`;
      query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      countQuery += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      queryParams.push(searchWild, searchWild);
      countParams.push(searchWild, searchWild);
    }

    if (category_id) {
      query += ` AND p.category_id = ?`;
      countQuery += ` AND p.category_id = ?`;
      queryParams.push(category_id);
      countParams.push(category_id);
    }

    if (min_price) {
      query += ` AND p.price >= ?`;
      countQuery += ` AND p.price >= ?`;
      queryParams.push(min_price);
      countParams.push(min_price);
    }
    if (max_price) {
      query += ` AND p.price <= ?`;
      countQuery += ` AND p.price <= ?`;
      queryParams.push(max_price);
      countParams.push(max_price);
    }

    if (sort === 'price_asc') {
      query += ` ORDER BY p.price ASC`;
    } else if (sort === 'price_desc') {
      query += ` ORDER BY p.price DESC`;
    } else if (sort === 'rating') {
      query += ` ORDER BY average_rating DESC`;
    } else if (sort === 'popularity') {
      query += ` ORDER BY p.likes DESC`;
    } else {
      query += ` ORDER BY p.id DESC`; // Newest first
    }

    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const [rows] = await db.query(query, queryParams);
    const [totalResult] = await db.query(countQuery, countParams);
    const total = totalResult[0].total;

    res.json({
      products: rows,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await db.query(
      `SELECT p.*, c.name as category_name,
              COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = p.id), 0) as average_rating,
              (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as reviews_count
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = products[0];

    const [images] = await db.query('SELECT * FROM product_images WHERE product_id = ?', [id]);
    product.images = images;

    const [reviews] = await db.query(
      'SELECT r.*, u.username as reviewer_username FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC',
      [id]
    );
    product.reviews = reviews;

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProductImages = async (req, res) => {
  try {
    const { id } = req.params;
    const [images] = await db.query('SELECT * FROM product_images WHERE product_id = ?', [id]);
    res.json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category_id, stock } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const [result] = await db.query(
      'INSERT INTO products (name, description, price, category_id, stock) VALUES (?, ?, ?, ?, ?)',
      [name, description || '', price, category_id || null, stock || 20]
    );

    const productId = result.insertId;

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageUrl = await uploadToCloudinary(file.path);
        const isPrimary = i === 0; // Make first image primary
        await db.query(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
          [productId, imageUrl, isPrimary]
        );
      }
    } else {
      await db.query(
        'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, TRUE)',
        [productId, 'https://picsum.photos/400/400?random=' + productId]
      );
    }

    res.status(201).json({ message: 'Product created successfully', productId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category_id, stock } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const [product] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await db.query(
      'UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, stock = ? WHERE id = ?',
      [name, description || '', price, category_id || null, stock || 20, id]
    );

    if (req.files && req.files.length > 0) {
      await db.query('DELETE FROM product_images WHERE product_id = ?', [id]);

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageUrl = await uploadToCloudinary(file.path);
        const isPrimary = i === 0;
        await db.query(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
          [id, imageUrl, isPrimary]
        );
      }
    }

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [product] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await db.query('DELETE FROM products WHERE id = ?', [id]);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.likeProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE products SET likes = likes + 1 WHERE id = ?', [id]);
    const [rows] = await db.query('SELECT likes FROM products WHERE id = ?', [id]);
    res.json({ message: 'Liked successfully', likes: rows[0]?.likes || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

