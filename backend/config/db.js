import mongoose from 'mongoose';

let memoryServer = null;

export async function connectDB() {
  mongoose.set('strictQuery', true);
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/medai';

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log('[MedAi] MongoDB connected');
    return;
  } catch (err) {
    if (process.env.NODE_ENV === 'production') throw err;
    console.warn('[MedAi] Local MongoDB unavailable, starting in-memory database...');
  }

  const { MongoMemoryServer } = await import('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri());
  console.log('[MedAi] In-memory MongoDB connected (dev mode)');
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
