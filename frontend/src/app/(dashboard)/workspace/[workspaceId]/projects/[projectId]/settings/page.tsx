"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useProjects } from "@/hooks/use-projects"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProjectSettingsPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const projectId = params?.projectId as string
    const workspaceId = params?.workspaceId as string

    const { currentProject, fetchProjectById, updateProject, deleteProject, loading } = useProjects()

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "planning",
        priority: "medium",
        visibility: "workspace",
    })
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (projectId) {
            fetchProjectById(projectId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId])

    useEffect(() => {
        if (currentProject) {
            setFormData({
                name: currentProject.name || "",
                description: currentProject.description || "",
                status: currentProject.status || "planning",
                priority: currentProject.priority || "medium",
                visibility: currentProject.visibility || "workspace",
            })
        }
    }, [currentProject])

    const handleSave = async () => {
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
            await updateProject(projectId, formData)
            toast({
                title: "Settings saved! ✓",
                description: "Project settings have been updated",
            })
            router.push(`/workspace/${workspaceId}/projects/${projectId}`)
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to save settings",
                description: (error as Error).message || "Please try again",
            })
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
            return
        }

        setDeleting(true)
        try {
            await deleteProject(projectId)
            toast({
                title: "Project deleted",
                description: "The project has been removed",
            })
            router.push(`/workspace/${workspaceId}/projects`)
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to delete project",
                description: (error as Error).message || "Please try again",
            })
            setDeleting(false)
        }
    }

    if (loading || !currentProject) {
        return (
            <div className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="space-y-6">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/workspace/${workspaceId}/projects/${projectId}`)}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Project Settings</h1>
                    <p className="text-sm text-muted-foreground">{currentProject.name}</p>
                </div>
            </div>

            {/* Settings Form */}
            <div className="max-w-2xl mx-auto space-y-6">{/* Added mx-auto for centering */}
                <Card>
                    <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Update project information and configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Project Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Project Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="My Awesome Project"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="What's this project about?"
                                rows={3}
                                className="resize-none"
                            />
                        </div>

                        <Separator />

                        {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="planning">📋 Planning</SelectItem>
                                    <SelectItem value="active">🚀 Active</SelectItem>
                                    <SelectItem value="on-hold">⏸️ On Hold</SelectItem>
                                    <SelectItem value="completed">✅ Completed</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Current project status
                            </p>
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) => setFormData({ ...formData, priority: value })}
                            >
                                <SelectTrigger id="priority">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">🟢 Low</SelectItem>
                                    <SelectItem value="medium">🟡 Medium</SelectItem>
                                    <SelectItem value="high">🟠 High</SelectItem>
                                    <SelectItem value="urgent">🔴 Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Set project priority level
                            </p>
                        </div>

                        {/* Visibility */}
                        <div className="space-y-2">
                            <Label htmlFor="visibility">Visibility</Label>
                            <Select
                                value={formData.visibility}
                                onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                            >
                                <SelectTrigger id="visibility">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="private">🔒 Private - Only project members</SelectItem>
                                    <SelectItem value="workspace">👥 Workspace - All workspace members</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Control who can view this project
                            </p>
                        </div>

                        <Separator />

                        {/* Save Button */}
                        <div className="flex gap-3">
                            <Button onClick={handleSave} disabled={saving} className="flex-1">
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/workspace/${workspaceId}/projects/${projectId}`)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>Irreversible and destructive actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Delete Project</p>
                                <p className="text-sm text-muted-foreground">
                                    Permanently delete this project and all its data
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Project
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
