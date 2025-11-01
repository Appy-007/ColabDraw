import { io, Socket } from "socket.io-client";

import { toast } from "react-toastify";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

let socket: Socket | null  = null;

const getAuthenticatedSocket = () => {
  if (socket && socket.connected) {
    return socket;
  }
  const localStorageData = localStorage.getItem("data");

  if (!localStorageData) {
    toast.error("Authentication data not found.");
    window.location.href = "/";
    return null;
  }
  const parsedData = JSON.parse(localStorageData);
  const token = parsedData?.token;

  if (!token) {
    console.error("Authentication token not found.");
    toast.error("Authentication token not found.");
    window.location.href = "/";
    return null;
  }

  socket = io(BACKEND_URL, {
    // Send the JWT in the handshake headers (best practice)
    auth: {
    token: `Bearer ${token}`,  // or just token
    },
    // Optional: Retry connection settings
    reconnectionAttempts: 5,
    transports: ["websocket"],
  });

  socket.on("connect_error", (err) => {
    console.error("Socket Connection Failed:", err.message);
    if (err.message === "Unauthorized") {
      toast.error("Unauthorized. Please log in again.");
      localStorage.removeItem("data");
      window.location.href = "/";
      // Handle unauthorized connection (e.g., clear token and redirect)
    }
  });

  return socket;
};

export default getAuthenticatedSocket;
