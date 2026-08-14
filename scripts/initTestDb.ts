import fs from "fs";
import path from "path";
import mongoose from "mongoose";

// Robust loader for .env.local, .env, etc.
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

async function initTestDatabase() {
  let uri = process.env.MONGODB_URI;
  if (uri) {
    uri = uri.trim().replace(/^["']|["']$/g, "");
  }

  if (!uri) {
    console.error("ERROR: MONGODB_URI is not defined.");
    process.exit(1);
  }

  console.log("==================================================================");
  console.log("INITIALIZING 'test' DATABASE WITH EMPTY COLLECTIONS");
  console.log("==================================================================");
  console.log("Connecting to MongoDB Atlas Cluster (Database: 'test')...");

  await mongoose.connect(uri, {
    dbName: "test",
  });

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Could not acquire MongoDB database handle");
  }

  const collections = [
    "users",
    "properties",
    "transactions",
    "categories",
    "accountbalances",
    "datasets",
  ];

  console.log("\nCreating empty collections in 'test' database:");
  for (const colName of collections) {
    try {
      await db.createCollection(colName);
      console.log(`✓ Created empty collection: '${colName}'`);
    } catch (err: any) {
      if (err.codeName === "NamespaceExists" || err.message?.includes("already exists")) {
        console.log(`- Collection '${colName}' already exists`);
      } else {
        console.error(`! Failed to create collection '${colName}':`, err.message);
      }
    }
  }

  // Ensure Mongoose indexes are built on the empty collections
  console.log("\nBuilding schema indexes on empty collections...");
  await Promise.all([
    User.createIndexes(),
    Property.createIndexes(),
    Transaction.createIndexes(),
    Category.createIndexes(),
    AccountBalance.createIndexes(),
    Dataset.createIndexes(),
  ]);
  console.log("✓ Indexes created successfully.");

  // Verify counts in test database
  console.log("\nVerifying collection document counts in 'test' database:");
  for (const colName of collections) {
    const count = await db.collection(colName).countDocuments();
    console.log(`- '${colName}': ${count} documents`);
  }

  console.log("\n==================================================================");
  console.log("SUCCESS: 'test' database is initialized with empty collections!");
  console.log("==================================================================");

  await mongoose.disconnect();
  process.exit(0);
}

initTestDatabase().catch((err) => {
  console.error("Failed to initialize test database:", err);
  process.exit(1);
});
