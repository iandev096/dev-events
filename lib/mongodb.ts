import mongoose from 'mongoose';

/**
 * MongoDB Connection Module
 * 
 * This module provides a singleton connection to MongoDB using Mongoose.
 * It implements connection caching to prevent multiple connections during
 * Next.js development hot-reloads and ensures efficient resource usage.
 */

// TypeScript interface for the cached connection
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Extend the global namespace to include mongoose cache
 * This is necessary because Next.js hot-reloading creates new module instances,
 * but the global object persists across reloads, allowing us to maintain
 * a single database connection throughout the development session.
 */
declare global {
  var mongoose: MongooseCache | undefined;
}

// Get MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Validate that MONGODB_URI is defined
if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Initialize the global cache object if it doesn't exist
 * In production, the module is only loaded once, so this is a simple singleton
 * In development, Next.js hot-reloading may reload modules, but global persists
 */
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connect to MongoDB using Mongoose
 * 
 * This function implements the following pattern:
 * 1. Return existing connection if already established
 * 2. Return cached promise if connection is in progress (prevents race conditions)
 * 3. Create new connection if neither exists
 * 
 * @returns {Promise<typeof mongoose>} The mongoose instance with an active connection
 */
export async function connectDB(): Promise<typeof mongoose> {
  // If we already have an active connection, return it immediately
  if (cached.conn) {
    return cached.conn;
  }

  /**
   * If we don't have a connection promise, create one
   * This prevents multiple simultaneous connection attempts
   * when connectDB is called multiple times before the first connection completes
   */
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable command buffering - fail fast if not connected
    };

    // Create and cache the connection promise
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    // Await the connection promise and cache the result
    cached.conn = await cached.promise;
  } catch (error) {
    // If connection fails, clear the promise so we can retry
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

/**
 * Export mongoose for direct access to mongoose functionality
 * This allows you to use mongoose.model(), mongoose.Schema, etc.
 */
export default mongoose;
