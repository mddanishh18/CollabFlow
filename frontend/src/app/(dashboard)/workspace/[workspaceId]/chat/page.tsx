"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useChat } from "@/hooks/use-chat";
import { Loader2 } from "lucide-react";
import { ChannelList } from "@/components/chat/channel-list";
import { ChatWindow } from "@/components/chat/chat-window";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export default function ChatPage() {
    const params = useParams();
    const workspaceId = params.workspaceId as string;
    const hasFetched = useRef(false);

    const { fetchChannels, loading, error, channels, activeChannel } = useChat();

    // Fetch channels ONCE when workspaceId is available
    useEffect(() => {
        if (!workspaceId || hasFetched.current) return;
        
        hasFetched.current = true;
        fetchChannels(workspaceId).catch(err => {
            console.error('Failed to fetch channels:', err);
            hasFetched.current = false; // Allow retry on error
        });
    }, [workspaceId, fetchChannels]);

    // Show loading spinner
    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">Loading channels...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        console.error('[ChatPage] Rendering error state:', error);
        return (
            <div className="flex items-center justify-center h-full p-6">
                <Alert variant="destructive" className="max-w-md">
                    <AlertTitle>Failed to load chat</AlertTitle>
                    <AlertDescription className="space-y-4">
                        <p className="text-sm">{error}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                fetchChannels(workspaceId);
                            }}
                        >
                            Try Again
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full overflow-hidden">
            {/* Channel Sidebar - Desktop always visible, Mobile only when no channel selected */}
            <div className={cn(
                "w-full lg:w-64 lg:border-r h-full overflow-y-auto",
                activeChannel ? "hidden lg:block" : "block"
            )}>
                <ChannelList workspaceId={workspaceId} />
            </div>

            {/* Main Chat Area - Desktop always visible, Mobile only when channel selected */}
            <div className={cn(
                "w-full lg:flex-1 flex-col min-w-0 h-full",
                activeChannel ? "flex" : "hidden lg:flex"
            )}>
                <ChatWindow />
            </div>
        </div>
    );
}
