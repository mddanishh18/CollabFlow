import { Server } from "socket.io";
import { AuthenticatedSocket } from "../middleware/socketAuth.js";
import Channel from "../models/Channel.js";
import { Types } from "mongoose";

// Rate limiting for typing indicators
const typingLimiters = new Map<string, number>();
const TYPING_COOLDOWN_MS = 2000; // 2 seconds between typing events

// Input validation helper
const isValidObjectId = (id: string): boolean => {
    return Types.ObjectId.isValid(id);
};

export const registerChatHandlers = (
    io: Server,
    socket: AuthenticatedSocket
) => {
    // Error handler for this socket
    socket.on("error", (error) => {
        console.error(`[chatHandlers] Socket error for user ${socket.userId}:`, error);
    });

    // Join a channel room with authorization
    socket.on("channel:join", async (channelId: string, callback?: (response: { success: boolean; error?: string }) => void) => {
        try {
            // Input validation
            if (!channelId || typeof channelId !== 'string') {
                const error = "Invalid channel ID";
                console.error(`[chatHandlers] ${error}`);
                socket.emit("error", { event: "channel:join", message: error });
                if (callback) callback({ success: false, error });
                return;
            }

            if (!isValidObjectId(channelId)) {
                const error = "Invalid channel ID format";
                console.error(`[chatHandlers] ${error}`);
                socket.emit("error", { event: "channel:join", message: error });
                if (callback) callback({ success: false, error });
                return;
            }

            // Authorization check - verify user has access to this channel
            const channel = await Channel.findById(channelId);
            
            if (!channel) {
                const error = "Channel not found";
                console.error(`[chatHandlers] ${error}: ${channelId}`);
                socket.emit("error", { event: "channel:join", message: error });
                if (callback) callback({ success: false, error });
                return;
            }

            // Check if user is a member (for private channels) or workspace member (for public)
            const userId = new Types.ObjectId(socket.userId);
            if (channel.type === 'private' || channel.type === 'direct') {
                if (!channel.isMember(userId)) {
                    const error = "Access denied: You are not a member of this channel";
                    console.error(`[chatHandlers] ${error} - User: ${socket.userId}, Channel: ${channelId}`);
                    socket.emit("error", { event: "channel:join", message: error });
                    if (callback) callback({ success: false, error });
                    return;
                }
            }

            // Join the room
            socket.join(`channel:${channelId}`);
            
            // Notify others in the channel
            socket.to(`channel:${channelId}`).emit("channel:userJoined", {
                userId: socket.userId,
                user: socket.user
            });

            // Send success acknowledgment
            if (callback) callback({ success: true });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to join channel";
            console.error(`[chatHandlers] Error joining channel:`, error);
            socket.emit("error", { event: "channel:join", message: errorMessage });
            if (callback) callback({ success: false, error: errorMessage });
        }
    });

    // Leave a channel room with validation
    socket.on("channel:leave", (channelId: string, callback?: (response: { success: boolean; error?: string }) => void) => {
        try {
            // Input validation
            if (!channelId || typeof channelId !== 'string') {
                const error = "Invalid channel ID";
                console.error(`[chatHandlers] ${error}`);
                socket.emit("error", { event: "channel:leave", message: error });
                if (callback) callback({ success: false, error });
                return;
            }

            socket.to(`channel:${channelId}`).emit("channel:userLeft", {
                userId: socket.userId,
                user: socket.user
            });
            socket.leave(`channel:${channelId}`);
            
            if (callback) callback({ success: true });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to leave channel";
            console.error(`[chatHandlers] Error leaving channel:`, error);
            socket.emit("error", { event: "channel:leave", message: errorMessage });
            if (callback) callback({ success: false, error: errorMessage });
        }
    });

    // Broadcast new message (after REST API saves it) with validation
    socket.on("message:send", (data: { channelId: string; message: any }) => {
        try {
            // Input validation
            if (!data || !data.channelId || !data.message) {
                const error = "Invalid message data";
                console.error(`[chatHandlers] ${error}`);
                socket.emit("error", { event: "message:send", message: error });
                return;
            }

            if (!isValidObjectId(data.channelId)) {
                const error = "Invalid channel ID format";
                console.error(`[chatHandlers] ${error}`);
                socket.emit("error", { event: "message:send", message: error });
                return;
            }

            socket.to(`channel:${data.channelId}`).emit("message:new", data.message);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to send message";
            console.error(`[chatHandlers] Error broadcasting message:`, error);
            socket.emit("error", { event: "message:send", message: errorMessage });
        }
    });

    // Broadcast edited message with validation
    socket.on("message:edit", (data: { channelId: string; message: any }) => {
        try {
            // Input validation
            if (!data || !data.channelId || !data.message) {
                const error = "Invalid message edit data";
                console.error(`[chatHandlers] ${error}`);
                socket.emit("error", { event: "message:edit", message: error });
                return;
            }

            socket.to(`channel:${data.channelId}`).emit("message:updated", data.message);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to edit message";
            console.error(`[chatHandlers] Error broadcasting message edit:`, error);
            socket.emit("error", { event: "message:edit", message: errorMessage });
        }
    });

    // Broadcast deleted message with validation
    socket.on("message:delete", (data: { channelId: string; messageId: string }) => {
        try {
            // Input validation
            if (!data || !data.channelId || !data.messageId) {
                const error = "Invalid message delete data";
                console.error(`[chatHandlers] ${error}`);
                socket.emit("error", { event: "message:delete", message: error });
                return;
            }

            socket.to(`channel:${data.channelId}`).emit("message:deleted", {
                channelId: data.channelId,
                messageId: data.messageId
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to delete message";
            console.error(`[chatHandlers] Error broadcasting message delete:`, error);
            socket.emit("error", { event: "message:delete", message: errorMessage });
        }
    });

    // Typing indicator with rate limiting
    socket.on("typing:start", (channelId: string) => {
        try {
            // Input validation
            if (!channelId || typeof channelId !== 'string') {
                console.error(`[chatHandlers] Invalid channelId for typing:start`);
                return;
            }

            // Rate limiting - prevent spam
            const rateLimitKey = `${socket.userId}:${channelId}`;
            const lastTyping = typingLimiters.get(rateLimitKey) || 0;
            const now = Date.now();

            if (now - lastTyping < TYPING_COOLDOWN_MS) {
                // Ignore rapid-fire typing events
                return;
            }

            typingLimiters.set(rateLimitKey, now);

            // Broadcast typing indicator
            socket.to(`channel:${channelId}`).emit("user:typing", {
                userId: socket.userId,
                user: socket.user,
                channelId: channelId
            });

            // Clean up old rate limit entries (prevent memory leak)
            if (typingLimiters.size > 1000) {
                const oldEntries = Array.from(typingLimiters.entries())
                    .filter(([_, timestamp]) => now - timestamp > 60000); // Remove entries older than 1 minute
                oldEntries.forEach(([key]) => typingLimiters.delete(key));
            }
        } catch (error) {
            console.error(`[chatHandlers] Error handling typing:start:`, error);
        }
    });

    socket.on("typing:stop", (channelId: string) => {
        try {
            // Input validation
            if (!channelId || typeof channelId !== 'string') {
                console.error(`[chatHandlers] Invalid channelId for typing:stop`);
                return;
            }

            socket.to(`channel:${channelId}`).emit("user:stopTyping", {
                userId: socket.userId,
                channelId: channelId
            });
        } catch (error) {
            console.error(`[chatHandlers] Error handling typing:stop:`, error);
        }
    });

    // Read receipts with validation
    socket.on("message:read", (data: { channelId: string; messageIds: string[] }) => {
        try {
            // Input validation
            if (!data || !data.channelId || !Array.isArray(data.messageIds)) {
                const error = "Invalid read receipt data";
                console.error(`[chatHandlers] ${error}`);
                socket.emit("error", { event: "message:read", message: error });
                return;
            }

            socket.to(`channel:${data.channelId}`).emit("message:seen", {
                userId: socket.userId,
                user: socket.user,
                messageIds: data.messageIds
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to mark messages as read";
            console.error(`[chatHandlers] Error handling read receipts:`, error);
            socket.emit("error", { event: "message:read", message: errorMessage });
        }
    });
};