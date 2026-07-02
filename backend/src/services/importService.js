const prisma = require('../config/db');
const { randomUUID } = require('crypto');

/**
 * Imports products and dynamic specifications into the database within a transaction.
 * @param {Array} productsData - Array of parsed product objects.
 * @returns {Promise<number>} - Number of successfully imported products.
 */
async function importProductData(productsData) {
  let importedCount = 0;

  // --- PHASE 1: Collect and Upsert Unique Categories and Subcategories ---
  // Collect unique category names
  const uniqueCategoryNames = [...new Set(productsData.map(item => item.category).filter(Boolean))];
  
  // Upsert categories and store in memory cache (Name -> ID)
  const categoryCache = new Map();
  for (const catName of uniqueCategoryNames) {
    const category = await prisma.category.upsert({
      where: { name: catName },
      update: {},
      create: { name: catName },
    });
    categoryCache.set(catName, category.id);
  }

  // Collect unique subcategory-category pairs
  const subcategoryPairs = [];
  const seenSubcats = new Set();
  for (const item of productsData) {
    if (!item.subcategory || !item.category) continue;
    const catId = categoryCache.get(item.category);
    const key = `${item.subcategory}_${catId}`;
    if (!seenSubcats.has(key)) {
      seenSubcats.add(key);
      subcategoryPairs.push({ name: item.subcategory, categoryId: catId });
    }
  }

  // Upsert subcategories and store in memory cache (Name_CategoryId -> ID)
  const subcategoryCache = new Map();
  for (const sub of subcategoryPairs) {
    const subcat = await prisma.subCategory.upsert({
      where: {
        name_categoryId: {
          name: sub.name,
          categoryId: sub.categoryId,
        },
      },
      update: {},
      create: {
        name: sub.name,
        categoryId: sub.categoryId,
      },
    });
    subcategoryCache.set(`${sub.name}_${sub.categoryId}`, subcat.id);
  }

  // --- PHASE 2: Import Products in Concurrent Batches ---
  const validItems = productsData.filter(item => item.category && item.subcategory && item.partNumber);
  const concurrencyLimit = 8; // Process 8 products in parallel at a time
  
  for (let i = 0; i < validItems.length; i += concurrencyLimit) {
    const batch = validItems.slice(i, i + concurrencyLimit);
    
    await Promise.all(batch.map(async (item) => {
      const catId = categoryCache.get(item.category);
      const subcatId = subcategoryCache.get(`${item.subcategory}_${catId}`);

      if (!subcatId) return;

      // Import the individual product and its attributes in a single transaction
      await prisma.$transaction(async (tx) => {
        // 1. Upsert Product
        const product = await tx.product.upsert({
          where: { partNumber: item.partNumber },
          update: {
            datasheetUrl: item.datasheetUrl,
            subCategoryId: subcatId,
          },
          create: {
            partNumber: item.partNumber,
            datasheetUrl: item.datasheetUrl,
            subCategoryId: subcatId,
          },
        });

        // 2. Delete existing attributes
        await tx.productAttribute.deleteMany({
          where: { productId: product.id },
        });

        // 3. Create new attributes
        if (item.attributes && item.attributes.length > 0) {
          await tx.productAttribute.createMany({
            data: item.attributes.map(attr => ({
              id: randomUUID(),
              productId: product.id,
              attributeName: attr.name,
              attributeValue: attr.value,
              isDash: attr.isDash,
            })),
          });
        }
      });
      
      importedCount++;
    }));
  }

  return importedCount;
}

module.exports = { importProductData };
