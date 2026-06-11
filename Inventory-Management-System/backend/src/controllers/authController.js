const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ─── REGISTER (owners only) ───────────────────────────────────────
// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password, store_type } = req.body;

  // Basic validation
  if (!name || !email || !password || !store_type) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, password, and store_type'
    });
  }

  if (!['offline', 'online'].includes(store_type)) {
    return res.status(400).json({
      success: false,
      message: 'store_type must be either offline or online'
    });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, role, store_type)
       VALUES ($1, $2, $3, 'owner', $4)
       RETURNING id, name, email, store_type, created_at`,
      [name, email, hashedPassword, store_type]
    );

    res.status(201).json({
      success: true,
      message: 'Owner registered successfully',
      user: rows[0]
    });

  } catch (err) {
    // Duplicate email error
    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }
    console.error('Register error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── LOGIN (owners + riders) ──────────────────────────────────────
// POST /api/auth/login
const login = async (req, res) => {
  const { email, username, password } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required' });
  }

  try {
    let result;

    // Owners login with email, riders login with username
    if (email) {
      result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    } else if (username) {
      result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Provide either email (for owners) or username (for riders)'
      });
    }

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        store_type: user.store_type,
        owner_id: user.owner_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        store_type: user.store_type
      }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { register, login };