export type FinancialRole =
  | "purchase_principal"
  | "property_expense"
  | "sale_receipt"
  | "capital_infusion"
  | "internal_transfer"
  | "personal_milestone"
  | "personal_overhead";

export interface SeedProperty {
  id: string;
  type: "commercial" | "personal";
  propertyCode: string;
  name: string;
  location?: string;
  acquisitionDate: string;
  sqftArea?: number;
  ratePerSqft?: number;
  agreedPurchasePrice: number;
  targetSalePrice?: number;
  agreedSellingPrice?: number;
  status: "open" | "in_progress" | "registered" | "sold" | "closed";
  notes?: string;
  milestones?: {
    name: string;
    targetAmount?: number;
    paidAmount?: number;
    status: "pending" | "in_progress" | "completed";
  }[];
}

export interface SeedTransaction {
  id: string;
  scope: "commercial" | "personal";
  transactionType: "outflow" | "deal_inflow" | "capital_inflow" | "transfer";
  transCode?: string;
  propertyCode?: string;
  date: string;
  category: string;
  mode: "Bank" | "Cash";
  transferType?:
    | "Bank Withdrawal to Cash"
    | "Cash Deposit to Bank"
    | "Cash to Bank"
    | "Bank to Cash";
  amount: number;
  recipientOrSource?: string;
  remarks?: string;
}

export interface SeedCategory {
  name: string;
  scope: "commercial" | "personal" | "both";
  type: "outflow" | "inflow" | "transfer";
  financialRole: FinancialRole;
}

export const INITIAL_PROPERTIES: SeedProperty[] = [
  // Commercial Properties from Land_Business_Tracker.xlsx
  {
    id: "prop-1",
    type: "commercial",
    propertyCode: "LND-001",
    name: "Andal Avenue",
    location: "Andal Avenue Site",
    acquisitionDate: "2026-01-05",
    agreedPurchasePrice: 28500000,
    targetSalePrice: 33000000,
    agreedSellingPrice: 0,
    status: "in_progress",
    notes: "Prime commercial land parcel",
  },
  {
    id: "prop-2",
    type: "commercial",
    propertyCode: "LND-002",
    name: "Kalaimal Nagar",
    location: "Kalaimal Nagar",
    acquisitionDate: "2026-02-01",
    sqftArea: 1122,
    ratePerSqft: 9100,
    agreedPurchasePrice: 10210200,
    targetSalePrice: 13464000,
    agreedSellingPrice: 12150000,
    status: "sold",
    notes: "1122 sq.ft @ ₹9,100/sqft buy, ₹10,828/sqft agreed sale",
  },
  {
    id: "prop-3",
    type: "commercial",
    propertyCode: "LND-003",
    name: "K C Garden",
    location: "K C Garden",
    acquisitionDate: "2026-03-01",
    agreedPurchasePrice: 11635600,
    targetSalePrice: 0,
    agreedSellingPrice: 0,
    status: "open",
    notes: "Token advance paid",
  },
  {
    id: "prop-4",
    type: "commercial",
    propertyCode: "LND-004",
    name: "Plot 49 T v k Nagar",
    location: "T v k Nagar",
    acquisitionDate: "2026-08-03",
    agreedPurchasePrice: 0,
    targetSalePrice: 0,
    agreedSellingPrice: 0,
    status: "open",
    notes: "Advance paid to seller",
  },
  {
    id: "prop-5",
    type: "commercial",
    propertyCode: "LND-005",
    name: "Revathi Nagar",
    location: "Revathi Nagar",
    acquisitionDate: "2026-08-14",
    agreedPurchasePrice: 2673000,
    targetSalePrice: 3762000,
    agreedSellingPrice: 0,
    status: "registered",
    notes: "Sale deed amount transferred, stamp paper & advocate advance paid",
  },

  // Personal Properties from New Apartment Expense Tracker.xlsx + multi-property expansion
  {
    id: "prop-personal-1",
    type: "personal",
    propertyCode: "APT-001",
    name: "Luxury Residency 3BHK",
    location: "OMR, Chennai",
    acquisitionDate: "2026-09-08",
    agreedPurchasePrice: 8500000,
    status: "in_progress",
    notes: "Primary personal apartment purchase with milestone payments",
    milestones: [
      {
        name: "1. Booking Amount / Agreement",
        targetAmount: 200000,
        paidAmount: 200000,
        status: "completed",
      },
      {
        name: "2. Foundation / Plinth Completion",
        targetAmount: 1200000,
        paidAmount: 0,
        status: "pending",
      },
      {
        name: "3. Slab Completion",
        targetAmount: 1800000,
        paidAmount: 0,
        status: "pending",
      },
      {
        name: "4. Brickwork & Plastering",
        targetAmount: 1500000,
        paidAmount: 0,
        status: "pending",
      },
      {
        name: "5. Flooring & Fit-outs",
        targetAmount: 1800000,
        paidAmount: 0,
        status: "pending",
      },
      {
        name: "6. Possession & Stamp Duty",
        targetAmount: 2000000,
        paidAmount: 0,
        status: "pending",
      },
    ],
  },
];

export const INITIAL_TRANSACTIONS: SeedTransaction[] = [
  // Commercial Capital Inflows (External Funding)
  {
    id: "tx-inf-1",
    scope: "commercial",
    transactionType: "capital_inflow",
    transCode: "INF-001",
    date: "2026-01-01",
    category: "Bank Account Funding",
    mode: "Bank",
    amount: 4700000,
    recipientOrSource: "Villiv Bank Accounts",
    remarks: "Primary bank account funding",
  },
  {
    id: "tx-inf-2",
    scope: "commercial",
    transactionType: "capital_inflow",
    transCode: "INF-002",
    date: "2026-01-01",
    category: "Cash Deposit Funding",
    mode: "Bank",
    amount: 1000000,
    recipientOrSource: "Tiruv Cash 10L",
    remarks: "Cash deposited in bank on 9/6/25",
  },
  {
    id: "tx-inf-3",
    scope: "commercial",
    transactionType: "capital_inflow",
    transCode: "INF-003",
    date: "2026-02-15",
    category: "Business Loan",
    mode: "Bank",
    amount: 3500000,
    recipientOrSource: "Fil Loan cheque",
    remarks: "Additional expansion funds",
  },
  {
    id: "tx-inf-4",
    scope: "commercial",
    transactionType: "capital_inflow",
    transCode: "INF-004",
    date: "2026-02-20",
    category: "Bank Funding",
    mode: "Bank",
    amount: 250000,
    recipientOrSource: "Tiruv Bank",
    remarks: "1st Tranch",
  },
  {
    id: "tx-inf-5",
    scope: "commercial",
    transactionType: "capital_inflow",
    transCode: "INF-005",
    date: "2026-03-01",
    category: "Partner Investment",
    mode: "Bank",
    amount: 2900000,
    recipientOrSource: "Sakthi vinay Bank",
    remarks: "13L + 16L",
  },
  {
    id: "tx-inf-6",
    scope: "commercial",
    transactionType: "capital_inflow",
    transCode: "INF-006",
    date: "2026-03-01",
    category: "Partner Cash Funding",
    mode: "Cash",
    amount: 1450000,
    recipientOrSource: "Sakthi vinay Cash",
    remarks: "Cash injection",
  },
  {
    id: "tx-inf-7",
    scope: "commercial",
    transactionType: "capital_inflow",
    transCode: "INF-007",
    date: "2026-03-10",
    category: "Cash Funding",
    mode: "Cash",
    amount: 1000000,
    recipientOrSource: "Tiruv Cash 2",
    remarks: "While Registration",
  },
  {
    id: "tx-inf-8",
    scope: "commercial",
    transactionType: "capital_inflow",
    transCode: "INF-008",
    date: "2026-03-15",
    category: "Cash Funding",
    mode: "Cash",
    amount: 950000,
    recipientOrSource: "Kattan Cash",
    remarks: "Cash infusion",
  },
  {
    id: "tx-inf-9",
    scope: "commercial",
    transactionType: "capital_inflow",
    transCode: "INF-009",
    date: "2026-04-01",
    category: "Investment Exit",
    mode: "Bank",
    amount: 1600000,
    recipientOrSource: "Strata",
    remarks: "Jaipur Opportunity Exit",
  },
  {
    id: "tx-inf-10",
    scope: "commercial",
    transactionType: "capital_inflow",
    transCode: "INF-010",
    date: "2026-04-10",
    category: "Cash Funding",
    mode: "Cash",
    amount: 140000,
    recipientOrSource: "Kattan Cash",
    remarks: "15L - 50k comm - 11.90L cheq - 1.2L zohra tran",
  },

  // Commercial Internal Transfers (Bank <-> Cash conversions)
  {
    id: "tx-trf-1",
    scope: "commercial",
    transactionType: "transfer",
    transCode: "TRF-001",
    date: "2026-01-04",
    category: "Internal Liquidity Transfer",
    mode: "Bank",
    transferType: "Bank Withdrawal to Cash",
    amount: 500000,
    recipientOrSource: "Transferred to pallani and got cash",
    remarks: "Converted bank balance to cash in hand palani",
  },
  {
    id: "tx-trf-2",
    scope: "commercial",
    transactionType: "transfer",
    transCode: "TRF-002",
    date: "2026-02-18",
    category: "Internal Liquidity Transfer",
    mode: "Bank",
    transferType: "Bank Withdrawal to Cash",
    amount: 500000,
    recipientOrSource: "Transferred to kumar and got cash",
    remarks: "Converted bank balance to cash in hand kumar",
  },
  {
    id: "tx-trf-3",
    scope: "commercial",
    transactionType: "transfer",
    transCode: "TRF-003",
    date: "2026-03-01",
    category: "Internal Liquidity Transfer",
    mode: "Bank",
    transferType: "Bank Withdrawal to Cash",
    amount: 600000,
    recipientOrSource: "Transferred to sarathy and got cash",
    remarks: "Converted bank balance to cash in hand sarathy",
  },
  {
    id: "tx-trf-4",
    scope: "commercial",
    transactionType: "transfer",
    transCode: "TRF-004",
    date: "2026-08-12",
    category: "Internal Liquidity Transfer",
    mode: "Bank",
    transferType: "Bank Withdrawal to Cash",
    amount: 500000,
    recipientOrSource: "Cash withdraw from shenaaz Hdfc",
    remarks: "Cash withdrawn from HDFC account",
  },
  {
    id: "tx-trf-5",
    scope: "commercial",
    transactionType: "transfer",
    transCode: "TRF-005",
    date: "2026-08-12",
    category: "Internal Liquidity Transfer",
    mode: "Bank",
    transferType: "Bank Withdrawal to Cash",
    amount: 400000,
    recipientOrSource: "Cash withdrawn from yousuf Hdfc",
    remarks: "Cash withdrawn from HDFC account",
  },

  // Commercial Property Outflows
  {
    id: "tx-out-1",
    scope: "commercial",
    transactionType: "outflow",
    transCode: "OUT-001",
    propertyCode: "LND-001",
    date: "2026-01-05",
    category: "Purchase Advance",
    mode: "Bank",
    amount: 7000000,
    recipientOrSource: "Seller",
    remarks: "Advance payment to seller",
  },
  {
    id: "tx-out-2",
    scope: "commercial",
    transactionType: "outflow",
    transCode: "OUT-002",
    propertyCode: "LND-001",
    date: "2026-01-12",
    category: "Purchase Advance",
    mode: "Cash",
    amount: 3000000,
    recipientOrSource: "Seller",
    remarks: "Advance payment to seller",
  },
  {
    id: "tx-out-3",
    scope: "commercial",
    transactionType: "outflow",
    transCode: "OUT-003",
    propertyCode: "LND-001",
    date: "2026-01-15",
    category: "Legal & Docs",
    mode: "Cash",
    amount: 40000,
    recipientOrSource: "Lawyer",
    remarks: "Lawyer registration fee",
  },
  {
    id: "tx-out-4",
    scope: "commercial",
    transactionType: "outflow",
    transCode: "OUT-004",
    propertyCode: "LND-002",
    date: "2026-01-20",
    category: "Purchase Advance",
    mode: "Cash",
    amount: 1000000,
    recipientOrSource: "Seller",
    remarks: "Advance payment to seller",
  },
  {
    id: "tx-out-5",
    scope: "commercial",
    transactionType: "outflow",
    transCode: "OUT-005",
    propertyCode: "LND-002",
    date: "2026-01-20",
    category: "Legal & Docs",
    mode: "Bank",
    amount: 8500,
    recipientOrSource: "Stalin",
    remarks: "Stalin fees",
  },
  {
    id: "tx-out-6",
    scope: "commercial",
    transactionType: "outflow",
    transCode: "OUT-006",
    propertyCode: "LND-002",
    date: "2026-02-05",
    category: "Legal & Docs",
    mode: "Bank",
    amount: 20000,
    recipientOrSource: "Patta Authority",
    remarks: "Patta advance",
  },
  {
    id: "tx-out-7",
    scope: "commercial",
    transactionType: "outflow",
    transCode: "OUT-007",
    propertyCode: "LND-002",
    date: "2026-02-10",
    category: "Compounding/Fencing",
    mode: "Bank",
    amount: 11000,
    recipientOrSource: "Kothanda",
    remarks: "Kothanda fencing labour",
  },
  {
    id: "tx-out-8",
    scope: "commercial",
    transactionType: "outflow",
    transCode: "OUT-008",
    propertyCode: "LND-002",
    date: "2026-03-05",
    category: "Compounding/Fencing",
    mode: "Cash",
    amount: 6500,
    recipientOrSource: "Fencing vendor",
    remarks: "Fencing material",
  },
  {
    id: "tx-out-9",
    scope: "commercial",
    transactionType: "outflow",
    transCode: "OUT-009",
    propertyCode: "LND-004",
    date: "2026-08-03",
    category: "Purchase Advance",
    mode: "Bank",
    amount: 505001,
    recipientOrSource: "Seller",
    remarks: "Advance paid to seller",
  },
  {
    id: "tx-out-10",
    scope: "commercial",
    transactionType: "outflow",
    transCode: "OUT-010",
    propertyCode: "LND-003",
    date: "2026-08-05",
    category: "Purchase Advance",
    mode: "Bank",
    amount: 10001,
    recipientOrSource: "Seller",
    remarks: "Token advance to seller",
  },
  {
    id: "tx-out-11",
    scope: "commercial",
    transactionType: "outflow",
    transCode: "OUT-011",
    propertyCode: "LND-005",
    date: "2026-08-12",
    category: "Purchase Installment",
    mode: "Bank",
    amount: 871200,
    recipientOrSource: "Seller",
    remarks: "Sale deed amount Transf to seller",
  },
  {
    id: "tx-out-12",
    scope: "commercial",
    transactionType: "outflow",
    transCode: "OUT-012",
    propertyCode: "LND-005",
    date: "2026-08-12",
    category: "Legal & Docs",
    mode: "Bank",
    amount: 90000,
    recipientOrSource: "Advocate & Sub-Registrar",
    remarks: "Stamp paper and advocate advance",
  },
  {
    id: "tx-out-13",
    scope: "commercial",
    transactionType: "outflow",
    transCode: "OUT-013",
    propertyCode: "LND-005",
    date: "2026-08-09",
    category: "Purchase Advance",
    mode: "Bank",
    amount: 10001,
    recipientOrSource: "Seller",
    remarks: "Token advance to seller",
  },

  // Personal Inflows & Outflows
  {
    id: "tx-pers-inf-1",
    scope: "personal",
    transactionType: "capital_inflow",
    date: "2026-09-08",
    category: "Personal Savings",
    mode: "Bank",
    amount: 342000,
    recipientOrSource: "HDFC FIL Account",
    remarks: "Shenaaz HDFC FIL 11.9L - wint 8.5L",
  },
  {
    id: "tx-pers-out-1",
    scope: "personal",
    transactionType: "outflow",
    propertyCode: "APT-001",
    date: "2026-09-08",
    category: "Booking Amount / Agreement",
    mode: "Bank",
    amount: 100000,
    recipientOrSource: "Builder Escrow",
    remarks: "Booking Advance part 1",
  },
  {
    id: "tx-pers-out-2",
    scope: "personal",
    transactionType: "outflow",
    propertyCode: "APT-001",
    date: "2026-10-08",
    category: "Booking Amount / Agreement",
    mode: "Bank",
    amount: 100000,
    recipientOrSource: "Builder Escrow",
    remarks: "Booking Advance part 2",
  },
];

export const INITIAL_CATEGORIES: SeedCategory[] = [
  // 1. Direct Purchase Consideration (Paid to Seller)
  {
    name: "Purchase Advance",
    scope: "commercial",
    type: "outflow",
    financialRole: "purchase_principal",
  },
  {
    name: "Token Advance / EMD",
    scope: "commercial",
    type: "outflow",
    financialRole: "purchase_principal",
  },
  {
    name: "Sale Agreement Advance",
    scope: "commercial",
    type: "outflow",
    financialRole: "purchase_principal",
  },
  {
    name: "Purchase Installment",
    scope: "commercial",
    type: "outflow",
    financialRole: "purchase_principal",
  },
  {
    name: "Final Sale Deed Consideration",
    scope: "commercial",
    type: "outflow",
    financialRole: "purchase_principal",
  },

  // 2. Statutory, Stamp Duty & Registration Expenses
  {
    name: "Sub-Registrar Stamp Duty (7%)",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },
  {
    name: "Registration Fee & Surcharge (4%)",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },
  {
    name: "Patta / Chitta Transfer & Mutation",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },
  {
    name: "Legal & Docs",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },
  {
    name: "Document Writer & Stamp Paper",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },
  {
    name: "Encumbrance Certificate (EC 30-Yr Search)",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },

  // 3. Approvals, DTCP / CMDA & Regulatory Levies
  {
    name: "DTCP / CMDA Layout Scrutiny Fees",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },
  {
    name: "Open Space Reservation (OSR) Charges",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },
  {
    name: "Panchayat Union Development NOC",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },
  {
    name: "Agricultural to Non-Agri Conversion Tax",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },
  {
    name: "RERA Project Registration Fee",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },

  // 4. Legal Due Diligence & Professional Fees
  {
    name: "Advocate Title Opinion & Verification",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },
  {
    name: "Court Dispute / Vakalat Clearance",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },
  {
    name: "CA & Auditor Tax Consulting",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },

  // 5. Site Survey, Boundary Protection & Development
  {
    name: "Land Surveyor & FMB Sketch Verification",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },
  {
    name: "Boundary Stone Fixing & Peg Marking",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },
  {
    name: "Compounding/Fencing",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },
  {
    name: "Earth Filling & JCB Leveling",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },
  {
    name: "Tree Clearing & De-weeding",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },

  // 6. Utilities & Infrastructure
  {
    name: "TANGEDCO EB Line & Transformer Setup",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },
  {
    name: "Borewell Drilling & Motor Pump",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },
  {
    name: "Road Formation & Culvert Works",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },
  {
    name: "Stormwater Drainage Line",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },

  // 7. Brokerage & Community Liaisoning
  {
    name: "Brokerage / Agent Commission",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },
  {
    name: "VAO & Revenue Liaisoning",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },
  {
    name: "Local Panchayat Liaisoning",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },
  {
    name: "Miscellaneous Site Expense",
    scope: "commercial",
    type: "outflow",
    financialRole: "property_expense",
  },

  // 8. Commercial Deal Inflows (Buyer Receipts)
  {
    name: "Booking Token",
    scope: "commercial",
    type: "inflow",
    financialRole: "sale_receipt",
  },
  {
    name: "Sale Installment",
    scope: "commercial",
    type: "inflow",
    financialRole: "sale_receipt",
  },
  {
    name: "Final Settlement",
    scope: "commercial",
    type: "inflow",
    financialRole: "sale_receipt",
  },

  // 9. Personal Milestone & Construction Categories
  {
    name: "Booking Amount / Agreement",
    scope: "personal",
    type: "outflow",
    financialRole: "personal_milestone",
  },
  {
    name: "Foundation / Plinth Completion",
    scope: "personal",
    type: "outflow",
    financialRole: "personal_milestone",
  },
  {
    name: "Slab Completion",
    scope: "personal",
    type: "outflow",
    financialRole: "personal_milestone",
  },
  {
    name: "Brickwork & Plastering",
    scope: "personal",
    type: "outflow",
    financialRole: "personal_milestone",
  },
  {
    name: "Flooring & Fit-outs",
    scope: "personal",
    type: "outflow",
    financialRole: "personal_milestone",
  },
  {
    name: "Possession / Handover",
    scope: "personal",
    type: "outflow",
    financialRole: "personal_milestone",
  },
  {
    name: "Stamp Duty & Registration",
    scope: "personal",
    type: "outflow",
    financialRole: "personal_overhead",
  },
  {
    name: "GST (Goods & Services Tax)",
    scope: "personal",
    type: "outflow",
    financialRole: "personal_overhead",
  },
  {
    name: "Floor Rise Charges",
    scope: "personal",
    type: "outflow",
    financialRole: "personal_overhead",
  },
  {
    name: "Clubhouse & Amenities Fees",
    scope: "personal",
    type: "outflow",
    financialRole: "personal_overhead",
  },
  {
    name: "Parking Fees",
    scope: "personal",
    type: "outflow",
    financialRole: "personal_overhead",
  },
  {
    name: "Corpus Fund",
    scope: "personal",
    type: "outflow",
    financialRole: "personal_overhead",
  },
];

export const INITIAL_ACCOUNT_BALANCES = [
  { name: "shen coin balanced", balance: 255000, type: "investment" },
  { name: "Yousuf coin balanced", balance: 300000, type: "investment" },
  { name: "shen vested", balance: 135000, type: "investment" },
  { name: "zohra fixed deposit", balance: 1100000, type: "deposit" },
  { name: "zohra icici", balance: 80000, type: "bank" },
  { name: "Radiance deposit", balance: 200000, type: "deposit" },
  { name: "Samad Kotak", balance: 700000, type: "bank" },
  { name: "Yousuf coin", balance: 122000, type: "investment" },
  { name: "Cash in hand", balance: 2000000, type: "cash" },
];

/**
 * Synthetic Random Filler Data for Unauthenticated / Demo Guest Exploration.
 * Completely isolated from real production client records.
 */
export const DEMO_FILLER_PROPERTIES: SeedProperty[] = [
  {
    id: "demo-prop-1",
    type: "commercial",
    propertyCode: "DEMO-LND-01",
    name: "Sample Greenfield Layout",
    location: "Demo Industrial Corridor, Zone 4",
    acquisitionDate: "2026-03-10",
    sqftArea: 12000,
    ratePerSqft: 2500,
    agreedPurchasePrice: 30000000,
    targetSalePrice: 42000000,
    agreedSellingPrice: 39000000,
    status: "in_progress",
    notes: "Synthetic sample commercial land layout for demo inspection",
  },
  {
    id: "demo-prop-2",
    type: "commercial",
    propertyCode: "DEMO-LND-02",
    name: "Sample Highway Commercial Parcel",
    location: "Demo Ring Road Bypass",
    acquisitionDate: "2026-05-15",
    sqftArea: 4800,
    ratePerSqft: 3500,
    agreedPurchasePrice: 16800000,
    targetSalePrice: 24000000,
    agreedSellingPrice: 0,
    status: "open",
    notes: "Synthetic sample parcel for sandbox preview",
  },
  {
    id: "demo-prop-3",
    type: "personal",
    propertyCode: "DEMO-APT-01",
    name: "Sample Skyview Heights 3BHK",
    location: "Demo City Central",
    acquisitionDate: "2026-04-01",
    agreedPurchasePrice: 9500000,
    status: "in_progress",
    notes: "Synthetic sample apartment for personal mode inspection",
    milestones: [
      { name: "1. Agreement & Booking Token", targetAmount: 500000, paidAmount: 500000, status: "completed" },
      { name: "2. Plinth & Foundation Level", targetAmount: 2000000, paidAmount: 2000000, status: "completed" },
      { name: "3. 5th Floor Slab Casting", targetAmount: 2500000, paidAmount: 0, status: "pending" },
      { name: "4. Brickwork & Finishing", targetAmount: 2500000, paidAmount: 0, status: "pending" },
      { name: "5. Handover & Registration", targetAmount: 2000000, paidAmount: 0, status: "pending" },
    ],
  },
];

export const DEMO_FILLER_TRANSACTIONS: SeedTransaction[] = [
  {
    id: "demo-tx-1",
    scope: "commercial",
    transactionType: "capital_inflow",
    transCode: "DEMO-INF-01",
    date: "2026-03-01",
    category: "Bank Account Funding",
    mode: "Bank",
    amount: 15000000,
    recipientOrSource: "Demo Capital Account",
    remarks: "Sample external funding injection for demo preview",
  },
  {
    id: "demo-tx-2",
    scope: "commercial",
    transactionType: "capital_inflow",
    transCode: "DEMO-INF-02",
    date: "2026-03-05",
    category: "Partner Cash Funding",
    mode: "Cash",
    amount: 5000000,
    recipientOrSource: "Demo Partner Inward",
    remarks: "Sample cash liquidity for demo preview",
  },
  {
    id: "demo-tx-3",
    scope: "commercial",
    transactionType: "outflow",
    transCode: "DEMO-OUT-01",
    propertyCode: "DEMO-LND-01",
    date: "2026-03-10",
    category: "Purchase Advance",
    mode: "Bank",
    amount: 8000000,
    recipientOrSource: "Demo Seller Escrow",
    remarks: "Sample token payment for demonstration",
  },
  {
    id: "demo-tx-4",
    scope: "commercial",
    transactionType: "outflow",
    transCode: "DEMO-OUT-02",
    propertyCode: "DEMO-LND-01",
    date: "2026-03-12",
    category: "Legal & Docs",
    mode: "Cash",
    amount: 75000,
    recipientOrSource: "Demo Legal Counsel",
    remarks: "Sample title documentation expense",
  },
  {
    id: "demo-tx-5",
    scope: "commercial",
    transactionType: "deal_inflow",
    transCode: "DEMO-REC-01",
    propertyCode: "DEMO-LND-01",
    date: "2026-06-20",
    category: "Booking Token",
    mode: "Bank",
    amount: 5000000,
    recipientOrSource: "Demo Buyer Escrow",
    remarks: "Sample buyer receipt collection",
  },
  {
    id: "demo-tx-6",
    scope: "personal",
    transactionType: "capital_inflow",
    date: "2026-04-01",
    category: "Personal Savings",
    mode: "Bank",
    amount: 3500000,
    recipientOrSource: "Demo Personal Account",
    remarks: "Sample personal income allocation",
  },
  {
    id: "demo-tx-7",
    scope: "personal",
    transactionType: "outflow",
    propertyCode: "DEMO-APT-01",
    date: "2026-04-01",
    category: "Booking Amount / Agreement",
    mode: "Bank",
    amount: 2500000,
    recipientOrSource: "Demo Developer Account",
    remarks: "Sample apartment milestone installment",
  },
];

