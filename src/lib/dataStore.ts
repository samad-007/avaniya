import mongoose from "mongoose";
import { connectDB, getSanitizedMongoUri, resetConnectionCache } from "./db";
import { Property, IProperty } from "../models/Property";
import { Transaction, ITransaction } from "../models/Transaction";
import { Category, ICategory } from "../models/Category";
import { Loan, ILoan } from "../models/Loan";
import { AccountBalance, IAccountBalance } from "../models/AccountBalance";
import {
  INITIAL_PROPERTIES,
  INITIAL_TRANSACTIONS,
  INITIAL_CATEGORIES,
  INITIAL_LOANS,
  INITIAL_ACCOUNT_BALANCES,
  DEMO_FILLER_PROPERTIES,
  DEMO_FILLER_TRANSACTIONS,
  DEMO_FILLER_LOANS,
  SeedProperty,
  SeedTransaction,
  SeedCategory,
  SeedLoan,
} from "./seedData";
import {
  calculateCommercialMetrics,
  calculatePersonalMetrics,
  CommercialDashboardMetrics,
  PersonalDashboardMetrics,
} from "./formulaEngine";

// Memory fallback store for edge preview & initial onboarding
let memProperties: (SeedProperty & { datasetId?: string })[] = [
  ...INITIAL_PROPERTIES.map((p) => ({ ...p, datasetId: "ds_yousuf_portfolio" })),
];
let memTransactions: (SeedTransaction & { datasetId?: string })[] = [
  ...INITIAL_TRANSACTIONS.map((t) => ({ ...t, datasetId: "ds_yousuf_portfolio" })),
];
let memCategories: (SeedCategory & { datasetId?: string })[] = [
  ...INITIAL_CATEGORIES.map((c) => ({ ...c, datasetId: "ds_yousuf_portfolio" })),
];
let memLoans: (SeedLoan & { datasetId?: string })[] = [
  ...INITIAL_LOANS.map((l) => ({ ...l, datasetId: "ds_yousuf_portfolio" })),
];
let memAccountBalances = [...INITIAL_ACCOUNT_BALANCES];

/**
 * Ensure MongoDB connection is active when MONGODB_URI is present.
 * Auto-retries on transient connection delay or socket recovery with exponential backoff.
 */
export async function ensureDB(retries = 2): Promise<boolean> {
  const uri = getSanitizedMongoUri();
  if (!uri) return false;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const conn = await connectDB();
      if (conn && conn.connection.readyState === 1) {
        return true;
      }
      if (conn && conn.connection.readyState === 2) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        if ((conn.connection.readyState as number) === 1) {
          return true;
        }
      }
    } catch (err) {
      if (attempt === retries) {
        console.error("ensureDB failed after retries:", err);
        throw err;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, 300 * Math.pow(2, attempt))
      );
    }
  }

  return false;
}

/**
 * Executes a database operation with automatic retry on transient connection drops.
 */
async function withDBRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 1
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const dbOk = await ensureDB();
      if (!dbOk) {
        throw new Error("MongoDB database is not connected.");
      }
      return await operation();
    } catch (err: unknown) {
      lastError = err;
      const isNetworkErr =
        err instanceof Error &&
        (err.name === "MongoNetworkError" ||
          err.name === "MongoServerSelectionError" ||
          err.message.toLowerCase().includes("connection closed") ||
          err.message.toLowerCase().includes("topology was destroyed") ||
          err.message.toLowerCase().includes("econnreset") ||
          err.message.toLowerCase().includes("not connected") ||
          err.message.toLowerCase().includes("socket timeout") ||
          err.message.toLowerCase().includes("timed out"));

      if (attempt < maxRetries && isNetworkErr) {
        console.warn(
          `Transient DB operation failure (attempt ${attempt + 1}), resetting cache and retrying...`,
          err
        );
        resetConnectionCache();
        await new Promise((resolve) => setTimeout(resolve, 350));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

/**
 * Get all properties filtered strictly by dataset ID (or user ID)
 */
export async function getProperties(
  datasetId: string = "ds_yousuf_portfolio",
  scope?: "commercial" | "personal",
  isSuperAdminAll: boolean = false
): Promise<SeedProperty[]> {
  // Demo Sandbox Guest Mode: Always return synthetic mock filler properties
  if (datasetId === "ds_demo_sandbox") {
    return scope
      ? DEMO_FILLER_PROPERTIES.filter((p) => p.type === scope)
      : DEMO_FILLER_PROPERTIES;
  }
  const dbOk = await ensureDB();
  if (dbOk) {
    const query: Record<string, unknown> = {};
    if (!isSuperAdminAll) {
      query.$or = [{ datasetId }, { userId: datasetId }];
    }
    if (scope) query.type = scope;

    const docs = await Property.find(query).lean<{ _id: unknown } & IProperty[]>();
    if (docs) {
      return (docs as unknown as ({ _id: { toString: () => string } } & IProperty)[]).map((d) => ({
        id: d._id.toString(),
        type: d.type,
        propertyCode: d.propertyCode,
        name: d.name,
        location: d.location,
        acquisitionDate: d.acquisitionDate
          ? new Date(d.acquisitionDate).toISOString().split("T")[0]
          : "",
        sqftArea: d.sqftArea,
        ratePerSqft: d.ratePerSqft,
        agreedPurchasePrice: d.agreedPurchasePrice,
        targetSalePrice: d.targetSalePrice,
        agreedSellingPrice: d.agreedSellingPrice,
        status: d.status,
        milestones: d.milestones,
        agreementDueDate: d.agreementDueDate
          ? new Date(d.agreementDueDate).toISOString().split("T")[0]
          : undefined,
        targetSettlementDate: d.targetSettlementDate
          ? new Date(d.targetSettlementDate).toISOString().split("T")[0]
          : undefined,
        attachmentUrl: d.attachmentUrl,
        subPlots: d.subPlots,
        partners: d.partners,
        notes: d.notes,
      }));
    }
    return [];
  }

  // Memory fallback only active in offline environments without MONGODB_URI
  let list = isSuperAdminAll
    ? memProperties
    : memProperties.filter((p) => p.datasetId === datasetId || !datasetId);
  return scope ? list.filter((p) => p.type === scope) : list;
}

/**
 * Get a specific property by code or ID
 */
export async function getPropertyByCode(
  propertyCode: string,
  datasetId: string = "ds_yousuf_portfolio"
): Promise<SeedProperty | null> {
  const props = await getProperties(datasetId);
  return (
    props.find(
      (p) =>
        p.propertyCode.toLowerCase() === propertyCode.toLowerCase() ||
        p.id === propertyCode
    ) || null
  );
}

/**
 * Add a new property mapped to the user's isolated dataset
 */
export async function addProperty(
  data: Omit<SeedProperty, "id" | "propertyCode"> & { propertyCode?: string },
  datasetId: string = "ds_yousuf_portfolio",
  userId: string = "user_default"
): Promise<SeedProperty> {
  const uri = getSanitizedMongoUri();
  if (uri && datasetId !== "ds_demo_sandbox") {
    return await withDBRetry(async () => {
      let propertyCode = data.propertyCode;
      if (!propertyCode) {
        const count = await Property.countDocuments({
          $or: [{ datasetId }, { userId: datasetId }],
          type: data.type,
        });
        const prefix = data.type === "commercial" ? "LND" : "APT";
        propertyCode = `${prefix}-${String(count + 1).padStart(3, "0")}`;
        const existing = await Property.findOne({ propertyCode });
        if (existing) {
          propertyCode = `${prefix}-${Date.now().toString().slice(-4)}`;
        }
      }

      const dbPayload = {
        ...data,
        propertyCode,
        userId,
        datasetId,
      };
      const doc = await Property.create(dbPayload);
      const newProp: SeedProperty = {
        ...data,
        id: doc._id.toString(),
        propertyCode,
      };
      memProperties.push({ ...newProp, datasetId });
      return newProp;
    });
  }

  if (datasetId === "ds_demo_sandbox" || !uri) {
    const newProp: SeedProperty & { datasetId: string } = {
      ...data,
      id: `prop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      datasetId,
      propertyCode:
        data.propertyCode ||
        (data.type === "commercial"
          ? `LND-${String(memProperties.length + 1).padStart(3, "0")}`
          : `APT-${String(memProperties.length + 1).padStart(3, "0")}`),
    };
    memProperties.push(newProp);
    return newProp;
  }

  throw new Error(
    "MongoDB database is not connected. Property was not saved."
  );
}

/**
 * Update property details within dataset
 */
export async function updateProperty(
  propertyCodeOrId: string,
  updates: Partial<SeedProperty>,
  datasetId: string = "ds_yousuf_portfolio"
): Promise<SeedProperty | null> {
  const uri = getSanitizedMongoUri();
  if (uri && datasetId !== "ds_demo_sandbox") {
    return await withDBRetry(async () => {
      const query: Record<string, unknown> = {
        $or: [
          { propertyCode: propertyCodeOrId },
          { _id: mongoose.isValidObjectId(propertyCodeOrId) ? propertyCodeOrId : null },
        ],
      };
      if (datasetId && datasetId !== "all") {
        query.$and = [{ $or: [{ datasetId }, { userId: datasetId }] }];
      }

      const updated = await Property.findOneAndUpdate(
        query,
        { $set: updates },
        { new: true }
      ).lean<IProperty & { _id: unknown }>();

      if (updated) {
        const mapped: SeedProperty = {
          id: updated._id.toString(),
          type: updated.type,
          propertyCode: updated.propertyCode,
          name: updated.name,
          location: updated.location,
          acquisitionDate: updated.acquisitionDate
            ? new Date(updated.acquisitionDate).toISOString().split("T")[0]
            : "",
          sqftArea: updated.sqftArea,
          ratePerSqft: updated.ratePerSqft,
          agreedPurchasePrice: updated.agreedPurchasePrice,
          targetSalePrice: updated.targetSalePrice,
          agreedSellingPrice: updated.agreedSellingPrice,
          status: updated.status,
          milestones: updated.milestones,
          agreementDueDate: updated.agreementDueDate
            ? new Date(updated.agreementDueDate).toISOString().split("T")[0]
            : undefined,
          targetSettlementDate: updated.targetSettlementDate
            ? new Date(updated.targetSettlementDate).toISOString().split("T")[0]
            : undefined,
          attachmentUrl: updated.attachmentUrl,
          subPlots: updated.subPlots,
          partners: updated.partners,
          notes: updated.notes,
        };

        const idx = memProperties.findIndex(
          (p) =>
            p.propertyCode.toLowerCase() === propertyCodeOrId.toLowerCase() ||
            p.id === propertyCodeOrId
        );
        if (idx !== -1) {
          memProperties[idx] = { ...memProperties[idx], ...updates, id: mapped.id };
        }
        return mapped;
      }
      return null;
    });
  }

  if (datasetId === "ds_demo_sandbox" || !uri) {
    const idx = memProperties.findIndex(
      (p) =>
        p.propertyCode.toLowerCase() === propertyCodeOrId.toLowerCase() ||
        p.id === propertyCodeOrId
    );
    if (idx !== -1) {
      memProperties[idx] = { ...memProperties[idx], ...updates };
      return memProperties[idx];
    }
    return null;
  }

  throw new Error(
    "MongoDB database is not connected. Property was not updated."
  );
}

/**
 * Get transactions filtered strictly by dataset ID
 */
export async function getTransactions(
  datasetId: string = "ds_yousuf_portfolio",
  filter?: { scope?: string; propertyCode?: string; type?: string },
  isSuperAdminAll: boolean = false
): Promise<SeedTransaction[]> {
  // Demo Sandbox Guest Mode: Always return synthetic mock filler transactions
  if (datasetId === "ds_demo_sandbox") {
    let demoList = [...DEMO_FILLER_TRANSACTIONS];
    if (filter?.scope) demoList = demoList.filter((t) => t.scope === filter.scope);
    if (filter?.propertyCode)
      demoList = demoList.filter((t) => t.propertyCode === filter.propertyCode);
    if (filter?.type)
      demoList = demoList.filter((t) => t.transactionType === filter.type);
    return demoList.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  const dbOk = await ensureDB();
  if (dbOk) {
    const query: Record<string, unknown> = {};
    if (!isSuperAdminAll) {
      query.$or = [{ datasetId }, { userId: datasetId }];
    }
    if (filter?.scope) query.scope = filter.scope;
    if (filter?.propertyCode) query.propertyCode = filter.propertyCode;
    if (filter?.type) query.transactionType = filter.type;

    const docs = await Transaction.find(query).sort({ date: -1 }).lean();
    if (docs) {
      return (docs as unknown as ({ _id: { toString: () => string } } & ITransaction)[]).map((d) => ({
        id: d._id.toString(),
        scope: d.scope,
        transactionType: d.transactionType,
        transCode: d.transCode,
        loanId: d.loanId,
        loanCode: d.loanCode,
        propertyCode: d.propertyCode,
        date: new Date(d.date).toISOString().split("T")[0],
        category: d.category,
        mode: d.mode,
        transferType: d.transferType,
        amount: d.amount,
        borneBy: d.borneBy || "self",
        amountSelf: d.amountSelf,
        amountSeller: d.amountSeller,
        amountBuyer: d.amountBuyer,
        subPlotNumber: d.subPlotNumber,
        attachmentUrl: d.attachmentUrl,
        recipientOrSource: d.recipientOrSource,
        remarks: d.remarks,
      }));
    }
    return [];
  }

  // Memory fallback only active in offline environments without MONGODB_URI
  let list = isSuperAdminAll
    ? [...memTransactions]
    : memTransactions.filter((t) => t.datasetId === datasetId || !datasetId);

  if (filter?.scope) list = list.filter((t) => t.scope === filter.scope);
  if (filter?.propertyCode)
    list = list.filter((t) => t.propertyCode === filter.propertyCode);
  if (filter?.type)
    list = list.filter((t) => t.transactionType === filter.type);

  return list.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Add transaction within dataset
 */
export async function addTransaction(
  data: Omit<SeedTransaction, "id">,
  datasetId: string = "ds_yousuf_portfolio",
  userId: string = "user_default"
): Promise<SeedTransaction> {
  const prefix =
    data.transactionType === "outflow"
      ? "OUT"
      : data.transactionType === "deal_inflow"
      ? "REC"
      : data.transactionType === "capital_inflow"
      ? "INF"
      : "TRF";

  const uri = getSanitizedMongoUri();
  if (uri && datasetId !== "ds_demo_sandbox") {
    return await withDBRetry(async () => {
      let transCode = data.transCode;
      if (!transCode) {
        const count = await Transaction.countDocuments({
          $or: [{ datasetId }, { userId: datasetId }],
        });
        transCode = `${prefix}-${String(count + 1).padStart(3, "0")}`;
        const existing = await Transaction.findOne({ transCode });
        if (existing) {
          transCode = `${prefix}-${Date.now().toString().slice(-4)}`;
        }
      }

      const dbPayload = {
        ...data,
        transCode,
        userId,
        datasetId,
      };
      const doc = await Transaction.create(dbPayload);
      const newTx: SeedTransaction = {
        ...data,
        id: doc._id.toString(),
        transCode,
      };
      memTransactions.push({ ...newTx, datasetId });
      return newTx;
    });
  }

  if (datasetId === "ds_demo_sandbox" || !uri) {
    const newTx: SeedTransaction & { datasetId: string } = {
      ...data,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      datasetId,
      transCode:
        data.transCode ||
        `${prefix}-${String(memTransactions.length + 1).padStart(3, "0")}`,
    };
    memTransactions.push(newTx);
    return newTx;
  }

  throw new Error(
    "MongoDB database is not connected. Transaction was not saved."
  );
}

/**
 * Update an existing transaction within dataset
 */
export async function updateTransaction(
  transIdOrCode: string,
  updates: Partial<SeedTransaction>,
  datasetId: string = "ds_yousuf_portfolio"
): Promise<SeedTransaction | null> {
  const uri = getSanitizedMongoUri();
  if (uri && datasetId !== "ds_demo_sandbox") {
    return await withDBRetry(async () => {
      const query: Record<string, unknown> = {
        $or: [
          { transCode: transIdOrCode },
          { _id: mongoose.isValidObjectId(transIdOrCode) ? transIdOrCode : null },
        ],
      };
      if (datasetId && datasetId !== "all") {
        query.$and = [{ $or: [{ datasetId }, { userId: datasetId }] }];
      }

      const updated = await Transaction.findOneAndUpdate(
        query,
        { $set: updates },
        { new: true }
      ).lean<ITransaction & { _id: unknown }>();

      if (updated) {
        const mapped: SeedTransaction = {
          id: updated._id.toString(),
          scope: updated.scope,
          transactionType: updated.transactionType,
          transCode: updated.transCode,
          loanId: updated.loanId,
          loanCode: updated.loanCode,
          propertyCode: updated.propertyCode,
          date: new Date(updated.date).toISOString().split("T")[0],
          category: updated.category,
          mode: updated.mode,
          transferType: updated.transferType,
          amount: updated.amount,
          borneBy: updated.borneBy || "self",
          amountSelf: updated.amountSelf,
          amountSeller: updated.amountSeller,
          amountBuyer: updated.amountBuyer,
          subPlotNumber: updated.subPlotNumber,
          attachmentUrl: updated.attachmentUrl,
          recipientOrSource: updated.recipientOrSource,
          remarks: updated.remarks,
        };

        const idx = memTransactions.findIndex(
          (t) =>
            (t.transCode && t.transCode.toLowerCase() === transIdOrCode.toLowerCase()) ||
            t.id === transIdOrCode
        );
        if (idx !== -1) {
          memTransactions[idx] = { ...memTransactions[idx], ...updates, id: mapped.id };
        }
        return mapped;
      }
      return null;
    });
  }

  if (datasetId === "ds_demo_sandbox" || !uri) {
    const idx = memTransactions.findIndex(
      (t) =>
        (t.transCode && t.transCode.toLowerCase() === transIdOrCode.toLowerCase()) ||
        t.id === transIdOrCode
    );
    if (idx !== -1) {
      memTransactions[idx] = { ...memTransactions[idx], ...updates };
      return memTransactions[idx];
    }
    return null;
  }

  throw new Error(
    "MongoDB database is not connected. Transaction was not updated."
  );
}

/**
 * Delete a transaction within dataset
 */
export async function deleteTransaction(
  transIdOrCode: string,
  datasetId: string = "ds_yousuf_portfolio"
): Promise<boolean> {
  const uri = getSanitizedMongoUri();
  if (uri && datasetId !== "ds_demo_sandbox") {
    return await withDBRetry(async () => {
      const query: Record<string, unknown> = {
        $or: [
          { transCode: transIdOrCode },
          { _id: mongoose.isValidObjectId(transIdOrCode) ? transIdOrCode : null },
        ],
      };
      if (datasetId && datasetId !== "all") {
        query.$and = [{ $or: [{ datasetId }, { userId: datasetId }] }];
      }

      const res = await Transaction.findOneAndDelete(query);
      if (res) {
        const idx = memTransactions.findIndex(
          (t) =>
            (t.transCode && t.transCode.toLowerCase() === transIdOrCode.toLowerCase()) ||
            t.id === transIdOrCode
        );
        if (idx !== -1) {
          memTransactions.splice(idx, 1);
        }
        return true;
      }
      return false;
    });
  }

  if (datasetId === "ds_demo_sandbox" || !uri) {
    const idx = memTransactions.findIndex(
      (t) =>
        (t.transCode && t.transCode.toLowerCase() === transIdOrCode.toLowerCase()) ||
        t.id === transIdOrCode
    );
    if (idx !== -1) {
      memTransactions.splice(idx, 1);
      return true;
    }
    return false;
  }

  throw new Error(
    "MongoDB database is not connected. Transaction was not deleted."
  );
}

/**
 * Get dynamic categories within dataset (or system defaults)
 */
export async function getCategories(
  datasetId: string = "ds_yousuf_portfolio",
  scope?: "commercial" | "personal",
  isSuperAdminAll: boolean = false
): Promise<SeedCategory[]> {
  const dbOk = await ensureDB();
  if (dbOk) {
    const query: Record<string, unknown> = isSuperAdminAll
      ? {}
      : { $or: [{ datasetId }, { userId: datasetId }, { isDefault: true }] };

    const docs = await Category.find(query).lean<ICategory[]>();
    if (docs && docs.length > 0) {
      return docs.map((d) => ({
        name: d.name,
        scope: d.scope,
        type: d.type,
        financialRole: d.financialRole,
      }));
    }
  }

  return scope
    ? memCategories.filter((c) => c.scope === scope || c.scope === "both")
    : memCategories;
}

/**
 * Add custom category within dataset
 */
export async function addCategory(
  category: SeedCategory,
  datasetId: string = "ds_yousuf_portfolio",
  userId: string = "user_default"
): Promise<SeedCategory> {
  const uri = getSanitizedMongoUri();
  if (uri && datasetId !== "ds_demo_sandbox") {
    try {
      await withDBRetry(async () => {
        await Category.create({ ...category, userId, datasetId });
      });
    } catch (e) {
      console.warn("Category DB write failed, updating in-memory store", e);
    }
  }

  memCategories.push({ ...category, datasetId });
  return category;
}

/**
 * Get all loans filtered by dataset ID and optional scope
 */
export async function getLoans(
  datasetId: string = "ds_yousuf_portfolio",
  scope?: "commercial" | "personal",
  isSuperAdminAll: boolean = false
): Promise<SeedLoan[]> {
  // Demo Sandbox Guest Mode
  if (datasetId === "ds_demo_sandbox") {
    return scope
      ? DEMO_FILLER_LOANS.filter((l) => l.scope === scope)
      : DEMO_FILLER_LOANS;
  }

  const dbOk = await ensureDB();
  if (dbOk) {
    const query: Record<string, unknown> = {};
    if (!isSuperAdminAll) {
      query.$or = [{ datasetId }, { userId: datasetId }];
    }
    if (scope) query.scope = scope;

    const docs = await Loan.find(query).sort({ startDate: -1 }).lean<{ _id: unknown } & ILoan[]>();
    if (docs) {
      return (docs as unknown as ({ _id: { toString: () => string } } & ILoan)[]).map((d) => ({
        id: d._id.toString(),
        scope: d.scope,
        loanCode: d.loanCode,
        lenderName: d.lenderName,
        lenderType: d.lenderType,
        principalAmount: d.principalAmount,
        interestRatePct: d.interestRatePct,
        profitSharePct: d.profitSharePct,
        profitShareTerms: d.profitShareTerms,
        startDate: d.startDate
          ? new Date(d.startDate).toISOString().split("T")[0]
          : "",
        endDate: d.endDate
          ? new Date(d.endDate).toISOString().split("T")[0]
          : undefined,
        tenureMonths: d.tenureMonths,
        linkedPropertyCode: d.linkedPropertyCode,
        status: d.status,
        notes: d.notes,
      }));
    }
    return [];
  }

  // Memory fallback only active in offline environments without MONGODB_URI
  let list = isSuperAdminAll
    ? memLoans
    : memLoans.filter((l) => l.datasetId === datasetId || !datasetId);
  return scope ? list.filter((l) => l.scope === scope) : list;
}

/**
 * Get loan by code or ID
 */
export async function getLoanByCode(
  loanCode: string,
  datasetId: string = "ds_yousuf_portfolio"
): Promise<SeedLoan | null> {
  const loans = await getLoans(datasetId);
  return (
    loans.find(
      (l) =>
        l.loanCode.toLowerCase() === loanCode.toLowerCase() ||
        l.id === loanCode
    ) || null
  );
}

/**
 * Add a new loan facility
 */
export async function addLoan(
  data: Omit<SeedLoan, "id" | "loanCode"> & { loanCode?: string },
  datasetId: string = "ds_yousuf_portfolio",
  userId: string = "user_default"
): Promise<SeedLoan> {
  const uri = getSanitizedMongoUri();
  if (uri && datasetId !== "ds_demo_sandbox") {
    return await withDBRetry(async () => {
      let loanCode = data.loanCode;
      if (!loanCode) {
        const count = await Loan.countDocuments({
          $or: [{ datasetId }, { userId: datasetId }],
        });
        loanCode = `LOAN-${String(count + 1).padStart(3, "0")}`;
        const existing = await Loan.findOne({ loanCode });
        if (existing) {
          loanCode = `LOAN-${Date.now().toString().slice(-4)}`;
        }
      }

      const dbPayload = {
        ...data,
        loanCode,
        userId,
        datasetId,
      };
      const doc = await Loan.create(dbPayload);
      const newLoan: SeedLoan = {
        ...data,
        id: doc._id.toString(),
        loanCode,
      };
      memLoans.push({ ...newLoan, datasetId });
      return newLoan;
    });
  }

  if (datasetId === "ds_demo_sandbox" || !uri) {
    const newLoan: SeedLoan & { datasetId: string } = {
      ...data,
      id: `loan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      datasetId,
      loanCode:
        data.loanCode ||
        `LOAN-${String(memLoans.length + 1).padStart(3, "0")}`,
    };
    memLoans.push(newLoan);
    return newLoan;
  }

  throw new Error("MongoDB database is not connected. Loan was not saved.");
}

/**
 * Update loan terms and metadata
 */
export async function updateLoan(
  loanIdOrCode: string,
  updates: Partial<SeedLoan>,
  datasetId: string = "ds_yousuf_portfolio"
): Promise<SeedLoan | null> {
  const uri = getSanitizedMongoUri();
  const trimmedKey = (loanIdOrCode || "").trim();
  if (uri && datasetId !== "ds_demo_sandbox") {
    return await withDBRetry(async () => {
      const orConditions: Record<string, unknown>[] = [
        {
          loanCode: {
            $regex: `^${trimmedKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            $options: "i",
          },
        },
      ];
      if (mongoose.isValidObjectId(trimmedKey)) {
        orConditions.push({ _id: trimmedKey });
      }

      const query: Record<string, unknown> = {
        $or: orConditions,
      };
      if (datasetId && datasetId !== "all") {
        query.$and = [{ $or: [{ datasetId }, { userId: datasetId }] }];
      }

      // Strip id / _id to avoid attempting to modify immutable / non-schema primary keys
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { id: _ignoredId, _id: _ignoredMongoId, ...cleanUpdates } = updates as any;

      const updated = await Loan.findOneAndUpdate(
        query,
        { $set: cleanUpdates },
        { new: true }
      ).lean<ILoan & { _id: unknown }>();

      if (updated) {
        const mapped: SeedLoan = {
          id: updated._id.toString(),
          scope: updated.scope,
          loanCode: updated.loanCode,
          lenderName: updated.lenderName,
          lenderType: updated.lenderType,
          principalAmount: updated.principalAmount,
          interestRatePct: updated.interestRatePct,
          profitSharePct: updated.profitSharePct,
          profitShareTerms: updated.profitShareTerms,
          startDate: updated.startDate
            ? new Date(updated.startDate).toISOString().split("T")[0]
            : "",
          endDate: updated.endDate
            ? new Date(updated.endDate).toISOString().split("T")[0]
            : undefined,
          tenureMonths: updated.tenureMonths,
          linkedPropertyCode: updated.linkedPropertyCode,
          status: updated.status,
          notes: updated.notes,
        };

        const idx = memLoans.findIndex(
          (l) =>
            l.loanCode.toLowerCase() === trimmedKey.toLowerCase() ||
            l.id === trimmedKey ||
            l.id === mapped.id
        );
        if (idx !== -1) {
          memLoans[idx] = { ...memLoans[idx], ...cleanUpdates, id: mapped.id };
        }
        return mapped;
      }
      return null;
    });
  }

  if (datasetId === "ds_demo_sandbox" || !uri) {
    const idx = memLoans.findIndex(
      (l) =>
        l.loanCode.toLowerCase() === trimmedKey.toLowerCase() ||
        l.id === trimmedKey
    );
    if (idx !== -1) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { id: _ignoredId, ...cleanUpdates } = updates as any;
      memLoans[idx] = { ...memLoans[idx], ...cleanUpdates };
      return memLoans[idx];
    }
    return null;
  }

  throw new Error("MongoDB database is not connected. Loan was not updated.");
}

/**
 * Delete a loan facility
 */
export async function deleteLoan(
  loanIdOrCode: string,
  datasetId: string = "ds_yousuf_portfolio"
): Promise<boolean> {
  const uri = getSanitizedMongoUri();
  const trimmedKey = (loanIdOrCode || "").trim();
  if (uri && datasetId !== "ds_demo_sandbox") {
    return await withDBRetry(async () => {
      const orConditions: Record<string, unknown>[] = [
        {
          loanCode: {
            $regex: `^${trimmedKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            $options: "i",
          },
        },
      ];
      if (mongoose.isValidObjectId(trimmedKey)) {
        orConditions.push({ _id: trimmedKey });
      }

      const query: Record<string, unknown> = {
        $or: orConditions,
      };
      if (datasetId && datasetId !== "all") {
        query.$and = [{ $or: [{ datasetId }, { userId: datasetId }] }];
      }

      const res = await Loan.findOneAndDelete(query);
      if (res) {
        const resId = res._id ? (res._id as { toString(): string }).toString() : "";
        const idx = memLoans.findIndex(
          (l) =>
            l.loanCode.toLowerCase() === trimmedKey.toLowerCase() ||
            l.id === trimmedKey ||
            (resId && l.id === resId)
        );
        if (idx !== -1) {
          memLoans.splice(idx, 1);
        }
        return true;
      }
      return false;
    });
  }

  if (datasetId === "ds_demo_sandbox" || !uri) {
    const idx = memLoans.findIndex(
      (l) =>
        l.loanCode.toLowerCase() === trimmedKey.toLowerCase() ||
        l.id === trimmedKey
    );
    if (idx !== -1) {
      memLoans.splice(idx, 1);
      return true;
    }
    return false;
  }

  throw new Error("MongoDB database is not connected. Loan was not deleted.");
}

/**
 * Calculate commercial metrics for dataset
 */
export async function getCommercialMetrics(
  datasetId: string = "ds_yousuf_portfolio",
  isSuperAdminAll: boolean = false
): Promise<CommercialDashboardMetrics> {
  const props = await getProperties(datasetId, "commercial", isSuperAdminAll);
  const txs = await getTransactions(datasetId, { scope: "commercial" }, isSuperAdminAll);
  const cats = await getCategories(datasetId, "commercial", isSuperAdminAll);
  const loans = await getLoans(datasetId, "commercial", isSuperAdminAll);
  return calculateCommercialMetrics(props, txs, cats, loans);
}

/**
 * Calculate personal metrics for dataset
 */
export async function getPersonalMetrics(
  datasetId: string = "ds_yousuf_portfolio",
  isSuperAdminAll: boolean = false
): Promise<PersonalDashboardMetrics> {
  const props = await getProperties(datasetId, "personal", isSuperAdminAll);
  const txs = await getTransactions(datasetId, { scope: "personal" }, isSuperAdminAll);
  return calculatePersonalMetrics(props, txs);
}
