const pool = require('../config/db');

// Deduct stock for multiple order items
const deductStock = (orderItems) => {
  for (const item of orderItems) {
    const product = db.products.find(p => p.id === item.product_id);
    if (!product) throw new Error('Product ' + item.product_id + ' not found');
    if (product.stock_quantity < item.quantity) {
      throw new Error('Insufficient stock for: ' + product.name);
    }
    product.stock_quantity -= item.quantity;
  }
};

// Restore stock (called when rider cancels an order)
const restoreStock = (orderItems) => {
  for (const item of orderItems) {
    const product = db.products.find(p => p.id === item.product_id);
    if (product) {
      product.stock_quantity += item.quantity;
    }
  }
};

// Add stock (manual restock by owner)
const addStock = (productId, quantity) => {
  const product = db.products.find(p => p.id === productId);
  if (!product) throw new Error('Product not found');
  product.stock_quantity += quantity;
  return product;
};

module.exports = { deductStock, restoreStock, addStock };