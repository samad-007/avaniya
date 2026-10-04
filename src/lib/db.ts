import mongoose from "mongoose";

/**
 * Global cache interface for Mongoose connection across serverless invocations.
 */
interface MongooseGlobalCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseGlobalCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
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

  // If already connected, reuse the active connection
  if (cached!.conn && mongoose.connection.readyState === 1) {
    return cached!.conn;
  }

  // Only reset cached promise if the connection is dead (disconnected) AND no connection is currently pending
  if (mongoose.connection.readyState === 0 && !cached!.promise) {
    cached!.conn = null;
  }

  // Initiate connection if no promise is in flight
  if (!cached!.promise) {
    const opts = {
      bufferCommands: true, // Allow Mongoose to buffer model operations while connecting
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      dbName: dbName, // Explicitly route to target database on Atlas
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      cached!.conn = m;
      return m;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    // Reset cache on failure so subsequent attempts can retry cleanly
    cached!.conn = null;
    cached!.promise = null;
    throw e;
  }

  return cached!.conn as typeof mongoose;
}
