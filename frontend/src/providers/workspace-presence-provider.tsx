"use client"

import { createContext, useContext, ReactNode } from "react"
import { useWorkspacePresence } from "@/hooks/use-workspace-presence"

interface OnlineUser {
    _id: string;
    name: string;
    email: string;
}

interface WorkspacePresenceContextValue {
    onlineUsers: OnlineUser[];
    isUserOnline: (userId: string) => boolean;
}

const WorkspacePresenceContext = createContext<WorkspacePresenceContextValue>({
    onlineUsers: [],
    isUserOnline: () => false,
})

export function WorkspacePresenceProvider({
    workspaceId,
    children,
}: {
    workspaceId: string
    children: ReactNode
}) {
    const presence = useWorkspacePresence(workspaceId)
    return (
        <WorkspacePresenceContext.Provider value={presence}>
            {children}
        </WorkspacePresenceContext.Provider>
    )
}

export const useWorkspacePresenceContext = () => useContext(WorkspacePresenceContext)
