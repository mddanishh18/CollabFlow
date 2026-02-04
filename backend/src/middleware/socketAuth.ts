import { Socket } from "socket.io";
import { JwtPayload } from "../types/index.js";
import { verifyToken } from "../utils/jwt.js";

export interface AuthenticatedSocket extends Socket {
    userId: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
}

export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
    try {
        const token = socket.handshake.auth?.token;

        if (!token || typeof token !== "string") {
            console.error("❌ Socket auth failed: No token provided");
            return next(new Error("Authentication required"));
        }

        const decoded = verifyToken(token) as JwtPayload;

        if (!decoded) {
            console.error("❌ Socket auth failed: Token verification returned null");
            return next(new Error("Invalid or expired token"));
        }

        (socket as AuthenticatedSocket).userId = decoded.userId;
        (socket as AuthenticatedSocket).user = {
            _id: decoded.userId,
            name: decoded.name || "Unknown",
            email: decoded.email
        };

        console.log("✅ Socket authenticated:", decoded.email);
        next();
    } catch (error) {
        const err = error as Error;
        console.error("❌ Socket auth error:", err.message);
        next(new Error(err.message || "Authentication error"));
    }
};