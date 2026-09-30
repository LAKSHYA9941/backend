// --------------------------------------------------
// Products Page (Listing)
// --------------------------------------------------
// Fetches and displays all products from the backend.
// Public users can see the listing. Logged-in users
// can see "Edit/Delete" buttons on products they own.
// --------------------------------------------------

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function Products() {
  const { user } = useAuth();
  
  // ---- State ----
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // GET /api/products is a public route
      const response = await api.get("/products");
      setProducts(response.data.products);
    } catch (error) {
      toast.error("Failed to load products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * handleDelete - Deletes a product if the user confirms.
   * Only the owner of the product can do this.
   */
  const handleDelete = async (productId) => {
    // Simple confirmation before destructive action
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      toast.success("Product deleted successfully");
      
      // Remove the deleted product from the local state
      // so we don't have to refetch the entire list
      setProducts(products.filter((p) => p._id !== productId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="mono">GLOBAL_DIRECTORY</h1>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <h3>[ NO_DATA_FOUND ]</h3>
          <p className="mono" style={{ color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>
            SYS: DATABASE CURRENTLY EMPTY
          </p>
          {user && (
            <Link to="/products/new" className="btn btn-primary">
              [ INITIALIZE FIRST ENTRY ]
            </Link>
          )}
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product._id} className="card product-card">
              {/* If there's an image, show it. Otherwise show a placeholder */}
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-card-image"
                />
              ) : (
                <div className="product-card-image">No Image</div>
              )}
              
              <div className="product-card-body">
                <div className="product-card-header">
                  <span className="product-card-category">{product.category}</span>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    ID: {product._id.slice(-6).toUpperCase()}
                  </div>
                </div>
                
                <h3 className="product-card-name">{product.name}</h3>
                <p className="product-card-description">{product.description}</p>
                
                <div className="product-card-footer">
                  <span className="product-card-price">${product.price.toFixed(2)}</span>
                  <span
                    className={`product-card-stock ${
                      product.stock > 0 ? "in-stock" : "out-of-stock"
                    }`}
                  >
                    {product.stock > 0 ? `[QTY:${product.stock}]` : "[ERR:OOS]"}
                  </span>
                </div>

                <div className="mono" style={{ marginTop: "12px", color: "var(--text-secondary)" }}>
                  SYS.OWNER // {product.owner?.name}
                </div>

                {/* 
                  Ownership check: If the logged-in user's ID matches
                  the product owner's ID, show Edit/Delete buttons 
                */}
                {user && user._id === product.owner?._id && (
                  <div className="product-card-actions">
                    <Link
                      to={`/products/edit/${product._id}`}
                      className="btn btn-secondary btn-block"
                    >
                      [ EDIT ]
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="btn btn-danger btn-block"
                    >
                      [ DEL ]
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;
