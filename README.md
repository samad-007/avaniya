# Avaniya: Indian Real Estate & Land Business Asset Tracker

> **The Comprehensive Master Guide & System Blueprint**
> 
> Production-grade full-stack real estate portfolio management, liquidity accounting, and deal pipeline system designed specifically for Indian real estate entrepreneurs, developers, land aggregators, and private asset investors.
>
> **Live Deployment**: `https://avaniya.vercel.app`  
> **Repository**: `https://github.com/samad-007/avaniya.git`

---

## 📑 Table of Contents

1. [Executive Overview & Mental Model](#1-executive-overview--mental-model)
2. [Layman & Business User Manual](#2-layman--business-user-manual)
   - [Commercial Land Mode vs Personal Asset Mode](#a-commercial-land-mode-vs-personal-asset-mode)
   - [The 4-Price Valuation Matrix & Cost Recovery Profit Recognition](#b-the-4-price-valuation-matrix--cost-recovery-profit-recognition)
   - [Recording Outflows, Inflows & Transfers](#c-recording-outflows-inflows--transfers)
   - [Editing Properties & Managing Milestones](#d-editing-properties--managing-milestones)
   - [Multi-Format Exports (Excel, PDF, CSV)](#e-multi-format-exports-excel-pdf-csv)
   - [Session Security, Inactivity Timeout & Sign Out](#f-session-security-inactivity-timeout--sign-out)
3. [Developer & DevOps Engineering Guide](#3-developer--devops-engineering-guide)
   - [Architecture & Tech Stack](#a-architecture--tech-stack)
   - [Project Directory Structure](#b-project-directory-structure)
   - [Environment Variables Configuration](#c-environment-variables-configuration)
   - [MongoDB Atlas Multi-Tenant Migration](#d-mongodb-atlas-multi-tenant-migration)
   - [Local Development & Build Verification](#e-local-development--build-verification)
   - [API Reference](#f-api-reference)
4. [AI Agent & Autonomous Pair Programming Directives](#4-ai-agent--autonomous-pair-programming-directives)
   - [Mathematical Formula Engine Rules](#a-mathematical-formula-engine-rules)
   - [Zero-Break Financial Role Mapping](#b-zero-break-financial-role-mapping)
   - [Multi-Tenant Data Scoping Directive](#c-multi-tenant-data-scoping-directive)
   - [Design Aesthetics & UI Constraints](#d-design-aesthetics--ui-constraints)

---

## 1. Executive Overview & Mental Model

Traditional accounting software (e.g. Tally, QuickBooks) and generic CRM trackers fail to address the nuances of Indian land deals, where:
1. **Statutory & site development costs** (Sub-Registrar Stamp Duty 7%, Patta/Chitta transfer, DTCP/CMDA scrutiny, boundary fencing, leveling, EB setup) can frequently equal or exceed the base purchase consideration paid to the seller.
2. **Dual-channel liquidity** (Bank NEFT/RTGS vs Liquid Cash) must be balanced in real-time.
3. **Multi-stage exit pipelines** require comparing *Agreed Buy Consideration*, *Total Project Outlay*, *Target Market Exit*, and *Actual Agreed Selling Price*.
4. **Data Isolation** is mandatory so multiple business partners, family offices, or clients view only their own segregated portfolio, while the Super Admin maintains master oversight.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               AVANIYA MULTI-TENANT ENGINE                               │
├──────────────────────────────────────────┬──────────────────────────────────────────────┤
│ COMMERCIAL LAND MODE                     │ PERSONAL ASSET MODE                          │
│ • Net Bank vs Cash In Hand Liquidity     │ • Personal Property Assets (Flats/Villas)    │
│ • 4-Price Valuation Matrix               │ • Construction Stages & Payment Milestones   │
│ • 5-Tab Pipeline & Expense Ledger        │ • Category Spending Breakdown                │
│ • Pending Seller & Buyer Liabilities     │ • Cash vs Bank Savings Reconciliation        │
├──────────────────────────────────────────┴──────────────────────────────────────────────┤
│ SUPER ADMIN & TENANT CONTROL CENTER                                                     │
│ • Instant Workspace Switcher across client datasets                                     │
│ • User Provisioning with Strict 15-Character Non-Ambiguous Passwords                    │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Layman & Business User Manual

### A. Commercial Land Mode vs Personal Asset Mode
Switch between modes using the toggle located in the top navigation bar:
- **Commercial Land Business Mode**: Use for joint ventures, layout developments, plotting schemes, and commercial acreage acquisitions.
- **Personal Asset Investment Mode**: Use for residential apartments, independent villas, or family plots with stage-wise builder payment schedules.

### B. The 4-Price Valuation Matrix & Cost Recovery Profit Recognition
Every commercial deal card displays four distinct financial metrics:
1. **Agreed Buy Price**: The baseline consideration agreed with the original land seller.
2. **Property Expenses**: Total spent on legal verification, stamp duty, registration, DTCP scrutiny, boundary fencing, and earth leveling (can exceed the buy price).
3. **Target Sale Exit**: Target valuation if sold at projected market rates.
4. **Agreed Selling Price**: The finalized contract price with the incoming buyer.
- **Total Project Outlay**: `Agreed Buy Price + Property Expenses`
- **Projected Profit**: `Agreed Selling Price - Total Project Outlay`

#### Cost Recovery Profit Recognition Model
In real estate asset management, recognizing paper profit on unsold or in-progress inventory distorts financial health. Avaniya enforces the conservative Cost Recovery Model:
- **In-Progress Pipeline Deals (`open`, `in_progress`, `registered`)**: Realized Profit is strictly ₹0. Token advances or installment receipts from incoming buyers offset cash outlays and reduce Pending Inflow, but do not record profit until the deal is formally completed.
- **Sold Deals (`sold`, `closed`)**: Realized Profit is recognized only when cumulative sale receipts exceed the Total Project Outlay:
  $$\text{Realized Profit} = \max(0, \text{Total Receipts Collected} - \text{Total Project Outlay})$$
- **Pending Profit**: For sold assets where the buyer still owes an outstanding balance, Pending Profit tracks uncollected profit:
  $$\text{Pending Profit} = \max(0, \text{Projected Profit} - \text{Realized Profit})$$

#### Auto-Switching Profit KPI Card
The top KPI strip features an intelligent dual-state Profit card:
- **Realized vs Pipeline States**: Toggles between Actual (Realized) Profit on sold assets and Total Projected Profit across active unsold pipeline inventory.
- **7-Second Auto Cycle**: Automatically rotates view every 7 seconds with subtle indicator pill lights.
- **Interactive Swipe & Touch Gestures**: Mobile users can swipe left or right across the card; desktop users can drag or click the pill buttons.
- **Hover Pause**: Hovering or touching the card pauses the auto-rotation timer to prevent jarring transitions while reviewing figures.

### C. Recording Outflows, Inflows & Transfers
Click **Record Outflow** or **Add Inflow** from the header:
- **Live Indian Verbal Summary**: As you type numbers (e.g. `12500000`), the converter displays `₹ 1.25 Crores / 125.00 Lakhs` to eliminate zero-counting errors.
- **Preset Chips**: Click buttons like `+10k`, `+1L`, `+5L`, `+50L`, `+1Cr` to increment amounts instantly.
- **Payment Mode**: Toggle between **Bank** (NEFT/RTGS/Cheque) and **Cash in Hand**.
- **Internal Transfers**: Move liquidity between Bank and Cash without distorting P&L profits.

### D. Editing Properties & Managing Milestones
- Click the **Pencil icon (✏️)** on any property card or inside the Property Ledger to edit any parameter: name, location, survey number, square feet area, rate per sq.ft, status, or legal verification notes.
- In Personal mode, manage stage milestones (e.g., *Booking Amount*, *Plinth Completion*, *Slab Casting*, *Plastering*, *Handover*) and check them off as work finishes.

### E. Loans, Debt Financing & Profit Sharing
- **Facility Registry**: Register Bank Loans (term loans, overdrafts, mortgage credit) and Family/Friend Private Financing with clear terms (interest % p.a. and/or profit share % on deals).
- **Dual-Channel Borrowing & Repayment**: Borrow funds directly into Bank or Cash liquidity; log principal repayments, interest expenses, and profit bonuses with complete historical ledger tracking.
- **Dynamic Liability Reconciliation**: Real-time calculation of outstanding debt liability ($\max(0, \sum \text{Borrowed} - \sum \text{Repaid})$) and total finance costs without distorting base equity or land acquisition outlays.

### F. Multi-Format Exports (Excel, PDF, CSV)
Click **Export** in the top bar to generate offline files:
- **Multi-Tab Excel (`.xlsx`)**: Interactive spreadsheet containing `Dashboard`, `Land_Master`, `Outflows`, `Deal_Inflows`, `Capital_Inflows`, `Loans_and_Debt`, and `Transfers` with live `SUMIFS` formulas and formatted INR numbers.
- **Executive Statement (`.pdf`)**: Print-ready 7-page executive overview including liquidity overview, land deals, loans/debt ledger, personal assets, and itemized transaction ledgers.
- **Normalized Ledger (`.csv`)**: Clean CSV with `Loan Code` ready for import into Tally or accountant software.

### G. Session Security, Inactivity Timeout & Sign Out
- **Auto-Logout on Idle**: If the tab remains inactive for 30 minutes, you will be logged out automatically.
- **Swipe / Back Button Protection**: Swiping back on mobile or pressing the browser back button prompts a logout confirmation modal to prevent accidental session termination.

---

## 3. Developer & DevOps Engineering Guide

### A. Architecture & Tech Stack
- **Framework**: Next.js 15 (App Router, Server Components & Route Handlers)
- **Runtime Environment**: Bun 1.4 (via `vercel.json` `"bunVersion": "1.4.x"`) with local Node.js / Bun cross-compatibility
- **Package Manager**: Bun 1.4 (`packageManager: bun@1.4.0`)
- **Language**: TypeScript 5 (Strict types, zero `any`, discriminated unions)
- **Styling**: Tailwind CSS (True Black `#000000` baseline, high-contrast zinc tokens)
- **Typography**: IBM Plex Sans (Body) + JetBrains Mono (Financial Tabular Digits) via `next/font/google`
- **Database & Persistence**: MongoDB Atlas Cluster (`ap-south-1` Mumbai) via Mongoose pooled connection with compound indexes (`datasetId + date`, `datasetId + scope`, `datasetId + propertyCode`, `datasetId + loanCode`). All tenant writes are strictly committed to MongoDB. Silent in-memory RAM fallback has been removed to guarantee data durability across serverless lifecycle events (retained strictly for sandboxed demo tenants).
- **Serverless Connection Lifecycle**: Self-healing cached connection pool (`cached.promise = null`) automatically recycles dead or dropped connections when `mongoose.connection.readyState !== 1`, preventing cold-start hangs and stale-connection data loss.
- **Client State Reactivity**: Dynamic derivation of active property financial metrics (`useMemo` keyed on `selectedPropertyCode`), ensuring modal ledgers and summaries update instantaneously on transaction entry without navigation or page reload.
- **Query Optimization**: $O(1)$ MongoDB Aggregation pipelines for tenant user & transaction matrix calculations
- **Authentication**: Stateless JSON Web Tokens (JWT) stored in HTTP-only Secure Cookies with 12-hour expiration, bcrypt password hashing, and authenticated route protection across all data endpoints.

### B. Project Directory Structure
```
Real-estate-tracker/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/users/route.ts       # Super admin user & dataset provisioning
│   │   │   ├── auth/                      # login, register, me, logout endpoints
│   │   │   ├── bootstrap/route.ts         # Single round-trip state loader
│   │   │   ├── categories/route.ts        # Dynamic category CRUD
│   │   │   ├── export/                    # excel, pdf, csv export generators
│   │   │   ├── loans/                     # Loan facility CRUD & [id] endpoints
│   │   │   ├── properties/                # Property listing, creation & PATCH [id]
│   │   │   └── transactions/route.ts      # Transaction ledger CRUD
│   │   ├── globals.css                    # Tailwind tokens & True Black baseline
│   │   ├── layout.tsx                     # Root layout, Google font variables
│   │   └── page.tsx                       # Master dashboard page with auth guards
│   ├── components/
│   │   ├── admin/SuperAdminDashboard.tsx  # Tenant & user control center
│   │   ├── auth/AuthModal.tsx             # Login & register dialog
│   │   ├── dashboard/                     # CommercialView, PersonalView, KpiStrip, LedgerModal
│   │   ├── layout/                        # Header & Footer components
│   │   └── modals/                        # EditProperty, NewProperty, QuickEntry, Category, LoanModal, Export
│   ├── lib/
│   │   ├── auth.ts                        # JWT issue, verify, cookie extraction
│   │   ├── dataStore.ts                   # Unified Mongoose & in-memory data access layer
│   │   ├── db.ts                          # MongoDB Atlas pooled Mongoose connector
│   │   ├── exportEngine.ts                # ExcelJS, jsPDF, and CSV export generators
│   │   ├── formatters.ts                  # formatINR, verbal converter, dates
│   │   ├── formulaEngine.ts               # Core spreadsheet SUMIFS math engine
│   │   ├── passwordGenerator.ts           # 15-character secure password algorithm
│   │   └── seedData.ts                    # Default commercial & personal datasets
│   └── models/                            # Mongoose Schemas: User, Property, Transaction, Category, Loan
├── scripts/
│   └── migrateToMongo.ts                  # Standalone CLI multi-tenant seed & migration runner
├── tests/
│   └── formulaEngine.test.ts              # Mathematical unit test suite
└── README.md                              # This document
```

### C. Environment Variables Configuration
Create a `.env.local` file in the project root:
```bash
# MongoDB Atlas Connection String (Explicitly routes to 'production' database)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/production?retryWrites=true&w=majority

# Optional: Override target database name (defaults to 'production', test runs use 'test')
MONGODB_DB=production

# JWT Secret for Session Signing
JWT_SECRET=your-production-secret-key-at-least-32-chars-long
```

> [!NOTE]
> - Real business portfolio data (including Mohammed Yousuf's real dataset `ds_yousuf_portfolio`) is explicitly stored in the **`production`** database.
> - The **`test`** database is preserved exclusively for automated testing and sandbox environments.
> - When configuring `MONGODB_URI` on Vercel or locally, do NOT enclose the connection string in double quotes if it causes parsing errors. Ensure the URI begins with `mongodb://` or `mongodb+srv://`.

### D. MongoDB Atlas Production Migration
To seed and update MongoDB Atlas production database with real tenant datasets (Super Admin and Mohammed Yousuf Portfolio):
```bash
npm run migrate
```
This script executes [`scripts/migrateToMongo.ts`](file:///Users/abdulsamad/Documents/development/projects/VibeCoded/Real-estate-tracker/scripts/migrateToMongo.ts) targeting the `production` database on your cluster.

### E. Local Development & Build Verification
```bash
# 1. Install dependencies
npm install

# 2. Run mathematical unit tests
npx vitest run

# 3. Start local development server
npm run dev

# 4. Production build verification
npm run build
```

### F. API Reference

| Endpoint | Method | Role Required | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Create new user account and dedicated dataset |
| `/api/auth/login` | `POST` | Public | Authenticate user and issue JWT cookie |
| `/api/auth/me` | `GET` | Authenticated | Retrieve currently logged-in user profile |
| `/api/auth/logout` | `POST` | Authenticated | Invalidate JWT session cookie |
| `/api/bootstrap` | `GET` | Authenticated | Consolidated single-endpoint state bootstrap |
| `/api/admin/users` | `GET` | `super_admin` | List all platform tenants, properties & transaction counts |
| `/api/admin/users` | `POST` | `super_admin` | Provision new client with autogenerated 15-char password |
| `/api/admin/users` | `PUT` | `super_admin` | Reset user password to a new 15-character secure string |
| `/api/admin/users` | `DELETE`| `super_admin` | Delete tenant user account |
| `/api/properties` | `GET` | Authenticated | List properties scoped to caller's `datasetId` |
| `/api/properties` | `POST` | Authenticated | Create a new commercial or personal property |
| `/api/properties/:id` | `PATCH`| Authenticated | Update valuations, status, notes, or milestones |
| `/api/loans` | `GET` | Authenticated | List loans and debt facilities scoped to `datasetId` |
| `/api/loans` | `POST` | Authenticated | Create a new loan or private financing agreement |
| `/api/loans/:id` | `PATCH`| Authenticated | Update loan terms, status, interest, or profit sharing |
| `/api/loans/:id` | `DELETE`| Authenticated | Delete a loan agreement |
| `/api/transactions` | `GET` | Authenticated | Query ledger entries filtered by scope, type, or property |
| `/api/transactions` | `POST` | Authenticated | Log outflow, inflow receipt, loan flow, or transfer |
| `/api/transactions/:id`| `PATCH`| Authenticated | Full editing of historical transaction details |
| `/api/transactions/:id`| `DELETE`| Authenticated | Remove transaction and immediately recalculate liquidity |
| `/api/categories` | `GET` | Authenticated | List registered categories with financial role mappings |
| `/api/categories` | `POST` | Authenticated | Register dynamic custom category into zero-break engine |
| `/api/export/excel` | `GET` | Authenticated | Stream multi-tab `.xlsx` workbook with Loan sheet |
| `/api/export/pdf` | `GET` | Authenticated | Stream 7-page formatted `.pdf` executive statement |
| `/api/export/csv` | `GET` | Authenticated | Stream normalized accounting `.csv` with Loan Code |

---

## 4. AI Agent & Autonomous Pair Programming Directives

> [!IMPORTANT]
> **Directive for AI Coding Assistants**:
> When continuing development, fixing bugs, or adding features to this codebase, adhere strictly to the following architectural rules.

### A. Mathematical Formula Engine Rules
All business logic MUST mirror the formulas verified in [`tests/formulaEngine.test.ts`](file:///Users/abdulsamad/Documents/development/projects/VibeCoded/Real-estate-tracker/tests/formulaEngine.test.ts):
1. **Commercial Net Bank Liquidity**:
   $$\begin{aligned}
   \text{Net Bank} = &\ \text{Cap Injected (Bank)} - \text{Cap Returned (Bank)} - \text{Profit Drawn (Bank)} + \text{Sale Receipts (Bank)} - \text{Outflows (Bank)} \\
   &+ \text{Loan Borrowed (Bank)} - \text{Loan Repaid (Bank)} - \text{Loan Interest (Bank)} - \text{Loan Profit Share (Bank)} \pm \text{Transfers}
   \end{aligned}$$
2. **Commercial Net Cash Balance**:
   $$\begin{aligned}
   \text{Net Cash} = &\ \text{Cap Injected (Cash)} - \text{Cap Returned (Cash)} - \text{Profit Drawn (Cash)} + \text{Sale Receipts (Cash)} - \text{Outflows (Cash)} \\
   &+ \text{Loan Borrowed (Cash)} - \text{Loan Repaid (Cash)} - \text{Loan Interest (Cash)} - \text{Loan Profit Share (Cash)} \mp \text{Transfers}
   \end{aligned}$$
3. **Current Combined Net Liquidity**:
   $$\text{Net Liquidity} = \text{Net Bank Liquidity} + \text{Net Cash Balance}$$
4. **Outstanding Principal Debt**:
   $$\text{Total Outstanding Debt} = \max(0, \sum \text{Loan Borrowed} - \sum \text{Loan Repaid})$$
5. **Total Finance Costs Paid**:
   $$\text{Total Finance Costs} = \sum \text{Loan Interest Paid} + \sum \text{Loan Profit Share Paid}$$
6. **Total Project Outlay**:
   $$\text{Total Outlay} = \text{Agreed Purchase Price} + \text{Property Expenses}$$
7. **Pending Payable to Seller**:
   $$\text{Pending Outflow} = \max(0, \text{Agreed Purchase Price} - \text{Principal Paid So Far})$$
8. **Pending Buyer Receivable**:
   $$\text{Pending Inflow} = \max(0, \text{Agreed Selling Price} - \text{Sale Inflows Received})$$
9. **Realized Profit (Cost Recovery Model)**:
   $$\text{Realized Profit} = \begin{cases} \max(0, \text{Total Sale Receipts Collected} - \text{Total Project Outlay}) & \text{if status} \in \{\text{sold}, \text{closed}\} \\ 0 & \text{otherwise} \end{cases}$$
10. **Pending Uncollected Profit on Sold Deals**:
    $$\text{Pending Profit} = \begin{cases} \max(0, \text{Projected Profit} - \text{Realized Profit}) & \text{if status} \in \{\text{sold}, \text{closed}\} \\ 0 & \text{otherwise} \end{cases}$$
11. **Total Projected Pipeline Profit**:
    $$\text{Total Projected Profit} = \sum_{\text{status} \in \{\text{open}, \text{in\_progress}, \text{registered}\}} \text{Projected Profit}$$

### B. Zero-Break Financial Role Mapping
Whenever adding categories, assign one of the predefined `financialRole` types:
- `purchase_principal`: Outflow that directly reduces the pending consideration owed to the land seller.
- `property_expense`: Outflow for legal, stamp duty, fencing, or leveling. Increases Total Project Outlay without reducing the base seller payable.
- `sale_receipt`: Deal inflow from incoming buyer that reduces Pending Buyer Receivables.
- `capital_infusion`: External equity funding that injects business liquidity.
- `profit_withdrawal`: Profit / earnings drawn to fund external ventures or personal dividends (reduces available liquidity, retains base capital).
- `capital_withdrawal`: Invested capital refund / equity pool reduction (reduces both available liquidity and net retained capital).
- `loan_borrowing`: Debt financing inward that increases liquidity without increasing owner equity.
- `loan_repayment_principal`: Principal debt repayment reducing liquidity and outstanding loan liability.
- `loan_interest_charge`: Financing interest expense reducing liquidity.
- `loan_profit_share_charge`: Investor/lender profit bonus distribution reducing liquidity.
- `personal_milestone`: Outflow that completes a stage in personal asset construction.
- `personal_overhead`: Personal maintenance, GST, or registration charges.
- `internal_transfer`: Neutral net effect, shifting balances between Bank and Cash accounts.

### C. Multi-Tenant Data Scoping Directive
- Never execute database queries without filtering by `datasetId`:
  ```typescript
  const query = session.role === "super_admin" && queryDatasetId
    ? { datasetId: queryDatasetId }
    : { $or: [{ datasetId: session.datasetId }, { userId: session.userId }] };
  ```
- Super Admins can pass `?datasetId=all` or a specific dataset ID to switch context.
- Regular users must NEVER have access to other users' dataset identifiers.

### D. Design Aesthetics & UI Constraints
- **Theme**: Dark mode with **True Black (`#000000`) background**, `#0a0a0a` card surfaces, `#262626` borders, and `#FFFFFF` / `#E4E4E7` / `#D4D4D8` / `#A1A1AA` high-contrast text.
- **No Em Dashes**: Never use em dashes in user-facing copy or component titles.
- **Legibility Standard**: Do NOT use text sizes smaller than `text-xs` (12px). Body and form inputs must default to comfortable `text-sm` (14px).
- **Tabular Numerals**: Always wrap financial amounts in `font-mono` (`font-family: var(--font-jetbrains-mono)`).

---

## 📄 License & Confidentiality

**Confidential & Proprietary Commercial Software**.  
Designed & Developed by **Samad** for Indian Real Estate Asset Portfolio Operations.
