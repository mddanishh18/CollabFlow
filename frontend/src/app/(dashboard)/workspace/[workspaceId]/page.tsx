"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { useWorkspace } from "@/hooks/use-workspace"
import { useProjects } from "@/hooks/use-projects"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/store/auth-store"
import {
    FolderKanban,
    Users,
    Settings,
    Plus,
    AlertCircle,
    RefreshCw,
    Activity,
    Clock,
    ArrowRight,
} from "lucide-react"
import Link from "next/link"

export default function WorkspaceOverviewPage() {
    const params = useParams()
    const workspaceId = params?.workspaceId as string
    const { toast } = useToast()

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

    // Import user to check role
    const { user } = useAuthStore()

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

    // Error state
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

    // Loading state
    if (loading) {
        return (
            <div className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="space-y-6">
                    {/* Header Skeleton */}
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>

                    {/* Stats Cards Skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>

                    {/* Recent Projects Skeleton */}
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        )
    }

    const members = currentWorkspace?.members || []
    const recentProjects = projects?.slice(0, 5) || []

    const currentUserId = user?._id || (user as any)?.id;
    const workspaceMember = members.find((m: any) => {
        const mUserId = typeof m.user === 'string' ? m.user : m.user?._id;
        return mUserId === currentUserId;
    });
    const workspaceRole = workspaceMember?.role;
    const isAdmin = workspaceRole === 'owner' || workspaceRole === 'admin';

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            {/* Header */}
            <div className="mb-6 md:mb-8 pl-12 md:pl-0">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {currentWorkspace?.name || "Workspace"}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1">
                    {currentWorkspace?.description || "Workspace overview and quick actions"}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                {/* Projects Card */}
                <Link href={`/workspace/${workspaceId}/projects`}>
                    <Card className="hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Projects
                            </CardTitle>
                            <FolderKanban className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl md:text-3xl font-bold">{projects?.length || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">Active projects in workspace</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Members Card */}
                <Link href={`/workspace/${workspaceId}/members`}>
                    <Card className="hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Members</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl md:text-3xl font-bold">{members?.length || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">Team members</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Settings Card - Only for Admins/Owners */}
                {isAdmin && (
                    <Link href={`/workspace/${workspaceId}/settings`}>
                        <Card className="hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Settings</CardTitle>
                                <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm font-medium">Configure workspace</p>
                                <p className="text-xs text-muted-foreground mt-1">Workspace configuration</p>
                            </CardContent>
                        </Card>
                    </Link>
                )}
            </div>

            {/* Recent Projects & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                {recentProjects.map((project: any) => (
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

                {/* Team Members */}
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
                            <div className="space-y-3">
                                {members.slice(0, 5).map((member: any, index: number) => (
                                    <div
                                        key={member.user?._id || index}
                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={member.user?.avatar} />
                                                <AvatarFallback className="text-xs">
                                                    {member.user?.name?.charAt(0)?.toUpperCase() || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-sm">{member.user?.name || "Unknown"}</p>
                                                <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={member.role === "owner" ? "default" : "secondary"}
                                            className="text-[10px]"
                                        >
                                            {member.role}
                                        </Badge>
                                    </div>
                                ))}
                                {members.length > 5 && (
                                    <p className="text-xs text-center text-muted-foreground">
                                        +{members.length - 5} more members
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
