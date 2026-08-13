// src/services/socket.js
// Single shared Socket.io client instance. connectSocket() is called once
// after login (see AuthContext.jsx) so the connection carries the JWT for
// the server-side auth check in server/socket.js.
import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (token) => {
  if (socket) return socket;

  socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
    auth: { token },
    autoConnect: true,
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
