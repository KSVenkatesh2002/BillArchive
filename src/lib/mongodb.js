import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  // In development/build mode without environment variables set, provide a graceful fallback or warning
  console.warn('Please add your MONGODB_URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri || 'mongodb://localhost:27017/bill_db', options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode (Vercel serverless functions), it's best to not use a global variable.
  client = new MongoClient(uri || 'mongodb://localhost:27017/bill_db', options);
  clientPromise = client.connect();
}

export default clientPromise;

/**
 * Utility helper to get connected database instance directly
 */
export async function getDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB || 'bill_db';
  return client.db(dbName);
}
