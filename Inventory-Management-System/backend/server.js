require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'IMS Backend is running',
    endpoints: {
      auth:     '/api/auth',
      riders:   '/api/riders',
      rider:    '/api/rider',
      products: '/api/products',
      restocks: '/api/restocks',
      reports:  '/api/reports',
      orders:   '/api/orders',
      analytics:'/api/analytics'
    }
  });
});

app.use('/api/auth',      require('./src/routes/authRoutes'));
app.use('/api/riders',    require('./src/routes/riderManagementRoutes')); 
app.use('/api/rider',     require('./src/routes/riderRoutes'));            
app.use('/api/products',  require('./src/routes/productRoutes'));
app.use('/api/restocks',  require('./src/routes/restockRoutes'));
app.use('/api/reports',   require('./src/routes/reportRoutes'));
app.use('/api/orders',    require('./src/routes/orderRoutes'));
app.use('/api/analytics', require('./src/routes/analyticsRoutes'));

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong on the server' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));