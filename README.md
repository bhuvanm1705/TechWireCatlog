# Semi-Ecommerce Technical Catalog with CSV Import

A complete, production-ready specifications repository and semi-ecommerce web application. This application dynamically imports product specifications from a CSV sheet, stores them using a fully normalized relational schema in PostgreSQL (NeonDB) via Prisma, and presents them in a premium industrial-themed user interface built with React, Vite, and Tailwind CSS.

---

## Architecture Overview

```text
techwire/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Prisma schema modeling Category, SubCategory, Product, ProductAttribute
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js          # Shared Prisma client initialization
│   │   ├── controllers/
│   │   │   ├── importController.js  # CSV & sample loading logic
│   │   │   └── productController.js # Category, Subcategory, Products and Detail endpoints
│   │   ├── middleware/
│   │   │   └── upload.js      # Multer config with filters for CSV safety
│   │   ├── routes/
│   │   │   └── productRoutes.js # Route mapping
│   │   ├── services/
│   │   │   └── importService.js # Transaction-based DB loader
│   │   ├── utils/
│   │   │   └── csvParser.js   # Dynamic columns parsing rule engine
│   │   └── app.js             # Express app setup and middleware registration
│   ├── server.js              # Entrypoint server execution
│   └── .env                   # DB connection environment configs
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js      # Axios client configuration
│   │   ├── components/        # Layout elements
│   │   ├── hooks/
│   │   │   └── useProducts.js # React Query hooks
│   │   ├── layouts/
│   │   │   └── Layout.jsx     # Navigation bar and header frame
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Landing dashboard
│   │   │   ├── CategoriesPage.jsx   # Interactive tree grid
│   │   │   ├── ProductListingPage.jsx # Component browsers, filters, pagination
│   │   │   ├── ProductDetailPage.jsx  # Technical parameter specifications
│   │   │   └── AdminUploadPage.jsx  # Custom file drag-drop & sample CSV loader
│   │   ├── App.jsx            # Router and QueryClientProvider config
│   │   ├── index.css          # Main Tailwind styles
│   │   └── main.jsx
│   ├── tailwind.config.js     # Slate & Sky-blue industrial theme config
│   ├── postcss.config.js
│   └── package.json
```

---

## DB Design & Association Rules

The database design implements a 1-to-many Category/Subcategory model, linking to a Product specs model. 

```mermaid
erDiagram
    Category ||--o{ SubCategory : "has"
    SubCategory ||--o{ Product : "contains"
    Product ||--o{ ProductAttribute : "stores"
```

### Storage Engine Logic
- All dynamic specification columns are stored as key-value items in the `ProductAttribute` table (linked to `Product` via `productId`).
- A compound unique constraint `@@unique([productId, attributeName])` prevents specification duplicates.
- **CSV cell mapping**:
  - **Cell populated** (e.g., `4`): Saved as `attributeValue = "4"` with `isDash = false`.
  - **Cell equals `-`**: Saved as `attributeValue = "-"` with `isDash = true`.
  - **Cell empty**: Skip association completely.

---

## Setup & Run Instructions

### 1. Prerequisite Installations
- Node.js (v18 or higher)
- PostgreSQL Database URL (NeonDB)

### 2. Configure Environment Variables
Create a file named `.env` in the `backend/` directory:
```bash
# backend/.env
DATABASE_URL="postgresql://[username]:[password]@[neon-hostname].neon.tech/neondb?sslmode=require"
PORT=5000
```

### 3. Initialize Database Tables
Run migrations to build the tables in your NeonDB database:
```bash
cd backend
npm install
npx prisma db push
npx prisma generate
```

### 4. Install & Run Dev Servers

#### A. Run Express API Server
```bash
cd backend
npm run dev
```
*The server starts listening at `http://localhost:5000`*

#### B. Run React Frontend App
```bash
cd frontend
npm install
npm run dev
```
*The Vite application runs on `http://localhost:3000`*

---

## Production Deployment Steps (Vercel)

Vercel will build your static React app and deploy the Express backend as Serverless Functions automatically based on the root [vercel.json](./vercel.json) configuration.

### 1. Environment Variable Configuration
Since Vercel builds the project on its own secure cloud environment, your local `.env` file is **not** pushed to GitHub. You must manually add your connection details in Vercel:

1. In your Vercel Project Dashboard, navigate to **Settings** -> **Environment Variables**.
2. Add a new variable:
   * **Key**: `DATABASE_URL`
   * **Value**: `postgresql://neondb_owner:YOUR_PASSWORD@ep-cool-butterfly-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
3. Click **Save**.

### 2. Manual Git Deployment
To trigger a new deployment on Vercel:
```bash
git add .
git commit -m "deploy: initial project push with database connection setup"
git push origin main
```
Vercel will detect the push, run the `vercel-build` script to generate the Prisma Client, compile the React assets, and deploy the live site.

