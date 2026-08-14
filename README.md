# Avaniya — Indian Real Estate & Land Business Asset Tracker

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
   - [The 4-Price Valuation Matrix](#b-the-4-price-valuation-matrix)
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

### B. The 4-Price Valuation Matrix
Every commercial deal card displays four distinct financial metrics:
1. **1. Agreed Buy Price**: The baseline consideration agreed with the original land seller.
2. **2. Property Expenses**: Total spent on legal verification, stamp duty, registration, DTCP scrutiny, boundary fencing, and earth leveling (can exceed the buy price).
3. **3. Target Sale Exit**: Target valuation if sold at projected market rates.
4. **4. Agreed Selling Price**: The finalized contract price with the incoming buyer.
- **Total Project Outlay**: `Agreed Buy Price + Property Expenses`
- **Projected Profit**: `Agreed Selling Price - Total Project Outlay`

### C. Recording Outflows, Inflows & Transfers
Click **Record Outflow** or **Add Inflow** from the header:
- **Live Indian Verbal Summary**: As you type numbers (e.g. `12500000`), the converter displays `₹ 1.25 Crores / 125.00 Lakhs` to eliminate zero-counting errors.
- **Preset Chips**: Click buttons like `+10k`, `+1L`, `+5L`, `+50L`, `+1Cr` to increment amounts instantly.
- **Payment Mode**: Toggle between **Bank** (NEFT/RTGS/Cheque) and **Cash in Hand**.
- **Internal Transfers**: Move liquidity between Bank and Cash without distorting P&L profits.

### D. Editing Properties & Managing Milestones
- Click the **Pencil icon (✏️)** on any property card or inside the Property Ledger to edit any parameter: name, location, survey number, square feet area, rate per sq.ft, status, or legal verification notes.
- In Personal mode, manage stage milestones (e.g., *Booking Amount*, *Plinth Completion*, *Slab Casting*, *Plastering*, *Handover*) and check them off as work finishes.

### E. Multi-Format Exports (Excel, PDF, CSV)
Click **Export** in the top bar to generate offline files:
- **Multi-Tab Excel (`.xlsx`)**: Interactive spreadsheet containing `Dashboard`, `Land_Master`, `Outflows`, `Deal_Inflows`, `Capital_Inflows`, and `Transfers` with live `SUMIFS` formulas and formatted INR numbers.
- **Executive Statement (`.pdf`)**: Print-ready executive overview of all deals and liquidity balances.
- **Normalized Ledger (`.csv`)**: Clean CSV ready for import into Tally or accountant software.

### F. Session Security, Inactivity Timeout & Sign Out
- **Auto-Logout on Idle**: If the tab remains inactive for 30 minutes, you will be logged out automatically.
- **Swipe / Back Button Protection**: Swiping back on mobile or pressing the browser back button prompts a logout confirmation modal to prevent accidental session termination.

---

## 3. Developer & DevOps Engineering Guide

### A. Architecture & Tech Stack
- **Framework**: Next.js 15 (App Router, Server Components & Route Handlers)
- **Language**: TypeScript 5 (Strict types, zero `any`, discriminated unions)
- **Styling**: Tailwind CSS (True Black `#000000` baseline, high-contrast zinc tokens)
- **Typography**: IBM Plex Sans (Body) + JetBrains Mono (Financial Tabular Digits) via `next/font/google`
- **Database**: MongoDB Atlas Cluster (M0 Free Tier, `ap-south-1` Mumbai) via Mongoose connection caching
- **Fallback Engine**: In-memory database mirror (`memProperties`, `memTransactions`, `memCategories`) ensures zero runtime downtime if the database connection drops.
- **Authentication**: Stateless JSON Web Tokens (JWT) stored in HTTP-only Secure Cookies with 12-hour expiration and bcrypt password hashing.

### B. Project Directory Structure
```
Real-estate-tracker/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/users/route.ts       # Super admin user & dataset provisioning
│   │   │   ├── auth/                      # login, register, me, logout endpoints
│   │   │   ├── categories/route.ts        # Dynamic category CRUD
│   │   │   ├── export/                    # excel, pdf, csv export generators
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
│   │   └── modals/                        # EditProperty, NewProperty, QuickEntry, Category, Export
│   ├── lib/
│   │   ├── auth.ts                        # JWT issue, verify, cookie extraction
│   │   ├── dataStore.ts                   # Unified Mongoose & in-memory data access layer
│   │   ├── db.ts                          # MongoDB Atlas pooled Mongoose connector
│   │   ├── formatters.ts                  # formatINR, verbal converter, dates
│   │   ├── formulaEngine.ts               # Core spreadsheet SUMIFS math engine
│   │   ├── passwordGenerator.ts           # 15-character secure password algorithm
│   │   └── seedData.ts                    # Default commercial & personal datasets
│   └── models/                            # Mongoose Schemas: User, Property, Transaction, Category
├── scripts/
│   └── migrateToMongo.ts                  # Standalone CLI multi-tenant seed & migration runner
├── tests/
│   └── formulaEngine.test.ts              # Mathematical unit test suite
└── README.md                              # This document
```

### C. Environment Variables Configuration
Create a `.env.local` file in the project root:
```bash
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/real_estate_tracker?retryWrites=true&w=majority

# JWT Secret for Session Signing
JWT_SECRET=your-production-secret-key-at-least-32-chars-long
```

> [!NOTE]
> When configuring `MONGODB_URI` on Vercel or locally, do NOT enclose the connection string in double quotes if it causes parsing errors. Ensure the URI begins with `mongodb://` or `mongodb+srv://`.

### D. MongoDB Atlas Multi-Tenant Migration
To seed MongoDB Atlas with the standard multi-tenant datasets (including Super Admin, Mohammed Yousuf Portfolio, and Fresh User):
```bash
npm run migrate
```
This script executes [`scripts/migrateToMongo.ts`](file:///Users/abdulsamad/Documents/development/projects/VibeCoded/Real-estate-tracker/scripts/migrateToMongo.ts) using `tsx`.

### E. Local Development & Build Verification
```bash
# 1. Install dependencies
npm install

# 2. Run mathematical unit tests
npx tsx tests/formulaEngine.test.ts

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
| `/api/admin/users` | `GET` | `super_admin` | List all platform tenants, properties & transaction counts |
| `/api/admin/users` | `POST` | `super_admin` | Provision new client with autogenerated 15-char password |
| `/api/admin/users` | `PUT` | `super_admin` | Reset user password to a new 15-character secure string |
| `/api/admin/users` | `DELETE`| `super_admin` | Delete tenant user account |
| `/api/properties` | `GET` | Authenticated | List properties scoped to caller's `datasetId` |
| `/api/properties` | `POST` | Authenticated | Create a new commercial or personal property |
| `/api/properties/:id` | `PATCH`| Authenticated | Update valuations, status, notes, or milestones |
| `/api/transactions` | `GET` | Authenticated | Query ledger entries filtered by scope, type, or property |
| `/api/transactions` | `POST` | Authenticated | Log outflow, inflow receipt, or bank-to-cash transfer |
| `/api/categories` | `GET` | Authenticated | List registered categories with financial role mappings |
| `/api/export/excel` | `GET` | Authenticated | Stream multi-tab `.xlsx` workbook |
| `/api/export/pdf` | `GET` | Authenticated | Stream formatted `.pdf` statement |
| `/api/export/csv` | `GET` | Authenticated | Stream normalized accounting `.csv` |

---

## 4. AI Agent & Autonomous Pair Programming Directives

> [!IMPORTANT]
> **Directive for AI Coding Assistants**:
> When continuing development, fixing bugs, or adding features to this codebase, adhere strictly to the following architectural rules.

### A. Mathematical Formula Engine Rules
All business logic MUST mirror the formulas verified in [`tests/formulaEngine.test.ts`](file:///Users/abdulsamad/Documents/development/projects/VibeCoded/Real-estate-tracker/tests/formulaEngine.test.ts):
1. **Commercial Net Bank Liquidity**:
   $$\text{Net Bank} = \text{Capital Inflows (Bank)} + \text{Deal Inflows (Bank)} - \text{Outflows (Bank)} - \text{Transfers (Bank to Cash)}$$
2. **Commercial Net Cash Balance**:
   $$\text{Net Cash} = \text{Capital Inflows (Cash)} + \text{Deal Inflows (Cash)} + \text{Transfers (Bank to Cash)} - \text{Outflows (Cash)}$$
3. **Current Combined Liquidity**:
   $$\text{Net Liquidity} = \text{Net Bank Liquidity} + \text{Net Cash Balance}$$
4. **Total Project Outlay**:
   $$\text{Total Outlay} = \text{Agreed Purchase Price} + \text{Property Expenses}$$
5. **Pending Payable to Seller**:
   $$\text{Pending Outflow} = \max(0, \text{Agreed Purchase Price} - \text{Principal Paid So Far})$$
6. **Pending Buyer Receivable**:
   $$\text{Pending Inflow} = \max(0, \text{Agreed Selling Price} - \text{Sale Inflows Received})$$

### B. Zero-Break Financial Role Mapping
Whenever adding categories, assign one of the 7 predefined `financialRole` types:
- `purchase_principal`: Outflow that directly reduces the pending consideration owed to the land seller.
- `property_expense`: Outflow for legal, stamp duty, fencing, or leveling. Increases Total Project Outlay without reducing the base seller payable.
- `sale_receipt`: Deal inflow from incoming buyer that reduces Pending Buyer Receivables.
- `capital_infusion`: External equity funding that injects business liquidity.
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
- **No Em Dashes**: Never use em dashes (`—`) in user-facing copy or component titles.
- **Legibility Standard**: Do NOT use text sizes smaller than `text-xs` (12px). Body and form inputs must default to comfortable `text-sm` (14px).
- **Tabular Numerals**: Always wrap financial amounts in `font-mono` (`font-family: var(--font-jetbrains-mono)`).

---

## 📄 License & Confidentiality

**Confidential & Proprietary Commercial Software**.  
Designed & Developed by **Samad** for Indian Real Estate Asset Portfolio Operations.
