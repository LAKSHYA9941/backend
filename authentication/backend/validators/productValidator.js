// --------------------------------------------------
// Product Validators
// --------------------------------------------------
// Defines express-validator chains for product routes:
// create, update, and ID param validation.
// These run BEFORE the validate middleware.
// --------------------------------------------------

const { body, param } = require("express-validator");
const mongoose = require("mongoose");

/**
 * productIdValidator - Validates the :id route parameter.
 *
 * Ensures the ID is a valid MongoDB ObjectId before we
 * even attempt to query the database. This prevents
 * unnecessary DB calls and cryptic Mongoose cast errors.
 */
const productIdValidator = [
  param("id")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid product ID format"),
];

/**
 * createProductValidator - Validates fields when creating a product.
 *
 * All fields are required for creation:
 * - name: non-empty string
 * - description: non-empty string
 * - price: must be a number >= 0
 * - stock: must be an integer >= 0
 * - category: non-empty string
 */
const createProductValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Product description is required"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a non-negative number"),

  body("stock")
    .notEmpty()
    .withMessage("Stock is required")
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required"),
];

/**
 * updateProductValidator - Validates fields when updating a product.
 *
 * Uses .optional() so you can send partial updates (PATCH-style)
 * while still validating the fields that ARE provided.
 * The :id param is also validated.
 */
const updateProductValidator = [
  // Validate the ID param first
  ...productIdValidator,

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product name cannot be empty"),

  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product description cannot be empty"),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a non-negative number"),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),

  body("category")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category cannot be empty"),
];

module.exports = {
  productIdValidator,
  createProductValidator,
  updateProductValidator,
};
