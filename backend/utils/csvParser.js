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
 * Parses a CSV file and maps the rows according to custom association rules.
 * @param {string} filePath - Absolute path to the CSV file.
 * @returns {Promise<Array>} - Resolves to an array of parsed product objects.
 */
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(
        csv({
          mapHeaders: ({ header }) => cleanHeader(header),
        })
      )
      .on('data', (row) => {
        // Skip empty rows
        if (!row['Part No.'] || row['Part No.'].trim() === '') {
          return;
        }

        // Clean cells and map columns based on special rules:
        // - Trim whitespace.
        // - Empty string or whitespace becomes null (EMPTY - not associated).
        // - "-" stays "-" (DASH - associated, no value).
        // - Other strings stay as values (FILLED - associated, has value).
        const product = {
          category: row['Category'] ? row['Category'].trim() : '',
          subcategory: row['Sub-category'] ? row['Sub-category'].trim() : '',
          partNo: row['Part No.'].trim(),
          datasheetLink: row['Datasheet Link (PDF)'] ? row['Datasheet Link (PDF)'].trim() : null,
          vdss: parseCell(row['VDSS V']),
          vgs: parseCell(row['VGS V']),
          vthMin: parseCell(row['VTH Min V']),
          vthMax: parseCell(row['VTH Max V']),
          idTa25: parseCell(row['ID(A) / TA=25']),
          vthMaxVal: parseCell(row['VTH(V) Max.']),
          ron45: parseCell(row['Ron 4.5v (mΩ)Max.']),
          ron10: parseCell(row['Ron 10v (mΩ)Max.']),
        };

        results.push(product);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

/**
 * Helper to interpret a single CSV cell based on rules.
 */
function parseCell(val) {
  if (val === undefined || val === null) {
    return null;
  }
  const trimmed = val.trim();
  if (trimmed === '') {
    return null; // Empty Cell => Not associated
  }
  return trimmed; // Can be "-" (associated, empty value) or "4" (associated, filled value)
}

module.exports = { parseCSV };
