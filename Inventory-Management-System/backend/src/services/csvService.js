const { Parser } = require('json2csv');

// Convert orders to CSV format
function exportOrdersToCSV(orders) {
  if (!orders || orders.length === 0) {
    return 'No data available';
  }

  const fields = [
    'order_id',
    'order_number',
    'customer_name',
    'total_amount',
    'status',
    'created_at',
    'items_count'
  ];

  const parser = new Parser({ fields });
  return parser.parse(orders);
}

// Convert products to CSV format
function exportProductsToCSV(products) {
  if (!products || products.length === 0) {
    return 'No data available';
  }

  const fields = [
    'id',
    'name',
    'category',
    'unit_type',
    'stock_qty',
    'created_at'
  ];

  const parser = new Parser({ fields });
  return parser.parse(products);
}

module.exports = {
  exportOrdersToCSV,
  exportProductsToCSV
};