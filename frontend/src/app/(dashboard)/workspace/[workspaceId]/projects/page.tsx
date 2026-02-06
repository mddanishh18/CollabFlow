"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useProjects } from "@/hooks/use-projects"
import { useWorkspace } from "@/hooks/use-workspace"
import { useToast } from "@/hooks/use-toast"
import { type ProjectVisibility } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    FolderKanban,
    Plus,
    AlertCircle,
    RefreshCw,
    MoreVertical,
    Trash2,
    Edit,
    Loader2,
    Search,
    Lock,
    Globe,
    Users,
    Calendar,
    UserPlus,
    Info,
    Bot,
    Sparkles,
    MessageSquare,
    Database,
    Shield,
    Zap,
} from "lucide-react"
import { AddProjectMembersDialog } from "@/components/project/add-project-members-dialog"

interface FormData {
    name: string
    description: string
    visibility: ProjectVisibility
}

export default function ProjectsPage() {
    const params = useParams()
    const router = useRouter()
    const workspaceId = params?.workspaceId as string
    const { toast } = useToast()

    const {
        workspaceProjects,
        fetchWorkspaceProjects,
        createProject,
        updateProject,
        deleteProject,
        loading,
        error,
    } = useProjects()

    const { currentWorkspace } = useWorkspace()

    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingProject, setEditingProject] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [creating, setCreating] = useState(false)
    const [saving, setSaving] = useState(false)
    const [membersDialogOpen, setMembersDialogOpen] = useState(false)
    const [selectedProjectForMembers, setSelectedProjectForMembers] = useState<any>(null)
    const [aiPreviewOpen, setAiPreviewOpen] = useState(false)

    const [formData, setFormData] = useState<FormData>({
        name: "",
        description: "",
        visibility: "workspace",
    })

    useEffect(() => {
        if (workspaceId) {
            fetchWorkspaceProjects(workspaceId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workspaceId])

    const resetForm = () => {
        setFormData({ name: "", description: "", visibility: "workspace" })
    }

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            toast({
                variant: "destructive",
                title: "Name required",
                description: "Project name cannot be empty",
            })
            return
        }

        setCreating(true)
        try {
            await createProject({
                ...formData,
                name: formData.name.trim(),
                description: formData.description.trim(),
                workspace: workspaceId,
            })

            toast({
                title: "Project created! 🎉",
                description: `${formData.name} is ready to use`,
            })

            setCreateDialogOpen(false)
            resetForm()
            fetchWorkspaceProjects(workspaceId)
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Failed to create project",
                description: (err as Error).message || "Please try again",
            })
        } finally {
            setCreating(false)
        }
    }

    const handleEdit = (project: any) => {
        setEditingProject(project)
        setFormData({
            name: project.name,
            description: project.description || "",
            visibility: project.visibility || "workspace",
        })
        setEditDialogOpen(true)
    }

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            toast({
                variant: "destructive",
                title: "Name required",
                description: "Project name cannot be empty",
            })
            return
        }

        setSaving(true)
        try {
            await updateProject(editingProject._id, {
                name: formData.name.trim(),
                description: formData.description.trim(),
                visibility: formData.visibility,
            })

            toast({
                title: "Project updated! ✓",
                description: "Changes have been saved",
            })

            setEditDialogOpen(false)
            setEditingProject(null)
            resetForm()
            fetchWorkspaceProjects(workspaceId)
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Failed to update project",
                description: (err as Error).message || "Please try again",
            })
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (projectId: string, projectName: string) => {
        try {
            await deleteProject(projectId)

            toast({
                title: "Project deleted",
                description: `${projectName} has been removed`,
            })

            fetchWorkspaceProjects(workspaceId)
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Failed to delete project",
                description: (err as Error).message || "Please try again",
            })
        }
    }

    const handleRetry = () => {
        fetchWorkspaceProjects(workspaceId).catch(() => {
            toast({
                variant: "destructive",
                title: "Still having issues",
                description: "Please check your connection",
            })
        })
    }

    const getVisibilityIcon = (visibility?: string) => {
        switch (visibility) {
            case "private":
                return <Lock className="h-3 w-3" />
            case "public":
                return <Globe className="h-3 w-3" />
            default:
                return <Users className="h-3 w-3" />
        }
    }

    // Error state
    if (error && !loading) {
        return (
            <div className="flex-1 p-4 md:p-6 lg:p-8">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            {error.includes("member") || error.includes("Access denied")
                                ? "Access Denied"
                                : "Failed to Load Projects"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => (window.location.href = "/workspace")}
                                variant="outline"
                                className="w-full"
                            >
                                Go to Dashboard
                            </Button>
                            <Button onClick={handleRetry} className="w-full">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Retry
                            </Button>
                        </div>
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
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <Skeleton className="h-10 w-full max-w-md" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-40" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const filteredProjects =
        workspaceProjects?.filter(
            (project: any) =>
                project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.description?.toLowerCase().includes(searchQuery.toLowerCase())
        ) || []

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pl-12 md:pl-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Manage your workspace projects ({workspaceProjects?.length || 0} total)
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setAiPreviewOpen(true)}
                        variant="outline"
                        className="w-full sm:w-auto border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                    >
                        <Bot className="mr-2 h-4 w-4" />
                        AI Assistant
                        <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
                    </Button>
                    {(currentWorkspace?.userRole === 'owner' || currentWorkspace?.userRole === 'admin') && (
                        <Button
                            onClick={() => {
                                resetForm()
                                setCreateDialogOpen(true)
                            }}
                            className="w-full sm:w-auto"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            New Project
                        </Button>
                    )}
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                            {searchQuery ? "No projects found" : "No projects visible"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                            {searchQuery
                                ? "Try a different search term"
                                : (currentWorkspace?.userRole === 'owner' || currentWorkspace?.userRole === 'admin')
                                    ? "Create your first project to get started"
                                    : "You haven't been added to any projects yet. Ask an admin to invite you or create one for you."}
                        </p>
                        {!searchQuery && (currentWorkspace?.userRole === 'owner' || currentWorkspace?.userRole === 'admin') && (
                            <Button
                                onClick={() => {
                                    resetForm()
                                    setCreateDialogOpen(true)
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create Project
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredProjects.map((project: any) => (
                        <Card
                            key={project._id}
                            className="elevated group cursor-pointer overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm"
                            onClick={() => router.push(`/workspace/${workspaceId}/projects/${project._id}`)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
                                            <FolderKanban className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-semibold truncate">{project.name}</CardTitle>
                                        </div>
                                    </div>
                                    {(project.userRole === 'owner' || project.userRole === 'editor') && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary/10 rounded-lg"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="glass-card">
                                                <DropdownMenuItem onClick={() => handleEdit(project)} className="cursor-pointer">
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                {project.userRole === 'owner' && (
                                                    <DropdownMenuItem
                                                        className="text-destructive cursor-pointer"
                                                        onClick={() => handleDelete(project._id, project.name)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                                    {project.description || "No description"}
                                </p>
                                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                                    <Badge variant="outline" className="text-xs flex items-center gap-1.5 rounded-lg">
                                        {getVisibilityIcon(project.visibility)}
                                        {project.visibility || "workspace"}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {new Date(project.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                        <DialogDescription>
                            Add a new project to {currentWorkspace?.name || "this workspace"}
                        </DialogDescription>
                    </DialogHeader>

                    <Alert className="mb-4">
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                            <strong>Creating a project in {currentWorkspace?.name || "this workspace"}</strong>
                            <ul className="mt-2 ml-4 list-disc space-y-1 text-muted-foreground">
                                <li>You'll be the project owner with full control</li>
                                <li><strong>Private:</strong> Only you and invited members can access</li>
                                <li><strong>Workspace:</strong> All workspace members can view (but not edit)</li>
                                <li>You can add editors and viewers after creation</li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    <form onSubmit={handleCreate}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="create-name">Project Name *</Label>
                                <Input
                                    id="create-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="My Awesome Project"
                                    disabled={creating}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create-description">Description</Label>
                                <Textarea
                                    id="create-description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="What's this project about?"
                                    rows={3}
                                    disabled={creating}
                                    className="resize-none"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create-visibility">Visibility</Label>
                                <Select
                                    value={formData.visibility}
                                    onValueChange={(value) => setFormData({ ...formData, visibility: value as ProjectVisibility })}
                                    disabled={creating}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select visibility" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="private">
                                            <div className="flex items-center gap-2">
                                                <Lock className="h-4 w-4" />
                                                Private - Only project members
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="workspace">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                Workspace - All workspace members
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCreateDialogOpen(false)}
                                disabled={creating}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={creating}>
                                {creating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Project
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                        <DialogDescription>Update project details</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleUpdate}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Project Name *</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    disabled={saving}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    disabled={saving}
                                    className="resize-none"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-visibility">Visibility</Label>
                                <Select
                                    value={formData.visibility}
                                    onValueChange={(value) => setFormData({ ...formData, visibility: value as ProjectVisibility })}
                                    disabled={saving}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="private">Private - Only project members</SelectItem>
                                        <SelectItem value="workspace">Workspace - All workspace members</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditDialogOpen(false)}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Add Members Dialog */}
            <AddProjectMembersDialog
                open={membersDialogOpen}
                onClose={() => {
                    setMembersDialogOpen(false)
                    setSelectedProjectForMembers(null)
                }}
                project={selectedProjectForMembers}
                workspaceId={workspaceId}
                existingMembers={selectedProjectForMembers?.members || []}
                onSuccess={() => fetchWorkspaceProjects(workspaceId)}
            />

            {/* AI Preview Dialog */}
            <Dialog open={aiPreviewOpen} onOpenChange={setAiPreviewOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Bot className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">AI Project Assistant</DialogTitle>
                                <DialogDescription>Coming Soon</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Hero Message */}
                        <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                            <p className="text-sm leading-relaxed">
                                <Sparkles className="inline h-4 w-4 text-primary mr-1" />
                                Each project will get its own intelligent AI assistant with dedicated knowledge base.
                                Ask questions, get insights, and boost productivity.
                            </p>
                        </div>

                        {/* Features List */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <Zap className="h-4 w-4 text-primary" />
                                What You'll Get:
                            </h4>

                            <div className="space-y-3">
                                <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
                                    <MessageSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Dedicated AI Per Project</p>
                                        <p className="text-xs text-muted-foreground">Each project gets its own AI assistant that understands your specific context</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
                                    <Database className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Separate Knowledge Bases</p>
                                        <p className="text-xs text-muted-foreground">Isolated knowledge per project - AI only knows what's relevant to that project</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
                                    <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Admin Controlled</p>
                                        <p className="text-xs text-muted-foreground">Project admins decide what the AI learns - tasks, files, docs, and more</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
                                    <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Real-Time Responses</p>
                                        <p className="text-xs text-muted-foreground">Get instant answers about project tasks, status, and context through chat</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Use Cases */}
                        <div className="p-4 border rounded-lg space-y-2">
                            <h4 className="text-sm font-semibold">Example Questions You Can Ask:</h4>
                            <div className="space-y-1.5 text-xs text-muted-foreground">
                                <p>• "What tasks are overdue in this project?"</p>
                                <p>• "Summarize recent activity and progress"</p>
                                <p>• "Who's working on the authentication feature?"</p>
                                <p>• "What's blocking us from completing sprint 3?"</p>
                            </div>
                        </div>

                        {/* Launch Badge */}
                        <div className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-lg">
                            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                            <span className="text-sm font-medium">Launching Soon</span>
                            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setAiPreviewOpen(false)} className="w-full">
                            Got it, can't wait!
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
