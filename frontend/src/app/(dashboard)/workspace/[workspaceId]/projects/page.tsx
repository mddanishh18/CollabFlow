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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Manage your workspace projects ({workspaceProjects?.length || 0} total)
                    </p>
                </div>
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
                            {searchQuery ? "No projects found" : "No projects yet"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 text-center">
                            {searchQuery ? "Try a different search term" : "Create your first project to get started"}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProjects.map((project: any) => (
                        <Card
                            key={project._id}
                            className="hover:border-primary/50 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                            onClick={() => router.push(`/workspace/${workspaceId}/projects/${project._id}`)}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                                            <FolderKanban className="h-4 w-4 text-primary" />
                                        </div>
                                        <CardTitle className="text-base font-medium truncate">{project.name}</CardTitle>
                                    </div>
                                    {(project.userRole === 'owner' || project.userRole === 'editor') && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(project)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                {project.userRole === 'owner' && (
                                                    <DropdownMenuItem
                                                        className="text-destructive"
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
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                    {project.description || "No description"}
                                </p>
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                                        {getVisibilityIcon(project.visibility)}
                                        {project.visibility || "workspace"}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
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
                                                Private - Only assigned members
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="workspace">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                Workspace - All workspace members
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="public">
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4" />
                                                Public - Anyone can view
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
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
                                        <SelectItem value="private">Private</SelectItem>
                                        <SelectItem value="workspace">Workspace</SelectItem>
                                        <SelectItem value="public">Public</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
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
        </div>
    )
}
