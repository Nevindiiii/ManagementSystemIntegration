import mongoose from "mongoose";
import { application } from "./application.js";

// MongoDB connection 
const connectDB = async () => {
  try { // Check if MONGO_URI is set
    const conn = await mongoose.connect(application.MONGO_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      tls: true,
      tlsAllowInvalidCertificates: false,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log(` MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
  } catch (error) { // Handle connection errors
    console.error(" MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB'); // Successfully connected
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err); // Connection error
});

mongoose.connection.on('disconnected', () => {
  console.log(' Mongoose disconnected from MongoDB'); // Disconnected
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error(' Error during MongoDB disconnection:', error);
    process.exit(1);
  }
});

// Database utility functions
export const getDBStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats();
    return {
      collections: stats.collections,
      documents: stats.objects,
      dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
      storageSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`
    };
  } catch (error) {
    console.error('Error getting DB stats:', error);
    return null;
  }
};

export const checkDBConnection = () => {
  return mongoose.connection.readyState === 1;
};

export const closeDBConnection = async () => {
  try {
    await mongoose.connection.close();
    console.log(' Database connection closed');
  } catch (error) {
    console.error(' Error closing database connection:', error);
  }
};

export default connectDB;