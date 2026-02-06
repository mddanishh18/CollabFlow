"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useProjects } from "@/hooks/use-projects"
import { useWorkspace } from "@/hooks/use-workspace"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProjectMembersDialog } from "@/components/project/project-members-dialog"
import { AddProjectMembersDialog } from "@/components/project/add-project-members-dialog"
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
    Loader2,
    Plus,
    User,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTasks } from "@/hooks/use-task"
import { useAuthStore } from "@/store/auth-store"
import { TaskList } from "@/components/task/task-list"
import { CreateTaskDialog } from "@/components/task/create-task-dialog"
import { TaskDetailDialog } from "@/components/task/task-detail-dialog"
import { UserPresence } from "@/components/realtime/user-presence"

export default function ProjectDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const projectId = params?.projectId as string
    const workspaceId = params?.workspaceId as string

    const { currentProject, fetchProjectById, loading, error } = useProjects()
    const { currentWorkspace } = useWorkspace()
    const { projectTasks, loading: tasksLoading, deleteTask } = useTasks(projectId)
    const { user } = useAuthStore()

    // Robust user ID check to handle potential persisted state mismatches
    const currentUserId = user?._id || (user as any)?.id;

    // Calculate completion percentage from tasks
    const completedTasksCount = projectTasks.filter(task => task.status === 'done').length;
    const completionPercentage = projectTasks.length > 0
        ? Math.round((completedTasksCount / projectTasks.length) * 100)
        : 0;

    const [membersDialogOpen, setMembersDialogOpen] = useState(false)
    const [addMembersDialogOpen, setAddMembersDialogOpen] = useState(false)
    const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState<any>(null)
    const [taskDetailOpen, setTaskDetailOpen] = useState(false)

    useEffect(() => {
        if (projectId) {
            fetchProjectById(projectId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId])

    const getInitials = (name?: string): string => {
        if (!name) return "?"
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const getVisibilityIcon = (visibility?: string) => {
        switch (visibility) {
            case "private":
                return <Lock className="h-4 w-4" />
            case "public":
                return <Globe className="h-4 w-4" />
            default:
                return <Users className="h-4 w-4" />
        }
    }

    const getStatusColor = (status?: string): string => {
        switch (status) {
            case "active":
                return "bg-green-500"
            case "completed":
                return "bg-blue-500"
            case "on-hold":
                return "bg-yellow-500"
            case "archived":
                return "bg-gray-500"
            default:
                return "bg-gray-400"
        }
    }

    // Permission checks based on user role
    const projectRole = currentProject?.userRole;
    const workspaceRole = currentWorkspace?.userRole;

    const isProjectOwner = projectRole === 'owner';
    const isWorkspaceAdmin = workspaceRole === 'owner' || workspaceRole === 'admin';
    const isEditor = projectRole === 'editor';

    // Project-level permissions
    const canManageMembers = isProjectOwner || isWorkspaceAdmin; // Project owner or workspace admin can manage members
    const canCreateTasks = isProjectOwner || isEditor; // Only project owner or editor can create tasks (must be project member)
    const canDeleteTasks = isProjectOwner || isWorkspaceAdmin; // Project owner or workspace admin can delete tasks (for oversight)

    // Error state
    if (error) {
        return (
            <div className="flex-1 p-4 md:p-6 lg:p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        <span>Failed to load project</span>
                        <Button variant="outline" size="sm" onClick={() => fetchProjectById(projectId)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        )
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
        )
    }

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 pl-12 md:pl-0">
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
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="flex items-center gap-1.5 px-2.5 py-0.5 border-primary/20 bg-primary/5 text-primary">
                                    {getVisibilityIcon(currentProject.visibility)}
                                    <span className="capitalize">{currentProject.visibility || "workspace"}</span>
                                </Badge>
                                <Badge variant="secondary" className="flex items-center gap-1.5 px-2.5 py-0.5">
                                    <div className={`h-1.5 w-1.5 rounded-full ${getStatusColor(currentProject.status)}`} />
                                    <span className="capitalize">{currentProject.status || "active"}</span>
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
                {canManageMembers && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/workspace/${workspaceId}/projects/${projectId}/settings`)}>
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
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
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                <ListTodo className="h-6 w-6 text-blue-500" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <p className="text-2xl font-bold leading-none mb-1">{projectTasks.length}</p>
                                <p className="text-xs text-muted-foreground">Total Tasks</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <p className="text-2xl font-bold leading-none mb-1">{completionPercentage}%</p>
                                <p className="text-xs text-muted-foreground">Completed</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                                <Users className="h-6 w-6 text-purple-500" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <p className="text-2xl font-bold leading-none mb-1">{currentProject.members?.length || 1}</p>
                                <p className="text-xs text-muted-foreground">Members</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                                <Clock className="h-6 w-6 text-orange-500" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <p className="text-2xl font-bold leading-none mb-1">
                                    {currentProject.dueDate
                                        ? new Date(currentProject.dueDate).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                        : "No date"}
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
                                <CardDescription>
                                    {projectTasks.length} task{projectTasks.length !== 1 ? "s" : ""} in this project
                                    {user && (
                                        <span className="ml-1">
                                            ({projectTasks.filter(t => {
                                                const assigneeId = typeof t.assignee === 'object' ? t.assignee?._id : t.assignee;
                                                return assigneeId === currentUserId;
                                            }).length} assigned to you)
                                        </span>
                                    )}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <UserPresence projectId={projectId} />
                                {canCreateTasks && (
                                    <Button onClick={() => setCreateTaskDialogOpen(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        New Task
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* My Tasks Section */}
                            {user && projectTasks.some(t => {
                                const assigneeId = typeof t.assignee === 'object' ? t.assignee?._id : t.assignee;
                                return assigneeId === currentUserId;
                            }) && (
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            My Tasks
                                        </h3>
                                        <ScrollArea className="h-[45vh] pr-4 rounded-md border p-2">
                                            <TaskList
                                                tasks={projectTasks.filter(t => {
                                                    const assigneeId = typeof t.assignee === 'object' ? t.assignee?._id : t.assignee;
                                                    return assigneeId === currentUserId;
                                                })}
                                                loading={tasksLoading}
                                                onTaskClick={(task) => {
                                                    const assigneeId = typeof task.assignee === 'object' ? task.assignee?._id : task.assignee;
                                                    const isAssignee = assigneeId === currentUserId;

                                                    if (canCreateTasks || isAssignee) {
                                                        setSelectedTask(task);
                                                        setTaskDetailOpen(true);
                                                    } else {
                                                        const isUnassigned = !task.assignee;
                                                        const assigneeName = typeof task.assignee === 'object' ? task.assignee?.name : "someone else";

                                                        toast({
                                                            variant: "destructive",
                                                            title: "Access Denied",
                                                            description: isUnassigned
                                                                ? "This task is unassigned. Only owners and editors can view it."
                                                                : `This task is assigned to ${assigneeName}. You can only view tasks assigned to you.`
                                                        });
                                                    }
                                                }}
                                                canEdit={canDeleteTasks}
                                                onDeleteTask={async (taskId) => {
                                                    try {
                                                        await deleteTask(taskId);
                                                        toast({ title: "Task deleted", description: "Task has been removed successfully." });
                                                    } catch (error) {
                                                        toast({
                                                            variant: "destructive",
                                                            title: "Failed to delete task",
                                                            description: "Please try again later."
                                                        });
                                                    }
                                                }}
                                            />
                                        </ScrollArea>
                                        <div className="border-t my-4" />
                                    </div>
                                )}

                            {/* All Tasks Section */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <FolderKanban className="w-4 h-4" />
                                    All Tasks
                                </h3>
                                <ScrollArea className="h-[60vh] pr-4 rounded-md border p-2">
                                    <TaskList
                                        tasks={projectTasks.filter(t => {
                                            const assigneeId = typeof t.assignee === 'object' ? t.assignee?._id : t.assignee;
                                            return assigneeId !== currentUserId;
                                        })}
                                        loading={tasksLoading}
                                        onTaskClick={(task) => {
                                            const assigneeId = typeof task.assignee === 'object' ? task.assignee?._id : task.assignee;
                                            const isAssignee = assigneeId === currentUserId;

                                            if (canCreateTasks || isAssignee) {
                                                setSelectedTask(task);
                                                setTaskDetailOpen(true);
                                            } else {
                                                const isUnassigned = !task.assignee;
                                                const assigneeName = typeof task.assignee === 'object' ? task.assignee?.name : "someone else";

                                                toast({
                                                    variant: "destructive",
                                                    title: "Access Denied",
                                                    description: isUnassigned
                                                        ? "This task is unassigned. Only owners and editors can view it."
                                                        : `This task is assigned to ${assigneeName}. You can only view tasks assigned to you.`
                                                });
                                            }
                                        }}
                                        canEdit={canDeleteTasks}
                                        onDeleteTask={async (taskId) => {
                                            try {
                                                await deleteTask(taskId);
                                                toast({ title: "Task deleted", description: "Task has been removed successfully." });
                                            } catch (error) {
                                                toast({
                                                    variant: "destructive",
                                                    title: "Failed to delete task",
                                                    description: "Please try again later."
                                                });
                                            }
                                        }}
                                    />
                                </ScrollArea>
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
                                    {currentProject.members?.length || 1} member
                                    {(currentProject.members?.length || 1) !== 1 ? "s" : ""}
                                </CardDescription>
                            </div>
                            {canManageMembers && (
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setAddMembersDialogOpen(true)}>
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Add
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setMembersDialogOpen(true)}>
                                        Manage
                                    </Button>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {/* Owner */}
                                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                            {getInitials(
                                                typeof currentProject.owner === 'string'
                                                    ? 'Owner'
                                                    : currentProject.owner?.name || 'Owner'
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {typeof currentProject.owner === 'string'
                                                ? "Owner"
                                                : currentProject.owner?.name || "Owner"}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {typeof currentProject.owner === 'string'
                                                ? ""
                                                : currentProject.owner?.email || ""}
                                        </p>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">
                                        Owner
                                    </Badge>
                                </div>

                                {/* Other Members */}
                                {currentProject.members
                                    ?.filter(
                                        (m: any) => {
                                            const ownerId = typeof currentProject.owner === 'string' ? currentProject.owner : currentProject.owner?._id
                                            return (m.user?._id || m.user) !== ownerId
                                        }
                                    )
                                    .slice(0, 4)
                                    .map((member: any, index: number) => (
                                        <div
                                            key={member.user?._id || index}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                                        >
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                                                    {getInitials(member.user?.name || 'Member')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{member.user?.name || "Member"}</p>
                                                <p className="text-xs text-muted-foreground truncate">{member.user?.email || ""}</p>
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
                                <Badge
                                    variant={
                                        currentProject.priority === "high"
                                            ? "destructive"
                                            : currentProject.priority === "medium"
                                                ? "default"
                                                : "secondary"
                                    }
                                >
                                    {currentProject.priority || "medium"}
                                </Badge>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Visibility</span>
                                <span className="capitalize">{currentProject.visibility || "workspace"}</span>
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
                canManageMembers={canManageMembers}
                onMemberRemoved={() => fetchProjectById(projectId)}
            />

            {selectedTask && (
                <TaskDetailDialog
                    open={taskDetailOpen}
                    onClose={() => setTaskDetailOpen(false)}
                    task={selectedTask}
                    projectId={projectId}
                    projectMembers={currentProject?.members || []}
                    canEdit={canCreateTasks} // Owner or Editor can edit
                    canDelete={canDeleteTasks} // Only Owner or Workspace Admin can delete
                    canEditStatus={selectedTask.assignee === currentUserId || (typeof selectedTask.assignee === 'object' && selectedTask.assignee?._id === currentUserId)}
                />
            )}
            <AddProjectMembersDialog
                open={addMembersDialogOpen}
                onClose={() => setAddMembersDialogOpen(false)}
                project={currentProject}
                workspaceId={workspaceId}
                existingMembers={currentProject.members || []}
                onSuccess={() => fetchProjectById(projectId)}
            />

            <CreateTaskDialog
                open={createTaskDialogOpen}
                onOpenChange={setCreateTaskDialogOpen}
                onClose={() => setCreateTaskDialogOpen(false)}
                projectId={projectId}
                projectMembers={currentProject?.members}
            />
        </div>
    )
}
