import { useEffect, useCallback, useState, useMemo } from "react";
import { Socket } from "socket.io-client";
import { initializeSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/auth-store";

interface UseSocketReturn {
    socket: Socket | null;
    isConnected: boolean;
    emit: (event: string, data: any) => void;
    //long code for on because it user may get memory leaks if not cleaned up so it cleans up automatically
    on: (event: string, callback: (...args: any[]) => void) => (() => void) | undefined;
}

export const useSocket = (): UseSocketReturn => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const token = useAuthStore((state) => state.token);
    const [isConnected, setIsConnected] = useState(false);
    const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

    //initialize socket ONCE
    useEffect(() => {
        if (!isAuthenticated || !token) {
            disconnectSocket();
            setIsConnected(false);
            setSocketInstance(null);
            return;
        }

        // initializeSocket acts as a singleton returning the existing socket if already connected/connecting
        const socket = initializeSocket(token);
        setSocketInstance(socket);

        // Update connected state immediately
        setIsConnected(socket.connected);

        // Listen to connection state changes
        const handleConnect = () => {
            setIsConnected(true);
        };

        const handleDisconnect = () => {
            setIsConnected(false);
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);

        // Cleanup
        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
        };
    }, [isAuthenticated, token]);

    //emit event helper
    const emit = useCallback((event: string, data: any) => {
        const socket = getSocket() || socketInstance;
        if (socket?.connected) {
            socket.emit(event, data);
        } else {
            console.warn(`⚠️  Socket not connected. Cannot emit event: ${event}`);
        }
    }, [socketInstance]);

    //event listener helper
    const on = useCallback((event: string, callback: (...args: any[]) => void) => {
        const socket = getSocket() || socketInstance;
        if (socket) {
            socket.on(event, callback);
            return () => socket.off(event, callback);
        }
    }, [socketInstance]);

    // Return stable memoized object
    return useMemo(() => ({
        socket: socketInstance,
        isConnected,
        emit,
        on
    }), [socketInstance, isConnected, emit, on]);
}
