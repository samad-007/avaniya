import mongoose from "mongoose";
import { connectDB, getSanitizedMongoUri } from "./db";
import { Property, IProperty } from "../models/Property";
import { Transaction, ITransaction } from "../models/Transaction";
import { Category, ICategory } from "../models/Category";
import { AccountBalance, IAccountBalance } from "../models/AccountBalance";
import {
  INITIAL_PROPERTIES,
  INITIAL_TRANSACTIONS,
  INITIAL_CATEGORIES,
  INITIAL_ACCOUNT_BALANCES,
  DEMO_FILLER_PROPERTIES,
  DEMO_FILLER_TRANSACTIONS,
  SeedProperty,
  SeedTransaction,
  SeedCategory,
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
let memAccountBalances = [...INITIAL_ACCOUNT_BALANCES];

/**
 * Check if MongoDB connection is active
 */
async function isDBConnected(): Promise<boolean> {
  const uri = getSanitizedMongoUri();
  if (!uri) return false;
  try {
    const conn = await connectDB();
    return !!conn && conn.connection.readyState === 1;
  } catch {
    return false;
  }
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
  const dbOk = await isDBConnected();
  if (dbOk) {
    const query: Record<string, unknown> = {};
    if (!isSuperAdminAll) {
      query.$or = [{ datasetId }, { userId: datasetId }];
    }
    if (scope) query.type = scope;

    const docs = await Property.find(query).lean<{ _id: unknown } & IProperty[]>();
    if (docs && docs.length > 0) {
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
        notes: d.notes,
      }));
    }
    return [];
  }

  // Memory fallback
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
  const newProp: SeedProperty & { datasetId: string } = {
    ...data,
    id: `prop-${Date.now()}`,
    datasetId,
    propertyCode:
      data.propertyCode ||
      (data.type === "commercial"
        ? `LND-${String(memProperties.length + 1).padStart(3, "0")}`
        : `APT-${String(memProperties.length + 1).padStart(3, "0")}`),
  };

  const dbOk = await isDBConnected();
  if (dbOk) {
    try {
      const doc = await Property.create({ ...newProp, userId, datasetId });
      newProp.id = doc._id.toString();
    } catch (e) {
      console.warn("DB write failed, updating in-memory store", e);
    }
  }

  memProperties.push(newProp);
  return newProp;
}

/**
 * Update property details within dataset
 */
export async function updateProperty(
  propertyCodeOrId: string,
  updates: Partial<SeedProperty>,
  datasetId: string = "ds_yousuf_portfolio"
): Promise<SeedProperty | null> {
  const dbOk = await isDBConnected();
  if (dbOk) {
    try {
      const query: Record<string, unknown> = {
        $or: [
          { propertyCode: propertyCodeOrId },
          { _id: mongoose.isValidObjectId(propertyCodeOrId) ? propertyCodeOrId : null },
        ],
      };
      if (datasetId) {
        query.$and = [{ $or: [{ datasetId }, { userId: datasetId }] }];
      }

      const updated = await Property.findOneAndUpdate(
        query,
        { $set: updates },
        { new: true }
      ).lean<IProperty & { _id: unknown }>();

      if (updated) {
        return {
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
          notes: updated.notes,
        };
      }
    } catch (e) {
      console.warn("DB update failed, falling back to memory store", e);
    }
  }

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

  const dbOk = await isDBConnected();
  if (dbOk) {
    const query: Record<string, unknown> = {};
    if (!isSuperAdminAll) {
      query.$or = [{ datasetId }, { userId: datasetId }];
    }
    if (filter?.scope) query.scope = filter.scope;
    if (filter?.propertyCode) query.propertyCode = filter.propertyCode;
    if (filter?.type) query.transactionType = filter.type;

    const docs = await Transaction.find(query).sort({ date: -1 }).lean();
    if (docs && docs.length > 0) {
      return (docs as unknown as ({ _id: { toString: () => string } } & ITransaction)[]).map((d) => ({
        id: d._id.toString(),
        scope: d.scope,
        transactionType: d.transactionType,
        transCode: d.transCode,
        propertyCode: d.propertyCode,
        date: new Date(d.date).toISOString().split("T")[0],
        category: d.category,
        mode: d.mode,
        transferType: d.transferType,
        amount: d.amount,
        recipientOrSource: d.recipientOrSource,
        remarks: d.remarks,
      }));
    }
    return [];
  }

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

  const newTx: SeedTransaction & { datasetId: string } = {
    ...data,
    id: `tx-${Date.now()}`,
    datasetId,
    transCode:
      data.transCode ||
      `${prefix}-${String(memTransactions.length + 1).padStart(3, "0")}`,
  };

  const dbOk = await isDBConnected();
  if (dbOk) {
    try {
      const doc = await Transaction.create({ ...newTx, userId, datasetId });
      newTx.id = doc._id.toString();
    } catch (e) {
      console.warn("DB write failed, updating in-memory store", e);
    }
  }

  memTransactions.push(newTx);
  return newTx;
}

/**
 * Get dynamic categories within dataset (or system defaults)
 */
export async function getCategories(
  datasetId: string = "ds_yousuf_portfolio",
  scope?: "commercial" | "personal",
  isSuperAdminAll: boolean = false
): Promise<SeedCategory[]> {
  const dbOk = await isDBConnected();
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
  const dbOk = await isDBConnected();
  if (dbOk) {
    try {
      await Category.create({ ...category, userId, datasetId });
    } catch (e) {
      console.warn("Category DB write failed, updating in-memory store", e);
    }
  }

  memCategories.push({ ...category, datasetId });
  return category;
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
  return calculateCommercialMetrics(props, txs, cats);
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
