"use client";

import { useSocket } from "@/hooks/use-socket";
import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function ConnectionStatus() {
    const { isConnected } = useSocket();
    const [hasBeenConnected, setHasBeenConnected] = useState(false);

    useEffect(() => {
        if (isConnected) {
            setHasBeenConnected(true);
        }
    }, [isConnected]);

    // Only show reconnecting banner if we were connected before and are now disconnected
    if (isConnected || !hasBeenConnected) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-muted border-b border-border py-2 px-4 text-center text-sm font-medium shadow-sm animate-in slide-in-from-top">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <WifiOff className="h-4 w-4 animate-pulse" />
                <span>Reconnecting...</span>
            </div>
        </div>
    );
}

export function ConnectionIndicator() {
    const { isConnected } = useSocket();

    return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isConnected ? (
                <>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>Connected</span>
                </>
            ) : (
                <>
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    <span>Connecting...</span>
                </>
            )}
        </div>
    );
}
