import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  ShoppingCart,
  Zap,
  CheckCircle2,
  X,
  Plus,
  Minus,
  Trash2,
  ShieldCheck,
  Search,
  ArrowRight,
  Lock,
  RefreshCw,
  AlertCircle,
  Package,
} from "lucide-react";
import { getProductImage, getProductCategory } from "./data/productImages";

const API_BASE = "http://localhost:4000";

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);

  // Cart state persisted in localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("kapda_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Save cart changes
  useEffect(() => {
    localStorage.setItem("kapda_cart", JSON.stringify(cart));
  }, [cart]);

  // Show temporary toast message
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Fetch products from MongoDB backend
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      // First try standard route, fallback to /api/payment/products
      let res;
      try {
        res = await fetch(`${API_BASE}/api/products`);
      } catch {
        res = await fetch(`/api/products`);
      }

      if (!res.ok) {
        res = await fetch(`${API_BASE}/api/payment/products`);
      }

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
        setBackendOnline(true);
      } else {
        throw new Error("Invalid product payload from backend");
      }
    } catch (err) {
      console.error("Backend fetch error:", err);
      setError(err.message || "Failed to connect to backend");
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Cart operations
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added ${product.name} to cart`);
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product._id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product._id !== productId));
    showToast("Item removed from cart");
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const totalCartAmount = cart.reduce((sum, item) => {
    const price =
      item.product.product_price?.amount ?? item.product.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  // Common Razorpay checkout runner
  const triggerRazorpayCheckout = ({ orderData, description, onSuccessClearCart = false }) => {
    if (typeof window.Razorpay === "undefined") {
      alert("Razorpay SDK not loaded. Please verify your internet connection.");
      setProcessingOrderId(null);
      return;
    }

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      name: "kapda.co",
      description: description || "Streetwear & Tech Essentials",
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=200&q=80",
      order_id: orderData.orderId,
      handler: async function (response) {
        console.log("Razorpay payment response received:", response);
        showToast("Verifying payment with backend...");

        try {
          const verifyRes = await fetch(`${API_BASE}/api/payment/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyRes.ok && verifyData.success) {
            setPaymentSuccessData({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              amount: orderData.amount / 100,
              currency: orderData.currency || "INR",
              timestamp: new Date().toLocaleTimeString(),
              status: "COMPLETED",
            });

            if (onSuccessClearCart) {
              clearCart();
              setIsCartOpen(false);
            }
          } else {
            alert(`Payment verification failed: ${verifyData.message || "Invalid signature"}`);
          }
        } catch (vErr) {
          console.error("Verification error:", vErr);
          alert("Network error while verifying payment with backend.");
        } finally {
          setProcessingOrderId(null);
        }
      },
      prefill: {
        name: "Test Customer",
        email: "customer@kapda.co",
        contact: "9999999999",
      },
      notes: {
        brand: "kapda.co",
        portal: "Test Storefront",
      },
      theme: {
        color: "#FFE600",
        backdrop_color: "rgba(0, 0, 0, 0.85)",
      },
      modal: {
        ondismiss: function () {
          setProcessingOrderId(null);
          showToast("Payment window closed");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (resp) {
      console.error("Payment failed:", resp.error);
      alert(`Payment Failed: ${resp.error.description || resp.error.reason}`);
      setProcessingOrderId(null);
    });
    rzp.open();
  };

  // 1-Click Buy Now for a single product
  const handleBuyNow = async (product) => {
    setProcessingOrderId(product._id);
    try {
      showToast(`Creating Razorpay order for ${product.name}...`);
      const res = await fetch(`${API_BASE}/api/payment/create/order/${product._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.message || "Failed to create order on server");
      }

      triggerRazorpayCheckout({
        orderData,
        description: `Buying ${product.name}`,
        onSuccessClearCart: false,
      });
    } catch (err) {
      console.error("Buy now error:", err);
      alert(`Order error: ${err.message}`);
      setProcessingOrderId(null);
    }
  };

  // Full Cart Checkout
  const handleCartCheckout = async () => {
    if (cart.length === 0) return;
    setProcessingOrderId("cart_checkout");
    try {
      showToast("Initializing cart checkout order...");
      const itemsPayload = cart.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
      }));

      const res = await fetch(`${API_BASE}/api/payment/create/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsPayload }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.message || "Failed to create cart order");
      }

      triggerRazorpayCheckout({
        orderData,
        description: `kapda.co cart (${cart.length} unique items)`,
        onSuccessClearCart: true,
      });
    } catch (err) {
      console.error("Cart checkout error:", err);
      alert(`Cart checkout error: ${err.message}`);
      setProcessingOrderId(null);
    }
  };

  // Filter categories
  const categories = ["ALL", "PERIPHERALS", "WEARABLES", "WORKSPACE", "HARDWARE"];

  const filteredProducts = products.filter((p) => {
    const matchesCat =
      activeCategory === "ALL" || getProductCategory(p) === activeCategory;
    const matchesSearch =
      (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="kapda-app">
      {/* Top Announcement Bar */}
      <div className="top-banner">
        <div className="banner-ticker">
          <span className="banner-badge">TESTNET</span>
          <span>KAPDA.CO // OFFICIAL STOREFRONT // SECURE RAZORPAY INTEGRATION</span>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span>FREE EXPRESS SHIPPING ACROSS INDIA</span>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="navbar">
        <div className="nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div className="brand-logo-mark">K</div>
          <div className="brand-text-wrap">
            <h1 className="brand-name">
              kapda<span>.co</span>
            </h1>
            <span className="brand-sub">STREETWEAR &amp; TECH GEAR</span>
          </div>
        </div>

        <div className="nav-actions">
          {/* Backend Health Badge */}
          <div className="backend-pill" title={backendOnline ? "MongoDB connected" : "Check backend server"}>
            <span className={`status-dot ${backendOnline ? "" : "error"}`}></span>
            <span>{backendOnline ? "MongoDB Synced (4000)" : "Backend Disconnected"}</span>
          </div>

          {/* Cart Trigger */}
          <button
            className="cart-toggle-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label="View Cart"
          >
            <ShoppingCart size={18} color="#FFE600" />
            <span>CART</span>
            {totalCartCount > 0 && (
              <span className="cart-badge">{totalCartCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glow-bg"></div>
        <div className="hero-tag">
          <Zap size={14} /> NEW DROP 2026 // EDITION 01
        </div>
        <h2 className="hero-title">
          MINIMALIST GEAR.
          <br />
          <span className="highlight-yellow">MAXIMALIST IDENTITY.</span>
        </h2>
        <p className="hero-desc">
          High-performance tech peripherals and cyber-street essentials sourced directly from our live MongoDB database. Integrated seamlessly with Razorpay test gateway for 1-click verified checkout.
        </p>

        <div className="hero-features">
          <div className="feature-pill">
            <ShieldCheck size={18} className="feature-icon" />
            <span>Razorpay HMAC Verification</span>
          </div>
          <div className="feature-pill">
            <Package size={18} className="feature-icon" />
            <span>Live MongoDB Collections</span>
          </div>
          <div className="feature-pill">
            <Zap size={18} className="feature-icon" />
            <span>Paise-Accurate Calculations</span>
          </div>
        </div>
      </section>

      {/* Controls Bar: Categories & Search */}
      <div className="controls-bar">
        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`tab-btn ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search MongoDB products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Products Grid */}
      <main className="products-container">
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <RefreshCw size={36} color="#FFE600" style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: "16px", color: "#888" }}>Fetching live inventory from MongoDB...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#181111", borderRadius: "12px", border: "1px solid #ff4444" }}>
            <AlertCircle size={40} color="#ff4444" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ color: "#FFF", marginBottom: "8px" }}>Could not connect to Backend</h3>
            <p style={{ color: "#aaa", maxWidth: "500px", margin: "0 auto 16px" }}>
              Make sure your payment backend is running on <code>http://localhost:4000</code>.
            </p>
            <button className="btn-primary-yellow" onClick={fetchProducts} style={{ margin: "0 auto" }}>
              <RefreshCw size={14} /> Retry Connection
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#888" }}>
            <p>No products match your search criteria.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => {
              const price = product.product_price?.amount ?? product.price ?? 0;
              const currency = product.product_price?.currency || "INR";
              const imgUrl = getProductImage(product);
              const category = getProductCategory(product);
              const isProcessing = processingOrderId === product._id;

              return (
                <div key={product._id} className="product-card">
                  <div className="card-img-wrap">
                    <img src={imgUrl} alt={product.name} loading="lazy" />
                    <span className="card-badge-top">{category}</span>
                    <span className="card-stock-badge">
                      {product.product_quantity} in stock
                    </span>
                  </div>

                  <div className="card-body">
                    <span className="card-category">{product.product_id}</span>
                    <h3 className="card-title">{product.name}</h3>
                    <p className="card-desc">{product.description || "Premium streetwear aesthetic accessory."}</p>

                    <div className="card-price-row">
                      <div className="card-price">
                        <span>₹</span>{price.toLocaleString("en-IN")}
                      </div>
                      <span className="card-code">INR / {currency}</span>
                    </div>

                    <div className="card-actions">
                      <button
                        className="btn-secondary"
                        onClick={() => addToCart(product)}
                        title="Add to shopping cart"
                      >
                        <ShoppingCart size={15} /> Add
                      </button>

                      <button
                        className="btn-primary-yellow"
                        onClick={() => handleBuyNow(product)}
                        disabled={isProcessing}
                        title="Instant Razorpay Checkout"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} />
                            Pay...
                          </>
                        ) : (
                          <>
                            <Zap size={14} /> Pay ₹{price}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <div
        className={`cart-backdrop ${isCartOpen ? "open" : ""}`}
        onClick={() => setIsCartOpen(false)}
      ></div>

      <aside className={`cart-drawer ${isCartOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h2>
            <ShoppingBag size={22} color="#FFE600" />
            CART <span>({totalCartCount})</span>
          </h2>
          <button
            className="close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        <div className="cart-items-wrap">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="empty-icon-wrap">
                <ShoppingBag size={36} />
              </div>
              <h3 style={{ color: "#FFF", marginBottom: "6px" }}>Your bag is empty</h3>
              <p style={{ color: "#777", fontSize: "0.85rem", marginBottom: "20px" }}>
                Add pieces from our latest drop to test the cart payment.
              </p>
              <button
                className="btn-primary-yellow"
                onClick={() => setIsCartOpen(false)}
              >
                Explore Collection
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const price =
                item.product.product_price?.amount ?? item.product.price ?? 0;
              const imgUrl = getProductImage(item.product);

              return (
                <div key={item.product._id} className="cart-item">
                  <img
                    src={imgUrl}
                    alt={item.product.name}
                    className="cart-item-img"
                  />
                  <div className="cart-item-details">
                    <div>
                      <h4 className="cart-item-title">{item.product.name}</h4>
                      <div className="cart-item-price">
                        ₹{(price * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>

                    <div className="cart-item-controls">
                      <div className="qty-counter">
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.product._id, -1)}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.product._id, 1)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        className="item-delete-btn"
                        onClick={() => removeFromCart(item.product._id)}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="bill-row">
              <span>Items Total ({totalCartCount} pcs)</span>
              <span>₹{totalCartAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="bill-row">
              <span>Shipping (Standard Express)</span>
              <span style={{ color: "#22C55E", fontWeight: 700 }}>FREE</span>
            </div>
            <div className="bill-row">
              <span>Razorpay Platform Fee</span>
              <span style={{ color: "#FFE600" }}>₹0 (Testnet)</span>
            </div>

            <div className="bill-row total">
              <span>Total to Pay</span>
              <span className="total-amount">
                ₹{totalCartAmount.toLocaleString("en-IN")}
              </span>
            </div>

            <button
              className="checkout-btn"
              onClick={handleCartCheckout}
              disabled={processingOrderId === "cart_checkout"}
            >
              {processingOrderId === "cart_checkout" ? (
                <>
                  <RefreshCw size={18} style={{ animation: "spin 1s linear infinite" }} />
                  Launching Razorpay...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  PAY NOW ₹{totalCartAmount.toLocaleString("en-IN")}
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="secure-tag">
              <ShieldCheck size={14} color="#FFE600" />
              <span>TEST MODE ACTIVE // NO REAL CHARGES INCURRED</span>
            </div>
          </div>
        )}
      </aside>

      {/* Payment Success Verification Modal */}
      {paymentSuccessData && (
        <div className="modal-overlay">
          <div className="receipt-modal">
            <div className="success-badge-icon">
              <CheckCircle2 size={44} />
            </div>

            <h3 style={{ fontSize: "1.6rem", color: "#FFF", marginBottom: "6px" }}>
              Payment Verified!
            </h3>
            <p style={{ color: "#AAA", fontSize: "0.9rem" }}>
              Razorpay signature verified via backend HMAC-SHA256 and stored in MongoDB.
            </p>

            <div className="receipt-details">
              <div className="receipt-line">
                <span className="label">Amount Paid:</span>
                <span className="val" style={{ color: "#FFE600", fontSize: "1.1rem" }}>
                  ₹{paymentSuccessData.amount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="receipt-line">
                <span className="label">Payment ID:</span>
                <span className="val">{paymentSuccessData.paymentId}</span>
              </div>
              <div className="receipt-line">
                <span className="label">Order ID:</span>
                <span className="val">{paymentSuccessData.orderId}</span>
              </div>
              <div className="receipt-line">
                <span className="label">Status:</span>
                <span className="val" style={{ color: "#22C55E" }}>
                  {paymentSuccessData.status}
                </span>
              </div>
              <div className="receipt-line">
                <span className="label">Gateway:</span>
                <span className="val">Razorpay Standard Checkout</span>
              </div>
            </div>

            <button
              className="btn-primary-yellow"
              style={{ width: "100%", padding: "14px" }}
              onClick={() => setPaymentSuccessData(null)}
            >
              Done &amp; Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="toast-msg">
          <Zap size={16} color="#FFE600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <h2 className="brand-name" style={{ fontSize: "1.8rem" }}>
                kapda<span>.co</span>
              </h2>
              <p style={{ color: "#777", fontSize: "0.85rem", marginTop: "4px" }}>
                Experimental e-commerce &amp; payment gateway testing environment.
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span className="banner-badge">TEST GATEWAY</span>
              <span style={{ fontSize: "0.8rem", color: "#888" }}>
                Key ID: rzp_test_TzY4dWP8slBLn6
              </span>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; 2026 kapda.co. All rights reserved.</span>
            <span>Designed with White typography, Deep Black background &amp; Electric Yellow accents.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

