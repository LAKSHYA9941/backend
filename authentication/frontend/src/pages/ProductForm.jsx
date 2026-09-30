// --------------------------------------------------
// Product Form Page (Create / Edit)
// --------------------------------------------------
// This component handles both Creating a new product
// and Editing an existing one. It checks the URL params
// to see if there's an :id. If there is, it fetches
// the product data and populates the form (Edit mode).
// Otherwise, it starts with an empty form (Create mode).
// --------------------------------------------------

import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

function ProductForm() {
  const navigate = useNavigate();
  // If we are on /products/edit/:id, useParams gives us the id
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // ---- Form State ----
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    image: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode); // Loading only if editing

  // If in Edit Mode, fetch the existing product data
  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      const product = response.data.product;
      // Populate form with existing data
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        image: product.image || "",
      });
    } catch (error) {
      toast.error("Failed to load product details");
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * handleChange - Updates the state when an input changes.
   * Uses computed property names to handle all inputs with one function.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * handleSubmit - Sends data to the API to create or update.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      if (isEditMode) {
        // PUT request to update
        await api.put(`/products/${id}`, formData);
        toast.success("Product updated successfully");
      } else {
        // POST request to create
        await api.post("/products", formData);
        toast.success("Product created successfully");
      }
      
      // Navigate back to the products list
      navigate("/");
    } catch (error) {
      const data = error.response?.data;
      if (data?.errors) {
        // Handle express-validator field errors
        const fieldErrors = {};
        data.errors.forEach((err) => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        toast.error(data?.message || "An error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="container mt-4 mb-4">
      <div className="product-form-container card">
        <h2>{isEditMode ? "Edit Product" : "Add New Product"}</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-6)" }}>
          {isEditMode
            ? "Update the details of your product below."
            : "Fill out the form below to list a new product."}
        </p>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              className={`form-input ${errors.name ? "input-error" : ""}`}
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              className={`form-input form-textarea ${errors.description ? "input-error" : ""}`}
              value={formData.description}
              onChange={handleChange}
            />
            {errors.description && <p className="field-error">{errors.description}</p>}
          </div>

          <div className="form-row">
            {/* Price */}
            <div className="form-group">
              <label htmlFor="price">Price ($) *</label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                className={`form-input ${errors.price ? "input-error" : ""}`}
                value={formData.price}
                onChange={handleChange}
              />
              {errors.price && <p className="field-error">{errors.price}</p>}
            </div>

            {/* Stock */}
            <div className="form-group">
              <label htmlFor="stock">Stock Quantity *</label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                className={`form-input ${errors.stock ? "input-error" : ""}`}
                value={formData.stock}
                onChange={handleChange}
              />
              {errors.stock && <p className="field-error">{errors.stock}</p>}
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <input
              id="category"
              name="category"
              type="text"
              className={`form-input ${errors.category ? "input-error" : ""}`}
              value={formData.category}
              onChange={handleChange}
            />
            {errors.category && <p className="field-error">{errors.category}</p>}
          </div>

          {/* Image URL */}
          <div className="form-group">
            <label htmlFor="image">Image URL (Optional)</label>
            <input
              id="image"
              name="image"
              type="text"
              className="form-input"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-6)" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : isEditMode ? "Update Product" : "Create Product"}
            </button>
            <Link to="/" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;
