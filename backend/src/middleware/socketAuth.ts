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
            return next(new Error("Authentication required"));
        }

        const decoded = verifyToken(token) as JwtPayload;

        if (!decoded) {
            return next(new Error("Invalid or expired token"));
        }

        (socket as AuthenticatedSocket).userId = decoded.userId;
        (socket as AuthenticatedSocket).user = {
            _id: decoded.userId,
            name: decoded.name || "Unknown",
            email: decoded.email
        };

        next();
    } catch (error) {
        const err = error as Error;
        next(new Error(err.message || "Authentication error"));
    }
};
