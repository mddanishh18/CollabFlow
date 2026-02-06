import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Channel, Message, TypingUser } from '@/types';


// ===== Chat Store State & Actions =====
interface ChatState {
    // State
    channels: Channel[];
    activeChannel: Channel | null;
    messages: Record<string, Message[]>;  // channelId -> messages
    typingUsers: Record<string, TypingUser[]>; // channelId -> typing users
    unreadCounts: Record<string, number>; // channelId -> count
    loading: boolean;
    error: string | null;

    // Setters
    setChannels: (channels: Channel[]) => void;
    setActiveChannel: (channel: Channel | null) => void;
    setMessages: (channelId: string, messages: Message[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // Actions
    addChannel: (channel: Channel) => void;
    updateChannel: (channelId: string, updates: Partial<Channel>) => void;
    removeChannel: (channelId: string) => void;

    addMessage: (channelId: string, message: Message) => void;
    updateMessage: (channelId: string, messageId: string, updates: Partial<Message>) => void;
    removeMessage: (channelId: string, messageId: string) => void;
    prependMessages: (channelId: string, messages: Message[]) => void;

    addTypingUser: (channelId: string, user: TypingUser) => void;
    removeTypingUser: (channelId: string, userId: string) => void;

    incrementUnreadCount: (channelId: string) => void;
    clearUnreadCount: (channelId: string) => void;

    reset: () => void;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            // Initial State
            channels: [],
            activeChannel: null,
            messages: {},
            typingUsers: {},
            unreadCounts: {},
            loading: false,
            error: null,

            // setters
            setChannels: (channels: Channel[]) => set({ channels }),
            setActiveChannel: (channel: Channel | null) => set({ activeChannel: channel }),

            setMessages: (channelId: string, messages: Message[]) => set((state) => ({
                messages: {
                    ...state.messages,
                    [channelId]: messages
                }
            })),

            setLoading: (loading: boolean) => set({ loading }),
            setError: (error: string | null) => set({ error }),

            // Channel Actions
            addChannel: (channel: Channel) => set((state) => ({
                channels: [channel, ...state.channels]
            })),

            updateChannel: (channelId: string, updates: Partial<Channel>) => set((state) => ({
                channels: state.channels.map(c =>
                    c._id === channelId ? { ...c, ...updates } : c
                )
            })),

            removeChannel: (channelId: string) => set((state) => ({
                channels: state.channels.filter(c => c._id !== channelId)
            })),

            // Message Actions
            addMessage: (channelId: string, message: Message) => set((state) => {
                const existingMessages = state.messages[channelId] || [];
                // Check if message already exists (prevent duplicates)
                const isDuplicate = existingMessages.some(m => m._id === message._id);
                if (isDuplicate) {
                    return state;
                }
                return {
                    messages: {
                        ...state.messages,
                        [channelId]: [...existingMessages, message]
                    }
                };
            }),

            updateMessage: (channelId: string, messageId: string, updates: Partial<Message>) => set((state) => ({
                messages: {
                    ...state.messages,
                    [channelId]: state.messages[channelId].map(m =>
                        m._id === messageId ? { ...m, ...updates } : m
                    )
                }
            })),

            removeMessage: (channelId: string, messageId: string) => set((state) => ({
                messages: {
                    ...state.messages,
                    [channelId]: state.messages[channelId].filter(m => m._id !== messageId)
                }
            })),

            prependMessages: (channelId: string, messages: Message[]) => set((state) => ({
                messages: {
                    ...state.messages,
                    [channelId]: [...messages, ...(state.messages[channelId] || [])]
                }
            })),

            // Typing User Actions
            addTypingUser: (channelId: string, user: TypingUser) => set((state) => {
                const existingUsers = state.typingUsers[channelId] || [];
                // Check if user is already in typing list (prevent duplicates)
                const isDuplicate = existingUsers.some(u => u.userId === user.userId);
                if (isDuplicate) {
                    return state;
                }
                return {
                    typingUsers: {
                        ...state.typingUsers,
                        [channelId]: [...existingUsers, user]
                    }
                };
            }),

            removeTypingUser: (channelId: string, userId: string) => set((state) => ({
                typingUsers: {
                    ...state.typingUsers,
                    [channelId]: (state.typingUsers[channelId] || []).filter(u => u.userId !== userId)
                }
            })),

            // Unread Count Actions
            incrementUnreadCount: (channelId: string) => set((state) => ({
                unreadCounts: {
                    ...state.unreadCounts,
                    [channelId]: (state.unreadCounts[channelId] || 0) + 1
                }
            })),

            clearUnreadCount: (channelId: string) => set((state) => ({
                unreadCounts: {
                    ...state.unreadCounts,
                    [channelId]: 0
                }
            })),

            // Reset
            reset: () => set({
                channels: [],
                activeChannel: null,
                messages: {},
                typingUsers: {},
                unreadCounts: {},
                loading: false,
                error: null
            })
        }),
        {
            name: 'chat-storage',
            partialize: (state) => ({
                activeChannel: state.activeChannel,
                unreadCounts: state.unreadCounts
            })
        }
    )
);