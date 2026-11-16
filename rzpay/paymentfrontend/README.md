# kapda.co - Razorpay Test Storefront

A modern e-commerce storefront designed to test and verify the Razorpay payment gateway integration with a live MongoDB backend.

## 🎨 Theme & Aesthetic
- **Colors**: Deep Pitch Black background (`#070707`), Crisp White typography (`#FFFFFF`), with Electric Neon-Yellow accents (`#FFE600`) for the landing page hero, call-to-actions, cart drawer, and pay buttons.
- **Brand**: **kapda.co** (Streetwear & Tech Essentials)

## 🚀 Features
- **Live Inventory**: Fetches products in real-time from your MongoDB database (`product_price.amount`, `name`, `description`, `product_quantity`).
- **Interactive Cart**:
  - Add to cart, adjust quantities (+/-), remove items.
  - Persistent cart state saved in `localStorage`.
  - Slide-over cart drawer with subtotal, tax breakdown, and clear cart button.
- **Checkout Flows**:
  - **1-Click Buy Now**: Direct single product checkout via `POST /api/payment/create/order/:productId`.
  - **Full Cart Checkout**: Aggregated order checkout via `POST /api/payment/create/order` with backend price calculation.
- **Razorpay Checkout SDK**:
  - Opens the official Razorpay checkout modal with custom yellow theme (`#FFE600`).
  - Pre-fills test user data.
- **Instant Signature Verification**:
  - On payment success, sends `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` to `POST /api/payment/verify`.
  - Backend verifies HMAC-SHA256 signature using the secret key and updates the payment status to `completed` in MongoDB.
  - Interactive success receipt modal displays order ID, payment ID, and verification status.

## 🛠️ Running the Application

### 1. Backend (Port 4000)
```bash
cd paymentbackend
npm run dev
```

### 2. Frontend (Port 5173)
```bash
cd paymentfrontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

