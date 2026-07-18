import { io } from "socket.io-client";
import { buildSocketUrl } from "./qrParser";

let socket = null;
let currentUrl = "";

export function connectToGameServer(connection) {
  const socketUrl = buildSocketUrl(connection);

  if (!socketUrl) {
    throw new Error("Servidor nao informado.");
  }

  if (socket && currentUrl === socketUrl) {
    if (!socket.connected) socket.connect();
    return socket;
  }

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  currentUrl = socketUrl;
  socket = io(socketUrl, {
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 700
  });

  return socket;
}

export function getGameSocket() {
  return socket;
}

export function disconnectGameSocket() {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
  currentUrl = "";
}
