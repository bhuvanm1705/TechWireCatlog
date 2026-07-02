const prisma = require('../config/db');

/**
 * Get all categories with subcategories and product counts.
 */
async function getCategories(req, res) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          include: {
            _count: {
              select: { products: true },
            },
          },
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { subcategories: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ error: 'Failed to fetch categories: ' + error.message });
  }
}

/**
 * Get subcategories for a specific category ID.
 */
async function getSubcategories(req, res) {
  const { id } = req.params;

  try {
    const subcategories = await prisma.subCategory.findMany({
      where: { categoryId: id },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json(subcategories);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return res.status(500).json({ error: 'Failed to fetch subcategories: ' + error.message });
  }
}

/**
 * Get products with filtering, search, and pagination.
 */
async function getProducts(req, res) {
  const { category, subcategory, partNumber, page, limit } = req.query;

  try {
    // Set up pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    // Build Prisma query filters
    const where = {};

    if (subcategory) {
      where.subcategory = {
        name: {
          equals: subcategory,
          mode: 'insensitive',
        },
      };
    }

    if (category) {
      where.subcategory = {
        ...(where.subcategory || {}),
        category: {
          name: {
            equals: category,
            mode: 'insensitive',
          },
        },
      };
    }

    if (partNumber) {
      where.partNumber = {
        contains: partNumber,
        mode: 'insensitive',
      };
    }

    // Run parallel queries to get count and paginated items
    const [totalProducts, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          subcategory: {
            include: {
              category: true,
            },
          },
          attributes: {
            orderBy: { attributeName: 'asc' },
          },
        },
        orderBy: { partNumber: 'asc' },
      }),
    ]);

    // Format products to match the expected format
    const formattedProducts = products.map((prod) => ({
      id: prod.id,
      partNumber: prod.partNumber,
      datasheetUrl: prod.datasheetUrl,
      category: prod.subcategory.category.name,
      subcategory: prod.subcategory.name,
      attributes: prod.attributes.map((attr) => ({
        name: attr.attributeName,
        value: attr.attributeValue,
        isDash: attr.isDash,
      })),
    }));

    return res.status(200).json({
      products: formattedProducts,
      pagination: {
        total: totalProducts,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalProducts / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: 'Failed to fetch products: ' + error.message });
  }
}

/**
 * Get details for a single product by Part Number.
 */
async function getProductDetail(req, res) {
  const { partNumber } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { partNumber },
      include: {
        subcategory: {
          include: {
            category: true,
          },
        },
        attributes: {
          orderBy: { attributeName: 'asc' },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: `Product with part number '${partNumber}' not found.` });
    }

    const formattedProduct = {
      id: product.id,
      partNumber: product.partNumber,
      datasheetUrl: product.datasheetUrl,
      category: product.subcategory.category.name,
      subcategory: product.subcategory.name,
      attributes: product.attributes.map((attr) => ({
        name: attr.attributeName,
        value: attr.attributeValue,
        isDash: attr.isDash,
      })),
    };

    return res.status(200).json(formattedProduct);
  } catch (error) {
    console.error('Error fetching product details:', error);
    return res.status(500).json({ error: 'Failed to fetch product details: ' + error.message });
  }
}

module.exports = {
  getCategories,
  getSubcategories,
  getProducts,
  getProductDetail,
};
