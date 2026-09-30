// --------------------------------------------------
// Product Controller
// --------------------------------------------------
// Contains all handler functions for product CRUD:
// create, getAll, getById, update, and delete.
//
// Write operations (create, update, delete) are
// protected by the authenticate middleware, so
// req.user is always available in those handlers.
// --------------------------------------------------

const Product = require("../models/Product");

// --------------------------------------------------
// POST /api/products
// --------------------------------------------------
// Creates a new product. The 'owner' field is
// automatically set to the logged-in user's ID.
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, image } = req.body;

    // Create the product with the owner set to the current user.
    // req.user.userId comes from the JWT payload via authenticate middleware.
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      image: image || "",
      owner: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error creating product.",
    });
  }
};

// --------------------------------------------------
// GET /api/products
// --------------------------------------------------
// Returns all products. This is a PUBLIC route.
// Supports optional pagination via query params:
//   ?page=1&limit=10
const getAllProducts = async (req, res) => {
  try {
    // Parse pagination params from query string.
    // Default to page 1, 10 items per page.
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate how many documents to skip.
    // Page 1 skips 0, page 2 skips 10, page 3 skips 20, etc.
    const skip = (page - 1) * limit;

    // Run two queries in parallel:
    // 1. Fetch the products for the current page
    // 2. Count total products for pagination metadata
    const [products, total] = await Promise.all([
      Product.find()
        .populate("owner", "name email")  // Include owner's name and email
        .sort({ createdAt: -1 })          // Newest first
        .skip(skip)
        .limit(limit),
      Product.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        limit,
      },
    });
  } catch (error) {
    console.error("Get products error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching products.",
    });
  }
};

// --------------------------------------------------
// GET /api/products/:id
// --------------------------------------------------
// Returns a single product by its MongoDB ObjectId.
// This is a PUBLIC route.
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "owner",
      "name email"
    );

    // If no product found with this ID, return 404
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching product.",
    });
  }
};

// --------------------------------------------------
// PUT /api/products/:id
// --------------------------------------------------
// Updates a product. Only the owner can update it.
// Uses findByIdAndUpdate with { new: true } to return
// the updated document instead of the old one.
const updateProduct = async (req, res) => {
  try {
    // First, find the product to check ownership
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Check if the logged-in user is the owner of this product.
    // We compare string representations because ObjectId comparison
    // with === won't work (they're different object references).
    if (product.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own products.",
      });
    }

    // Update the product with the provided fields.
    // { new: true } returns the modified document.
    // { runValidators: true } ensures Mongoose schema validations
    //   still apply on update (e.g., min price, required fields).
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error updating product.",
    });
  }
};

// --------------------------------------------------
// DELETE /api/products/:id
// --------------------------------------------------
// Deletes a product. Only the owner can delete it.
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Ownership check -- same as update
    if (product.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own products.",
      });
    }

    // Remove the product from the database
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete product error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error deleting product.",
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
