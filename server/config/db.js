// config/db.js
// Handles the MongoDB connection using Mongoose.
// Called once, when the server starts (see server.js).

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // MONGO_URI comes from your .env file.
    // Local example: mongodb://127.0.0.1:27017/social-feed
    // Atlas example: mongodb+srv://<user>:<pass>@cluster.mongodb.net/social-feed
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Exit the process if the DB is unreachable — the app is useless without it.
    process.exit(1);
  }
};

module.exports = connectDB;
