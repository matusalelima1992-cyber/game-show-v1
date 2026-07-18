import { io } from "socket.io-client";

const configuredSocketUrl = process.env.REACT_APP_SOCKET_URL;

const socketUrl =
  configuredSocketUrl ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3001"
    : `http://${window.location.hostname}:3001`);

const socket = io(socketUrl);

export default socket;
