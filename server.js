import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import usersRouter from './routes/users.js';
import categoriesRouter from './routes/categories.js';
import menuItemsRouter from './routes/menuItems.js';
import ordersRouter from './routes/orders.js';
import paymentsRouter from './routes/payments.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'], // Frontend URLs
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});


// API Routes
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/menu-items', menuItemsRouter);  // ✅ Pastikan ini sesuai dengan API service
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString() 
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Dapur Bunda Bahagia API Server',
    version: '1.0.0'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API available at: http://localhost:${PORT}/api`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
});

export default app;