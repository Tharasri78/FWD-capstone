require("dotenv").config();

const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database (NO localhost fallback)
  database: {
    uri: process.env.MONGODB_URI
  },

  // CORS (dev vs prod)
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CORS_ORIGIN
        : "http://localhost:5173"
  }
};

// Fail fast if Mongo URI is missing
if (!config.database.uri) {
  throw new Error("❌ MONGODB_URI is not defined in environment variables");
}

module.exports = config;