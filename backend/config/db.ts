import mongoose from 'mongoose';
import { env } from './env.ts';

let mongoConnected = false;

export async function connectDatabase(): Promise<boolean> {
  if (!env.mongoUri) {
    console.info('[Database] MONGODB_URI not set. Using local persistent data store (.data/quizora.json).');
    mongoConnected = false;
    return false;
  }

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    mongoConnected = true;
    console.info('[Database] Connected to MongoDB Atlas.');
    return true;
  } catch (err) {
    console.error('[Database] MongoDB Atlas connection failed, falling back to local persistent store:', (err as Error).message);
    mongoConnected = false;
    return false;
  }
}

export function isMongoConnected(): boolean {
  return mongoConnected && mongoose.connection.readyState === 1;
}
