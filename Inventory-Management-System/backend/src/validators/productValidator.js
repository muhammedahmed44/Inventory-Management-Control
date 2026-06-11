// Product validation
function validateProduct(data) {
  const errors = [];
  
  if (!data.name || data.name.trim() === '') {
    errors.push('Product name is required');
  }
  
  if (!data.unit_type || data.unit_type.trim() === '') {
    errors.push('Unit type is required (piece, kg, meter, etc.)');
  }
  
  if (data.stock_qty !== undefined && data.stock_qty < 0) {
    errors.push('Current stock cannot be negative');
  }
  
  if (data.stock_qty !== undefined && isNaN(data.stock_qty)) {
    errors.push('Current stock must be a number');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Restock validation
function validateRestock(data) {
  const errors = [];
  
  if (!data.product_id) {
    errors.push('Product ID is required');
  }
  
  if (!data.quantity || data.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }
  
  if (data.quantity && isNaN(data.quantity)) {
    errors.push('Quantity must be a number');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Date range validation for reports
function validateDateRange(fromDate, toDate) {
  const errors = [];
  
  if (!fromDate) {
    errors.push('from_date is required');
  }
  
  if (!toDate) {
    errors.push('to_date is required');
  }
  
  if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
    errors.push('from_date cannot be after to_date');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

module.exports = { validateProduct, validateRestock, validateDateRange };