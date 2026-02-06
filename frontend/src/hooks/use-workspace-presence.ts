"use client"

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/use-socket";

interface OnlineUser {
    _id: string;
    name: string;
    email: string;
}

export function useWorkspacePresence(workspaceId: string | undefined) {
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const { emit, on, isConnected } = useSocket();

    useEffect(() => {
        if (!isConnected || !workspaceId) {
            setOnlineUsers([]);
            return;
        }

        // Join workspace room
        emit("join:workspace", workspaceId);

        // Listen for online users list
        const unsubUsers = on?.("workspace:users", (data: { users: OnlineUser[] }) => {
            setOnlineUsers(data.users || []);
        });

        // Listen for user joined
        const unsubJoined = on?.("user:joined", (data: { userId: string; user: OnlineUser }) => {
            setOnlineUsers(prev => {
                // Avoid duplicates
                if (prev.some(u => u._id === data.user._id)) return prev;
                return [...prev, data.user];
            });
        });

        // Listen for user left
        const unsubLeft = on?.("user:left", (data: { userId: string }) => {
            setOnlineUsers(prev => prev.filter(u => u._id !== data.userId));
        });

        return () => {
            unsubUsers?.();
            unsubJoined?.();
            unsubLeft?.();
            emit("leave:workspace", workspaceId);
        };
    }, [isConnected, workspaceId, emit, on]);

    // Helper function to check if a user is online
    const isUserOnline = (userId: string): boolean => {
        return onlineUsers.some(u => u._id === userId);
    };

    return { onlineUsers, isUserOnline };
}
