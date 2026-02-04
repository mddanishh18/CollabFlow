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
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
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
        markAsRead(channelId);

        return () => {
            leaveChannel(channelId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channelId]);

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
                <div className="text-center space-y-4">
                    <Hash className="w-16 h-16 mx-auto text-muted-foreground/50" />
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">No Channel Selected</h3>
                        <p className="text-sm text-muted-foreground">
                            Select a channel from the sidebar to start chatting
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
        <div className="flex flex-col h-screen">
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
            <div className="flex-1 overflow-y-auto p-6">
                {loading && channelMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
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
                    <MessageList
                        messages={channelMessages}
                        channelId={activeChannel._id}
                        typingUsers={activeTypingUsers}
                    />
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
