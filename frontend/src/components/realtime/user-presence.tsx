"use client"

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/use-socket";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";

interface UserPresenceProps {
    projectId: string;
}

interface OnlineUser {
    _id: string;
    name: string;
    email: string;
}

export function UserPresence({ projectId }: UserPresenceProps) {
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const { emit, on, isConnected } = useSocket();

    useEffect(() => {
        if (!isConnected || !projectId) return;

        // Join project room
        emit("join:project", projectId);

        // Listen for online users list
        const unsubUsers = on?.("room:users", (data: { users: OnlineUser[] }) => {
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
            emit("leave:project", projectId);
        };
    }, [isConnected, projectId, emit, on]);

    if (!isConnected || onlineUsers.length === 0) return null;

    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{onlineUsers.length} online</span>
            <div className="flex -space-x-2">
                {onlineUsers.slice(0, 3).map((user) => (
                    <Avatar key={user._id} className="w-6 h-6 border-2 border-background">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {user.name?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                    </Avatar>
                ))}
                {onlineUsers.length > 3 && (
                    <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px]">
                        +{onlineUsers.length - 3}
                    </div>
                )}
            </div>
        </div>
    );
}
