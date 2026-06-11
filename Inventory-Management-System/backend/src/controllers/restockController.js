const restockModel = require('../models/restockModel');
const { validateRestock } = require('../validators/productValidator');
const { success, error } = require('../utils/responseFormatter');

const getOwnerId = (req) => req.user.id; // ← fixed, was () => 1

async function addRestock(req, res) {
  try {
    const ownerId = getOwnerId(req);
    const { product_id, quantity, notes } = req.body;

    const validation = validateRestock(req.body);
    if (!validation.isValid) {
      return error(res, 'Validation failed', 400, validation.errors);
    }

    const result = await restockModel.addRestock(ownerId, product_id, quantity, notes || null);

    return success(res, {
      product: result.product,
      restock: result.restock
    }, `Added ${quantity} units to ${result.product.name}`);

  } catch (err) {
    console.error(err);
    if (err.message === 'Product not found') {
      return error(res, 'Product not found', 404);
    }
    return error(res, 'Internal server error');
  }
}

async function getRestockHistory(req, res) {
  try {
    const ownerId = getOwnerId(req);
    const { product_id } = req.query;

    const history = await restockModel.getRestockHistory(ownerId, product_id);
    return success(res, history, 'Restock history retrieved successfully');
  } catch (err) {
    console.error(err);
    return error(res, 'Internal server error');
  }
}

module.exports = { addRestock, getRestockHistory };