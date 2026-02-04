import {io, Socket} from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let socket: Socket | null = null;

export const initializeSocket = (token: string): Socket => {
    // Return existing connected socket
    if (socket?.connected) {
        console.log("Socket already connected, reusing");
        return socket;
    }
    
    // Cleanup only if disconnected
    if (socket && !socket.connected) {
        console.log("Cleaning up disconnected socket");
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
    }

    //create new socket connection
    console.log("Initializing new socket connection to:", SOCKET_URL);
    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 10000,
        autoConnect: true,
        forceNew: false
    });

    //connection events
    socket.on("connect", () => {
        // Socket connected
    });

    socket.on("connect_error", (error) => {
        // Silently handle connection errors - Socket.IO will auto-retry
    });

    socket.on("error", (error) => {
        // Silently handle socket errors
    });

    socket.on("disconnect", () => {
        // Socket disconnected
    });

    socket.io.on("reconnect", () => {
        // Socket reconnected
    });

    socket.io.on("reconnect_attempt", () => {
        // Reconnection attempt
    });

    socket.on("reconnect_failed", () => {
        // All reconnection attempts failed
    });

    return socket;
};

export const getSocket = (): Socket | null => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        console.log("Disconnecting socket");
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
    }
};

// Don't export socket directly, always use getSocket()
export default getSocket;
