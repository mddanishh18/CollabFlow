import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createRedisClient } from "../config/redis.js";
import { socketAuthMiddleware, AuthenticatedSocket } from "../middleware/socketAuth.js";
import { registerTaskHandlers } from "../handlers/taskHandlers.js";
import { registerChatHandlers } from "../handlers/chatHandlers.js";
import { registerPresenceHandlers } from "../handlers/presenceHandlers.js";
import { logger } from "../utils/logger.js";

let io: Server;

export const getIO = (): Server => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
};

export const initializeSocket = async (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    //setup redis adapter
    const pubClient = createRedisClient();
    const subClient = pubClient?.duplicate();

    if (pubClient && subClient) {
        await Promise.all([
            new Promise((resolve) => pubClient.on("ready", resolve)),
            new Promise((resolve) => subClient.on("ready", resolve)),
        ]);
        io.adapter(createAdapter(pubClient, subClient));
        logger.log("Socket.io Redis adapter initialized");
    } else {
        logger.log("Socket.io running without Redis adapter (single server mode)");
    }

    //apply middleware
    io.use(socketAuthMiddleware);

    io.on("connection", (socket) => {
        const authSocket = socket as AuthenticatedSocket;

        // Global error handler for this socket
        socket.on("error", (error) => {
            logger.error(`[Socket] Error for user ${authSocket.userId}:`, error);
        });

        //register all event handlers
        registerTaskHandlers(io, authSocket);
        registerChatHandlers(io, authSocket);
        registerPresenceHandlers(io, authSocket);

        authSocket.on("disconnect", (reason) => {
            // Silently handle disconnection - normal operation
        });
    });

    return io;
}
