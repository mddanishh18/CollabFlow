"use client";

import { useState, useEffect } from "react";
import { useChat } from "@/hooks/use-chat";
import { useWorkspace } from "@/hooks/use-workspace";
import { useAuthStore } from "@/store/auth-store";
import { Loader2, Hash, Lock, Users } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import type { ChannelType } from "@/types";

interface CreateChannelModalProps {
    workspaceId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateChannelModal({
    workspaceId,
    open,
    onOpenChange,
}: CreateChannelModalProps) {
    const { createChannel, loading, channels } = useChat();
    const { currentWorkspace } = useWorkspace();
    const { user } = useAuthStore();
    const { toast } = useToast();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<ChannelType>("public");
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    const members = currentWorkspace?.members || [];

    // Get list of user IDs who already have DM channels with current user
    const existingDMUserIds = channels
        .filter(channel => channel.type === 'direct')
        .flatMap(channel => 
            channel.members
                .filter(member => {
                    const memberId = typeof member === 'string' ? member : member._id;
                    return memberId !== user?._id;
                })
                .map(member => typeof member === 'string' ? member : member._id)
        );

    // Filter members based on channel type
    const availableMembers = members.filter(member => {
        const userId = typeof member.user === 'string' ? member.user : member.user._id;
        
        // Don't show current user
        if (userId === user?._id) return false;
        
        // For direct messages, filter out users who already have DM with current user
        if (type === 'direct' && existingDMUserIds.includes(userId)) {
            return false;
        }
        
        return true;
    });

    // Check if current user is admin, owner, or the workspace owner
    const workspaceOwnerId = typeof currentWorkspace?.owner === 'string' 
        ? currentWorkspace?.owner 
        : currentWorkspace?.owner?._id;
    
    const isWorkspaceOwner = workspaceOwnerId === user?._id;
    
    // Check if user has owner/admin role in members array
    const currentUserMember = availableMembers.find(m => {
        const userId = typeof m.user === 'string' ? m.user : m.user._id;
        return userId === user?._id;
    });
    const currentUserRole = currentUserMember?.role || 'member';
    
    // Check userRole property from API response
    const apiUserRole = currentWorkspace?.userRole;
    
    // User can create public channel if:
    // 1. They are the workspace owner (owner field matches their ID)
    // 2. OR their role (from members array or userRole property) is 'owner' or 'admin'
    const isAdminOrOwner = isWorkspaceOwner || 
                          currentUserRole === 'admin' || 
                          currentUserRole === 'owner' ||
                          apiUserRole === 'admin' ||
                          apiUserRole === 'owner';

    // Reset selected members when channel type changes
    useEffect(() => {
        setSelectedMembers([]);
    }, [type]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // For direct messages, name is auto-generated, skip validation
        if (type !== 'direct' && !name.trim()) {
            toast({
                title: "Error",
                description: "Channel name is required",
                variant: "destructive",
            });
            return;
        }

        // For direct messages, must have exactly 1 member selected
        if (type === 'direct' && selectedMembers.length !== 1) {
            toast({
                title: "Error",
                description: "Please select exactly one person for direct message",
                variant: "destructive",
            });
            return;
        }

        try {
            const channel = await createChannel({
                name: type === 'direct' ? 'DM' : name.trim(), // Auto-name for DMs
                description: description.trim(),
                type,
                workspaceId,
                members: type === "public" ? [] : selectedMembers,
            });

            // Show appropriate success message
            const successMessage = type === 'direct'
                ? 'Direct message channel opened'
                : `Channel "${name}" created successfully`;

            toast({
                title: "Success",
                description: successMessage,
            });

            // Reset form
            setName("");
            setDescription("");
            setType("public");
            setSelectedMembers([]);
            onOpenChange(false);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create channel",
                variant: "destructive",
            });
        }
    };

    const handleMemberToggle = (memberId: string) => {
        setSelectedMembers((prev) => {
            // For direct messages, only allow one member
            if (type === 'direct') {
                return prev.includes(memberId) ? [] : [memberId];
            }
            // For private channels, allow multiple
            return prev.includes(memberId)
                ? prev.filter((id) => id !== memberId)
                : [...prev, memberId];
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Channel</DialogTitle>
                    <DialogDescription>
                        Create a new channel for your workspace
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Channel Name - Hidden for Direct Messages */}
                    {type !== 'direct' && (
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Channel Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g. general, project-updates"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    )}

                    {/* Description - Hidden for Direct Messages */}
                    {type !== 'direct' && (
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="What's this channel about?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={loading}
                                rows={3}
                            />
                        </div>
                    )}

                    {/* Channel Type */}
                    <div className="space-y-3">
                        <Label>Channel Type</Label>
                        <RadioGroup
                            value={type}
                            onValueChange={(value: string) => setType(value as ChannelType)}
                            disabled={loading}
                        >
                            <div className={`flex items-start space-x-3 p-3 border rounded-md ${!isAdminOrOwner ? 'opacity-50' : ''}`}>
                                <RadioGroupItem 
                                    value="public" 
                                    id="public" 
                                    className="mt-1" 
                                    disabled={!isAdminOrOwner}
                                />
                                <div className="flex-1">
                                    <Label htmlFor="public" className={`flex items-center gap-2 ${isAdminOrOwner ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                                        <Hash className="w-4 h-4" />
                                        <span className="font-semibold">Public</span>
                                        {!isAdminOrOwner && (
                                            <span className="text-xs text-muted-foreground">(Admin/Owner only)</span>
                                        )}
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Anyone in the workspace can view and join. Only one public channel allowed per workspace.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 border rounded-md">
                                <RadioGroupItem value="private" id="private" className="mt-1" />
                                <div className="flex-1">
                                    <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
                                        <Lock className="w-4 h-4" />
                                        <span className="font-semibold">Private</span>
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Only invited members can view and join
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 border rounded-md">
                                <RadioGroupItem value="direct" id="direct" className="mt-1" />
                                <div className="flex-1">
                                    <Label htmlFor="direct" className="flex items-center gap-2 cursor-pointer">
                                        <Users className="w-4 h-4" />
                                        <span className="font-semibold">Direct Message</span>
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Private 1-on-1 conversation
                                    </p>
                                </div>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Member Selection (for private/direct channels) */}
                    {type !== "public" && (
                        <div className="space-y-2">
                            <Label>
                                {type === 'direct' ? 'Select Person' : 'Add Members'}
                                {type === 'direct' && <span className="text-destructive"> *</span>}
                            </Label>
                            {type === 'direct' && (
                                <p className="text-xs text-muted-foreground">Choose one person for 1-on-1 conversation</p>
                            )}
                            <ScrollArea className="h-[200px] border rounded-md p-3">
                                <div className="space-y-3">
                                    {availableMembers.map((member) => {
                                        const userId = typeof member.user === 'string' ? member.user : member.user._id;
                                        const userName = typeof member.user === 'string' ? 'Unknown' : member.user.name;
                                        const userAvatar = typeof member.user === 'string' ? undefined : member.user.avatar;

                                        return (
                                            <div
                                                key={userId}
                                                className="flex items-center space-x-3"
                                            >
                                                <Checkbox
                                                    id={userId}
                                                    checked={selectedMembers.includes(userId)}
                                                    onCheckedChange={() => handleMemberToggle(userId)}
                                                />
                                                <Label
                                                    htmlFor={userId}
                                                    className="flex items-center gap-2 flex-1 cursor-pointer"
                                                >
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarImage src={userAvatar || undefined} />
                                                        <AvatarFallback>
                                                            {userName.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm">{userName}</span>
                                                </Label>
                                            </div>
                                        );
                                    })}

                                    {availableMembers.length === 0 && (
                                        <div className="text-center py-4 text-sm text-muted-foreground">
                                            {type === 'direct' 
                                                ? 'No available members. You already have DM channels with all workspace members.' 
                                                : 'No members available'}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create Channel
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
