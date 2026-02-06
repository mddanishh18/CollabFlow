import { Server } from "socket.io";
import { AuthenticatedSocket } from "../middleware/socketAuth.js";
import { Types } from "mongoose";

// Store full user objects instead of just IDs
interface OnlineUser {
    _id: string;
    name: string;
    email: string;
}

export const onlineUsers = new Map<string, Map<string, OnlineUser>>();

// Input validation helper
const isValidObjectId = (id: string): boolean => {
    return Types.ObjectId.isValid(id);
};

export const registerPresenceHandlers = (
    io: Server,
    socket: AuthenticatedSocket
) => {
    // Error handler
    socket.on("error", (error) => {
        console.error(`[presenceHandlers] Socket error for user ${socket.userId}:`, error);
    });

    //user joins a project with validation
    socket.on("join:project", (projectId: string) => {
        try {
            // Input validation
            if (!projectId || typeof projectId !== 'string') {
                const error = "Invalid project ID";
                console.error(`[presenceHandlers] ${error}`);
                socket.emit("error", { event: "join:project", message: error });
                return;
            }

            if (!isValidObjectId(projectId)) {
                const error = "Invalid project ID format";
                console.error(`[presenceHandlers] ${error}`);
                socket.emit("error", { event: "join:project", message: error });
                return;
            }

            const roomName = `project:${projectId}`;
            socket.join(roomName);

            //track online users with full user object
            if (!onlineUsers.has(roomName)) {
                onlineUsers.set(roomName, new Map());
            }

            const userObj: OnlineUser = {
                _id: socket.userId,
                name: socket.user.name,
                email: socket.user.email
            };
            onlineUsers.get(roomName)!.set(socket.userId, userObj);

            //notify others in same room
            socket.to(roomName).emit("user:joined", {
                userId: socket.userId,
                user: userObj,
            });

            //send current online users to the joining user (as array of full user objects)
            const usersInRoom = Array.from(onlineUsers.get(roomName)?.values() || []);
            socket.emit("room:users", { users: usersInRoom });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to join project";
            console.error(`[presenceHandlers] Error joining project:`, error);
            socket.emit("error", { event: "join:project", message: errorMessage });
        }
    });

    //user leaves a project room with validation
    socket.on("leave:project", (projectId: string) => {
        try {
            // Input validation
            if (!projectId || typeof projectId !== 'string') {
                console.error(`[presenceHandlers] Invalid project ID for leave:project`);
                return;
            }

            const roomName = `project:${projectId}`;
            socket.leave(roomName);

            //remove from online users
            onlineUsers.get(roomName)?.delete(socket.userId);

            //notify others in same room
            socket.to(roomName).emit("user:left", {
                userId: socket.userId,
            });
        } catch (error) {
            console.error(`[presenceHandlers] Error leaving project:`, error);
        }
    });

    //user joins a workspace with validation
    socket.on("join:workspace", (workspaceId: string) => {
        try {
            // Input validation
            if (!workspaceId || typeof workspaceId !== 'string') {
                const error = "Invalid workspace ID";
                console.error(`[presenceHandlers] ${error}`);
                socket.emit("error", { event: "join:workspace", message: error });
                return;
            }

            if (!isValidObjectId(workspaceId)) {
                const error = "Invalid workspace ID format";
                console.error(`[presenceHandlers] ${error}`);
                socket.emit("error", { event: "join:workspace", message: error });
                return;
            }

            const roomName = `workspace:${workspaceId}`;
            socket.join(roomName);

            //track online users with full user object
            if (!onlineUsers.has(roomName)) {
                onlineUsers.set(roomName, new Map());
            }

            const userObj: OnlineUser = {
                _id: socket.userId,
                name: socket.user.name,
                email: socket.user.email
            };
            onlineUsers.get(roomName)!.set(socket.userId, userObj);

            //notify others in same room
            socket.to(roomName).emit("user:joined", {
                userId: socket.userId,
                user: userObj,
            });

            //send current online users to the joining user (as array of full user objects)
            const usersInRoom = Array.from(onlineUsers.get(roomName)?.values() || []);
            socket.emit("workspace:users", { users: usersInRoom });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to join workspace";
            console.error(`[presenceHandlers] Error joining workspace:`, error);
            socket.emit("error", { event: "join:workspace", message: errorMessage });
        }
    });

    //user leaves a workspace room with validation
    socket.on("leave:workspace", (workspaceId: string) => {
        try {
            // Input validation
            if (!workspaceId || typeof workspaceId !== 'string') {
                console.error(`[presenceHandlers] Invalid workspace ID for leave:workspace`);
                return;
            }

            const roomName = `workspace:${workspaceId}`;
            socket.leave(roomName);

            //remove from online users
            onlineUsers.get(roomName)?.delete(socket.userId);

            //notify others in same room
            socket.to(roomName).emit("user:left", {
                userId: socket.userId,
            });
        } catch (error) {
            console.error(`[presenceHandlers] Error leaving workspace:`, error);
        }
    });

    //handle disconnect
    socket.on("disconnect", () => {
        //remove user from all rooms they were in
        for (const [roomName, users] of onlineUsers.entries()) {
            if (users.has(socket.userId)) {
                users.delete(socket.userId);
                socket.to(roomName).emit("user:left", {
                    userId: socket.userId,
                });
            }
        }
    })
}