const pool = require('../config/db');
const productModel = require('../models/productModel');
const { validateProduct } = require('../validators/productValidator');
const { success, error } = require('../utils/responseFormatter');

const getOwnerId = (req) => req.user.id; // ← fixed, was () => 1

async function createProduct(req, res) {
  try {
    const ownerId = getOwnerId(req);
    const { name, category, unit_type, stock_qty } = req.body;

    const validation = validateProduct(req.body);
    if (!validation.isValid) {
      return error(res, 'Validation failed', 400, validation.errors);
    }

    const product = await productModel.createProduct(
      ownerId, name, category, unit_type, stock_qty || 0
    );

    return success(res, product, 'Product created successfully', 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Internal server error');
  }
}

async function getProducts(req, res) {
  try {
    const ownerId = getOwnerId(req);
    const products = await productModel.getProductsByOwner(ownerId);
    return success(res, products, 'Products retrieved successfully');
  } catch (err) {
    console.error(err);
    return error(res, 'Internal server error');
  }
}

async function getProductById(req, res) {
  try {
    const ownerId = getOwnerId(req);
    const { id } = req.params;

    const product = await productModel.getProductById(id, ownerId);
    if (!product) return error(res, 'Product not found', 404);

    return success(res, product, 'Product retrieved successfully');
  } catch (err) {
    console.error(err);
    return error(res, 'Internal server error');
  }
}

async function getLowStockProducts(req, res) {
  try {
    const ownerId = getOwnerId(req);
    const threshold = parseInt(req.query.threshold) || 10;

    const result = await pool.query(
      `SELECT * FROM products
       WHERE owner_id = $1 AND stock_qty < $2
       ORDER BY stock_qty ASC`,
      [ownerId, threshold]
    );

    return success(res, result.rows, 'Low stock products retrieved successfully');
  } catch (err) {
    console.error(err);
    return error(res, 'Internal server error');
  }
}

async function updateProduct(req, res) {
  try {
    const ownerId = getOwnerId(req);
    const { id } = req.params;

    const product = await productModel.updateProduct(id, ownerId, req.body);
    if (!product) return error(res, 'Product not found', 404);

    return success(res, product, 'Product updated successfully');
  } catch (err) {
    console.error(err);
    return error(res, 'Internal server error');
  }
}

async function deleteProduct(req, res) {
  try {
    const ownerId = getOwnerId(req);
    const { id } = req.params;

    const product = await productModel.deleteProduct(id, ownerId);
    if (!product) return error(res, 'Product not found', 404);

    return success(res, null, 'Product deleted successfully');
  } catch (err) {
    console.error(err);
    return error(res, 'Internal server error');
  }
}

module.exports = {
  createProduct, getProducts, getProductById,
  getLowStockProducts, updateProduct, deleteProduct
};