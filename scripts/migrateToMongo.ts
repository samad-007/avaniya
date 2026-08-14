import mongoose from "mongoose";
import { Property } from "../src/models/Property";
import { Transaction } from "../src/models/Transaction";
import { Category } from "../src/models/Category";
import { AccountBalance } from "../src/models/AccountBalance";
import { User } from "../src/models/User";
import {
  INITIAL_PROPERTIES,
  INITIAL_TRANSACTIONS,
  INITIAL_CATEGORIES,
  INITIAL_ACCOUNT_BALANCES,
} from "../src/lib/seedData";
import { hashPassword } from "../src/lib/auth";

async function runMigration() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("ERROR: MONGODB_URI environment variable is not defined.");
    console.error("Please ensure your .env.local file contains MONGODB_URI=<your-connection-string>");
    process.exit(1);
  }

  console.log("==================================================");
  console.log("AVANIYA — MONGODB ATLAS DATA MIGRATION & SEEDING");
  console.log("==================================================");
  console.log("Connecting to MongoDB Atlas Cluster...");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB Atlas successfully.\n");

  const defaultUserId = "demo_businessman_1";
  const defaultAdminEmail = "samad@avaniya.com";
  const defaultAdminPassword = "AvaniyaSecure2026!";

  // 1. Migrate / Create Admin User
  console.log("[1/5] Migrating Admin User...");
  const existingUser = await User.findOne({ email: defaultAdminEmail });
  if (!existingUser) {
    const passwordHash = await hashPassword(defaultAdminPassword);
    await User.create({
      email: defaultAdminEmail,
      passwordHash,
      name: "Samad",
      role: "admin",
    });
    console.log(`- Created Admin account: ${defaultAdminEmail}`);
  } else {
    console.log(`- Admin account already exists: ${defaultAdminEmail}`);
  }

  // 2. Migrate Properties
  console.log("\n[2/5] Migrating Commercial & Personal Properties...");
  for (const p of INITIAL_PROPERTIES) {
    await Property.findOneAndUpdate(
      { userId: defaultUserId, propertyCode: p.propertyCode },
      {
        $set: {
          type: p.type,
          propertyCode: p.propertyCode,
          name: p.name,
          location: p.location || "",
          acquisitionDate: p.acquisitionDate ? new Date(p.acquisitionDate) : null,
          sqftArea: p.sqftArea || 0,
          ratePerSqft: p.ratePerSqft || 0,
          agreedPurchasePrice: p.agreedPurchasePrice,
          targetSalePrice: p.targetSalePrice || 0,
          agreedSellingPrice: p.agreedSellingPrice || 0,
          status: p.status,
          notes: p.notes || "",
          milestones: p.milestones || [],
        },
      },
      { upsert: true, new: true }
    );
  }
  const propCount = await Property.countDocuments({ userId: defaultUserId });
  console.log(`- Migrated ${propCount} properties to MongoDB.`);

  // 3. Migrate Categories
  console.log("\n[3/5] Migrating Dynamic Categories & Financial Roles...");
  for (const c of INITIAL_CATEGORIES) {
    await Category.findOneAndUpdate(
      { userId: defaultUserId, name: c.name, scope: c.scope },
      {
        $set: {
          type: c.type,
          financialRole: c.financialRole,
          isDefault: true,
        },
      },
      { upsert: true, new: true }
    );
  }
  const catCount = await Category.countDocuments({ userId: defaultUserId });
  console.log(`- Migrated ${catCount} categories to MongoDB.`);

  // 4. Migrate Unified Transactions
  console.log("\n[4/5] Migrating Unified Transactions...");
  for (const t of INITIAL_TRANSACTIONS) {
    await Transaction.findOneAndUpdate(
      { userId: defaultUserId, transCode: t.transCode },
      {
        $set: {
          scope: t.scope,
          transactionType: t.transactionType,
          propertyCode: t.propertyCode || "",
          date: new Date(t.date),
          category: t.category,
          mode: t.mode,
          transferType: t.transferType || "",
          amount: t.amount,
          recipientOrSource: t.recipientOrSource || "",
          remarks: t.remarks || "",
        },
      },
      { upsert: true, new: true }
    );
  }
  const txCount = await Transaction.countDocuments({ userId: defaultUserId });
  console.log(`- Migrated ${txCount} transactions to MongoDB.`);

  // 5. Migrate Account Balances
  console.log("\n[5/5] Migrating Account Balances...");
  for (const a of INITIAL_ACCOUNT_BALANCES) {
    await AccountBalance.findOneAndUpdate(
      { userId: defaultUserId, name: a.name },
      {
        $set: {
          balance: a.balance,
          type: a.type as any,
          notes: "",
        },
      },
      { upsert: true, new: true }
    );
  }
  const accCount = await AccountBalance.countDocuments({ userId: defaultUserId });
  console.log(`- Migrated ${accCount} account balances to MongoDB.`);

  console.log("\n==================================================");
  console.log("MIGRATION COMPLETE! All data is securely in MongoDB Atlas.");
  console.log("==================================================");

  await mongoose.disconnect();
  process.exit(0);
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
