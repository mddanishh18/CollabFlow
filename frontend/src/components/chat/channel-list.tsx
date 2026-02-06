"use client";

import { useState, useEffect } from "react";
import { useChat } from "@/hooks/use-chat";
import { useWorkspacePresence } from "@/hooks/use-workspace-presence";
import { Plus, Search, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChannelItem } from "./channel-item";
import { CreateChannelModal } from "./create-channel-modal";
import type { Channel } from "@/types";

interface ChannelListProps {
    workspaceId: string;
}

export function ChannelList({ workspaceId }: ChannelListProps) {
    const { channels, activeChannel, setActiveChannel, fetchWorkspaceUnreadCounts } = useChat();
    const { isUserOnline } = useWorkspacePresence(workspaceId);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Fetch unread counts when component mounts or workspace changes
    useEffect(() => {
        if (workspaceId) {
            fetchWorkspaceUnreadCounts(workspaceId);
        }
    }, [workspaceId, fetchWorkspaceUnreadCounts]);

    // Filter channels by search query
    const filteredChannels = channels.filter((channel) =>
        channel.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group channels by type
    const publicChannels = filteredChannels.filter((c) => c.type === "public");
    const privateChannels = filteredChannels.filter((c) => c.type === "private");
    const directChannels = filteredChannels.filter((c) => c.type === "direct");

    const handleChannelSelect = (channel: Channel) => {
        // Clone channel to force new object reference - fixes Zustand identity issue
        setActiveChannel({ ...channel });
    };

    return (
        <>
            <div className="flex flex-col h-full border-r bg-card/50 backdrop-blur-md shadow-lg">
                {/* Header */}
                <div className="p-4 border-b border-border/50 bg-gradient-to-br from-muted/30 to-transparent space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <Hash className="w-4 h-4 text-primary" />
                            </div>
                            <h2 className="font-semibold text-base">Channels</h2>
                        </div>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:shadow-sm rounded-xl"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search channels..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 rounded-xl"
                        />
                    </div>
                </div>

                {/* Channel List */}
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-4">
                        {/* Public Channels */}
                        {publicChannels.length > 0 && (
                            <div className="space-y-1">
                                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                                    Public Channels
                                </div>
                                {publicChannels.map((channel) => (
                                    <ChannelItem
                                        key={channel._id}
                                        channel={channel}
                                        isActive={activeChannel?._id === channel._id}
                                        onClick={() => handleChannelSelect(channel)}
                                        workspaceId={workspaceId}
                                        isUserOnline={isUserOnline}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Private Channels */}
                        {privateChannels.length > 0 && (
                            <div className="space-y-1">
                                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                                    Private Channels
                                </div>
                                {privateChannels.map((channel) => (
                                    <ChannelItem
                                        key={channel._id}
                                        channel={channel}
                                        isActive={activeChannel?._id === channel._id}
                                        onClick={() => handleChannelSelect(channel)}
                                        workspaceId={workspaceId}
                                        isUserOnline={isUserOnline}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Direct Messages */}
                        {directChannels.length > 0 && (
                            <div className="space-y-1">
                                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                                    Direct Messages
                                </div>
                                {directChannels.map((channel) => (
                                    <ChannelItem
                                        key={channel._id}
                                        channel={channel}
                                        isActive={activeChannel?._id === channel._id}
                                        onClick={() => handleChannelSelect(channel)}
                                        workspaceId={workspaceId}
                                        isUserOnline={isUserOnline}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {filteredChannels.length === 0 && (
                            <div className="text-center py-8 text-sm text-muted-foreground">
                                {searchQuery ? "No channels found" : "No channels yet"}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Create Channel Modal */}
            <CreateChannelModal
                workspaceId={workspaceId}
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
            />
        </>
    );
}
