const CURRENCY = 'Rs';

const formatCurrency = (amount) => {
  return `${CURRENCY} ${Number(amount).toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

module.exports = { CURRENCY, formatCurrency };