// Safely handles ?sort_by=created_at&order=DESC from URL
// Only allows specific fields so no one can inject SQL
const ALLOWED_SORT_FIELDS = ['created_at', 'total_amount', 'status', 'updated_at'];
const ALLOWED_DIRECTIONS  = ['ASC', 'DESC'];

const sortOrders = (req, res, next) => {
  const field = ALLOWED_SORT_FIELDS.includes(req.query.sort_by)
    ? req.query.sort_by
    : 'created_at';

  const dir = ALLOWED_DIRECTIONS.includes(req.query.order?.toUpperCase())
    ? req.query.order.toUpperCase()
    : 'DESC';

  req.sort = { field, dir };
  next();
};

module.exports = sortOrders;