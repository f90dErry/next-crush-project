// lib/mongodb.ts

import mongoose, { Mongoose } from 'mongoose'

/**
 * Define a TypeScript interface describing the shape of the cached connection.
 * - conn: The active Mongoose connection, if it exists.
 * - promise: A promise that resolves to a Mongoose connection (used during initialization).
 */
interface MongooseCache {
  conn: Mongoose | null
  promise: Promise<Mongoose> | null
}

/**
 * Add a cache object to the global namespace so it persists
 * across hot reloads in development.
 *
 * We extend the global type declaration to include `mongoose`.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined
}

// Initialize the global cache if it doesn't exist yet
const cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
}

global.mongoose = cached

/**
 * Connect to MongoDB using Mongoose with connection caching.
 * Ensures Next.js does not create multiple connections during dev hot reload.
 */
export async function connectToDatabase(): Promise<Mongoose> {
  // If a connection already exists, return it immediately
  if (cached.conn) {
    return cached.conn
  }

  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    throw new Error('❌ Missing MONGODB_URI environment variable')
  }

  // If no existing connection promise, create one
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri, {
        // These options help avoid deprecation warnings
        dbName: process.env.MONGODB_DB, // optional: DB name if not included in URI
      })
      .then((mongooseInstance) => mongooseInstance)
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    cached.promise = null // Reset promise on failure
    throw err
  }

  return cached.conn
}
