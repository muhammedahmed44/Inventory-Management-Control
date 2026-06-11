const pool = require('../config/db'); 

async function createProduct(ownerId, name, category, unitType, currentStock) {
  const result = await pool.query(
    `INSERT INTO products (owner_id, name, category, unit_type, stock_qty)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [ownerId, name, category, unitType, currentStock]
  );
  return result.rows[0];
}

async function getProductsByOwner(ownerId) {
  const result = await pool.query(
    'SELECT * FROM products WHERE owner_id = $1 ORDER BY created_at DESC',
    [ownerId]
  );
  return result.rows;
}

async function getProductById(productId, ownerId) {
  const result = await pool.query(
    'SELECT * FROM products WHERE id = $1 AND owner_id = $2',
    [productId, ownerId]
  );
  return result.rows[0];
}

async function updateProduct(productId, ownerId, updates) {
  const { name, category, unit_type, stock_qty } = updates;
  const result = await pool.query(
    `UPDATE products
     SET name      = COALESCE($1, name),
         category  = COALESCE($2, category),
         unit_type = COALESCE($3, unit_type),
         stock_qty = COALESCE($4, stock_qty),
         updated_at = NOW()
     WHERE id = $5 AND owner_id = $6
     RETURNING *`,
    [name, category, unit_type, stock_qty, productId, ownerId]
  );
  return result.rows[0];
}

async function deleteProduct(productId, ownerId) {
  const result = await pool.query(
    'DELETE FROM products WHERE id = $1 AND owner_id = $2 RETURNING *',
    [productId, ownerId]
  );
  return result.rows[0];
}

module.exports = {
  createProduct, getProductsByOwner,
  getProductById, updateProduct, deleteProduct
};