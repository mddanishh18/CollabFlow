"use client";

import { Hash, Lock, User, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useChatStore } from "@/store/chat-store";
import type { Channel } from "@/types";

interface ChannelItemProps {
    channel: Channel;
    isActive: boolean;
    onClick: () => void;
    workspaceId?: string;
    isUserOnline?: (userId: string) => boolean;
}

export function ChannelItem({ channel, isActive, onClick, workspaceId, isUserOnline }: ChannelItemProps) {
    const user = useAuthStore((state) => state.user);
    const unreadCounts = useChatStore((state) => state.unreadCounts);

    // Get unread count for this channel
    const unreadCount = unreadCounts[channel._id] || 0;

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

    // Get the other user's ID for DM channels
    const getOtherUserId = (): string | null => {
        if (channel.type === 'direct' && channel.members) {
            const currentUserId = user?._id || (user as any)?.id;
            const otherMember = channel.members.find(
                (member: any) => {
                    const memberId = typeof member === 'string' ? member : (member._id || member.id);
                    return memberId !== currentUserId;
                }
            );

            if (otherMember) {
                return typeof otherMember === 'string' ? otherMember : (otherMember._id || otherMember.id);
            }
        }
        return null;
    };

    // Check if DM user is online
    const otherUserId = getOtherUserId();
    const isDMUserOnline = channel.type === 'direct' && otherUserId && isUserOnline?.(otherUserId);

    // Get icon based on channel type
    const getIcon = () => {
        switch (channel.type) {
            case "private":
                return <Lock className="w-4 h-4" />;
            case "direct":
                return (
                    <div className="relative">
                        <User className="w-4 h-4" />
                        {isDMUserOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 border border-background" />
                        )}
                    </div>
                );
            default:
                return <Hash className="w-4 h-4" />;
        }
    };

    return (
        <button
            onClick={onClick}
            className={cn(
                "group w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                "hover:bg-accent/70 hover:text-accent-foreground hover:shadow-sm hover:translate-x-0.5",
                isActive && "bg-primary/10 text-primary border border-primary/20 shadow-sm font-medium",
                unreadCount > 0 && !isActive && "font-semibold bg-accent/40"
            )}
        >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className={cn(
                    "text-muted-foreground shrink-0 transition-transform duration-200 group-hover:scale-110",
                    isActive && "text-primary"
                )}>
                    {getIcon()}
                </div>
                <span className="truncate">{getDisplayName()}</span>
            </div>

            {/* Unread Badge */}
            {unreadCount > 0 && (
                <Badge
                    variant="destructive"
                    className="h-5 min-w-5 px-1.5 text-xs font-semibold shadow-sm animate-in fade-in zoom-in duration-200"
                >
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
