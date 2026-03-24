"use client";

import { useSocket } from "@/hooks/use-socket";
import { useAuthStore } from "@/store/auth-store";
import { WifiOff, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ConnectionStatus() {
    const { isConnected } = useSocket();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [hasBeenConnected, setHasBeenConnected] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        if (isConnected) {
            setHasBeenConnected(true);
        }
    }, [isConnected]);

    useEffect(() => {
        if (!isAuthenticated) {
            setHasBeenConnected(false);
        }
    }, [isAuthenticated]);

    const showReconnecting = isAuthenticated && !isConnected && hasBeenConnected;

    return (
        <AnimatePresence>
            {showReconnecting && (
                <motion.div
                    key="reconnecting-banner"
                    initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-[var(--z-toast)] flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-lg border border-amber-200 dark:border-amber-800 bg-amber-50/95 dark:bg-amber-950/90 backdrop-blur-sm text-amber-900 dark:text-amber-100"
                >
                    <WifiOff className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-medium">Reconnecting…</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export function ConnectionIndicator() {
    const { isConnected } = useSocket();

    return (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {isConnected ? (
                <>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500/70" />
                    <span className="text-muted-foreground/60">Connected</span>
                </>
            ) : (
                <>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>Connecting…</span>
                </>
            )}
        </div>
    );
}
