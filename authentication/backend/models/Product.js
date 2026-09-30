// --------------------------------------------------
// Product Model
// --------------------------------------------------
// Defines the schema for products in the e-commerce store.
// Each product tracks who created it (via the 'owner' field)
// so we can enforce ownership rules on update/delete.
// --------------------------------------------------

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // Product title / name
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    // Detailed product description
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },

    // Price in the smallest currency unit or as a decimal.
    // Must be zero or positive.
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    // Number of items in stock.
    // Must be zero or positive, and a whole number.
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

    // Product category for filtering / organization
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },

    // Optional image URL for the product
    image: {
      type: String,
      default: "",
    },

    // Reference to the User who created this product.
    // Used to enforce "only the owner can update/delete".
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    // Adds createdAt and updatedAt fields automatically
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
