"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { useWorkspace } from "@/hooks/use-workspace"
import { useProjects } from "@/hooks/use-projects"
import { useToast } from "@/hooks/use-toast"
import { useWorkspacePresenceContext } from "@/providers/workspace-presence-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/store/auth-store"
import { type WorkspaceMember } from "@/types"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
    FolderKanban,
    Users,
    Settings,
    Plus,
    AlertCircle,
    RefreshCw,
    ArrowRight,
} from "lucide-react"
import Link from "next/link"

export default function WorkspaceOverviewPage() {
    const params = useParams()
    const workspaceId = params?.workspaceId as string
    const { toast } = useToast()
    const prefersReducedMotion = useReducedMotion()

    const {
        currentWorkspace,
        fetchWorkspaceById,
        loading: workspaceLoading,
        error: workspaceError,
    } = useWorkspace()

    const {
        workspaceProjects: projects,
        fetchWorkspaceProjects,
        loading: projectsLoading,
        error: projectsError,
    } = useProjects()

    const { user } = useAuthStore()
    const { onlineUsers, isUserOnline } = useWorkspacePresenceContext()

    useEffect(() => {
        if (workspaceId) {
            loadData()
        }
    }, [workspaceId])

    const loadData = async () => {
        try {
            await Promise.all([fetchWorkspaceById(workspaceId), fetchWorkspaceProjects(workspaceId)])
        } catch (err) {
            console.error("Failed to load workspace data:", err)
        }
    }

    const handleRetry = () => {
        loadData().catch(() => {
            toast({
                variant: "destructive",
                title: "Still having issues",
                description: "Please check your connection and try again",
            })
        })
    }

    const loading = workspaceLoading || projectsLoading
    const error = workspaceError || projectsError

    if (error && !loading) {
        return (
            <div className="flex-1 p-4 md:p-6 lg:p-8">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            Failed to Load Workspace
                        </CardTitle>
                        <CardDescription>We couldn't load this workspace</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                        <Button onClick={handleRetry} className="w-full" size="lg">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <Skeleton className="h-12 w-full max-w-sm" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        )
    }

    const members = currentWorkspace?.members || []
    const recentProjects = projects?.slice(0, 5) || []

    const currentUserId = user?._id || (user as { id?: string })?.id
    const workspaceMember = members.find((m: WorkspaceMember) => {
        const mUserId = typeof m.user === "string" ? m.user : m.user?._id
        return mUserId === currentUserId
    })
    const workspaceRole = workspaceMember?.role
    const isAdmin = workspaceRole === "owner" || workspaceRole === "admin"

    // Exclude self from presence strip — you know you're here
    const otherOnlineUsers = onlineUsers.filter((u) => u._id !== currentUserId)

    const firstName = user?.name?.split(" ")[0] ?? "there"

    const fadeUp = {
        initial: prefersReducedMotion ? false : { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
    }

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            {/* Header — greeting + workspace name */}
            <motion.div
                {...fadeUp}
                transition={{ duration: 0.25 }}
                className="mb-6 md:mb-8 pl-12 md:pl-0"
            >
                <p className="text-sm text-muted-foreground font-medium mb-1">
                    Welcome back, {firstName}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {currentWorkspace?.name || "Workspace"}
                </h1>
                {currentWorkspace?.description && (
                    <p className="text-sm md:text-base text-muted-foreground mt-1">
                        {currentWorkspace.description}
                    </p>
                )}
            </motion.div>

            {/* Presence surface — who else is here right now */}
            {otherOnlineUsers.length > 0 && (
                <motion.div
                    {...fadeUp}
                    transition={{ duration: 0.25, delay: 0.05 }}
                    className="mb-6 md:mb-8 flex items-center gap-3 px-4 py-3 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm w-fit"
                >
                    <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-60" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{otherOnlineUsers.length}</span>{" "}
                        {otherOnlineUsers.length === 1 ? "teammate" : "teammates"} online now
                    </span>
                    <div className="flex -space-x-2 ml-1">
                        {otherOnlineUsers.slice(0, 5).map((u) => (
                            <Avatar key={u._id} className="w-7 h-7 border-2 border-background ring-0">
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
                                    {u.name?.charAt(0).toUpperCase() ?? "?"}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                        {otherOnlineUsers.length > 5 && (
                            <div className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[9px] font-medium text-muted-foreground">
                                +{otherOnlineUsers.length - 5}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Navigation stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                {[
                    {
                        href: `/workspace/${workspaceId}/projects`,
                        label: "Projects",
                        icon: <FolderKanban className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />,
                        value: projects?.length ?? 0,
                        sub: "Active projects",
                        delay: 0.1,
                    },
                    {
                        href: `/workspace/${workspaceId}/members`,
                        label: "Members",
                        icon: <Users className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />,
                        value: members?.length ?? 0,
                        sub: otherOnlineUsers.length > 0
                            ? `${otherOnlineUsers.length} teammate${otherOnlineUsers.length === 1 ? "" : "s"} online`
                            : "Team members",
                        delay: 0.15,
                    },
                    ...(isAdmin
                        ? [
                            {
                                href: `/workspace/${workspaceId}/settings`,
                                label: "Settings",
                                icon: <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />,
                                value: null,
                                sub: "Configure workspace",
                                delay: 0.2,
                            },
                        ]
                        : []),
                ].map((card) => (
                    <motion.div
                        key={card.href}
                        {...fadeUp}
                        transition={{ duration: 0.25, delay: card.delay }}
                    >
                        <Link href={card.href}>
                            <Card className="hover:border-primary/50 hover:shadow-md transition-all duration-300 cursor-pointer group h-full">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {card.label}
                                    </CardTitle>
                                    {card.icon}
                                </CardHeader>
                                <CardContent>
                                    {card.value !== null ? (
                                        <div className="text-2xl md:text-3xl font-bold">{card.value}</div>
                                    ) : (
                                        <p className="text-sm font-medium">Configure workspace</p>
                                    )}
                                    <p className={cn(
                                        "text-xs mt-1",
                                        card.label === "Members" && otherOnlineUsers.length > 0
                                            ? "text-green-600 dark:text-green-400 font-medium"
                                            : "text-muted-foreground"
                                    )}>
                                        {card.sub}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Recent Projects & Team Members */}
            <motion.div
                {...fadeUp}
                transition={{ duration: 0.25, delay: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
                {/* Recent Projects */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base md:text-lg">Recent Projects</CardTitle>
                            <CardDescription className="text-xs md:text-sm">
                                Your latest projects in this workspace
                            </CardDescription>
                        </div>
                        <Link href={`/workspace/${workspaceId}/projects`}>
                            <Button variant="ghost" size="sm" className="group">
                                View All
                                <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentProjects.length === 0 ? (
                            <div className="text-center py-8">
                                <FolderKanban className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                                <p className="text-sm text-muted-foreground mb-3">No projects yet</p>
                                <Link href={`/workspace/${workspaceId}/projects`}>
                                    <Button size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Project
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentProjects.map((project: { _id: string; name: string; description?: string; visibility?: string }) => (
                                    <div
                                        key={project._id}
                                        className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                                <FolderKanban className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm truncate">{project.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {project.description || "No description"}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] shrink-0">
                                            {project.visibility || "private"}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Team Members with presence */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base md:text-lg">Team Members</CardTitle>
                            <CardDescription className="text-xs md:text-sm">
                                People in this workspace
                            </CardDescription>
                        </div>
                        {isAdmin && (
                            <Link href={`/workspace/${workspaceId}/members`}>
                                <Button variant="ghost" size="sm" className="group">
                                    Manage
                                    <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        )}
                    </CardHeader>
                    <CardContent>
                        {members.length === 0 ? (
                            <div className="text-center py-8">
                                <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                                <p className="text-sm text-muted-foreground">No members yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {members.slice(0, 5).map((member: WorkspaceMember, index: number) => {
                                    const userObj = typeof member.user === "string" ? null : member.user
                                    const memberId = userObj?._id ?? ""
                                    const isSelf = memberId === currentUserId
                                    const online = !isSelf && isUserOnline(memberId)
                                    return (
                                        <div
                                            key={memberId || index}
                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative shrink-0">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={userObj?.avatar ?? undefined} />
                                                        <AvatarFallback className="text-xs">
                                                            {userObj?.name?.charAt(0)?.toUpperCase() || "U"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {online && (
                                                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm leading-tight">
                                                        {userObj?.name || "Unknown"}
                                                        {isSelf && (
                                                            <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">(You)</span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground leading-tight">
                                                        {online ? (
                                                            <span className="text-green-600 dark:text-green-400">Online</span>
                                                        ) : (
                                                            userObj?.email
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge
                                                variant={member.role === "owner" ? "default" : "secondary"}
                                                className="text-[10px]"
                                            >
                                                {member.role}
                                            </Badge>
                                        </div>
                                    )
                                })}
                                {members.length > 5 && (
                                    <p className="text-xs text-center text-muted-foreground pt-1">
                                        +{members.length - 5} more members
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
