var express = require('express');
var router = express.Router();
var categoriesData = require('../utils/categories.data');
var productsData = require('../utils/data');
var { generateId } = require('../utils/IncrementalIdHandler');

// GET all categories with optional filter by name
// Query: ?name=search_text
router.get('/', function(req, res, next) {
  try {
    let categories = categoriesData.data;
    
    // Filter by name if query parameter exists
    if (req.query.name) {
      const searchName = req.query.name.toLowerCase();
      categories = categories.filter(category => 
        category.name.toLowerCase().includes(searchName)
      );
    }
    
    res.status(200).json({
      success: true,
      message: "Get all categories successfully",
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET category by ID
router.get('/:id', function(req, res, next) {
  try {
    const { id } = req.params;
    const category = categoriesData.data.find(c => c.id == id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Get category by ID successfully",
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET category by slug
router.get('/slug/:slug', function(req, res, next) {
  try {
    const { slug } = req.params;
    const category = categoriesData.data.find(c => c.slug === slug);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Get category by slug successfully",
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET all products by category ID
router.get('/:id/products', function(req, res, next) {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const category = categoriesData.data.find(c => c.id == id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }
    
    // Get all products with matching category ID
    const products = productsData.data.filter(p => p.category.id == id);
    
    res.status(200).json({
      success: true,
      message: "Get products by category ID successfully",
      data: products,
      total: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// CREATE new category
router.post('/', function(req, res, next) {
  try {
    const { name, slug, image } = req.body;
    
    // Validate required fields
    if (!name || !slug || !image) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, slug, and image"
      });
    }
    
    // Check if slug already exists
    const existingCategory = categoriesData.data.find(c => c.slug === slug);
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Slug already exists"
      });
    }
    
    // Generate new ID
    const newId = Math.max(...categoriesData.data.map(c => c.id)) + 1;
    const now = new Date().toISOString();
    
    const newCategory = {
      id: newId,
      name: name,
      slug: slug,
      image: image,
      creationAt: now,
      updatedAt: now
    };
    
    categoriesData.data.push(newCategory);
    
    res.status(201).json({
      success: true,
      message: "Create category successfully",
      data: newCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// UPDATE category by ID
router.put('/:id', function(req, res, next) {
  try {
    const { id } = req.params;
    const { name, slug, image } = req.body;
    
    const categoryIndex = categoriesData.data.findIndex(c => c.id == id);
    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }
    
    const category = categoriesData.data[categoryIndex];
    
    // Check if new slug already exists in other categories
    if (slug && slug !== category.slug) {
      const existingCategory = categoriesData.data.find(c => c.slug === slug && c.id != id);
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Slug already exists"
        });
      }
    }
    
    // Update fields
    if (name) category.name = name;
    if (slug) category.slug = slug;
    if (image) category.image = image;
    category.updatedAt = new Date().toISOString();
    
    res.status(200).json({
      success: true,
      message: "Update category successfully",
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE category by ID
router.delete('/:id', function(req, res, next) {
  try {
    const { id } = req.params;
    
    const categoryIndex = categoriesData.data.findIndex(c => c.id == id);
    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }
    
    const deletedCategory = categoriesData.data.splice(categoryIndex, 1);
    
    res.status(200).json({
      success: true,
      message: "Delete category successfully",
      data: deletedCategory[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
