"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/use-chat";
import { Send, Paperclip, Smile, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MessageInputProps {
    channelId: string;
}

export function MessageInput({ channelId }: MessageInputProps) {
    const { sendMessage, startTyping, stopTyping } = useChat();
    const { toast } = useToast();

    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [shouldRefocus, setShouldRefocus] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Detect if user is on mobile device
    const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Handle typing indicator
    const handleTyping = () => {
        startTyping(channelId);

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing after 3 seconds
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping(channelId);
        }, 3000);
    };

    // Stop typing on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            stopTyping(channelId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channelId]);

    // Refocus textarea after sending message (disabled on mobile to prevent keyboard flickering)
    useEffect(() => {
        if (shouldRefocus && !isSending && message === "" && !isMobile) {
            textareaRef.current?.focus();
            setShouldRefocus(false);
        }
    }, [shouldRefocus, isSending, message, isMobile]);

    const handleSend = async () => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage || isSending) return;

        try {
            setIsSending(true);

            // Stop typing indicator
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            stopTyping(channelId);

            // Extract mentions (simple @username detection)
            const mentions: string[] = [];
            const mentionRegex = /@(\w+)/g;
            let match;
            while ((match = mentionRegex.exec(trimmedMessage)) !== null) {
                mentions.push(match[1]);
            }

            await sendMessage(channelId, trimmedMessage, undefined, mentions.length > 0 ? mentions : undefined);

            // Clear input and trigger refocus
            setMessage("");
            setShouldRefocus(!isMobile); // Only refocus on desktop, not mobile
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to send message",
                variant: "destructive",
            });
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Send on Enter (without Shift)
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        handleTyping();
    };

    const handleFileAttachment = () => {
        // TODO: Implement file upload
        toast({
            title: "Coming Soon",
            description: "File attachments will be available soon",
        });
    };

    const handleEmoji = () => {
        // TODO: Implement emoji picker
        toast({
            title: "Coming Soon",
            description: "Emoji picker will be available soon",
        });
    };

    return (
        <div className="px-4 py-3">
            {/* Composition container — lifts on focus */}
            <div className={cn(
                "flex items-end gap-1 rounded-2xl border border-input bg-background/80",
                "px-3 py-2 transition-all duration-200",
                "focus-within:border-ring/50 focus-within:shadow-sm focus-within:bg-background"
            )}>
                {/* Paperclip */}
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={handleFileAttachment}
                    disabled={isSending}
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                >
                    <Paperclip className="w-4 h-4" />
                </Button>

                {/* Textarea — borderless inside the container */}
                <Textarea
                    ref={textareaRef}
                    placeholder="Type a message..."
                    value={message}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    disabled={isSending}
                    className="flex-1 min-h-9 max-h-48 resize-none border-0 shadow-none focus-visible:ring-0 focus-visible:outline-none bg-transparent px-1 py-1 text-sm"
                    rows={1}
                />

                {/* Emoji */}
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={handleEmoji}
                    disabled={isSending}
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                >
                    <Smile className="w-4 h-4" />
                </Button>

                {/* Send — subtle when empty, active when has content */}
                <Button
                    onClick={handleSend}
                    disabled={!message.trim() || isSending}
                    size="icon"
                    className={cn(
                        "h-8 w-8 shrink-0 rounded-xl transition-all duration-200",
                        message.trim()
                            ? "opacity-100"
                            : "opacity-40"
                    )}
                >
                    {isSending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                </Button>
            </div>

            {/* Helper text */}
            <p className="text-xs text-muted-foreground mt-1.5 px-1">
                Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> to send,{" "}
                <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Shift+Enter</kbd> for new line
            </p>
        </div>
    );
}
