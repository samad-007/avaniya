import { connectDB } from "./db";
import { Property, IProperty } from "../models/Property";
import { Transaction, ITransaction } from "../models/Transaction";
import { Category, ICategory } from "../models/Category";
import { AccountBalance, IAccountBalance } from "../models/AccountBalance";
import {
  INITIAL_PROPERTIES,
  INITIAL_TRANSACTIONS,
  INITIAL_CATEGORIES,
  INITIAL_ACCOUNT_BALANCES,
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
let memProperties: SeedProperty[] = [...INITIAL_PROPERTIES];
let memTransactions: SeedTransaction[] = [...INITIAL_TRANSACTIONS];
let memCategories: SeedCategory[] = [...INITIAL_CATEGORIES];
let memAccountBalances = [...INITIAL_ACCOUNT_BALANCES];

/**
 * Check if MongoDB connection is active
 */
async function isDBConnected(): Promise<boolean> {
  if (!process.env.MONGODB_URI) return false;
  try {
    const conn = await connectDB();
    return !!conn && conn.connection.readyState === 1;
  } catch {
    return false;
  }
}

/**
 * Get all properties for a user
 */
export async function getProperties(
  userId: string = "demo_businessman_1",
  scope?: "commercial" | "personal"
): Promise<SeedProperty[]> {
  const dbOk = await isDBConnected();
  if (dbOk) {
    const query: { userId: string; type?: string } = { userId };
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
  }

  // Memory fallback
  return scope
    ? memProperties.filter((p) => p.type === scope)
    : memProperties;
}

/**
 * Get a specific property by code or ID
 */
export async function getPropertyByCode(
  propertyCode: string,
  userId: string = "demo_businessman_1"
): Promise<SeedProperty | null> {
  const props = await getProperties(userId);
  return (
    props.find(
      (p) =>
        p.propertyCode.toLowerCase() === propertyCode.toLowerCase() ||
        p.id === propertyCode
    ) || null
  );
}

/**
 * Add a new property (Commercial Land Deal or Personal Asset)
 */
export async function addProperty(
  data: Omit<SeedProperty, "id">,
  userId: string = "demo_businessman_1"
): Promise<SeedProperty> {
  const newProp: SeedProperty = {
    ...data,
    id: `prop-${Date.now()}`,
    propertyCode:
      data.propertyCode ||
      (data.type === "commercial"
        ? `LND-${String(memProperties.length + 1).padStart(3, "0")}`
        : `APT-${String(memProperties.length + 1).padStart(3, "0")}`),
  };

  const dbOk = await isDBConnected();
  if (dbOk) {
    try {
      const doc = await Property.create({ ...newProp, userId });
      newProp.id = doc._id.toString();
    } catch (e) {
      console.warn("DB write failed, updating in-memory store", e);
    }
  }

  memProperties.push(newProp);
  return newProp;
}

/**
 * Update property details
 */
export async function updateProperty(
  propertyCode: string,
  updates: Partial<SeedProperty>,
  userId: string = "demo_businessman_1"
): Promise<SeedProperty | null> {
  const dbOk = await isDBConnected();
  if (dbOk) {
    await Property.findOneAndUpdate(
      { userId, propertyCode },
      { $set: updates }
    );
  }

  const idx = memProperties.findIndex(
    (p) => p.propertyCode.toLowerCase() === propertyCode.toLowerCase()
  );
  if (idx !== -1) {
    memProperties[idx] = { ...memProperties[idx], ...updates };
    return memProperties[idx];
  }
  return null;
}

/**
 * Get transactions with optional filter
 */
export async function getTransactions(
  userId: string = "demo_businessman_1",
  filter?: { scope?: string; propertyCode?: string; type?: string }
): Promise<SeedTransaction[]> {
  const dbOk = await isDBConnected();
  if (dbOk) {
    const query: Record<string, string> = { userId };
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
  }

  let list = [...memTransactions];
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
 * Add a new transaction (Outflow, Inflow, Receipt, Transfer)
 */
export async function addTransaction(
  data: Omit<SeedTransaction, "id">,
  userId: string = "demo_businessman_1"
): Promise<SeedTransaction> {
  const prefix =
    data.transactionType === "outflow"
      ? "OUT"
      : data.transactionType === "deal_inflow"
      ? "REC"
      : data.transactionType === "capital_inflow"
      ? "INF"
      : "TRF";

  const newTx: SeedTransaction = {
    ...data,
    id: `tx-${Date.now()}`,
    transCode:
      data.transCode ||
      `${prefix}-${String(memTransactions.length + 1).padStart(3, "0")}`,
  };

  const dbOk = await isDBConnected();
  if (dbOk) {
    try {
      const doc = await Transaction.create({ ...newTx, userId });
      newTx.id = doc._id.toString();
    } catch (e) {
      console.warn("DB write failed, updating in-memory store", e);
    }
  }

  memTransactions.push(newTx);
  return newTx;
}

/**
 * Get dynamic categories
 */
export async function getCategories(
  userId: string = "demo_businessman_1",
  scope?: "commercial" | "personal"
): Promise<SeedCategory[]> {
  const dbOk = await isDBConnected();
  if (dbOk) {
    const docs = await Category.find({ userId }).lean<ICategory[]>();
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
 * Add custom category with dynamic financial role mapping
 */
export async function addCategory(
  category: SeedCategory,
  userId: string = "demo_businessman_1"
): Promise<SeedCategory> {
  const dbOk = await isDBConnected();
  if (dbOk) {
    try {
      await Category.create({ ...category, userId });
    } catch (e) {
      console.warn("Category DB write failed, updating in-memory store", e);
    }
  }

  const existing = memCategories.findIndex(
    (c) => c.name.toLowerCase() === category.name.toLowerCase()
  );
  if (existing === -1) {
    memCategories.push(category);
  } else {
    memCategories[existing] = category;
  }
  return category;
}

/**
 * Get commercial dashboard calculated metrics
 */
export async function getCommercialMetrics(
  userId: string = "demo_businessman_1"
): Promise<CommercialDashboardMetrics> {
  const props = await getProperties(userId, "commercial");
  const txs = await getTransactions(userId, { scope: "commercial" });
  const cats = await getCategories(userId, "commercial");
  return calculateCommercialMetrics(props, txs, cats);
}

/**
 * Get personal dashboard calculated metrics
 */
export async function getPersonalMetrics(
  userId: string = "demo_businessman_1"
): Promise<PersonalDashboardMetrics> {
  const props = await getProperties(userId, "personal");
  const txs = await getTransactions(userId, { scope: "personal" });
  return calculatePersonalMetrics(props, txs);
}
