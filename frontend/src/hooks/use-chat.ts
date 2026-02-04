import { useCallback, useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { useChatStore } from "@/store/chat-store";
import type { Message, Channel, CreateChannelData, TypingUser } from "@/types";
import { useSocket } from "@/hooks/use-socket";

// ===== Types =====
interface ApiErrorResponse {
    message?: string;
}

interface UseChatReturn {
    channels: Channel[];
    activeChannel: Channel | null;
    messages: Record<string, Message[]>;
    typingUsers: Record<string, TypingUser[]>;
    unreadCounts: Record<string, number>;
    loading: boolean;
    error: string | null;

    // Channel actions
    fetchChannels: (workspaceId: string) => Promise<void>;
    fetchChannel: (channelId: string) => Promise<Channel>;
    createChannel: (channelData: CreateChannelData) => Promise<Channel>;
    updateChannel: (channelId: string, updates: Partial<Channel>) => Promise<Channel>;
    deleteChannel: (channelId: string) => Promise<void>;
    addMember: (channelId: string, memberId: string) => Promise<void>;
    removeMember: (channelId: string, memberId: string) => Promise<void>;

    // Message actions
    fetchMessages: (channelId: string, options?: { limit?: number; before?: string }) => Promise<void>;
    sendMessage: (channelId: string, content: string, attachments?: string[], mentions?: string[]) => Promise<Message>;
    editMessage: (channelId: string, messageId: string, content: string) => Promise<Message>;
    deleteMessage: (channelId: string, messageId: string) => Promise<void>;
    markAsRead: (channelId: string) => Promise<void>;

    // Real-time actions
    joinChannel: (channelId: string) => void;
    leaveChannel: (channelId: string) => void;
    startTyping: (channelId: string) => void;
    stopTyping: (channelId: string) => void;

    // Store actions
    setActiveChannel: (channel: Channel | null) => void;
}

export const useChat = (): UseChatReturn => {
    // Get state from store
    const channels = useChatStore((state) => state.channels);
    const activeChannel = useChatStore((state) => state.activeChannel);
    
    // Use refs to access latest values without triggering re-renders
    const activeChannelRef = useRef(activeChannel);
    const messagesRef = useRef<Record<string, Message[]>>({});
    const messages = useChatStore((state) => state.messages);
    const typingUsers = useChatStore((state) => state.typingUsers);
    const unreadCounts = useChatStore((state) => state.unreadCounts);

    // Get store actions
    const setChannels = useChatStore((state) => state.setChannels);
    const setActiveChannel = useChatStore((state) => state.setActiveChannel);
    const setMessages = useChatStore((state) => state.setMessages);
    const addChannelToStore = useChatStore((state) => state.addChannel);
    const updateChannelInStore = useChatStore((state) => state.updateChannel);
    const removeChannelFromStore = useChatStore((state) => state.removeChannel);
    const addMessageToStore = useChatStore((state) => state.addMessage);
    const updateMessageInStore = useChatStore((state) => state.updateMessage);
    const removeMessageFromStore = useChatStore((state) => state.removeMessage);
    const prependMessages = useChatStore((state) => state.prependMessages);
    const addTypingUser = useChatStore((state) => state.addTypingUser);
    const removeTypingUser = useChatStore((state) => state.removeTypingUser);
    const incrementUnreadCount = useChatStore((state) => state.incrementUnreadCount);
    const clearUnreadCount = useChatStore((state) => state.clearUnreadCount);

    // Local loading/error state (not persisted)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Socket
    const { socket, isConnected } = useSocket();

    // Error handler
    const handleError = useCallback((err: unknown): string => {
        const error = err as Error & { response?: { data: ApiErrorResponse } };
        const message = error?.response?.data?.message || error.message || 'Something went wrong';
        setError(message);
        return message;
    }, []);

    // ===== Channel Actions =====
    const fetchChannels = useCallback(async (workspaceId: string): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/api/chat/workspace/${workspaceId}/channels`);
            setChannels(response.data.data || response.data);
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError, setChannels, handleError]);

    const fetchChannel = useCallback(async (channelId: string): Promise<Channel> => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/api/chat/channels/${channelId}`);
            return response.data.data || response.data;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError, handleError]);

    const createChannel = useCallback(async (channelData: CreateChannelData): Promise<Channel> => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.post('/api/chat/channels', channelData);
            const newChannel = response.data.data || response.data;
            addChannelToStore(newChannel);
            return newChannel;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError, addChannelToStore, handleError]);

    const updateChannel = useCallback(async (channelId: string, updates: Partial<Channel>): Promise<Channel> => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.patch(`/api/chat/channels/${channelId}`, updates);
            const updatedChannel = response.data.data || response.data;
            updateChannelInStore(channelId, updatedChannel);
            return updatedChannel;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError, updateChannelInStore, handleError]);

    const deleteChannel = useCallback(async (channelId: string): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            await api.delete(`/api/chat/channels/${channelId}`);
            removeChannelFromStore(channelId);
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError, removeChannelFromStore, handleError]);

    const addMember = useCallback(async (channelId: string, memberId: string): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            await api.post(`/api/chat/channels/${channelId}/members`, { userId: memberId });
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError, handleError]);

    const removeMember = useCallback(async (channelId: string, memberId: string): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            await api.delete(`/api/chat/channels/${channelId}/members?userId=${memberId}`);
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError, handleError]);

    // ===== Message Actions =====
    const fetchMessages = useCallback(async (
        channelId: string,
        options?: { limit?: number; before?: string }
    ): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            const params = new URLSearchParams();
            if (options?.limit) params.append('limit', options.limit.toString());
            if (options?.before) params.append('before', options.before);

            const response = await api.get(`/api/chat/channels/${channelId}/messages?${params}`);
            const fetchedMessages = response.data.data || response.data;

            if (options?.before) {
                prependMessages(channelId, fetchedMessages);
            } else {
                setMessages(channelId, fetchedMessages);
            }
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError, setMessages, prependMessages, handleError]);

    const sendMessage = useCallback(async (
        channelId: string,
        content: string,
        attachments?: string[],
        mentions?: string[]
    ): Promise<Message> => {
        try {
            setError(null);
            const response = await api.post(`/api/chat/channels/${channelId}/messages`, {
                content,
                attachments,
                mentions
            });
            const newMessage = response.data.data || response.data;
            
            // Backend now broadcasts via socket, so we don't need to emit from frontend
            // Just add to local store immediately for instant feedback
            addMessageToStore(channelId, newMessage);
            
            return newMessage;
        } catch (err) {
            handleError(err);
            throw err;
        }
    }, [setError, addMessageToStore, handleError]);

    const editMessage = useCallback(async (
        channelId: string,
        messageId: string,
        content: string
    ): Promise<Message> => {
        try {
            setError(null);
            const response = await api.patch(`/api/chat/messages/${messageId}`, { content });
            const updatedMessage = response.data.data || response.data;
            updateMessageInStore(channelId, messageId, updatedMessage);
            
            // Emit via socket for real-time updates
            if (socket && isConnected) {
                socket.emit('message:edit', {
                    channelId,
                    message: updatedMessage
                });
            }
            
            return updatedMessage;
        } catch (err) {
            handleError(err);
            throw err;
        }
    }, [setError, updateMessageInStore, socket, isConnected, handleError]);

    const deleteMessage = useCallback(async (channelId: string, messageId: string): Promise<void> => {
        try {
            setError(null);
            await api.delete(`/api/chat/messages/${messageId}`);
            removeMessageFromStore(channelId, messageId);
            
            // Emit via socket for real-time updates
            if (socket && isConnected) {
                socket.emit('message:delete', {
                    channelId,
                    messageId
                });
            }
        } catch (err) {
            handleError(err);
            throw err;
        }
    }, [setError, removeMessageFromStore, socket, isConnected, handleError]);

    const markAsRead = useCallback(async (channelId: string): Promise<void> => {
        try {
            setError(null);
            await api.post(`/api/chat/channels/${channelId}/read`, {});
            clearUnreadCount(channelId);
        } catch (err) {
            handleError(err);
            throw err;
        }
    }, [setError, clearUnreadCount, handleError]);

    // ===== Real-time Actions =====
    const joinChannel = useCallback((channelId: string): void => {
        if (socket && isConnected) {
            socket.emit('channel:join', channelId, (response: { success: boolean; error?: string }) => {
                if (!response.success) {
                    console.error('[useChat] Failed to join channel:', response.error);
                    setError(response.error || 'Failed to join channel');
                }
            });
        }
    }, [socket, isConnected, setError]);

    const leaveChannel = useCallback((channelId: string): void => {
        if (socket && isConnected) {
            socket.emit('channel:leave', channelId, (response: { success: boolean; error?: string }) => {
                if (!response.success) {
                    console.error('[useChat] Failed to leave channel:', response.error);
                }
            });
        }
    }, [socket, isConnected]);

    // Debounced typing indicator
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    const startTyping = useCallback((channelId: string): void => {
        if (socket && isConnected) {
            socket.emit('typing:start', channelId);
            
            // Auto-stop typing after 3 seconds
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('typing:stop', channelId);
            }, 3000);
        }
    }, [socket, isConnected]);

    const stopTyping = useCallback((channelId: string): void => {
        if (socket && isConnected) {
            socket.emit('typing:stop', channelId);
        }
    }, [socket, isConnected]);

    // Sync refs with state changes (separate from socket listeners)
    useEffect(() => {
        activeChannelRef.current = activeChannel;
    }, [activeChannel]);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    // ===== Socket Event Listeners =====
    useEffect(() => {
        if (!socket || !isConnected) {
            return;
        }

        // Error handler
        const handleSocketError = (error: { event?: string; message: string }) => {
            console.error('[useChat] Socket error:', error);
            setError(error.message || 'Socket communication error');
        };

        // Message events - use refs to access latest values without dependency
        const handleNewMessage = (message: Message) => {
            console.log('[useChat] Received message:new', message);
            const channelId = typeof message.channel === 'string' ? message.channel : message.channel._id;
            addMessageToStore(channelId, message);
            // Use ref to check active channel without dependency
            if (activeChannelRef.current?._id !== channelId) {
                incrementUnreadCount(channelId);
            }
        };

        const handleUpdatedMessage = (message: Message) => {
            console.log('[useChat] Received message:updated', message);
            const channelId = typeof message.channel === 'string' ? message.channel : message.channel._id;
            updateMessageInStore(channelId, message._id, message);
        };

        const handleDeletedMessage = (data: { channelId: string; messageId: string } | string) => {
            console.log('[useChat] Received message:deleted', data);
            if (typeof data === 'string') {
                // Use ref to access current messages
                const messageId = data;
                const channelIds = Object.keys(messagesRef.current);
                for (const channelId of channelIds) {
                    const channelMessages = messagesRef.current[channelId];
                    if (channelMessages?.some(m => m._id === messageId)) {
                        removeMessageFromStore(channelId, messageId);
                        break;
                    }
                }
            } else {
                removeMessageFromStore(data.channelId, data.messageId);
            }
        };

        // Typing events - use ref for activeChannel
        const handleUserTyping = (data: { userId: string; user: { _id: string; name: string; avatar?: string }; channelId: string }) => {
            const targetChannelId = data.channelId || activeChannelRef.current?._id;
            if (targetChannelId) {
                addTypingUser(targetChannelId, { userId: data.userId, user: data.user });
            }
        };

        const handleUserStopTyping = (data: { userId: string; channelId: string }) => {
            const targetChannelId = data.channelId || activeChannelRef.current?._id;
            if (targetChannelId) {
                removeTypingUser(targetChannelId, data.userId);
            }
        };

        // Register listeners
        socket.on('error', handleSocketError);
        socket.on('message:new', handleNewMessage);
        socket.on('message:updated', handleUpdatedMessage);
        socket.on('message:deleted', handleDeletedMessage);
        socket.on('user:typing', handleUserTyping);
        socket.on('user:stopTyping', handleUserStopTyping);

        // Cleanup
        return () => {
            console.log('[useChat] Cleaning up socket listeners');
            socket.off('error', handleSocketError);
            socket.off('message:new', handleNewMessage);
            socket.off('message:updated', handleUpdatedMessage);
            socket.off('message:deleted', handleDeletedMessage);
            socket.off('user:typing', handleUserTyping);
            socket.off('user:stopTyping', handleUserStopTyping);
        };
    }, [socket, isConnected, addMessageToStore, updateMessageInStore, removeMessageFromStore, addTypingUser, removeTypingUser, incrementUnreadCount, setError]);

    return {
        // State
        channels,
        activeChannel,
        messages,
        typingUsers,
        unreadCounts,
        loading,
        error,

        // Channel actions
        fetchChannels,
        fetchChannel,
        createChannel,
        updateChannel,
        deleteChannel,
        addMember,
        removeMember,

        // Message actions
        fetchMessages,
        sendMessage,
        editMessage,
        deleteMessage,
        markAsRead,

        // Real-time actions
        joinChannel,
        leaveChannel,
        startTyping,
        stopTyping,

        // Store actions
        setActiveChannel
    };
};