const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// ─── HELPER: auto-generate unique credentials ─────────────────────
const generateCredentials = (name) => {
  const slug = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return {
    username: `${slug}${rand}`,
    plainPassword: `Rider@${rand}`
  };
};

// ─── GET all riders for this owner ───────────────────────────────
// GET /api/riders
const listRiders = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, username, created_at
       FROM users
       WHERE owner_id = $1 AND role = 'rider'
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('List riders error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── CREATE a new rider ───────────────────────────────────────────
// POST /api/riders
const createRider = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Rider name is required' });
  }

  try {
    const creds = generateCredentials(name);
    const hashedPassword = await bcrypt.hash(creds.plainPassword, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (name, username, password, role, owner_id)
       VALUES ($1, $2, $3, 'rider', $4)
       RETURNING id, name, username, created_at`,
      [name, creds.username, hashedPassword, req.user.id]
    );

    // We return the plain password ONCE here so owner can share it with rider
    res.status(201).json({
      success: true,
      message: 'Rider created successfully',
      rider: rows[0],
      credentials: {
        username: creds.username,
        password: creds.plainPassword,
        note: 'Save this password now — it will not be shown again'
      }
    });

  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Username conflict — please try again'
      });
    }
    console.error('Create rider error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── UPDATE rider name ────────────────────────────────────────────
// PUT /api/riders/:id
const updateRider = async (req, res) => {
  const { name } = req.body;
  const riderId  = req.params.id;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE users
       SET name = $1
       WHERE id = $2 AND owner_id = $3 AND role = 'rider'
       RETURNING id, name, username`,
      [name, riderId, req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }

    res.json({ success: true, message: 'Rider updated', rider: rows[0] });
  } catch (err) {
    console.error('Update rider error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── DELETE a rider ───────────────────────────────────────────────
// DELETE /api/riders/:id
const deleteRider = async (req, res) => {
  const riderId = req.params.id;

  try {
    const { rowCount } = await pool.query(
      `DELETE FROM users
       WHERE id = $1 AND owner_id = $2 AND role = 'rider'`,
      [riderId, req.user.id]
    );

    if (!rowCount) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }

    res.json({ success: true, message: 'Rider deleted successfully' });
  } catch (err) {
    console.error('Delete rider error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── REGENERATE credentials ───────────────────────────────────────
// POST /api/riders/:id/regenerate
const regenerateCredentials = async (req, res) => {
  const riderId = req.params.id;

  try {
    // First find the rider
    const { rows: found } = await pool.query(
      `SELECT * FROM users WHERE id = $1 AND owner_id = $2 AND role = 'rider'`,
      [riderId, req.user.id]
    );

    if (!found.length) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }

    // Generate new credentials
    const creds = generateCredentials(found[0].name);
    const hashedPassword = await bcrypt.hash(creds.plainPassword, 10);

    await pool.query(
      `UPDATE users SET username = $1, password = $2 WHERE id = $3`,
      [creds.username, hashedPassword, riderId]
    );

    res.json({
      success: true,
      message: 'Credentials regenerated successfully',
      credentials: {
        username: creds.username,
        password: creds.plainPassword,
        note: 'Save this password now — it will not be shown again'
      }
    });

  } catch (err) {
    console.error('Regenerate error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { listRiders, createRider, updateRider, deleteRider, regenerateCredentials };