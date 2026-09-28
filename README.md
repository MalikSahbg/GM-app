# Sales Manager — Complete Android App (Kotlin + Room + MVVM)

---

## Project File Structure

```
SalesApp/
├── build.gradle.kts                          ← Root build file
├── settings.gradle.kts                       ← Module settings
├── gradle/
│   └── libs.versions.toml                    ← Dependency catalog
│
└── app/
    ├── build.gradle.kts                      ← App-level deps & plugins
    └── src/main/
        ├── AndroidManifest.xml
        ├── java/com/salesapp/
        │   ├── data/
        │   │   ├── model/
        │   │   │   ├── Entities.kt           ← User, Company, Product, Customer, Sale
        │   │   │   └── DataClasses.kt        ← ProductWithCompany, CustomerBalance, SaleDetail
        │   │   ├── dao/
        │   │   │   ├── UserDao.kt
        │   │   │   ├── CompanyDao.kt
        │   │   │   ├── ProductDao.kt
        │   │   │   ├── CustomerDao.kt
        │   │   │   └── SaleDao.kt
        │   │   ├── database/
        │   │   │   └── AppDatabase.kt        ← Room singleton
        │   │   └── repository/
        │   │       └── Repositories.kt       ← All 5 repositories
        │   └── ui/
        │       ├── ViewModelFactory.kt
        │       ├── auth/
        │       │   ├── AuthViewModel.kt
        │       │   ├── LoginActivity.kt
        │       │   └── SignupActivity.kt
        │       ├── dashboard/
        │       │   ├── DashboardViewModel.kt
        │       │   └── DashboardActivity.kt
        │       ├── company/
        │       │   ├── CompanyViewModel.kt
        │       │   ├── CompanyAdapter.kt
        │       │   └── CompanyActivity.kt
        │       ├── product/
        │       │   ├── ProductViewModel.kt
        │       │   ├── ProductAdapter.kt
        │       │   └── ProductActivity.kt
        │       ├── customer/
        │       │   ├── CustomerViewModel.kt
        │       │   ├── CustomerAdapter.kt
        │       │   └── CustomerActivity.kt
        │       ├── sale/
        │       │   ├── SaleViewModel.kt
        │       │   ├── SaleAdapter.kt
        │       │   └── SaleActivity.kt
        │       ├── balance/
        │       │   ├── CustomerBalanceViewModel.kt
        │       │   ├── CustomerBalanceAdapter.kt
        │       │   └── CustomerBalanceActivity.kt
        │       └── stock/
        │           ├── StockViewModel.kt
        │           ├── StockAdapter.kt
        │           └── StockActivity.kt
        └── res/
            ├── layout/
            │   ├── activity_login.xml
            │   ├── activity_signup.xml
            │   ├── activity_dashboard.xml
            │   ├── activity_company.xml
            │   ├── activity_product.xml
            │   ├── activity_customer.xml
            │   ├── activity_sale.xml
            │   ├── activity_customer_balance.xml
            │   ├── activity_stock.xml
            │   ├── item_company.xml
            │   ├── item_product.xml
            │   ├── item_customer.xml
            │   ├── item_sale.xml
            │   ├── item_customer_balance.xml
            │   └── item_stock.xml
            ├── drawable/
            │   └── spinner_background.xml
            └── values/
                ├── colors.xml
                ├── strings.xml
                └── themes.xml
```

---

## Step-by-Step Setup in Android Studio

### Step 1 — Create a New Project

1. Open **Android Studio** (Hedgehog or newer)
2. Click **"New Project"**
3. Choose **"Empty Views Activity"**
4. Fill in:
   - **Name:** `SalesApp`
   - **Package name:** `com.salesapp`
   - **Save location:** your preferred folder
   - **Language:** `Kotlin`
   - **Minimum SDK:** `API 24`
5. Click **Finish** and wait for Gradle sync

---

### Step 2 — Replace Gradle Files

Replace the contents of these files with the provided code:

| File | What to replace |
|------|----------------|
| `gradle/libs.versions.toml` | Full dependency catalog |
| `build.gradle.kts` (root) | Root build file |
| `app/build.gradle.kts` | App-level build file |
| `settings.gradle.kts` | Settings file |

After replacing, click **"Sync Now"** in the top-right bar.

---

### Step 3 — Create Package Folders

In `app/src/main/java/com/salesapp/`, right-click and create these packages:

```
data.model
data.dao
data.database
data.repository
ui
ui.auth
ui.dashboard
ui.company
ui.product
ui.customer
ui.sale
ui.balance
ui.stock
```

---

### Step 4 — Copy All Kotlin Files

Copy each `.kt` file into its matching package:

| Package | Files |
|---------|-------|
| `data.model` | `Entities.kt`, `DataClasses.kt` |
| `data.dao` | `UserDao.kt`, `CompanyDao.kt`, `ProductDao.kt`, `CustomerDao.kt`, `SaleDao.kt` |
| `data.database` | `AppDatabase.kt` |
| `data.repository` | `Repositories.kt` |
| `ui` | `ViewModelFactory.kt` |
| `ui.auth` | `AuthViewModel.kt`, `LoginActivity.kt`, `SignupActivity.kt` |
| `ui.dashboard` | `DashboardViewModel.kt`, `DashboardActivity.kt` |
| `ui.company` | `CompanyViewModel.kt`, `CompanyAdapter.kt`, `CompanyActivity.kt` |
| `ui.product` | `ProductViewModel.kt`, `ProductAdapter.kt`, `ProductActivity.kt` |
| `ui.customer` | `CustomerViewModel.kt`, `CustomerAdapter.kt`, `CustomerActivity.kt` |
| `ui.sale` | `SaleViewModel.kt`, `SaleAdapter.kt`, `SaleActivity.kt` |
| `ui.balance` | `CustomerBalanceViewModel.kt`, `CustomerBalanceAdapter.kt`, `CustomerBalanceActivity.kt` |
| `ui.stock` | `StockViewModel.kt`, `StockAdapter.kt`, `StockActivity.kt` |

---

### Step 5 — Copy All XML Files

Replace `res/layout/activity_main.xml` with the provided `activity_login.xml`, then
add all other XML files under `res/layout/`:

```
activity_login.xml         activity_signup.xml
activity_dashboard.xml     activity_company.xml
activity_product.xml       activity_customer.xml
activity_sale.xml          activity_customer_balance.xml
activity_stock.xml
item_company.xml           item_product.xml
item_customer.xml          item_sale.xml
item_customer_balance.xml  item_stock.xml
```

Also add to `res/drawable/`:
```
spinner_background.xml
```

Replace `res/values/`:
```
colors.xml    strings.xml    themes.xml
```

---

### Step 6 — Replace AndroidManifest.xml

Replace the entire content of `app/src/main/AndroidManifest.xml` with the provided version.

> **Important:** Delete the default `MainActivity` from the project since the launcher is now `LoginActivity`.

---

### Step 7 — Build & Run

1. Connect an Android device or start an emulator (API 24+)
2. Click the **Run ▶** button
3. The app will launch on the **Login screen**

---

## How to Use the App

### First-Time Setup

```
1. Open app → Login screen appears
2. Tap "Don't have an account? Sign Up"
3. Enter name, email, password → tap "CREATE ACCOUNT"
4. Log in with your credentials
5. Dashboard opens ✓
```

### Typical Workflow

```
Step 1: Add Companies
   Dashboard → 🏢 Companies → type name → ADD

Step 2: Add Products
   Dashboard → 📦 Products → fill details → ADD PRODUCT
   (Company must be added first)

Step 3: Add Customers
   Dashboard → 👥 Customers → fill name & phone → ADD CUSTOMER

Step 4: Record a Sale
   Dashboard → 🛒 New Sale
   → Select customer from dropdown
   → Select product from dropdown
   → Enter quantity (stock auto-checked)
   → Enter paid amount (leave 0 for full udhaar)
   → Tap RECORD SALE
   → Stock reduces automatically ✓

Step 5: Check Udhaar (Balance)
   Dashboard → 💰 Udhaar
   → Red cards = customers with unpaid balance
   → Green cards = fully paid customers
   → Total outstanding shown at top

Step 6: Check Stock
   Dashboard → 📊 Stock
   → ⚠️ LOW badge appears when stock ≤ 5
   → Low stock count shown at top
```

---

## Architecture Overview

```
UI Layer (Activities + Adapters)
       ↓ observes LiveData
ViewModel Layer (business logic, validation)
       ↓ calls suspend functions
Repository Layer (data access abstraction)
       ↓
Room Database (DAOs + Entities)
       ↓
SQLite (local storage on device)
```

### Key Design Decisions

| Feature | Implementation |
|---------|---------------|
| Local Auth | Room DB — email/password stored locally |
| Session | SharedPreferences — user_id persists login |
| Stock check | Done in ViewModel before recording sale |
| Udhaar query | SQL LEFT JOIN with SUM aggregation |
| Auto price | TextWatcher on quantity field |
| LiveData lists | Room returns `LiveData<List<T>>` — UI auto-updates |

---

## Database Schema

```sql
users        (id, name, email, password)
companies    (id, name)
products     (id, name, companyId→companies, price, stockQuantity)
customers    (id, name, phone)
sales        (id, customerId→customers, productId→products,
              quantity, date, totalPrice, paidAmount)
```

---

## Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| Gradle sync fails | Check `libs.versions.toml` versions match exactly |
| `kapt` not found | Add `kotlin-kapt` plugin in `app/build.gradle.kts` |
| Room compile error | Make sure all DAOs are listed in `@Database` |
| Spinner crash | Ensure companies/customers list is non-empty before selecting |
| Login not persisting | Check SharedPreferences key matches in Login + Dashboard |
| Cannot add product | Add at least one company first |

---

## Dependencies Used

```toml
Room         2.6.1   ← Local database (SQLite ORM)
ViewModel    2.7.0   ← MVVM architecture
LiveData     2.7.0   ← Reactive UI updates
Coroutines   1.7.3   ← Async DB operations
Material     1.11.0  ← Cards, TextInputLayout, Buttons
RecyclerView 1.3.2   ← All lists
CardView     1.0.0   ← Item cards
```
