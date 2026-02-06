"use client";

import { useState } from "react";
import { useChat } from "@/hooks/use-chat";
import { useAuthStore } from "@/store/auth-store";
import { MoreVertical, Pencil, Trash2, Loader2, Check, CheckCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";

interface MessageItemProps {
    message: Message;
    channelId: string;
}

export function MessageItem({ message, channelId }: MessageItemProps) {
    const { editMessage, deleteMessage } = useChat();
    const { user } = useAuthStore();
    const { toast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(message.content);
    const [isDeleting, setIsDeleting] = useState(false);

    const senderId = typeof message.sender === 'string' ? message.sender : message.sender._id;
    const senderName = typeof message.sender === 'string' ? 'Unknown' : message.sender.name;
    const senderAvatar = typeof message.sender === 'string' ? undefined : message.sender.avatar;

    // Handle both _id and id for compatibility (backend uses _id, some auth might use id)
    const currentUserId = user?._id || (user as any)?.id;
    const isOwnMessage = senderId === currentUserId;

    // Calculate read receipt status for own messages
    const readByCount = message.readBy?.length || 0;
    const isRead = readByCount > 0;
    const readByOthers = message.readBy?.filter(r => {
        const readerId = typeof r.user === 'string' ? r.user : r.user._id;
        return readerId !== currentUserId;
    }) || [];

    const handleEdit = async () => {
        if (!editedContent.trim() || editedContent === message.content) {
            setIsEditing(false);
            setEditedContent(message.content);
            return;
        }

        try {
            await editMessage(channelId, message._id, editedContent.trim());
            setIsEditing(false);
            toast({
                title: "Success",
                description: "Message updated",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to edit message",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this message?")) {
            return;
        }

        try {
            setIsDeleting(true);
            await deleteMessage(channelId, message._id);
            toast({
                title: "Success",
                description: "Message deleted",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete message",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleEdit();
        } else if (e.key === "Escape") {
            setIsEditing(false);
            setEditedContent(message.content);
        }
    };

    return (
        <div
            className={cn(
                "flex gap-3 px-4 py-2 -mx-4 transition-colors",
                isOwnMessage ? "flex-row-reverse justify-start" : "group hover:bg-muted/50",
                isDeleting && "opacity-50 pointer-events-none"
            )}
        >
            {/* Avatar - hidden for own messages or shown for others */}
            {!isOwnMessage && (
                <Avatar className="w-10 h-10 shrink-0">
                    <AvatarImage src={senderAvatar && senderAvatar ? senderAvatar : undefined} />
                    <AvatarFallback>
                        {senderName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            )}

            <div className={cn(
                "min-w-0 max-w-[70%] flex flex-col",
                isOwnMessage && "items-end"
            )}>
                {/* Header */}
                <div className={cn(
                    "flex items-baseline gap-2 mb-1",
                    isOwnMessage && "flex-row-reverse"
                )}>
                    <span className="font-semibold text-sm">
                        {isOwnMessage ? "You" : senderName}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                            {new Date(message.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                        {message.isEdited && (
                            <span className="text-xs text-muted-foreground italic">
                                (edited)
                            </span>
                        )}

                        {/* Read Receipts - Only show for own messages */}
                        {isOwnMessage && (
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            className="flex items-center gap-1 text-muted-foreground cursor-pointer hover:text-foreground transition-colors touch-manipulation"
                                            onClick={(e) => {
                                                // On mobile, show alert with read receipts
                                                if ('ontouchstart' in window) {
                                                    e.preventDefault();
                                                    if (readByOthers.length > 0) {
                                                        const readers = readByOthers.map(r => {
                                                            const readerName = typeof r.user === 'string' ? 'Unknown' : r.user.name;
                                                            const readTime = new Date(r.readAt).toLocaleString([], {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            });
                                                            return `${readerName} - ${readTime}`;
                                                        }).join('\n');
                                                        alert(`Read by:\n\n${readers}`);
                                                    } else {
                                                        alert('Message sent (not yet read)');
                                                    }
                                                }
                                            }}
                                        >
                                            {readByOthers.length > 0 ? (
                                                <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                                            ) : (
                                                <Check className="w-3.5 h-3.5" />
                                            )}
                                            {readByOthers.length > 1 && (
                                                <span className="text-xs">{readByOthers.length}</span>
                                            )}
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" className="max-w-xs hidden md:block">
                                        {readByOthers.length > 0 ? (
                                            <div className="space-y-1">
                                                <p className="font-semibold text-xs">Read by:</p>
                                                {readByOthers.map((r, idx) => {
                                                    const readerName = typeof r.user === 'string'
                                                        ? 'Unknown'
                                                        : r.user.name;
                                                    const readTime = new Date(r.readAt).toLocaleString([], {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    });
                                                    return (
                                                        <div key={idx} className="text-xs">
                                                            {readerName} - {readTime}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-xs">Sent</p>
                                        )}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </div>

                {/* Content */}
                {isEditing ? (
                    <div className="space-y-2 w-full">
                        <Input
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleEdit}
                            autoFocus
                            className="text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            Press Enter to save, Esc to cancel
                        </p>
                    </div>
                ) : (
                    <>
                        <div className={cn(
                            "text-sm whitespace-pre-wrap break-words rounded-lg px-4 py-2",
                            isOwnMessage
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                        )}>
                            {message.content}
                        </div>

                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                            <div className={cn(
                                "flex flex-wrap gap-2 mt-2",
                                isOwnMessage && "justify-end"
                            )}>
                                {message.attachments.map((attachment, idx) => (
                                    <a
                                        key={idx}
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-2 bg-muted rounded text-xs hover:bg-muted/80 transition-colors"
                                    >
                                        📎 {attachment.name || attachment.url}
                                    </a>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Actions Menu (only for own messages) */}
            {isOwnMessage && !isEditing && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleDelete}
                                className="text-destructive focus:text-destructive"
                            >
                                {isDeleting ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4 mr-2" />
                                )}
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </div>
    );
}
