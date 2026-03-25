"use client"

import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/hooks/use-socket";

interface OnlineUser {
    _id: string;
    name: string;
    email: string;
}

export function useWorkspacePresence(workspaceId: string | undefined) {
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const { emit, on, isConnected } = useSocket();

    // Use a stable ref object that always has the latest functions
    // Initialized synchronously so they're valid on first effect run
    const stableRef = useRef({ emit, on, isConnected });
    stableRef.current = { emit, on, isConnected };

    useEffect(() => {
        if (!stableRef.current.isConnected || !workspaceId) {
            setOnlineUsers([]);
            return;
        }

        // Join workspace room
        stableRef.current.emit("join:workspace", workspaceId);

        // Listen for online users list
        const unsubUsers = stableRef.current.on?.("workspace:users", (data: { users: OnlineUser[] }) => {
            setOnlineUsers(data.users || []);
        });

        // Listen for user joined
        const unsubJoined = stableRef.current.on?.("workspace:user:joined", (data: { userId: string; user: OnlineUser }) => {
            setOnlineUsers(prev => {
                if (prev.some(u => u._id === data.user._id)) return prev;
                return [...prev, data.user];
            });
        });

        // Listen for user left
        const unsubLeft = stableRef.current.on?.("workspace:user:left", (data: { userId: string }) => {
            setOnlineUsers(prev => prev.filter(u => u._id !== data.userId));
        });

        return () => {
            unsubUsers?.();
            unsubJoined?.();
            unsubLeft?.();
            stableRef.current.emit("leave:workspace", workspaceId);
        };
    }, [isConnected, workspaceId]);

    const isUserOnline = (userId: string): boolean => {
        return onlineUsers.some(u => u._id === userId);
    };

    return { onlineUsers, isUserOnline };
}
