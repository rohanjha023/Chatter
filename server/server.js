// server.js
// Entry point. Run with: npm run dev  (nodemon, auto-restarts on save)
//                    or: npm start   (plain node)
//
// Wiring order matters here:
//   1. Load .env
//   2. Connect to MongoDB
//   3. Create the Express app + a raw http.Server (Socket.io needs the
//      raw http server, not the Express app, to attach to)
//   4. Initialize Socket.io on that http server
//   5. Mount all REST routes
//   6. Start listening

const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const connectDB = require("./config/db");
const { initSocket } = require("./socket");

const app = express();
const httpServer = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "https://chatter-chatter.netlify.app",
].filter(Boolean).map((origin) => origin.replace(/\/$/, ""));

app.use((req, res, next) => {
  const origin = req.headers.origin || "NO_ORIGIN";
  const authHeader = req.headers.authorization || "NO_AUTH_HEADER";

  console.log("\n=== REQUEST START ===");
  console.log("METHOD:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("ORIGIN:", origin);
  console.log("HOST:", req.headers.host);
  console.log("USER-AGENT:", req.headers["user-agent"] || "N/A");
  console.log("AUTH HEADER:", authHeader === "NO_AUTH_HEADER" ? authHeader : authHeader.slice(0, 30) + "...");

  if (req.method === "OPTIONS") {
    console.log("OPTIONS PRE-FLIGHT REQUEST");
  }

  next();
});

// --- 2. Database ---
connectDB();

// --- 3/4. Socket.io ---
initSocket(httpServer);

// --- Middleware ---
app.use(
  cors({
    origin: (origin, callback) => {
      const normalizedOrigin = origin ? origin.replace(/\/$/, "") : origin;
      console.log("CORS CHECK -> request origin:", origin);
      console.log("CORS CHECK -> allowed origins:", allowedOrigins);
      console.log("CORS CHECK -> normalized origin:", normalizedOrigin);

      if (!origin || allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      console.log("CORS BLOCKED for origin:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Serve locally-uploaded images (only used when Cloudinary isn't configured —
// see config/cloudinary.js). Files land in /server/uploads/<avatars|posts>/...
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check / sanity route
app.get("/", (req, res) => {
  res.json({ message: "Real-Time Social Media Feed API is running 🚀" });
});

// --- 5. Routes ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/bookmarks", require("./routes/bookmarkRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// Fallback error handler — catches anything thrown/rejected inside routes
// that wasn't already wrapped in its own try/catch.
app.use((err, req, res, next) => {
  console.error("=== ERROR HANDLER ===");
  console.error("METHOD:", req.method);
  console.error("URL:", req.originalUrl);
  console.error("ORIGIN:", req.headers.origin || "NO_ORIGIN");
  console.error("ERROR STACK:", err.stack);
  res.status(500).json({ message: "Something went wrong on the server", error: err.message });
});

// --- 6. Start ---
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
