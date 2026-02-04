"use client";

import { useEffect, useRef } from "react";
import { MessageItem } from "./message-item";
import { TypingIndicator } from "./typing-indicator";
import type { Message } from "@/types";

interface MessageListProps {
    messages: Message[];
    channelId: string;
    typingUsers: Array<{ userId: string; user: { _id: string; name: string; avatar?: string | null } }>;
}

export function MessageList({ messages, channelId, typingUsers }: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                        No messages yet. Be the first to say something!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {messages.map((message) => (
                <MessageItem key={message._id} message={message} channelId={channelId} />
            ))}

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
                <TypingIndicator users={typingUsers} />
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
        </div>
    );
}
