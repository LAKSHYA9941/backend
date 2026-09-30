# Authentication & Product CRUD APIs

This is a full-stack e-commerce API and frontend application built to demonstrate a complete JWT authentication flow and protected CRUD operations.

## Features

- **Backend (Node.js/Express/MongoDB)**
  - JWT Authentication (Short-lived Access Tokens in JSON body, Long-lived Refresh Tokens in httpOnly cookies)
  - Complete Product CRUD operations (Create, Read, Update, Delete)
  - Write routes protected by authentication
  - express-validator used on all endpoints for robust request validation and formatted 400 responses
  - Passwords hashed with bcrypt (min 10 salt rounds)
  - Refresh token stored in the database for revocation (logout functionality)

- **Frontend (React/Vite)**
  - Full authentication flow with Login, Register, and Logout pages
  - Protected routes guarding creating and editing products
  - Automatic silent refresh of access tokens using Axios interceptors
  - Field-level validation error messages mapped directly to form inputs
  - Clean, dark-themed UI built with custom CSS variables

## Setup & Installation

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Ensure MongoDB is running on your machine (default connects to `mongodb://127.0.0.1:27017/auth_ecommerce`).
5. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:5000`.

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Create a new user account |
| POST | `/login` | Public | Authenticate user, returns access token & sets refresh token cookie |
| POST | `/refresh-token` | Public* | Issue a new access token using the refresh token cookie |
| POST | `/logout` | Authenticated | Revoke refresh token and clear cookie |
| GET | `/me` | Authenticated | Get current logged-in user profile |

### Products (`/api/products`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List all products (with optional `?page=` and `?limit=`) |
| GET | `/:id` | Public | Get a single product by ID |
| POST | `/` | Authenticated | Create a new product (sets owner to current user) |
| PUT | `/:id` | Authenticated | Update a product (only owner allowed) |
| DELETE | `/:id` | Authenticated | Delete a product (only owner allowed) |
