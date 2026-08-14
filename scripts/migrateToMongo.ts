import fs from "fs";
import path from "path";
import mongoose from "mongoose";

// Robust loader for .env.local, .env, etc. for standalone script execution
function loadLocalEnv() {
  const envFiles = [".env.local", ".env", ".env.development.local"];
  for (const file of envFiles) {
    const envPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, "utf-8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();
            // Strip outer quotes if enclosed in single or double quotes
            if (
              (val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))
            ) {
              val = val.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      } catch (err) {
        console.warn(`Could not read ${file}`, err);
      }
    }
  }
}

loadLocalEnv();

import { Property } from "../src/models/Property";
import { Transaction } from "../src/models/Transaction";
import { Category } from "../src/models/Category";
import { AccountBalance } from "../src/models/AccountBalance";
import { User } from "../src/models/User";
import { Dataset } from "../src/models/Dataset";
import {
  INITIAL_PROPERTIES,
  INITIAL_TRANSACTIONS,
  INITIAL_CATEGORIES,
  INITIAL_ACCOUNT_BALANCES,
} from "../src/lib/seedData";
import { hashPassword } from "../src/lib/auth";
import { generateSecurePassword } from "../src/lib/passwordGenerator";

async function runMigration() {
  let uri = process.env.MONGODB_URI;
  if (uri) {
    uri = uri.trim().replace(/^["']|["']$/g, "");
  }

  if (!uri) {
    console.error("\n==================================================================");
    console.error("ERROR: MONGODB_URI environment variable is not defined or empty.");
    console.error("Please ensure your `.env.local` file contains:");
    console.error("MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/real_estate_tracker?retryWrites=true&w=majority");
    console.error("==================================================================\n");
    process.exit(1);
  }

  console.log("==================================================================");
  console.log("AVANIYA — MONGODB ATLAS MULTI-TENANT SEED & DATASET MIGRATION");
  console.log("==================================================================");
  console.log("Connecting to MongoDB Atlas Cluster...");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB Atlas successfully.\n");

  const yousufDatasetId = "ds_yousuf_portfolio";
  const superAdminEmail = "samad@avaniya.com";
  const superAdminPassword = generateSecurePassword(15);

  const yousufEmail = "yousuf@avaniya.com";
  const yousufPassword = generateSecurePassword(15);

  // 1. Create or Update Dataset Definition
  console.log("[1/6] Registering Dataset Workspaces...");
  const yousufDataset = await Dataset.findOneAndUpdate(
    { datasetId: yousufDatasetId },
    {
      $set: {
        name: "Mohammed Yousuf — Commercial Land & Apartment Portfolio",
        description: "Official real estate portfolio migrated from reference workbooks",
      },
    },
    { upsert: true, new: true }
  );
  console.log(`- Dataset '${yousufDatasetId}' initialized: ${yousufDataset.name}`);

  // 2. Migrate / Create Super Admin (Samad)
  console.log("\n[2/6] Provisioning Super Admin Account (Developer)...");
  let superAdminUser = await User.findOne({ email: superAdminEmail });
  if (!superAdminUser) {
    const pHash = await hashPassword(superAdminPassword);
    superAdminUser = await User.create({
      name: "Samad",
      email: superAdminEmail,
      passwordHash: pHash,
      role: "super_admin",
      datasetId: yousufDatasetId,
      status: "active",
    });
    console.log(`- Created Super Admin: ${superAdminEmail}`);
    console.log(`  Password (15 chars): ${superAdminPassword}`);
  } else {
    superAdminUser.role = "super_admin";
    await superAdminUser.save();
    console.log(`- Super Admin verified: ${superAdminEmail} (Role: super_admin)`);
  }

  // 3. Migrate / Create Client User (Mohammed Yousuf)
  console.log("\n[3/6] Provisioning Client User (Mohammed Yousuf)...");
  let yousufUser = await User.findOne({ email: yousufEmail });
  if (!yousufUser) {
    const pHash = await hashPassword(yousufPassword);
    yousufUser = await User.create({
      name: "Mohammed Yousuf",
      email: yousufEmail,
      passwordHash: pHash,
      role: "admin",
      datasetId: yousufDatasetId,
      status: "active",
    });
    console.log(`- Created User: ${yousufEmail}`);
    console.log(`  Password (15 chars): ${yousufPassword}`);
    console.log(`  Mapped Dataset: ${yousufDatasetId}`);
  } else {
    yousufUser.datasetId = yousufDatasetId;
    await yousufUser.save();
    console.log(`- User exists: ${yousufEmail} (Mapped Dataset: ${yousufDatasetId})`);
  }

  // Link users to Dataset
  await Dataset.findOneAndUpdate(
    { datasetId: yousufDatasetId },
    {
      $addToSet: {
        assignedUserIds: [
          superAdminUser._id.toString(),
          yousufUser._id.toString(),
        ],
      },
    }
  );

  // 4. Migrate Properties under Dataset
  console.log("\n[4/6] Migrating Properties under Dataset 'ds_yousuf_portfolio'...");
  for (const p of INITIAL_PROPERTIES) {
    await Property.findOneAndUpdate(
      { datasetId: yousufDatasetId, propertyCode: p.propertyCode },
      {
        $set: {
          userId: yousufUser._id.toString(),
          datasetId: yousufDatasetId,
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
  const propCount = await Property.countDocuments({ datasetId: yousufDatasetId });
  console.log(`- Migrated ${propCount} properties into dataset '${yousufDatasetId}'.`);

  // 5. Migrate Dynamic Categories under Dataset
  console.log("\n[5/6] Migrating South Indian Real Estate Categories under Dataset...");
  for (const c of INITIAL_CATEGORIES) {
    await Category.findOneAndUpdate(
      { datasetId: yousufDatasetId, name: c.name, scope: c.scope },
      {
        $set: {
          userId: yousufUser._id.toString(),
          datasetId: yousufDatasetId,
          type: c.type,
          financialRole: c.financialRole,
          isDefault: true,
        },
      },
      { upsert: true, new: true }
    );
  }
  const catCount = await Category.countDocuments({ datasetId: yousufDatasetId });
  console.log(`- Migrated ${catCount} categories into dataset '${yousufDatasetId}'.`);

  // 6. Migrate Transactions & Account Balances under Dataset
  console.log("\n[6/6] Migrating Itemized Transactions & Balances under Dataset...");
  for (const t of INITIAL_TRANSACTIONS) {
    await Transaction.findOneAndUpdate(
      { datasetId: yousufDatasetId, transCode: t.transCode },
      {
        $set: {
          userId: yousufUser._id.toString(),
          datasetId: yousufDatasetId,
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
  const txCount = await Transaction.countDocuments({ datasetId: yousufDatasetId });
  console.log(`- Migrated ${txCount} transactions into dataset '${yousufDatasetId}'.`);

  for (const a of INITIAL_ACCOUNT_BALANCES) {
    await AccountBalance.findOneAndUpdate(
      { datasetId: yousufDatasetId, name: a.name },
      {
        $set: {
          userId: yousufUser._id.toString(),
          datasetId: yousufDatasetId,
          balance: a.balance,
          type: a.type as any,
          notes: "",
        },
      },
      { upsert: true, new: true }
    );
  }

  console.log("\n==================================================================");
  console.log("MIGRATION COMPLETE!");
  console.log("All data is securely mapped under dataset 'ds_yousuf_portfolio'.");
  console.log("Super Admin (Samad) has full management & switching capabilities.");
  console.log("==================================================================");

  await mongoose.disconnect();
  process.exit(0);
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
