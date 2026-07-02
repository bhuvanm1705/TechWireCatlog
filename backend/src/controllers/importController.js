const fs = require('fs');
const path = require('path');
const { parseCSV } = require('../utils/csvParser');
const { importProductData } = require('../services/importService');

/**
 * Handle CSV upload and database import.
 */
async function importCSV(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded' });
  }

  const filePath = req.file.path;
  try {
    const productsData = await parseCSV(filePath);
    const count = await importProductData(productsData);

    // Remove uploaded temporary file
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Error removing upload temp file:', err);
    }

    return res.status(200).json({
      success: true,
      message: `Successfully imported ${count} products.`,
      count,
    });
  } catch (error) {
    console.error('CSV Import API error:', error);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      // Ignore
    }
    return res.status(500).json({
      success: false,
      error: 'Failed to import CSV file: ' + error.message,
    });
  }
}

/**
 * Handle direct import of local sample Assignment CSV file.
 */
async function importSample(req, res) {
  const potentialPaths = [
    path.join(__dirname, '../../../Assignment - Sheet1.csv'),
    path.join(__dirname, '../../Assignment - Sheet1.csv'),
    'C:\\Users\\bhuva\\Downloads\\techwire\\Assignment - Sheet1.csv',
    'C:\\Users\\bhuva\\Downloads\\tw\\Assignment - Sheet1.csv',
    'C:\\Users\\bhuva\\Downloads\\Assignment - Sheet1.csv',
  ];

  let samplePath = null;
  for (const p of potentialPaths) {
    if (fs.existsSync(p)) {
      samplePath = p;
      break;
    }
  }

  if (!samplePath) {
    return res.status(404).json({
      success: false,
      error: `Sample file 'Assignment - Sheet1.csv' could not be resolved in default paths. Tried paths:\n${potentialPaths.join('\n')}`,
    });
  }

  try {
    const productsData = await parseCSV(samplePath);
    const count = await importProductData(productsData);

    return res.status(200).json({
      success: true,
      message: `Successfully imported ${count} products from sample CSV.`,
      count,
      resolvedPath: samplePath,
    });
  } catch (error) {
    console.error('Sample CSV Import API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to import sample CSV: ' + error.message,
    });
  }
}

module.exports = {
  importCSV,
  importSample,
};
