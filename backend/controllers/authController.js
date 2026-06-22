const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_key_123456';

// Register User
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username or Email already exists' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Default role is 'user' (role_id = 2)
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, 2)',
      [username, email, hashedPassword]
    );

    const userId = result.insertId;

    // Automatically create empty cart for user
    await db.query('INSERT INTO cart (user_id) VALUES (?)', [userId]);

    // Generate JWT
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        username,
        email,
        role: 'user'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Get user with role name
    const [users] = await db.query(
      'SELECT u.*, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Make sure user has a cart, just in case
    const [carts] = await db.query('SELECT * FROM cart WHERE user_id = ?', [user.id]);
    if (carts.length === 0) {
      await db.query('INSERT INTO cart (user_id) VALUES (?)', [user.id]);
    }

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    // Generate token (e.g. 6-digit numeric OTP)
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 3600000; // 1 hour

    await db.query('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?', [token, expiry, email]);

    // In production, send email. Here, we mock it by logging and returning it in the API for demo purposes
    console.log(`[MOCK EMAIL] Password reset token for ${email}: ${token}`);

    res.json({
      message: 'Reset token generated (mock email sent to console)',
      token // Returning token so the portfolio app user doesn't need a real email setup
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ? AND reset_token = ? AND reset_token_expiry > ?',
      [email, token, Date.now()]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear token columns
    await db.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE email = ?',
      [hashedPassword, email]
    );

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get User Profile
exports.getProfile = async (req, res) => {
  try {
    // req.user is set byprotect middleware
    res.json({ user: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
