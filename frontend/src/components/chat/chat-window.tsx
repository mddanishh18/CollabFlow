"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/use-chat";
import { useSocket } from "@/hooks/use-socket";
import { useAuthStore } from "@/store/auth-store";
import { Loader2, Hash, Lock, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageInput } from "./message-input";
import { MessageList } from "./message-list";
import { MessageSkeleton } from "./message-skeleton";
import { ChannelMembers } from "./channel-members";

export function ChatWindow() {
    const { isConnected } = useSocket();
    const user = useAuthStore((state) => state.user);
    const {
        activeChannel,
        messages,
        typingUsers,
        loading,
        error,
        setActiveChannel,
        fetchMessages,
        joinChannel,
        leaveChannel,
        markAsRead
    } = useChat();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const activeChannelRef = useRef(activeChannel);
    const markAsReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const previousMessageCountRef = useRef(0);

    // Helper: Get display name for channels (especially DMs)
    const getChannelDisplayName = () => {
        if (!activeChannel) return '';

        // For direct messages, ALWAYS show the other user's name (even for old DMs with custom names)
        if (activeChannel.type === 'direct' && activeChannel.members) {
            const currentUserId = user?._id || (user as any)?.id;
            const otherMember = activeChannel.members.find(
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

        // For public/private channels, use the channel name
        return activeChannel.name;
    };

    // Track activeChannel changes
    useEffect(() => {
        activeChannelRef.current = activeChannel;
    });

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            const channelId = activeChannel?._id;
            const currentMessageCount = channelId ? (messages[channelId]?.length || 0) : 0;
            const isChannelSwitch = activeChannelRef.current?._id !== activeChannel?._id;

            // Instant scroll when switching channels or loading initial messages
            // Smooth scroll only when new messages arrive in the current channel
            const behavior = isChannelSwitch || previousMessageCountRef.current === 0 ? "instant" : "smooth";

            messagesEndRef.current.scrollIntoView({ behavior: behavior as ScrollBehavior });
            previousMessageCountRef.current = currentMessageCount;
        }
    }, [messages, activeChannel]);

    // Join channel and fetch messages when active channel changes
    const channelId = activeChannel?._id;
    useEffect(() => {
        if (!channelId) {
            return;
        }

        joinChannel(channelId);
        fetchMessages(channelId, { limit: 50 });

        return () => {
            leaveChannel(channelId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channelId]);

    // Mark messages as read after viewing them for 1 second
    useEffect(() => {
        if (!channelId || !messages[channelId]?.length) {
            return;
        }

        // Clear previous timeout
        if (markAsReadTimeoutRef.current) {
            clearTimeout(markAsReadTimeoutRef.current);
        }

        // Mark as read after 1 second of viewing
        markAsReadTimeoutRef.current = setTimeout(() => {
            markAsRead(channelId).catch((err) => {
                console.error('Failed to mark messages as read:', err);
            });
        }, 1000);

        return () => {
            if (markAsReadTimeoutRef.current) {
                clearTimeout(markAsReadTimeoutRef.current);
            }
        };
    }, [channelId, messages, markAsRead]);

    // Re-join channel when socket connects (handles timing issues)
    useEffect(() => {
        if (isConnected && channelId) {
            joinChannel(channelId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnected]);

    // Handle no active channel
    if (!activeChannel) {
        return (
            <div className="flex-1 flex items-center justify-center bg-muted/20">
                <div className="text-center space-y-6 max-w-md px-6">
                    <div className="relative inline-block">
                        <Hash className="w-24 h-24 mx-auto text-muted-foreground/20 stroke-[1.5]" />
                        <div className="absolute inset-0 bg-linear-to-b from-primary/30 via-accent/15 to-transparent blur-3xl -z-10" />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-xl font-semibold text-foreground">No Channel Selected</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Select a channel from the sidebar to start chatting with your team
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const channelMessages = messages[activeChannel._id] || [];
    const activeTypingUsers = typingUsers[activeChannel._id] || [];

    // Get channel icon based on type
    const getChannelIcon = () => {
        switch (activeChannel.type) {
            case "private":
                return <Lock className="w-5 h-5" />;
            case "direct":
                return <Users className="w-5 h-5" />;
            default:
                return <Hash className="w-5 h-5" />;
        }
    };

    return (
        <div className="flex flex-col h-dvh">
            {/* Channel Header */}
            <div className="flex-none border-b bg-background px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setActiveChannel(null)}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>

                        <div className="flex items-center gap-2">
                            <div className="text-muted-foreground">
                                {getChannelIcon()}
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">{getChannelDisplayName()}</h2>
                                {activeChannel.description && activeChannel.type !== 'direct' && (
                                    <p className="text-xs text-muted-foreground">
                                        {activeChannel.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Only show members button for private channels (public has all workspace members, DMs are always 2 people) */}
                        {activeChannel.type === 'private' && (
                            <ChannelMembers channel={activeChannel} />
                        )}
                    </div>
                </div>
            </div>

            {/* Messages Area - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                {loading && channelMessages.length === 0 ? (
                    <MessageSkeleton />
                ) : error ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-2">
                            <p className="text-sm text-destructive">{error}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchMessages(activeChannel._id)}
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="p-6">
                        <MessageList
                            messages={channelMessages}
                            channelId={activeChannel._id}
                            typingUsers={activeTypingUsers}
                        />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input - Fixed at bottom */}
            <div className="flex-none border-t bg-background">
                <MessageInput channelId={activeChannel._id} />
            </div>
        </div>
    );
}
