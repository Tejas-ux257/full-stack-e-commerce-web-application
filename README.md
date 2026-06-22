# Fullstack React Node App

## Features
- **React frontend** built with Vite (fast, hot‑reload)
- **Node.js Express backend** with JWT authentication
- **MySQL** database (configured via `.env`)
- **User authentication** (login & register)
- **Product catalog** with categories
- **Product images** (multiple images per product)
- **Wishlist** functionality
- **Product likes** and **reviews** system
- **Contact form** for inquiries
- **Responsive design** with modern UI (glassmorphism, animations)

## Setup Instructions

### 1. Prerequisites
- Node.js (v20+)
- MySQL server
- Git (optional)

### 2. Database Setup
```sql
CREATE DATABASE website_db;
-- Run the schema to create tables
mysql -u <user> -p website_db < backend/models/schema.sql
```

### 3. Backend Setup
```bash
cd backend
cp .env.example .env   # edit DB credentials
npm install
npm run init-db        # creates tables (adds a script)
npm run dev            # starts server on http://localhost:5000
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev            # starts Vite dev server on http://localhost:3000
```

## Notes
- Ensure the backend port (5000) is free; if you see `EADDRINUSE`, stop any process using that port or change the port in `backend/server.js`.
- The README now reflects MySQL usage (previously mentioned PostgreSQL).

### 3. Frontend Setup
cd frontend
npm install
npm run dev

Runs on: http://localhost:3000

## API Endpoints

GET    /api/products
POST   /api/products/like/:id
POST   /api/reviews
POST   /api/contacts

## How to Extend

- Add new pages in /pages
- Add new API routes in backend/routes
- Add new DB tables in schema.sql
