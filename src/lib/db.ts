import mongoose from "mongoose";

/**
 * Global cache interface for Mongoose connection across serverless invocations.
 */
interface MongooseGlobalCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  listenersAttached?: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseGlobalCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = {
    conn: null,
    promise: null,
    listenersAttached: false,
  };
}

/**
 * Resets the connection cache completely.
 * Exported so dataStore and test runners can force a fresh reconnect when needed.
 */
export function resetConnectionCache(): void {
  if (cached) {
    cached.conn = null;
    cached.promise = null;
  }
}

/**
 * Sanitize and clean MongoDB connection string
 * (removes accidental quotes, leading/trailing whitespace, etc.)
 */
export function getSanitizedMongoUri(): string | undefined {
  let uri = process.env.MONGODB_URI?.trim();
  if (!uri) return undefined;

  // Strip leading/trailing single or double quotes
  uri = uri.replace(/^["']+|["']+$/g, "").trim();

  // If someone accidentally pasted "MONGODB_URI=..." into the value field
  if (uri.startsWith("MONGODB_URI=")) {
    uri = uri.replace(/^MONGODB_URI=/, "").trim();
    uri = uri.replace(/^["']+|["']+$/g, "").trim();
  }

  return uri || undefined;
}

/**
 * Get target database name.
 * Defaults to "production" for real business data and "test" for automated testing.
 */
export function getTargetDbName(): string {
  if (process.env.MONGODB_DB) {
    return process.env.MONGODB_DB.trim();
  }
  if (process.env.NODE_ENV === "test") {
    return "test";
  }
  return "production";
}

/**
 * Connect to MongoDB Atlas with pooled serverless connection pointing to the production database.
 * Thread-safe promise caching ensures concurrent calls share the same connection attempt.
 */
export async function connectDB(overrideDbName?: string): Promise<typeof mongoose> {
  const MONGODB_URI = getSanitizedMongoUri();
  const dbName = overrideDbName || getTargetDbName();

  if (!MONGODB_URI) {
    const errorMsg = "MONGODB_URI is not defined in environment variables.";
    console.warn(errorMsg);
    throw new Error(errorMsg);
  }

  const activeReadyState =
    (cached!.conn as typeof mongoose | null)?.connection?.readyState ??
    mongoose.connection.readyState;

  // 1. If actively connected, reuse connection immediately
  if (cached!.conn && activeReadyState === 1) {
    return cached!.conn;
  }

  // 2. If a connection is in-flight, await the shared promise
  if (cached!.promise) {
    return await cached!.promise;
  }

  // 3. Stale or disconnected: clear connection handle before reconnecting
  cached!.conn = null;

  if (activeReadyState === 3) {
    try {
      await mongoose.connection.close();
    } catch {
      // Disconnecting transition; safe to proceed
    }
  }

  // Attach lifecycle event listeners once to catch future drops and invalidate cache
  if (!cached!.listenersAttached && mongoose.connection) {
    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB connection disconnected: cache reset for auto-reconnect");
      if (cached) {
        cached.conn = null;
        cached.promise = null;
      }
    });
    mongoose.connection.on("close", () => {
      if (cached) {
        cached.conn = null;
        cached.promise = null;
      }
    });
    cached!.listenersAttached = true;
  }

  const opts = {
    bufferCommands: true, // Allow Mongoose to buffer model operations while connecting
    maxPoolSize: 10,
    minPoolSize: 0, // Serverless best practice: prevents frozen socket timeouts on mobile sleep
    maxIdleTimeMS: 30000, // Discard sockets idle >30s before container pause drops them
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    dbName: dbName, // Explicitly route to target database on Atlas
  };

  cached!.promise = mongoose
    .connect(MONGODB_URI, opts)
    .then((m) => {
      cached!.conn = m;
      cached!.promise = null; // Clear promise once resolved so future disconnects reconnect cleanly
      return m;
    })
    .catch((e) => {
      cached!.conn = null;
      cached!.promise = null;
      throw e;
    });

  return await cached!.promise;
}
