"use client"

import { useParams } from "next/navigation"
import { WorkspacePresenceProvider } from "@/providers/workspace-presence-provider"
import { ReactNode, useEffect } from "react"
import { useChat } from "@/hooks/use-chat"

function WorkspaceUnreadInit({ workspaceId }: { workspaceId: string }) {
    const { fetchWorkspaceUnreadCounts } = useChat()
    useEffect(() => {
        if (workspaceId) {
            fetchWorkspaceUnreadCounts(workspaceId)
        }
        // Run once per workspace load — real-time updates handle the rest
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workspaceId])
    return null
}

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
    const params = useParams()
    const workspaceId = params?.workspaceId as string

    return (
        <WorkspacePresenceProvider workspaceId={workspaceId}>
            <WorkspaceUnreadInit workspaceId={workspaceId} />
            {children}
        </WorkspacePresenceProvider>
    )
}
