"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageItem } from "./message-item";
import { TypingIndicator } from "./typing-indicator";
import { MessageSquare } from "lucide-react";
import type { Message } from "@/types";

interface MessageListProps {
    messages: Message[];
    channelId: string;
    typingUsers: Array<{ userId: string; user: { _id: string; name: string; avatar?: string | null } }>;
}

const GROUP_THRESHOLD_MS = 5 * 60 * 1000;

const getSenderId = (m: Message) =>
    typeof m.sender === 'string' ? m.sender : m.sender._id;

export function MessageList({ messages, channelId, typingUsers }: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const initialMessageIdsRef = useRef<Set<string>>(new Set());
    const isInitialLoadDoneRef = useRef(false);
    const channelIdRef = useRef(channelId);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Track initial load and new messages
    useEffect(() => {
        if (channelId !== channelIdRef.current) {
            // Channel switched: reset tracking
            channelIdRef.current = channelId;
            initialMessageIdsRef.current.clear();
            isInitialLoadDoneRef.current = false;
        }

        if (!isInitialLoadDoneRef.current && messages.length > 0) {
            // First load for this channel: mark all current messages as "old"
            initialMessageIdsRef.current = new Set(messages.map(m => m._id));
            isInitialLoadDoneRef.current = true;
        }
    }, [messages, channelId]);

    // Compute message grouping
    const groupedMessages = messages.map((message, index) => {
        const currentSenderId = getSenderId(message);
        const previousMessage = index > 0 ? messages[index - 1] : null;
        const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;

        const isFirstInGroup = !previousMessage ||
            getSenderId(previousMessage) !== currentSenderId ||
            new Date(message.createdAt).getTime() - new Date(previousMessage.createdAt).getTime() > GROUP_THRESHOLD_MS;

        const isLastInGroup = !nextMessage ||
            getSenderId(nextMessage) !== currentSenderId ||
            new Date(nextMessage.createdAt).getTime() - new Date(message.createdAt).getTime() > GROUP_THRESHOLD_MS;

        const isNew = isInitialLoadDoneRef.current && !initialMessageIdsRef.current.has(message._id);

        return {
            message,
            isFirstInGroup,
            isLastInGroup,
            isNew,
        };
    });

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
        <div className="space-y-1">
            <AnimatePresence mode="popLayout">
                {groupedMessages.map(({ message, isFirstInGroup, isLastInGroup, isNew }) =>
                    isNew ? (
                        <motion.div
                            key={message._id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                            <MessageItem
                                message={message}
                                channelId={channelId}
                                isFirstInGroup={isFirstInGroup}
                                isLastInGroup={isLastInGroup}
                                isNew={isNew}
                            />
                        </motion.div>
                    ) : (
                        <div key={message._id}>
                            <MessageItem
                                message={message}
                                channelId={channelId}
                                isFirstInGroup={isFirstInGroup}
                                isLastInGroup={isLastInGroup}
                                isNew={isNew}
                            />
                        </div>
                    )
                )}
            </AnimatePresence>

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
                <TypingIndicator users={typingUsers} />
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
        </div>
    );
}
