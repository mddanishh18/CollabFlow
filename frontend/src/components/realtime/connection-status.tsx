"use client";

import { useSocket } from "@/hooks/use-socket";
import { useAuthStore } from "@/store/auth-store";
import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function ConnectionStatus() {
    const { isConnected } = useSocket();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [hasBeenConnected, setHasBeenConnected] = useState(false);

    useEffect(() => {
        if (isConnected) {
            setHasBeenConnected(true);
        }
    }, [isConnected]);

    // Reset hasBeenConnected when user logs out
    useEffect(() => {
        if (!isAuthenticated) {
            setHasBeenConnected(false);
        }
    }, [isAuthenticated]);

    // Only show reconnecting banner if:
    // 1. User is authenticated (logged in)
    // 2. Was connected before
    // 3. Currently disconnected (unexpected loss)
    if (!isAuthenticated || isConnected || !hasBeenConnected) {
        return null;
    }

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-(--z-toast) glass rounded-full px-6 py-3 shadow-xl animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-center gap-3">
                <WifiOff className="h-4 w-4 animate-pulse text-yellow-500" />
                <span className="text-sm font-medium">Reconnecting...</span>
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
