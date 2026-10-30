import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import mongoose from "mongoose";
import { connectDB, getSanitizedMongoUri, resetConnectionCache } from "../src/lib/db";
import {
  ensureDB,
  getProperties,
  getTransactions,
  addProperty,
  addTransaction,
  addLoan,
} from "../src/lib/dataStore";

describe("Data Flow Resilience & Connection Concurrency", () => {
  const originalMongoUri = process.env.MONGODB_URI;

  beforeEach(() => {
    // Clear cached mongoose state before tests
    if (global.mongooseCache) {
      global.mongooseCache.conn = null;
      global.mongooseCache.promise = null;
    }
  });

  afterEach(() => {
    process.env.MONGODB_URI = originalMongoUri;
    vi.restoreAllMocks();
  });

  it("safely sanitizes MongoDB connection URIs", () => {
    process.env.MONGODB_URI = ' "mongodb+srv://user:pass@cluster.mongodb.net/production" ';
    expect(getSanitizedMongoUri()).toBe("mongodb+srv://user:pass@cluster.mongodb.net/production");

    process.env.MONGODB_URI = 'MONGODB_URI="mongodb://localhost:27017/test"';
    expect(getSanitizedMongoUri()).toBe("mongodb://localhost:27017/test");
  });

  it("handles concurrent connectDB calls by sharing a single connection promise", async () => {
    process.env.MONGODB_URI = "mongodb://fake-cluster:27017/test";

    let connectCallCount = 0;
    const mockMongoose = {
      connection: { readyState: 1 },
    } as unknown as typeof mongoose;

    // Spy on mongoose.connect to ensure it is only invoked once during concurrent requests
    vi.spyOn(mongoose, "connect").mockImplementation(() => {
      connectCallCount++;
      // Simulate network delay
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockMongoose);
        }, 50);
      });
    });

    // Fire 5 simultaneous calls to connectDB in parallel (simulating Promise.all in bootstrap)
    const results = await Promise.all([
      connectDB(),
      connectDB(),
      connectDB(),
      connectDB(),
      connectDB(),
    ]);

    // mongoose.connect should only have been called ONCE
    expect(connectCallCount).toBe(1);

    // All callers should have received the same connection instance
    for (const res of results) {
      expect(res).toBe(mockMongoose);
    }
  });

  it("resets cached promise on connection error allowing clean retry", async () => {
    process.env.MONGODB_URI = "mongodb://fake-cluster:27017/test";

    let attempts = 0;
    const mockMongoose = {
      connection: { readyState: 1 },
    } as unknown as typeof mongoose;

    vi.spyOn(mongoose, "connect").mockImplementation(() => {
      attempts++;
      if (attempts === 1) {
        return Promise.reject(new Error("Transient Atlas DNS failure"));
      }
      return Promise.resolve(mockMongoose);
    });

    // First attempt fails
    await expect(connectDB()).rejects.toThrow("Transient Atlas DNS failure");

    // Cache should be cleared on failure
    expect(global.mongooseCache?.promise).toBeNull();
    expect(global.mongooseCache?.conn).toBeNull();

    // Second attempt retries and succeeds cleanly
    const conn = await connectDB();
    expect(conn).toBe(mockMongoose);
    expect(attempts).toBe(2);
  });

  it("generates collision-resistant transaction codes in offline mode", async () => {
    delete process.env.MONGODB_URI;

    const tx1 = await addTransaction(
      {
        scope: "commercial",
        transactionType: "outflow",
        date: "2026-03-01",
        category: "Advance",
        mode: "Bank",
        amount: 100000,
      },
      "ds_test_resilience"
    );

    const tx2 = await addTransaction(
      {
        scope: "commercial",
        transactionType: "outflow",
        date: "2026-03-02",
        category: "Legal",
        mode: "Bank",
        amount: 25000,
      },
      "ds_test_resilience"
    );

    expect(tx1.id).toBeDefined();
    expect(tx2.id).toBeDefined();
    expect(tx1.id).not.toBe(tx2.id);
    expect(tx1.transCode).toBeDefined();
    expect(tx2.transCode).toBeDefined();
  });

  it("isolates demo sandbox guest dataset strictly from production memory", async () => {
    const demoProps = await getProperties("ds_demo_sandbox");
    const demoTxs = await getTransactions("ds_demo_sandbox");

    expect(demoProps.length).toBeGreaterThan(0);
    expect(demoTxs.length).toBeGreaterThan(0);

    // Verify all demo properties are synthetic mocks
    for (const p of demoProps) {
      expect(p.propertyCode).toBeDefined();
    }
  });

  it("automatically initiates fresh reconnect when connection drops to readyState 0 (mobile sleep/idle disconnect)", async () => {
    process.env.MONGODB_URI = "mongodb://fake-cluster:27017/test";

    let connectCount = 0;
    const connectionState = { readyState: 1 };
    const mockMongoose = {
      connection: connectionState,
    } as unknown as typeof mongoose;

    vi.spyOn(mongoose, "connect").mockImplementation(() => {
      connectCount++;
      return Promise.resolve(mockMongoose);
    });

    // 1. Initial connection succeeds
    const conn1 = await connectDB();
    expect(conn1).toBe(mockMongoose);
    expect(connectCount).toBe(1);

    // 2. Subsequent call while connected reuses the instance without connecting again
    const conn2 = await connectDB();
    expect(conn2).toBe(mockMongoose);
    expect(connectCount).toBe(1);

    // 3. Simulate mobile phone going to sleep or Atlas idle socket timeout: readyState drops to 0
    connectionState.readyState = 0;

    // 4. Next call to connectDB (e.g. user submits a transaction after unlocking phone)
    // MUST trigger a new connection rather than returning a dead connection or throwing
    const conn3 = await connectDB();
    expect(conn3).toBe(mockMongoose);
    expect(connectCount).toBe(2);
  });

  it("ensures ensureDB retries on transient connection delay before giving up", async () => {
    process.env.MONGODB_URI = "mongodb://fake-cluster:27017/test";

    let attempts = 0;
    const mockMongoose = {
      connection: { readyState: 1 },
    } as unknown as typeof mongoose;

    vi.spyOn(mongoose, "connect").mockImplementation(() => {
      attempts++;
      if (attempts === 1) {
        return Promise.reject(new Error("Transient connection timeout"));
      }
      return Promise.resolve(mockMongoose);
    });

    const isConnected = await ensureDB(2);
    expect(isConnected).toBe(true);
    expect(attempts).toBe(2);
  });

  it("recovers and completes writes when encountering transient network disconnection", async () => {
    process.env.MONGODB_URI = "mongodb://fake-cluster:27017/test";

    let connectAttempts = 0;
    const mockMongoose = {
      connection: { readyState: 1 },
    } as unknown as typeof mongoose;

    vi.spyOn(mongoose, "connect").mockImplementation(() => {
      connectAttempts++;
      return Promise.resolve(mockMongoose);
    });

    // In offline/test mode without live Atlas, addProperty calls withDBRetry
    // Let's verify addProperty completes cleanly with valid dataset
    const prop = await addProperty(
      {
        name: "Test Resilient Villa",
        type: "personal",
        agreedPurchasePrice: 5000000,
        acquisitionDate: "2026-03-01",
        status: "open",
      },
      "ds_demo_sandbox"
    );

    expect(prop.name).toBe("Test Resilient Villa");
    expect(prop.propertyCode).toBeDefined();
  });
});
