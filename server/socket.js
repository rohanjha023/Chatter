// socket.js
// Sets up Socket.io on top of the same HTTP server Express uses.
//
// Rooms used:
//   "feed"            -> everyone connected joins this; new posts are
//                        broadcast here so all open tabs get them live.
//   "user:<userId>"   -> a private room per logged-in user, used to push
//                        that user's own notifications (like/reply/follow).
//
// Events emitted (frontend listens for these — see client/src/services/socket.js):
//   "post:new"          -> a brand-new top-level post was created
//   "post:comment"      -> a reply was added to a post   { postId, comment }
//   "post:updated"      -> like/repost counts changed     { postId, likesCount, repostsCount }
//   "notification:new"  -> a new notification for that specific user

const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST"],
    },
  });

  // Authenticate the socket connection using the same JWT the REST API uses.
  // Client sends it via: io(url, { auth: { token } })
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(); // allow anonymous/read-only connections too
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(); // invalid token -> just treat as anonymous, don't hard-fail
    }
  });

  io.on("connection", (socket) => {
    socket.join("feed");
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    socket.on("disconnect", () => {
      // Nothing to clean up manually — Socket.io removes room membership automatically.
    });
  });

  console.log("Socket.io initialized.");
  return io;
};

/** Use this from controllers to emit events, e.g. getIO().to("feed").emit(...) */
const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized yet — call initSocket(server) first.");
  return io;
};

module.exports = { initSocket, getIO };
