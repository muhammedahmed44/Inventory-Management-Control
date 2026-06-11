const pool = require('../config/db');
const { deductStock, addStock } = require('../services/stockService');

// GET /api/orders — list all orders (with optional ?status= or ?date= filter)
const getOrders = (req, res, next) => {
  try {
    let orders = [...db.orders];

    if (req.query.status) {
      orders = orders.filter(o => o.status === req.query.status);
    }
    if (req.query.date) {
      orders = orders.filter(o => o.created_at.startsWith(req.query.date));
    }

    // Attach items to each order
    const result = orders.map(o => ({
      ...o,
      items: db.order_items.filter(i => i.order_id === o.id)
    }));

    res.json({ success: true, orders: result });
  } catch (err) {
    next(err);
  }
};

// POST /api/orders — create a new order (status: pending, no stock deduction)
const createOrder = (req, res, next) => {
  try {
    const { items, store_type = 'offline' } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Items are required' });
    }

    // Validate products exist
    for (const item of items) {
      const product = db.products.find(p => p.id === item.product_id);
      if (!product) {
        return res.status(400).json({ success: false, message: 'Product ' + item.product_id + ' not found' });
      }
    }

    const order = {
      id: getId(),
      store_type,
      status: 'pending',
      rider_id: null,
      total_amount: null,
      created_at: new Date().toISOString(),
      completed_at: null,
      dispatched_at: null,
      delivered_at: null,
      cancelled_at: null,
    };

    db.orders.push(order);

    // Save order items
    for (const item of items) {
      const product = db.products.find(p => p.id === item.product_id);
      db.order_items.push({
        id: getId(),
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product.price,
      });
    }

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/:id/complete — complete order, deduct stock, generate invoice
const completeOrder = (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const order = db.orders.find(o => o.id === id);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Order is already ' + order.status });
    }

    const items = db.order_items.filter(i => i.order_id === id);

    // Deduct stock (throws if insufficient)
    deductStock(items);

    // Calculate total
    const total = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);

    order.status = 'completed';
    order.total_amount = total;
    order.completed_at = new Date().toISOString();

    res.json({
      success: true,
      order,
      invoice: {
        order_id: id,
        items: items.map(i => {
          const product = db.products.find(p => p.id === i.product_id);
          return { product_name: product.name, quantity: i.quantity, unit_price: i.unit_price };
        }),
        total_amount: total,
        generated_at: new Date().toISOString(),
      }
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/:id/assign — assign a rider to an order
const assignRider = (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { rider_id } = req.body;

    const order = db.orders.find(o => o.id === id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const rider = db.riders.find(r => r.id === rider_id);
    if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' });

    order.rider_id = rider_id;
    order.status = 'assigned';

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/:id/dispatch — dispatch order (deducts stock for online stores)
const dispatchOrder = (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const order = db.orders.find(o => o.id === id);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!order.rider_id) return res.status(400).json({ success: false, message: 'Assign a rider first' });

    // Online store: deduct stock at dispatch (not at completion)
    if (order.store_type === 'online' && order.status !== 'completed') {
      const items = db.order_items.filter(i => i.order_id === id);
      deductStock(items);
    }

    order.status = 'dispatched';
    order.dispatched_at = new Date().toISOString();

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// POST /api/orders/restock — manually restock a product
const restockProduct = (req, res, next) => {
  try {
    const { product_id, quantity } = req.body;
    if (!product_id || !quantity) {
      return res.status(400).json({ success: false, message: 'product_id and quantity required' });
    }
    const product = addStock(product_id, quantity);
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/products — view all products and stock levels
const getProducts = (req, res) => {
  res.json({ success: true, products: db.products });
};

module.exports = { getOrders, createOrder, completeOrder, assignRider, dispatchOrder, restockProduct, getProducts };