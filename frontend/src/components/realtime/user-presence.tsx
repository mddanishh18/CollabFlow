"use client"

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/use-socket";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

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
    const prefersReducedMotion = useReducedMotion();

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
        <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
            <Users className="w-4 h-4" />
            <span className="tabular-nums">{onlineUsers.length} online</span>
            <div className="flex -space-x-1.5">
                <AnimatePresence initial={false}>
                    {onlineUsers.slice(0, 3).map((user) => (
                        <motion.div
                            key={user._id}
                            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.7 }}
                            transition={{ duration: 0.15 }}
                        >
                            <Avatar className="w-6 h-6 border-2 border-background ring-0">
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
                                    {user.name?.charAt(0).toUpperCase() ?? "?"}
                                </AvatarFallback>
                            </Avatar>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {onlineUsers.length > 3 && (
                    <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                        +{onlineUsers.length - 3}
                    </div>
                )}
            </div>
        </div>
    );
}
