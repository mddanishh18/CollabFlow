"use client";

import { useState } from "react";
import { useChat } from "@/hooks/use-chat";
import { useAuthStore } from "@/store/auth-store";
import { useWorkspace } from "@/hooks/use-workspace";
import { Users, UserMinus, Crown, Loader2, UserPlus } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Channel } from "@/types";

interface ChannelMembersProps {
    channel: Channel;
}

export function ChannelMembers({ channel }: ChannelMembersProps) {
    const { removeMember, addMember } = useChat();
    const { user } = useAuthStore();
    const { currentWorkspace } = useWorkspace();
    const { toast } = useToast();
    const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
    const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
    const [selectedNewMembers, setSelectedNewMembers] = useState<string[]>([]);
    const [addingMembers, setAddingMembers] = useState(false);

    const handleRemoveMember = async (memberId: string) => {
        try {
            setRemovingMemberId(memberId);
            await removeMember(channel._id, memberId);
            toast({
                title: "Success",
                description: "Member removed from channel",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to remove member",
                variant: "destructive",
            });
        } finally {
            setRemovingMemberId(null);
        }
    };

    const handleAddMembers = async () => {
        if (selectedNewMembers.length === 0) {
            toast({
                title: "Error",
                description: "Please select at least one member to add",
                variant: "destructive",
            });
            return;
        }

        try {
            setAddingMembers(true);
            
            // Add members one by one
            for (const memberId of selectedNewMembers) {
                await addMember(channel._id, memberId);
            }

            toast({
                title: "Success",
                description: `${selectedNewMembers.length} member(s) added successfully`,
            });

            setSelectedNewMembers([]);
            setAddMemberDialogOpen(false);
            
            // Refresh the page to show updated members
            window.location.reload();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to add members",
                variant: "destructive",
            });
        } finally {
            setAddingMembers(false);
        }
    };

    const toggleMemberSelection = (memberId: string) => {
        setSelectedNewMembers(prev => 
            prev.includes(memberId) 
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const members = channel.members || [];
    const isOwner = typeof channel.createdBy === 'string' 
        ? channel.createdBy === user?._id 
        : channel.createdBy?._id === user?._id;

    // Get workspace members who are not already in the channel (for private channels)
    const workspaceMembers = currentWorkspace?.members || [];
    const channelMemberIds = members.map(m => typeof m === 'string' ? m : m._id);
    const availableMembers = workspaceMembers.filter(wm => {
        const wmId = typeof wm.user === 'string' ? wm.user : wm.user._id;
        return !channelMemberIds.includes(wmId);
    });

    console.log('[ChannelMembers] Debug:', {
        channelType: channel.type,
        isOwner,
        availableMembersCount: availableMembers.length,
        shouldShowAddButton: channel.type === 'private' && isOwner && availableMembers.length > 0
    });

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    {members.length} Members
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Channel Members</SheetTitle>
                    <SheetDescription>
                        {members.length} {members.length === 1 ? "member" : "members"} in #{channel.name}
                    </SheetDescription>
                </SheetHeader>

                {/* Add Member Button (only for private channels and if user is owner) */}
                {channel.type === 'private' && isOwner && availableMembers.length > 0 && (
                    <div className="mt-4">
                        <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full">
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Add Members
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Members to Channel</DialogTitle>
                                    <DialogDescription>
                                        Select workspace members to invite to this private channel
                                    </DialogDescription>
                                </DialogHeader>

                                <ScrollArea className="h-[300px] border rounded-md p-4">
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
                                                        id={`add-${userId}`}
                                                        checked={selectedNewMembers.includes(userId)}
                                                        onCheckedChange={() => toggleMemberSelection(userId)}
                                                    />
                                                    <Label
                                                        htmlFor={`add-${userId}`}
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
                                    </div>
                                </ScrollArea>

                                <div className="flex justify-end gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setAddMemberDialogOpen(false)}
                                        disabled={addingMembers}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleAddMembers}
                                        disabled={addingMembers || selectedNewMembers.length === 0}
                                    >
                                        {addingMembers ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Adding...
                                            </>
                                        ) : (
                                            `Add ${selectedNewMembers.length > 0 ? `(${selectedNewMembers.length})` : ''}`
                                        )}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}

                <ScrollArea className="h-[calc(100vh-120px)] mt-6">
                    <div className="space-y-4">
                        {members.map((member) => {
                            // Handle both populated User and string ID
                            const userId = typeof member === 'string' ? member : member._id;
                            const userName = typeof member === 'string' ? 'Unknown' : member.name;
                            const userEmail = typeof member === 'string' ? '' : member.email;
                            const userAvatar = typeof member === 'string' ? undefined : member.avatar;
                            
                            const isMemberOwner = typeof channel.createdBy === 'string'
                                ? channel.createdBy === userId
                                : channel.createdBy?._id === userId;
                            
                            const isCurrentUser = userId === user?._id;

                            return (
                                <div
                                    key={userId}
                                    className="flex items-center justify-between gap-3 p-3 rounded-md border"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage src={userAvatar || undefined} />
                                            <AvatarFallback>
                                                {userName.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-sm truncate">
                                                    {userName}
                                                    {isCurrentUser && (
                                                        <span className="text-xs text-muted-foreground ml-1">
                                                            (you)
                                                        </span>
                                                    )}
                                                </p>
                                                {isMemberOwner && (
                                                    <Crown className="w-3 h-3 text-yellow-500 shrink-0" />
                                                )}
                                            </div>
                                            {userEmail && (
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {userEmail}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Remove Member Button (only for owner, not for themselves) */}
                                    {isOwner && !isCurrentUser && !isMemberOwner && (
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleRemoveMember(userId)}
                                            disabled={removingMemberId === userId}
                                        >
                                            {removingMemberId === userId ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <UserMinus className="w-4 h-4" />
                                            )}
                                        </Button>
                                    )}
                                </div>
                            );
                        })}

                        {members.length === 0 && (
                            <div className="text-center py-8 text-sm text-muted-foreground">
                                No members in this channel
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
