"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useWorkspace } from "@/hooks/use-workspace"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Settings,
    AlertCircle,
    RefreshCw,
    Save,
    Trash2,
    Loader2,
    Shield,
    Globe,
    Lock,
} from "lucide-react"

interface FormData {
    name: string
    description: string
    visibility: string
}

export default function SettingsPage() {
    const params = useParams()
    const router = useRouter()
    const workspaceId = params?.workspaceId as string
    const { toast } = useToast()

    const {
        currentWorkspace,
        fetchWorkspaceById,
        updateWorkspace,
        deleteWorkspace,
        loading,
        error,
    } = useWorkspace()

    const [formData, setFormData] = useState<FormData>({
        name: "",
        description: "",
        visibility: "private",
    })
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        if (workspaceId) {
            fetchWorkspaceById(workspaceId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workspaceId])

    useEffect(() => {
        if (currentWorkspace) {
            setFormData({
                name: currentWorkspace.name || "",
                description: currentWorkspace.description || "",
                visibility: currentWorkspace.settings?.visibility || "private",
            })
        }
    }, [currentWorkspace])

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        setHasChanges(true)
    }

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            toast({
                variant: "destructive",
                title: "Name required",
                description: "Workspace name cannot be empty",
            })
            return
        }

        setSaving(true)
        try {
            await updateWorkspace(workspaceId, {
                name: formData.name.trim(),
                description: formData.description.trim(),
                settings: {
                    isPublic: currentWorkspace?.settings?.isPublic ?? false,
                    allowMemberInvites: currentWorkspace?.settings?.allowMemberInvites ?? false,
                    defaultProjectVisibility: currentWorkspace?.settings?.defaultProjectVisibility ?? 'workspace',
                    visibility: formData.visibility as 'private' | 'public',
                },
            })

            toast({
                title: "Settings saved! ✓",
                description: "Your workspace has been updated",
            })

            setHasChanges(false)
            fetchWorkspaceById(workspaceId)
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Failed to save",
                description: (err as Error).message || "Please try again",
            })
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            await deleteWorkspace(workspaceId)

            toast({
                title: "Workspace deleted",
                description: "The workspace has been permanently deleted",
            })

            router.push("/workspace")
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Failed to delete",
                description: (err as Error).message || "Please try again",
            })
        } finally {
            setDeleting(false)
        }
    }

    const handleRetry = () => {
        fetchWorkspaceById(workspaceId).catch(() => {
            toast({
                variant: "destructive",
                title: "Still having issues",
                description: "Please check your connection",
            })
        })
    }

    // Error state
    if (error && !loading) {
        return (
            <div className="flex-1 p-4 md:p-6 lg:p-8">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            Failed to Load Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                        <Button onClick={handleRetry} className="w-full">
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
                <div className="max-w-2xl mx-auto space-y-6">
                    <Skeleton className="h-8 w-48" />
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Settings className="h-6 w-6 md:h-8 md:w-8" />
                        Workspace Settings
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">
                        Manage your workspace configuration
                    </p>
                </div>

                {/* General Settings */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-base md:text-lg">General</CardTitle>
                        <CardDescription className="text-xs md:text-sm">
                            Basic workspace information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Workspace Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    placeholder="My Workspace"
                                    disabled={saving}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    placeholder="What's this workspace for?"
                                    rows={3}
                                    disabled={saving}
                                    className="resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="visibility">Visibility</Label>
                                <Select
                                    value={formData.visibility}
                                    onValueChange={(value) => handleInputChange("visibility", value)}
                                    disabled={saving}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select visibility" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="private">
                                            <div className="flex items-center gap-2">
                                                <Lock className="h-4 w-4" />
                                                Private
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="public">
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4" />
                                                Public
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    {formData.visibility === "private"
                                        ? "Only invited members can access this workspace"
                                        : "Anyone can view this workspace"}
                                </p>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={saving || !hasChanges}>
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
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="text-base md:text-lg text-destructive flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription className="text-xs md:text-sm">
                            Irreversible actions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-destructive/30 rounded-lg bg-destructive/5">
                            <div>
                                <h4 className="font-medium text-sm">Delete Workspace</h4>
                                <p className="text-xs text-muted-foreground">
                                    This will permanently delete the workspace and all its data
                                </p>
                            </div>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" disabled={deleting}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the workspace "
                                            <strong>{currentWorkspace?.name}</strong>" and all associated projects,
                                            members, and data.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            {deleting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Deleting...
                                                </>
                                            ) : (
                                                "Yes, delete workspace"
                                            )}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
