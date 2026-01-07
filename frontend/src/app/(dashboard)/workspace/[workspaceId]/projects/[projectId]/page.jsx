"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProjects } from "@/hooks/use-projects";
import { useWorkspace } from "@/hooks/use-workspace";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectMembersDialog } from "@/components/project/project-members-dialog";
import { AddProjectMembersDialog } from "@/components/project/add-project-members-dialog";
import {
    FolderKanban,
    ArrowLeft,
    Settings,
    Users,
    Calendar,
    AlertCircle,
    RefreshCw,
    MoreVertical,
    UserPlus,
    Lock,
    Globe,
    Clock,
    CheckCircle2,
    ListTodo,
    Loader2
} from "lucide-react";

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const projectId = params?.projectId;
    const workspaceId = params?.workspaceId;

    const { currentProject, fetchProjectById, loading, error } = useProjects();
    const { currentWorkspace } = useWorkspace();

    const [membersDialogOpen, setMembersDialogOpen] = useState(false);
    const [addMembersDialogOpen, setAddMembersDialogOpen] = useState(false);

    useEffect(() => {
        if (projectId) {
            fetchProjectById(projectId);
        }
    }, [projectId]);

    const getInitials = (name) => {
        if (!name) return "?";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const getVisibilityIcon = (visibility) => {
        switch (visibility) {
            case 'private': return <Lock className="h-4 w-4" />;
            case 'public': return <Globe className="h-4 w-4" />;
            default: return <Users className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-500';
            case 'completed': return 'bg-blue-500';
            case 'on-hold': return 'bg-yellow-500';
            case 'archived': return 'bg-gray-500';
            default: return 'bg-gray-400';
        }
    };

    // Error state
    if (error) {
        return (
            <div className="flex-1 p-4 md:p-6 lg:p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        <span>Failed to load project</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchProjectById(projectId)}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Loading state
    if (loading || !currentProject) {
        return (
            <div className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="space-y-6">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-32 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Skeleton className="h-24" />
                        <Skeleton className="h-24" />
                        <Skeleton className="h-24" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/workspace/${workspaceId}/projects`)}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FolderKanban className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{currentProject.name}</h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline" className="flex items-center gap-1">
                                    {getVisibilityIcon(currentProject.visibility)}
                                    {currentProject.visibility || "workspace"}
                                </Badge>
                                <span className="flex items-center gap-1">
                                    <div className={`h-2 w-2 rounded-full ${getStatusColor(currentProject.status)}`} />
                                    {currentProject.status || "active"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setAddMembersDialogOpen(true)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Members
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Description */}
            {currentProject.description && (
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground">{currentProject.description}</p>
                    </CardContent>
                </Card>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <ListTodo className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">0</p>
                                <p className="text-xs text-muted-foreground">Total Tasks</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{currentProject.progress || 0}%</p>
                                <p className="text-xs text-muted-foreground">Completed</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{currentProject.members?.length || 1}</p>
                                <p className="text-xs text-muted-foreground">Members</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {currentProject.endDate
                                        ? new Date(currentProject.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                        : "No date"
                                    }
                                </p>
                                <p className="text-xs text-muted-foreground">Due Date</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tasks Section - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <ListTodo className="h-5 w-5" />
                                    Tasks
                                </CardTitle>
                                <CardDescription>Manage project tasks</CardDescription>
                            </div>
                            <Button disabled>
                                <Loader2 className="mr-2 h-4 w-4" />
                                Coming Soon
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <ListTodo className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Task management coming in Phase 3!
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Members Section */}
                <div>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Members
                                </CardTitle>
                                <CardDescription>
                                    {currentProject.members?.length || 1} member{(currentProject.members?.length || 1) !== 1 ? 's' : ''}
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setMembersDialogOpen(true)}
                            >
                                Manage
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {/* Owner */}
                                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                            {getInitials(currentProject.owner?.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {currentProject.owner?.name || "Owner"}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {currentProject.owner?.email}
                                        </p>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">Owner</Badge>
                                </div>

                                {/* Other Members */}
                                {currentProject.members?.filter(m =>
                                    (m.user?._id || m.user) !== (currentProject.owner?._id || currentProject.owner)
                                ).slice(0, 4).map((member, index) => (
                                    <div
                                        key={member.user?._id || index}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                                                {getInitials(member.user?.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {member.user?.name || "Member"}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {member.user?.email}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {member.role || "member"}
                                        </Badge>
                                    </div>
                                ))}

                                {(currentProject.members?.length || 0) > 5 && (
                                    <Button
                                        variant="ghost"
                                        className="w-full text-sm"
                                        onClick={() => setMembersDialogOpen(true)}
                                    >
                                        View all {currentProject.members.length} members
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Project Info Card */}
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle className="text-base">Project Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created</span>
                                <span>{new Date(currentProject.createdAt).toLocaleDateString()}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Priority</span>
                                <Badge variant={
                                    currentProject.priority === 'high' ? 'destructive' :
                                        currentProject.priority === 'medium' ? 'default' : 'secondary'
                                }>
                                    {currentProject.priority || 'medium'}
                                </Badge>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Visibility</span>
                                <span className="capitalize">{currentProject.visibility || 'workspace'}</span>
                            </div>
                            {currentProject.startDate && (
                                <>
                                    <Separator />
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Start Date</span>
                                        <span>{new Date(currentProject.startDate).toLocaleDateString()}</span>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Dialogs */}
            <ProjectMembersDialog
                open={membersDialogOpen}
                onClose={() => setMembersDialogOpen(false)}
                project={currentProject}
                workspaceId={workspaceId}
                onMemberRemoved={() => fetchProjectById(projectId)}
            />

            <AddProjectMembersDialog
                open={addMembersDialogOpen}
                onClose={() => setAddMembersDialogOpen(false)}
                project={currentProject}
                workspaceId={workspaceId}
                existingMembers={currentProject.members || []}
                onSuccess={() => fetchProjectById(projectId)}
            />
        </div>
    );
}
