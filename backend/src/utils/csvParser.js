const fs = require('fs');
const csv = require('csv-parser');

/**
 * Normalizes header keys to handle newlines, quotes, and whitespace.
 * e.g., "VDSS\nV" becomes "VDSS V"
 */
function cleanHeader(header) {
  return header
    .replace(/\r?\n|\r/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parses a CSV file and dynamically maps the rows according to custom association rules.
 * @param {string} filePath - Absolute path to the CSV file.
 * @returns {Promise<Array>} - Resolves to an array of parsed product objects with dynamic attributes.
 */
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    let headers = [];

    fs.createReadStream(filePath)
      .pipe(
        csv({
          mapHeaders: ({ header }) => cleanHeader(header),
        })
      )
      .on('headers', (hdrList) => {
        headers = hdrList.map(cleanHeader);
      })
      .on('data', (row) => {
        // Find main columns
        const partNoKey = headers.find(h => h.toLowerCase().startsWith('part no'));
        const categoryKey = headers.find(h => h.toLowerCase() === 'category');
        const subcategoryKey = headers.find(h => h.toLowerCase().startsWith('sub-category') || h.toLowerCase().startsWith('subcategory'));
        const datasheetKey = headers.find(h => h.toLowerCase().startsWith('datasheet'));

        const rawPartNo = partNoKey ? row[partNoKey] : null;
        if (!rawPartNo || rawPartNo.trim() === '') {
          return;
        }

        const partNumber = rawPartNo.trim();
        const category = categoryKey && row[categoryKey] ? row[categoryKey].trim() : 'Uncategorized';
        const subcategory = subcategoryKey && row[subcategoryKey] ? row[subcategoryKey].trim() : 'General';
        const datasheetUrl = datasheetKey && row[datasheetKey] ? row[datasheetKey].trim() : null;

        // Use a Map to accumulate unique spec attributes and prevent duplicate keys
        const attributesMap = new Map();
        const excludedKeys = [categoryKey, subcategoryKey, partNoKey, datasheetKey].filter(Boolean);

        for (const key of headers) {
          // Skip empty or spacer column headers
          if (!key || key.trim() === '') {
            continue;
          }
          if (excludedKeys.includes(key)) {
            continue;
          }

          const rawVal = row[key];
          if (rawVal === undefined || rawVal === null) {
            continue;
          }

          const val = rawVal.trim();
          if (val === '') {
            // Empty Cell: Product is NOT associated with this column.
            continue;
          }

          if (val === '-') {
            // Dash Cell: Associated with column, display '-'
            attributesMap.set(key, {
              name: key,
              value: '-',
              isDash: true,
            });
          } else {
            // Filled Cell: Associated with column, display value
            attributesMap.set(key, {
              name: key,
              value: val,
              isDash: false,
            });
          }
        }

        results.push({
          category,
          subcategory,
          partNumber,
          datasheetUrl,
          attributes: Array.from(attributesMap.values()),
        });
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

module.exports = { parseCSV };
