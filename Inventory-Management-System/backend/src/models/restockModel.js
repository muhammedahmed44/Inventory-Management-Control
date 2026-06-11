const pool = require('../config/db'); 

async function addRestock(ownerId, productId, quantity, notes) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Update product stock
    const updateProduct = await client.query(
      `UPDATE products
       SET stock_qty = stock_qty + $1, updated_at = NOW()
       WHERE id = $2 AND owner_id = $3
       RETURNING *`,
      [quantity, productId, ownerId]
    );

    if (updateProduct.rows.length === 0) {
      throw new Error('Product not found');
    }

    // Record restock entry
    const insertRestock = await client.query(
      `INSERT INTO restocks (owner_id, product_id, quantity_added, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [ownerId, productId, quantity, notes]
    );

    // Record stock transaction — fixed columns to match your schema
    await client.query(
      `INSERT INTO stock_transactions (product_id, change_qty, reason, order_id)
       VALUES ($1, $2, 'restock', NULL)`,
      [productId, quantity]  // ← fixed, was wrong columns
    );

    await client.query('COMMIT');

    return {
      product: updateProduct.rows[0],
      restock: insertRestock.rows[0]
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getRestockHistory(ownerId, productId = null) {
  let query = `
    SELECT r.*, p.name AS product_name
    FROM restocks r
    JOIN products p ON r.product_id = p.id
    WHERE r.owner_id = $1
  `;
  let params = [ownerId];

  if (productId) {
    query += ` AND r.product_id = $2`;
    params.push(productId);
  }

  query += ` ORDER BY r.created_at DESC`;

  const result = await pool.query(query, params);
  return result.rows;
}

module.exports = { addRestock, getRestockHistory };