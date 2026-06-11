# 🏪 Inventory Management System (IMS)

A full-stack inventory and order management platform built for **offline retail shops**, with optional extensions for online stores and rider/delivery management.

---

## 📌 Overview

IMS helps shop owners track products, manage stock levels, process orders, assign riders, and generate reports — all from a role-aware dashboard. The rider and dispatch features activate only when the owner registers as an **online store**.

---

## ✨ Features

### 👤 Shop Owner
- Register as **Offline Shop** or **Online Store**
- Add, edit, and delete products with stock quantities and low-stock thresholds
- Create orders by selecting products; stock auto-deducts on completion
- Manual restocking at any time
- Generate and download daily reports as **CSV** or **PDF**
- Analytics dashboard with order counts, success rate, and daily trend graphs

### 🛵 Rider *(Online stores only)*
- Rider credentials are created and shared by the shop owner
- Dedicated rider dashboard showing assigned orders
- Update order status: **Dispatched → Delivered / Cancelled**
- Cancelling an order automatically restores inventory stock

### 📦 Inventory Logic

| Event | Inventory Action | Applies To |
|---|---|---|
| Order completed (offline) | Stock deducted | Offline & Online |
| Order dispatched (online) | Stock deducted | Online only |
| Rider marks Delivered | No change | Online only |
| Rider marks Cancelled | Stock restored | Online only |
| Owner restock | Stock added | Offline & Online |

---

## 🛠️ Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js v18+ |
| Framework | Express 5 |
| Database | PostgreSQL (via Supabase or local) |
| Auth | JWT + Role-Based Access Control (owner / rider) |
| Validation | Joi |
| Reports | pdfkit (PDF) + json2csv (CSV) |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Routing | React Router DOM v7 |
| HTTP Client | Axios |
| Styling | Tailwind CSS v3 |

---

## 📁 Project Structure

```
Inventory-Management-System/
├── backend/
│   ├── server.js                  # Express entry point, route registration
│   └── src/
│       ├── config/
│       │   ├── db.js              # PostgreSQL pool (reads DATABASE_URL)
│       │   └── constants.js       # Currency formatting helpers
│       ├── migrations/
│       │   ├── 001_init.sql       # Database schema (all tables)
│       │   └── migrate.js         # Migration runner
│       ├── models/
│       │   ├── productModel.js    # Product CRUD queries
│       │   └── restockModel.js    # Restock queries
│       ├── controllers/
│       │   ├── authController.js       # Register, login (owners & riders)
│       │   ├── productController.js    # Product management
│       │   ├── orderController.js      # Order lifecycle
│       │   ├── restockController.js    # Manual restock
│       │   ├── riderController.js      # Rider order view & status updates
│       │   ├── riderOrderController.js # Owner rider management
│       │   ├── analyticsController.js  # Dashboard analytics
│       │   └── reportController.js     # CSV & PDF report generation
│       ├── routes/                # Express routers for each module
│       ├── middleware/
│       │   ├── auth.js            # JWT verification + role guard
│       │   ├── paginate.js        # Pagination helper
│       │   └── sortOrders.js      # Order sorting middleware
│       ├── services/
│       │   ├── stockService.js    # deductStock / addStock logic
│       │   ├── csvService.js      # CSV generation
│       │   └── pdfService.js      # PDF generation
│       ├── validators/
│       │   ├── productValidator.js
│       │   └── orderValidator.js
│       └── utils/
│           ├── responseFormatter.js   # success() / error() helpers
│           └── api.js
│
└── my-app/                        # React + Vite frontend
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── context/               # ProductContext (React Context)
        ├── pages/
        │   ├── Landing.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── owner/
        │   │   ├── Dashboard.jsx
        │   │   ├── Inventory.jsx
        │   │   ├── Orders.jsx
        │   │   ├── Restock.jsx
        │   │   ├── Riders.jsx
        │   │   ├── Reports.jsx
        │   │   └── Analytics.jsx
        │   └── Rider/             # Rider dashboard & order views
        └── components/            # Shared UI components (Navbar, Table, Modal, etc.)
```

---

## 🗄️ Database Schema

```
users
 ├── role: 'owner' | 'rider'
 ├── store_type: 'offline' | 'online'
 └── owner_id → references users(id)  [for riders]

products
 ├── owner_id → users(id)
 ├── stock_qty, low_stock_threshold
 └── category, unit_type

orders
 ├── owner_id → users(id)
 ├── rider_id → users(id)
 └── status: pending | completed | dispatched | delivered | cancelled

order_items
 ├── order_id → orders(id)
 ├── product_id → products(id)
 └── quantity, unit_price

stock_transactions
 ├── product_id → products(id)
 ├── order_id → orders(id)
 ├── change_qty  (positive = restock, negative = deduction)
 └── reason
```

---

## 👥 User Roles

| Role | Access | Login Method |
|---|---|---|
| Shop Owner | Full dashboard, inventory, orders, riders, reports, analytics | Email + password |
| Rider | Assigned orders only, status updates | Username + password |

---



## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** 14+ (or a Supabase project)



### 1. Set up the backend

```bash
cd backend
npm install

# Create your .env file and fill in DATABASE_URL and JWT_SECRET
# Then run the migration to create all tables
npm run migrate
```

### 2. Set up the frontend

```bash
cd ../my-app
npm install
```

### 3. Run the project

Open **two separate terminals**:

```bash
# Terminal 1 — Backend (auto-restarts on changes)
cd backend
npm run dev        # starts on http://localhost:5000

# Terminal 2 — Frontend
cd my-app
npm run dev        # starts on http://localhost:5173
```

---

## 📜 Available Scripts

| Command | Directory | Description |
|---|---|---|
| `npm run dev` | `backend/` | Start backend with nodemon |
| `npm start` | `backend/` | Start backend without nodemon |
| `npm run migrate` | `backend/` | Run database migration (creates all tables) |
| `npm run dev` | `my-app/` | Start Vite dev server on port 5173 |
| `npm run build` | `my-app/` | Build production bundle |
| `npm run preview` | `my-app/` | Preview the production build locally |

---

## 🌐 API Overview

All responses follow the envelope: `{ success: boolean, message: string, data: any }`

| Group | Base Path | Auth |
|---|---|---|
| Auth | `/api/auth` | None |
| Products | `/api/products` | Owner only |
| Orders | `/api/orders` | Owner only |
| Restocks | `/api/restocks` | Owner only |
| Riders (management) | `/api/riders` | Owner only |
| Rider (self) | `/api/rider` | Rider only |
| Analytics | `/api/analytics` | Owner only |
| Reports | `/api/reports` | Owner only |

---

## 🔐 Authentication

- Owners log in with **email + password**; riders log in with **username + password**.
- A **JWT token** (24-hour expiry) is returned on login and must be sent as `Authorization: Bearer <token>` on all protected routes.
- The `auth` middleware verifies the token and attaches `req.user` (with `id`, `role`, `store_type`, `owner_id`) to every protected request.

---

## 📄 License

This project is licensed under the MIT License.
