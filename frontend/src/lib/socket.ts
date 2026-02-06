import { io, Socket } from "socket.io-client";
import { logger } from "./logger";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let socket: Socket | null = null;

export const initializeSocket = (token: string): Socket => {
    // Return existing connected socket
    if (socket?.connected) {
        logger.log("Socket already connected, reusing");
        return socket;
    }

    // Cleanup only if disconnected
    if (socket && !socket.connected) {
        logger.log("Cleaning up disconnected socket");
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
    }

    //create new socket connection
    logger.log("Initializing new socket connection to:", SOCKET_URL);
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
        logger.log("Socket connected:", socket?.id);
    });

    socket.on("connect_error", (error) => {
        // Handle token expiration gracefully
        if (error.message === "Token has expired" || error.message.includes("jwt expired")) {
            logger.warn("Session expired, redirecting to login...");
            // Token expired - cleanup and redirect to login
            disconnectSocket();
            // Clear auth state
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth-storage');
                window.location.href = '/login';
            }
            return;
        }

        // Log other connection errors only in development
        logger.error("Socket connection error:", error.message);
    });

    socket.on("error", (error) => {
        logger.error("Socket error:", error);
    });

    socket.on("disconnect", (reason) => {
        logger.log("Socket disconnected:", reason);
    });

    socket.io.on("reconnect", (attemptNumber) => {
        logger.log("Socket reconnected after", attemptNumber, "attempts");
    });

    socket.io.on("reconnect_attempt", (attemptNumber) => {
        logger.log("Socket reconnection attempt", attemptNumber);
    });

    socket.on("reconnect_failed", () => {
        logger.error("Socket reconnection failed after all attempts");
    });

    return socket;
};

export const getSocket = (): Socket | null => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        logger.log("Disconnecting socket");
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
    }
};

// Don't export socket directly, always use getSocket()
export default getSocket;

