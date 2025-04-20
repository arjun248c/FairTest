const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if we're in test mode (no MongoDB required)
    if (process.env.NODE_ENV === 'test-no-db') {
      console.log('Running in test mode without MongoDB');
      return;
    }

    // Try to connect to MongoDB
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fairtest', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (mongoError) {
      console.warn(`MongoDB connection failed: ${mongoError.message}`);
      console.log('Running in memory mode - data will not be persisted');
      // Continue without MongoDB in development
      if (process.env.NODE_ENV !== 'production') {
        return;
      } else {
        // In production, we should fail if MongoDB is not available
        throw mongoError;
      }
    }
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
