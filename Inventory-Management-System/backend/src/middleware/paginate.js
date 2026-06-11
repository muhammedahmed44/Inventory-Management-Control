// Add this middleware to any route that returns a list
// It reads ?page=1&limit=20 from the URL
const paginate = (req, res, next) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const offset = (page - 1) * limit;

  req.pagination = { page, limit, offset };
  next();
};

// Use this helper in your controllers to send paginated responses
const paginatedResponse = (res, data, total, pagination) => {
  res.json({
    success: true,
    data,
    meta: {
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit)
    }
  });
};

module.exports = { paginate, paginatedResponse };