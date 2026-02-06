"use client";

import { useEffect, useRef } from "react";
import { MessageItem } from "./message-item";
import { TypingIndicator } from "./typing-indicator";
import { MessageSquare } from "lucide-react";
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
            <div className="flex items-center justify-center h-full p-6">
                <div className="text-center space-y-4 max-w-sm mx-auto">
                    <div className="relative inline-block">
                        <MessageSquare className="w-20 h-20 mx-auto text-muted-foreground/20 stroke-[1.5]" />
                        <div className="absolute inset-0 bg-linear-to-b from-primary/30 to-transparent blur-2xl -z-10" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">
                            Start the conversation
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Share ideas, updates, ask questions, or just say hi to your team!
                        </p>
                    </div>
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
