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
 * Connect to MongoDB Atlas with pooled serverless connection.
 */
export async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI = getSanitizedMongoUri();

  if (!MONGODB_URI) {
    console.warn("MONGODB_URI is not defined in environment variables.");
  }

  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise && MONGODB_URI) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      return m;
    });
  }

  try {
    if (cached!.promise) {
      cached!.conn = await cached!.promise;
    }
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn as typeof mongoose;
}
