const express = require('express');
const cors = require('cors');
const path = require('path');
const productRoutes = require('./routes/productRoutes');

const app = express();

// Enable CORS with default settings (allow all origins in development)
app.use(cors());

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend service is running smoothly.' });
});

// API Routes mounting
app.use('/api', productRoutes);

// Optional: Serve Frontend Build Static Files (if in production)
const frontendBuildPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendBuildPath));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message || err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

module.exports = app;
