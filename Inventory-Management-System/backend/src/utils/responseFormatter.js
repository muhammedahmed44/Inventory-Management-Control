// Success response
function success(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message: message,
    data: data
  });
}

// Error response
function error(res, message, statusCode = 500, details = null) {
  const response = {
    success: false,
    message: message
  };
  
  if (details && process.env.NODE_ENV === 'development') {
    response.details = details;
  }
  
  return res.status(statusCode).json(response);
}

module.exports = { success, error };