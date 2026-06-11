const pool = require('../config/db');

// Helper 1: Check if enough stock exists for all items in an order
async function validateStockAvailability(orderItems) {
  const errors = [];
  
  for (const item of orderItems) {
    const result = await pool.query(
      'SELECT id, name, stock_qty FROM products WHERE id = $1',
      [item.product_id]
    );
    
    if (result.rows.length === 0) {
      errors.push(`Product with ID ${item.product_id} not found`);
      continue;
    }
    
    const product = result.rows[0];
    
    if (product.stock_qty < item.quantity) {
      errors.push(
        `Insufficient stock for ${product.name}. ` +
        `Available: ${product.stock_qty}, Requested: ${item.quantity}`
      );
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Helper 2: Calculate total amount of the order
function calculateOrderTotal(orderItems, products) {
  let total = 0;
  
  for (const item of orderItems) {
    const product = products.find(p => p.id === item.product_id);
    if (product) {
      total += product.unit_price * item.quantity;
    }
  }
  
  return parseFloat(total.toFixed(2));
}

// Helper 3: Check which products will become low stock after deduction
async function checkLowStockAfterOrder(orderItems, threshold = 10) {
  const lowStockProducts = [];
  
  for (const item of orderItems) {
    const result = await pool.query(
      'SELECT id, name, stock_qty FROM products WHERE id = $1',
      [item.product_id]
    );
    
    if (result.rows.length > 0) {
      const product = result.rows[0];
      const remainingStock = product.stock_qty - item.quantity;
      
      if (remainingStock < threshold && remainingStock >= 0) {
        lowStockProducts.push({
          id: product.id,
          name: product.name,
          stock_qty: product.stock_qty,
          after_deduction: remainingStock,
          threshold: threshold
        });
      }
    }
  }
  
  return lowStockProducts;
}

module.exports = {
  validateStockAvailability,
  calculateOrderTotal,
  checkLowStockAfterOrder
};