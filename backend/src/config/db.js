import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/iic-website';
  const serverSelectionTimeoutMS = Number(process.env.MONGO_TIMEOUT_MS || 10000);

  try {
    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};

export const getDatabaseHealth = () => ({
  state: mongoose.connection.readyState,
  status: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
  host: mongoose.connection.host || null,
  name: mongoose.connection.name || null
});

export default connectDB;
