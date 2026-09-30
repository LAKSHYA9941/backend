// --------------------------------------------------
// Database Connection Module
// --------------------------------------------------
// This file handles the MongoDB connection using Mongoose.
// It exports a function that connects to the database
// and logs success or failure.
// --------------------------------------------------

const mongoose = require("mongoose");

/**
 * connectDB - Establishes connection to MongoDB.
 *
 * Uses the MONGO_URI from environment variables.
 * Mongoose handles connection pooling internally,
 * so we only need to call this once at server startup.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Log the host we connected to (useful for debugging)
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);

    // Exit the process with failure code if DB connection fails.
    // The server cannot function without a database.
    process.exit(1);
  }
};

module.exports = connectDB;
