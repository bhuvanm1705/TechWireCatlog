const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { importCSV, importSample } = require('../controllers/importController');
const {
  getCategories,
  getSubcategories,
  getProducts,
  getProductDetail,
} = require('../controllers/productController');

// Import routes
router.post('/import', upload.single('file'), importCSV);
router.post('/import-sample', importSample);

// Category routes
router.get('/categories', getCategories);
router.get('/categories/:id/subcategories', getSubcategories);

// Product routes
router.get('/products', getProducts);
router.get('/products/:partNumber', getProductDetail);

module.exports = router;
