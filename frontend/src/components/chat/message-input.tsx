"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/use-chat";
import { Send, Paperclip, Smile, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
    channelId: string;
}

export function MessageInput({ channelId }: MessageInputProps) {
    const { sendMessage, startTyping, stopTyping } = useChat();
    const { toast } = useToast();

    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
            
            // Clear input
            setMessage("");
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
        <div className="border-t bg-background p-4">
            <div className="flex items-end gap-2">
                {/* Attachment Button */}
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={handleFileAttachment}
                    disabled={isSending}
                >
                    <Paperclip className="w-5 h-5" />
                </Button>

                {/* Message Input */}
                <div className="flex-1 relative">
                    <Textarea
                        placeholder="Type a message..."
                        value={message}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        disabled={isSending}
                        className="min-h-11 max-h-50 resize-none pr-10"
                        rows={1}
                    />
                    
                    {/* Emoji Button (inside textarea) */}
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={handleEmoji}
                        disabled={isSending}
                        className="absolute right-2 bottom-2 h-8 w-8"
                    >
                        <Smile className="w-4 h-4" />
                    </Button>
                </div>

                {/* Send Button */}
                <Button
                    onClick={handleSend}
                    disabled={!message.trim() || isSending}
                    size="icon"
                >
                    {isSending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                </Button>
            </div>

            {/* Helper Text */}
            <p className="text-xs text-muted-foreground mt-2">
                Press <kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd> to send,{" "}
                <kbd className="px-1 py-0.5 bg-muted rounded">Shift+Enter</kbd> for new line
            </p>
        </div>
    );
}
