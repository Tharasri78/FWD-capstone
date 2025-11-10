require('dotenv').config();

const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database - Use MONGODB_URI (standard naming)
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/blogApp'
  },
  
  // CORS - Updated to port 5173
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  },
  
  // ... rest of your config
};

module.exports = config;