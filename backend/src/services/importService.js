const prisma = require('../config/db');

/**
 * Imports products and dynamic specifications into the database within a transaction.
 * @param {Array} productsData - Array of parsed product objects.
 * @returns {Promise<number>} - Number of successfully imported products.
 */
async function importProductData(productsData) {
  let importedCount = 0;

  // Execute import inside a single Prisma transaction for database consistency
  await prisma.$transaction(async (tx) => {
    for (const item of productsData) {
      if (!item.category || !item.subcategory || !item.partNumber) {
        continue;
      }

      // 1. Ensure Category exists
      const category = await tx.category.upsert({
        where: { name: item.category },
        update: {},
        create: { name: item.category },
      });

      // 2. Ensure SubCategory exists
      const subcategory = await tx.subCategory.upsert({
        where: {
          name_categoryId: {
            name: item.subcategory,
            categoryId: category.id,
          },
        },
        update: {},
        create: {
          name: item.subcategory,
          categoryId: category.id,
        },
      });

      // 3. Upsert Product
      const product = await tx.product.upsert({
        where: { partNumber: item.partNumber },
        update: {
          datasheetUrl: item.datasheetUrl,
          subCategoryId: subcategory.id,
        },
        create: {
          partNumber: item.partNumber,
          datasheetUrl: item.datasheetUrl,
          subCategoryId: subcategory.id,
        },
      });

      // 4. Delete existing attributes for this product to prevent duplicates/stale specifications
      await tx.productAttribute.deleteMany({
        where: { productId: product.id },
      });

      // 5. Bulk create new attributes for this product
      if (item.attributes && item.attributes.length > 0) {
        await tx.productAttribute.createMany({
          data: item.attributes.map(attr => ({
            productId: product.id,
            attributeName: attr.name,
            attributeValue: attr.value,
            isDash: attr.isDash,
          })),
        });
      }

      importedCount++;
    }
  }, {
    timeout: 30000, // 30 seconds timeout limit for transaction
  });

  return importedCount;
}

module.exports = { importProductData };
