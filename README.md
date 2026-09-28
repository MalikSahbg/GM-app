# Sales Manager (Web Application)

A modern, responsive React + TypeScript web application rewritten from the Android **SalesApp / GM-app** architecture. It provides complete inventory tracking, vendor company management, customer directory, sales recording with automated stock deduction, and real-time **Udhaar (credit/debt ledger)** management.

---

## Features Ported & Implemented

### 1. 🏢 Companies & Suppliers (`CompanyActivity`)
- Full vendor/distributor registry (name, phone, email, warehouse address).
- Dynamic count of products supplied by each vendor.
- Company validation: ensures a vendor exists before assigning products.
- Add, Edit, and Delete company operations.

### 2. 📦 Products Catalog (`ProductActivity`)
- Products linked to their parent suppliers/companies.
- Retail pricing, stock level tracking, and category tags.
- Add, Edit, Delete, and live search/filtering by company and name.

### 3. 👥 Customers Directory (`CustomerActivity`)
- Customer directory with direct phone and address tracking.
- Real-time order count and outstanding balance summary for each customer.
- One-click phone call and WhatsApp message integration.
- Full CRUD operations.

### 4. 🛒 Sales Recording & Billing (`SaleActivity`)
- Select customer and product with real-time stock availability check.
- Automatic price calculation (`quantity * unitPrice`).
- Flexible payment terms:
  - **Full Cash:** Payment equal to total bill.
  - **Full Udhaar:** 0 cash paid, full amount recorded as customer credit/debt.
  - **Partial Paid:** Custom down payment with remainder added to customer's Udhaar.
- Stock quantity auto-deducted immediately upon sale completion.
- Interactive, printable **Sale Invoice / Receipt Modal** with share capabilities.

### 5. 💰 Udhaar / Balance Ledger (`CustomerBalanceActivity`)
- As specified in the original application:
  - **Red Cards:** Highlight customers with active, unpaid Udhaar balances.
  - **Green Cards:** Highlight customers whose accounts are fully settled.
  - **Total Outstanding Udhaar:** Prominently calculated and displayed at the top banner.
- **Collect Payment Modal:** Record cash or online repayments against a customer's Udhaar, automatically updating balance status.
- **WhatsApp Reminder:** Generates pre-formatted payment reminder messages with customer name and exact balance due.

### 6. 📊 Stock Inventory Management (`StockActivity`)
- Real-time stock audit across all products.
- **⚠️ LOW Badge:** Displayed when product stock is $\le 5$ units.
- **Low Stock Count:** Displayed at the top KPI banner.
- **Quick Restock:** Fast $+5$, $+10$, and $+50$ replenishment buttons.
- Filter by Low Stock, Out of Stock, or In Stock.

### 7. 📈 Dashboard Overview (`DashboardActivity`)
- Key performance metrics:
  - Total Outstanding Udhaar
  - Cash Revenue Collected
  - Stock Inventory Units & Low Stock Warnings
  - Customer Accounts Count
- Quick-action buttons to launch New Sale, Udhaar Ledger, Stock Inventory, Add Product, Add Company, and Add Customer.
- Priority widgets: Highest Outstanding Udhaar list and Low Stock alerts.
- Live Recent Sales feed.

### 8. 🔐 Authentication & Session (`LoginActivity`, `SignupActivity`)
- User profile and store name persistence in `localStorage`.
- Support for Store Owner sign-in, account creation, and quick demo login.

---

## Tech Stack
- **Framework:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Storage:** Browser `localStorage` with initial seed demo dataset

---

## Development & Build

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```
