const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_key_123456');

      const [users] = await db.query(
        'SELECT u.id, u.username, u.email, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
        [decoded.id]
      );

      if (users.length === 0) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = users[0];
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

exports.optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_key_123456');

      const [users] = await db.query(
        'SELECT u.id, u.username, u.email, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
        [decoded.id]
      );

      if (users.length > 0) {
        req.user = users[0];
      }
    } catch (error) {
      // Ignore token failure for optional protect, fallback to guest
    }
  }
  next();
};

exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
