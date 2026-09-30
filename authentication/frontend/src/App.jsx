// --------------------------------------------------
// Main App Component
// --------------------------------------------------
// Configures React Router and wraps the application
// in the AuthProvider context.
// --------------------------------------------------

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";

function App() {
  return (
    // AuthProvider must wrap the entire router so all pages
    // and components can access auth state.
    <AuthProvider>
      <Router>
        {/* Navbar is outside Routes so it renders on every page */}
        <Navbar />

        {/* Global Toast notifications container */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)",
            },
            success: {
              iconTheme: {
                primary: "var(--color-success)",
                secondary: "white",
              },
            },
            error: {
              iconTheme: {
                primary: "var(--color-danger)",
                secondary: "white",
              },
            },
          }}
        />

        {/* Main Content Area */}
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Products />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes - require login */}
            <Route
              path="/products/new"
              element={
                <ProtectedRoute>
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/edit/:id"
              element={
                <ProtectedRoute>
                  <ProductForm />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
