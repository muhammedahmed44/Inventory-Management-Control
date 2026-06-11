const pool = require('../config/db');
const csvService = require('../services/csvService');
const { validateDateRange } = require('../validators/productValidator');
const { success, error } = require('../utils/responseFormatter');

const getOwnerId = (req) => req.user.id;

async function exportProductsCSV(req, res) {
  try {
    const ownerId = getOwnerId(req);

    const result = await pool.query(
      `SELECT id, name, category, unit_type, stock_qty, created_at
       FROM products
       WHERE owner_id = $1
       ORDER BY name ASC`,
      [ownerId]  // ← comma was missing before, now correct
    );

    const csv = csvService.exportProductsToCSV(result.rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    return res.send(csv);

  } catch (err) {
    console.error(err);
    return error(res, 'Internal server error');
  }
}

async function exportDailyReportCSV(req, res) {
  try {
    const ownerId = getOwnerId(req);
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const result = await pool.query(
      `SELECT
         id            AS order_id,
         status,
         total_amount,
         created_at,
         (SELECT COUNT(*) FROM order_items WHERE order_id = orders.id) AS items_count
       FROM orders
       WHERE owner_id = $1 AND DATE(created_at) = $2
       ORDER BY created_at DESC`,
      [ownerId, date]  // ← comma was missing before, now correct
    );

    const csv = csvService.exportOrdersToCSV(result.rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=report_${date}.csv`);
    return res.send(csv);

  } catch (err) {
    console.error(err);
    return error(res, 'Internal server error');
  }
}

async function exportCustomReportCSV(req, res) {
  try {
    const ownerId = getOwnerId(req);
    const { from_date, to_date } = req.query;

    const validation = validateDateRange(from_date, to_date);
    if (!validation.isValid) {
      return error(res, 'Validation failed', 400, validation.errors);
    }

    const result = await pool.query(
      `SELECT
         id            AS order_id,
         status,
         total_amount,
         created_at,
         (SELECT COUNT(*) FROM order_items WHERE order_id = orders.id) AS items_count
       FROM orders
       WHERE owner_id = $1
         AND DATE(created_at) BETWEEN $2 AND $3
       ORDER BY created_at DESC`,
      [ownerId, from_date, to_date]  // ← comma was missing before, now correct
    );

    const csv = csvService.exportOrdersToCSV(result.rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition',
      `attachment; filename=report_${from_date}_to_${to_date}.csv`);
    return res.send(csv);

  } catch (err) {
    console.error(err);
    return error(res, 'Internal server error');
  }
}

module.exports = { exportProductsCSV, exportDailyReportCSV, exportCustomReportCSV };