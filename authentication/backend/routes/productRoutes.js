// --------------------------------------------------
// Product Routes
// --------------------------------------------------
// Defines all product CRUD routes and wires them to
// validators, middleware, and controllers.
//
// Public routes: GET (list all, get by ID)
// Protected routes: POST, PUT, DELETE (require auth)
// --------------------------------------------------

const express = require("express");
const router = express.Router();

// Import controller functions
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// Import validation rules
const {
  productIdValidator,
  createProductValidator,
  updateProductValidator,
} = require("../validators/productValidator");

// Import middleware
const validate = require("../middleware/validate");
const authenticate = require("../middleware/authenticate");

// --------------------------------------------------
// PUBLIC ROUTES
// --------------------------------------------------

// GET /api/products
// List all products with optional pagination (?page=1&limit=10)
// No authentication required -- anyone can browse products.
router.get("/", getAllProducts);

// GET /api/products/:id
// Get a single product by its ID.
// The productIdValidator ensures :id is a valid ObjectId
// before we hit the database.
router.get("/:id", productIdValidator, validate, getProductById);

// --------------------------------------------------
// PROTECTED ROUTES (require valid access token)
// --------------------------------------------------

// POST /api/products
// Create a new product.
// Flow: authenticate -> createProductValidator -> validate -> controller
router.post("/", authenticate, createProductValidator, validate, createProduct);

// PUT /api/products/:id
// Update an existing product (owner only).
// Flow: authenticate -> updateProductValidator -> validate -> controller
// Note: updateProductValidator already includes productIdValidator
router.put("/:id", authenticate, updateProductValidator, validate, updateProduct);

// DELETE /api/products/:id
// Delete a product (owner only).
// Flow: authenticate -> productIdValidator -> validate -> controller
router.delete("/:id", authenticate, productIdValidator, validate, deleteProduct);

module.exports = router;
