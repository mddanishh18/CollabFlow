"use client";

import { Hash, Lock, User, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import type { Channel } from "@/types";

interface ChannelItemProps {
    channel: Channel;
    isActive: boolean;
    onClick: () => void;
}

export function ChannelItem({ channel, isActive, onClick }: ChannelItemProps) {
    const user = useAuthStore((state) => state.user);
    
    // Get display name - for DMs, ALWAYS show the other user's name (even for old DMs)
    const getDisplayName = () => {
        if (channel.type === 'direct' && channel.members) {
            const currentUserId = user?._id || (user as any)?.id;
            const otherMember = channel.members.find(
                (member: any) => {
                    const memberId = typeof member === 'string' ? member : (member._id || member.id);
                    return memberId !== currentUserId;
                }
            );
            
            if (otherMember && typeof otherMember === 'object') {
                return otherMember.name || 'Unknown User';
            }
            // Fallback if member not populated
            return 'Direct Message';
        }
        
        return channel.name;
    };
    // Get icon based on channel type
    const getIcon = () => {
        switch (channel.type) {
            case "private":
                return <Lock className="w-4 h-4" />;
            case "direct":
                return <User className="w-4 h-4" />;
            default:
                return <Hash className="w-4 h-4" />;
        }
    };

    // Get unread count from store (will be connected later)
    const unreadCount = 0; // TODO: Connect to unreadCounts from store

    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground font-medium"
            )}
        >
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="text-muted-foreground shrink-0">
                    {getIcon()}
                </div>
                <span className="truncate">{getDisplayName()}</span>
            </div>

            {/* Unread Badge */}
            {unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 min-w-5 px-1 text-xs">
                    {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
            )}

            {/* Muted Indicator (Optional) */}
            {/* {channel.isMuted && (
                <Volume2 className="w-3 h-3 text-muted-foreground/50" />
            )} */}
        </button>
    );
}
