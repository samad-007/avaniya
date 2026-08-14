# Avaniya — Indian Real Estate & Land Business Asset Tracker

A high-precision, production-grade full-stack real estate portfolio management and liquidity tracking web application built specifically for Indian real estate entrepreneurs, developers, and land investors.

---

## 🌟 Key Features

### 1. Dual Portfolio Modes
- **Commercial Land Business Mode**:
  - Live Net Bank Liquidity, Cash in Hand, and Combined Liquid Capital tracking.
  - Option B Visual Deal Pipeline Cards with 4-price matrix:
    1. **Agreed Buy Price**: Base seller consideration
    2. **Property Expenses**: All statutory & development costs (which can exceed agreed purchase price)
    3. **Target Sale Price**: Projected market exit valuation
    4. **Agreed Selling Price**: Actual agreed price with buyer
    5. **Total Acquisition Outlay**: `Agreed Buy Price + Property Expenses`
  - Dense Ledger Matrix (Option A) toggle for high-density accounting view.
  - Multi-tab tracking matching reference workbooks: **Land Deals Master**, **Property Outflows**, **Sale Receipts (Deal Inflows)**, **Capital Funding Log**, and **Internal Cash/Bank Transfers**.
- **Personal Real Estate Asset Investment Mode**:
  - Multi-property asset management (Apartments, Villas, Commercial Plots).
  - Construction stage and payment milestone tracking (Booking, Plinth, Slab, Brickwork, Flooring, Handover).
  - Category-wise expense distribution analytics.

### 2. Deep Property Ledger Drill-Down View
- Clicking any deal or personal asset card opens an itemized property ledger modal.
- Displays agreed purchase price, bank vs cash payment breakdowns, legal/fencing/mutation expenses, pending payables to sellers, target exit price, and complete transaction history.
- Quick action to record payments or receipts linked directly to that specific property.

### 3. Rapid Non-Tech Data Entry Drawer
- Live Indian Rupee verbal converter (e.g. typing `5000000` $\rightarrow$ `₹ 50 Lakhs / 0.50 Cr`).
- Preset quick increment chips (`+10k`, `+50k`, `+1L`, `+5L`, `+10L`, `+50L`, `+1Cr`).
- Instant Bank vs Cash toggle with transfer direction handling.

### 4. Dynamic Category & South Indian Expense Engine
- Comprehensive South Indian real estate expense types pre-configured:
  - Sub-Registrar Stamp Duty (7%), Registration Fee (4%), Patta/Chitta Mutation Fee, 30-Year EC Search
  - DTCP / CMDA Layout Scrutiny Fees, Open Space Reservation (OSR) Charges, Agricultural Conversion Tax
  - Advocate Title Verification, Court Vakalat & Dispute Clearance
  - Land Surveyor Fee, FMB Sketch, Boundary Stone Fixing, Perimeter Fencing / Compound Wall, Earth Filling / JCB Leveling
  - TANGEDCO EB Line & Transformer Setup, Borewell Drilling & Motor Pump, Road Formation & Drainage
  - Brokerage / Mandi Mediator Commission (1% - 2%), VAO & Local Panchayat Liaisoning
- Zero-break financial role mapping (`purchase_principal`, `property_expense`, `sale_receipt`, `capital_infusion`, `personal_milestone`, `personal_overhead`, `internal_transfer`).

### 5. Multi-Format Export Engine
- **Excel Workbook (`.xlsx`)**: Generates an interactive multi-tab workbook (`Dashboard`, `Land_Master`, `Outflows`, `Deal_Inflows`, `Capital_Inflows`, `Transfers`) with live `SUMIFS` formulas and formatted Indian currency cells.
- **Executive Statement (`.pdf`)**: Print-ready portfolio overview and property pipeline report.
- **Normalized Ledger (`.csv`)**: Tabular export ready for Tally or accounting audits.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router, Serverless API routes)
- **Language & Runtime**: TypeScript (Strict mode, Zero `any`), Node.js
- **Styling**: Tailwind CSS (True Black `#000000` baseline / Luxury Emerald `#060907` Obsidian option)
- **Typography**: IBM Plex Sans + JetBrains Mono (Google Fonts)
- **Database**: MongoDB Atlas (M0 Free Tier Mumbai `ap-south-1`) with pooled Mongoose connection and memory cache fallback
- **Authentication**: JWT session cookies with bcrypt password hashing
- **Spreadsheet & PDF Generation**: `exceljs`, `jspdf`, `jspdf-autotable`
- **Branding**: AI-generated Avaniya luxury geometric real estate emblem

---

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Environment Variables (Optional)
Create `.env.local` to connect to MongoDB Atlas (if omitted, the app runs in in-memory mode seeded from reference data):
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/real_estate_tracker?retryWrites=true&w=majority
JWT_SECRET=your-secure-jwt-secret-key-here
```

### 3. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Running Unit Tests
```bash
npx tsx tests/formulaEngine.test.ts
```

---

## 📊 Spreadsheet Formula Validation

All dashboard metrics are verified against the reference workbooks `Land_Business_Tracker.xlsx` and `New Apartment Expense Tracker.xlsx`:

| Metric | Reference Sheet Value | App Formula Engine | Match Status |
| :--- | :--- | :--- | :--- |
| **Commercial Net Bank Liquidity** | `₹ 29,24,297` | `₹ 29,24,297` | 100% Exact Match |
| **Commercial Net Cash Balance** | `₹ 19,93,500` | `₹ 19,93,500` | 100% Exact Match |
| **Combined Net Liquidity** | `₹ 49,17,797` | `₹ 49,17,797` | 100% Exact Match |
| **Total Outflows Paid** | `₹ 1,25,72,203` | `₹ 1,25,72,203` | 100% Exact Match |
| **Pending Outflows to Sellers** | `₹ 4,11,27,598` | `₹ 4,11,27,598` | 100% Exact Match |
| **Personal Investment Done** | `₹ 2,00,000` | `₹ 2,00,000` | 100% Exact Match |
| **Personal Bank Balance** | `₹ 1,42,000` | `₹ 1,42,000` | 100% Exact Match |
