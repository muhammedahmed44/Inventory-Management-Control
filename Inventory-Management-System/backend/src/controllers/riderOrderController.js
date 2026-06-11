const pool = require('../config/db');
const { restoreStock } = require('../services/stockService');

// GET /api/rider/orders?rider_id=1 — get orders assigned to a rider
const getRiderOrders = (req, res, next) => {
  try {
    const rider_id = parseInt(req.query.rider_id);
    if (!rider_id) return res.status(400).json({ success: false, message: 'rider_id query param required' });

    const orders = db.orders
      .filter(o => o.rider_id === rider_id && ['assigned', 'dispatched'].includes(o.status))
      .map(o => ({
        ...o,
        items: db.order_items
          .filter(i => i.order_id === o.id)
          .map(i => {
            const product = db.products.find(p => p.id === i.product_id);
            return { ...i, product_name: product ? product.name : 'Unknown' };
          })
      }));

    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

// PUT /api/rider/orders/:id/deliver — mark order as delivered
const deliverOrder = (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { rider_id } = req.body;

    const order = db.orders.find(o => o.id === id && o.rider_id === rider_id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found or not assigned to you' });

    order.status = 'delivered';
    order.delivered_at = new Date().toISOString();

    // No stock change — already deducted at dispatch
    res.json({ success: true, order, message: 'Order marked as delivered' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/rider/orders/:id/cancel — cancel order and restore stock automatically
const cancelOrder = (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { rider_id } = req.body;

    const order = db.orders.find(o => o.id === id && o.rider_id === rider_id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found or not assigned to you' });

    // Restore stock only if it was already deducted
    if (['dispatched', 'completed'].includes(order.status)) {
      const items = db.order_items.filter(i => i.order_id === id);
      restoreStock(items);
    }

    order.status = 'cancelled';
    order.cancelled_at = new Date().toISOString();

    res.json({ success: true, order, message: 'Order cancelled — stock restored automatically' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRiderOrders, deliverOrder, cancelOrder };