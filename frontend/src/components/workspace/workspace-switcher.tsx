"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useWorkspace } from "@/hooks/use-workspace"
import { useAuthStore } from "@/store/auth-store"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateWorkspaceDialog } from "./create-workspace-dialog"
import { ChevronsUpDown, Plus, Check, Building2, AlertCircle, Crown, Shield } from "lucide-react"

interface WorkspaceItem {
    _id: string
    name: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    members?: any[]
    userRole?: string
}

export function WorkspaceSwitcher() {
    const router = useRouter()
    const params = useParams()
    const { toast } = useToast()
    const { user } = useAuthStore()
    const currentWorkspaceId = params?.workspaceId as string | undefined
    const {
        workspaces,
        currentWorkspace,
        fetchUserWorkspaces,
        setCurrentWorkspace,
        loading,
        error,
    } = useWorkspace()
    const [open, setOpen] = useState(false)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)

    useEffect(() => {
        fetchUserWorkspaces().catch((err: Error) => {
            console.error("Failed to load workspaces:", err)
        })
    }, [fetchUserWorkspaces])

    useEffect(() => {
        if (currentWorkspaceId && workspaces.length > 0) {
            const workspace = workspaces.find((w) => w._id === currentWorkspaceId)
            if (workspace) {
                setCurrentWorkspace(workspace)
            }
        }
    }, [currentWorkspaceId, workspaces, setCurrentWorkspace])

    // Get user's role in a workspace
    const getUserRole = (workspace: WorkspaceItem): string | null => {
        if (!workspace || !user) return null
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const member = workspace.members?.find((m: any) =>
            (typeof m.user === 'string' ? m.user : m.user?._id) === user._id
        )
        return member?.role || workspace.userRole || null
    }

    const handleSelectWorkspace = async (workspace: WorkspaceItem) => {
        try {
            // Clear all chat state when switching workspaces
            const chatStore = (await import('@/store/chat-store')).useChatStore.getState();
            chatStore.reset(); // Reset all chat data (channels, messages, active channel, etc.)
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setCurrentWorkspace(workspace as any)
            router.push(`/workspace/${workspace._id}`)
            setOpen(false)

            toast({
                title: "Workspace switched",
                description: `Now viewing ${workspace.name}`,
            })
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Failed to switch workspace",
                description: (err as Error).message || "Please try again",
            })
        }
    }

    // Get role icon
    const getRoleIcon = (role: string | null) => {
        if (role === "owner") {
            return <Crown className="h-3 w-3 text-yellow-500" />
        }
        if (role === "admin") {
            return <Shield className="h-3 w-3 text-blue-500" />
        }
        return null
    }

    const currentUserRole = currentWorkspace ? getUserRole(currentWorkspace) : null

    // Error state with retry
    if (error) {
        return (
            <Button
                variant="destructive"
                size="sm"
                className="w-full justify-start text-xs md:text-sm h-9 md:h-10"
                onClick={() => fetchUserWorkspaces()}
            >
                <AlertCircle className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="truncate">Failed. Retry?</span>
            </Button>
        )
    }

    // Loading state
    if (loading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-9 md:h-10 w-full animate-pulse" />
            </div>
        )
    }

    return (
        <>
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        size="sm"
                        className="w-full justify-between text-xs md:text-sm h-9 md:h-10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50 group"
                    >
                        <div className="flex items-center gap-1.5 md:gap-2 truncate">
                            <Building2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                            <span className="truncate">
                                {currentWorkspace?.name || "Select workspace"}
                            </span>
                            {currentUserRole && getRoleIcon(currentUserRole)}
                        </div>
                        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 opacity-50 transition-transform duration-300 group-hover:scale-110" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[200px] md:w-[240px]" align="start">
                    <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">
                        Your Workspaces
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {workspaces.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground">
                            No workspaces yet
                        </div>
                    ) : (
                        workspaces.map((workspace: WorkspaceItem) => {
                            const role = getUserRole(workspace)
                            return (
                                <DropdownMenuItem
                                    key={workspace._id}
                                    onSelect={() => handleSelectWorkspace(workspace)}
                                    className="cursor-pointer transition-all duration-200 hover:bg-accent hover:scale-105 hover:shadow-sm group/item"
                                >
                                    <Check
                                        className={`mr-2 h-3.5 w-3.5 md:h-4 md:w-4 transition-all duration-300 ${currentWorkspace?._id === workspace._id
                                            ? "opacity-100 text-primary scale-110"
                                            : "opacity-0 group-hover/item:opacity-30"
                                            }`}
                                    />
                                    <div className="flex flex-col flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs md:text-sm font-medium group-hover/item:text-primary transition-colors duration-200">
                                                {workspace.name}
                                            </span>
                                            {getRoleIcon(role)}
                                        </div>
                                        <span className="text-[10px] md:text-xs text-muted-foreground group-hover/item:text-primary/60 transition-colors duration-200">
                                            {workspace.members?.length || 0} member
                                            {workspace.members?.length !== 1 ? "s" : ""} • {role || "member"}
                                        </span>
                                    </div>
                                </DropdownMenuItem>
                            )
                        })
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onSelect={() => {
                            setCreateDialogOpen(true)
                            setOpen(false)
                        }}
                        className="cursor-pointer transition-all duration-200 hover:bg-primary/10 hover:scale-105 hover:shadow-sm group/create"
                    >
                        <Plus className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4 transition-transform duration-300 group-hover/create:rotate-90" />
                        <span className="text-xs md:text-sm font-medium transition-all duration-300 group-hover/create:translate-x-1">
                            Create workspace
                        </span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <CreateWorkspaceDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
            />
        </>
    )
}
