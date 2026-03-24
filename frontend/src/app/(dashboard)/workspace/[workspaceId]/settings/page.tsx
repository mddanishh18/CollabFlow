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
import { Badge } from "@/components/ui/badge"
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
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
    Settings,
    AlertCircle,
    RefreshCw,
    Save,
    Trash2,
    Loader2,
    Shield,
    Check,
    Globe,
    Lock,
    Users,
} from "lucide-react"

interface FormData {
    name: string
    description: string
    isPublic: boolean
    allowMemberInvites: boolean
    defaultProjectVisibility: "private" | "workspace" | "public"
}

export default function SettingsPage() {
    const params = useParams()
    const router = useRouter()
    const workspaceId = params?.workspaceId as string
    const { toast } = useToast()
    const prefersReducedMotion = useReducedMotion()

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
        isPublic: false,
        allowMemberInvites: false,
        defaultProjectVisibility: "workspace",
    })
    const [saving, setSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
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
                isPublic: currentWorkspace.settings?.isPublic ?? false,
                allowMemberInvites: currentWorkspace.settings?.allowMemberInvites ?? false,
                defaultProjectVisibility: currentWorkspace.settings?.defaultProjectVisibility ?? "workspace",
            })
            setHasChanges(false)
        }
    }, [currentWorkspace])

    const handleInputChange = (field: keyof FormData, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        setHasChanges(true)
        setSaveSuccess(false)
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
                    isPublic: formData.isPublic,
                    allowMemberInvites: formData.allowMemberInvites,
                    defaultProjectVisibility: formData.defaultProjectVisibility,
                },
            })

            setSaveSuccess(true)
            setHasChanges(false)
            fetchWorkspaceById(workspaceId)

            setTimeout(() => setSaveSuccess(false), 3000)
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

    if (loading) {
        return (
            <div className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-10 w-28 ml-auto" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const fadeUp = {
        initial: prefersReducedMotion ? false : { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
    }

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <motion.div
                    {...fadeUp}
                    transition={{ duration: 0.25 }}
                    className="mb-8 pl-12 md:pl-0"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                            <Settings className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                                Workspace Settings
                            </h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {currentWorkspace?.name}
                            </p>
                        </div>
                    </div>
                </motion.div>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* General — name and description */}
                    <motion.div {...fadeUp} transition={{ duration: 0.25, delay: 0.05 }}>
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base">General</CardTitle>
                                <CardDescription>
                                    The name and description visible to all workspace members
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                                    <Label htmlFor="description">
                                        Description{" "}
                                        <span className="text-muted-foreground font-normal">(optional)</span>
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange("description", e.target.value)}
                                        placeholder="What is this workspace for?"
                                        rows={3}
                                        disabled={saving}
                                        className="resize-none"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Access & Defaults */}
                    <motion.div {...fadeUp} transition={{ duration: 0.25, delay: 0.1 }}>
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base">Access & Defaults</CardTitle>
                                <CardDescription>
                                    Control who can join and what defaults apply to new projects
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-0">
                                {/* isPublic */}
                                <div className="flex items-start justify-between gap-4 py-4">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-medium flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            Public workspace
                                        </p>
                                        <p className="text-xs text-muted-foreground pl-6">
                                            Allow anyone with the link to find and request access
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={formData.isPublic}
                                        onClick={() => handleInputChange("isPublic", !formData.isPublic)}
                                        disabled={saving}
                                        className={cn(
                                            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                            formData.isPublic ? "bg-primary" : "bg-input"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
                                                formData.isPublic ? "translate-x-4" : "translate-x-0"
                                            )}
                                        />
                                    </button>
                                </div>

                                <Separator />

                                {/* allowMemberInvites */}
                                <div className="flex items-start justify-between gap-4 py-4">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-medium flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            Members can invite
                                        </p>
                                        <p className="text-xs text-muted-foreground pl-6">
                                            Allow regular members (not just admins) to send workspace invitations
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={formData.allowMemberInvites}
                                        onClick={() => handleInputChange("allowMemberInvites", !formData.allowMemberInvites)}
                                        disabled={saving}
                                        className={cn(
                                            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                            formData.allowMemberInvites ? "bg-primary" : "bg-input"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
                                                formData.allowMemberInvites ? "translate-x-4" : "translate-x-0"
                                            )}
                                        />
                                    </button>
                                </div>

                                <Separator />

                                {/* defaultProjectVisibility */}
                                <div className="flex items-start justify-between gap-4 py-4">
                                    <div className="space-y-0.5 flex-1 min-w-0">
                                        <p className="text-sm font-medium flex items-center gap-2">
                                            <Lock className="h-4 w-4 text-muted-foreground" />
                                            Default project visibility
                                        </p>
                                        <p className="text-xs text-muted-foreground pl-6">
                                            Applied automatically when a new project is created
                                        </p>
                                    </div>
                                    <Select
                                        value={formData.defaultProjectVisibility}
                                        onValueChange={(v) =>
                                            handleInputChange(
                                                "defaultProjectVisibility",
                                                v as "private" | "workspace" | "public"
                                            )
                                        }
                                        disabled={saving}
                                    >
                                        <SelectTrigger className="w-36 shrink-0">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="private">Private</SelectItem>
                                            <SelectItem value="workspace">Workspace</SelectItem>
                                            <SelectItem value="public">Public</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Save row */}
                    <motion.div
                        {...fadeUp}
                        transition={{ duration: 0.25, delay: 0.15 }}
                        className="flex items-center justify-between"
                    >
                        <div className="h-5">
                            {saveSuccess && (
                                <motion.span
                                    initial={prefersReducedMotion ? false : { opacity: 0, x: -4 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400"
                                >
                                    <Check className="h-4 w-4" />
                                    Saved
                                </motion.span>
                            )}
                            {hasChanges && !saveSuccess && (
                                <span className="text-xs text-muted-foreground">
                                    Unsaved changes
                                </span>
                            )}
                        </div>
                        <Button type="submit" disabled={saving || !hasChanges}>
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving…
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </motion.div>
                </form>

                {/* Danger Zone */}
                <motion.div
                    {...fadeUp}
                    transition={{ duration: 0.25, delay: 0.2 }}
                    className="mt-8"
                >
                    <Card className="border-destructive/40">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base text-destructive flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Danger Zone
                            </CardTitle>
                            <CardDescription>
                                Actions here are permanent and cannot be undone
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-destructive/25 bg-destructive/5">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-medium">Delete this workspace</p>
                                    <p className="text-xs text-muted-foreground">
                                        All projects, tasks, members, and data will be permanently removed
                                    </p>
                                </div>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            disabled={deleting}
                                            className="shrink-0"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete workspace
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Delete &ldquo;{currentWorkspace?.name}&rdquo;?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription className="space-y-2">
                                                <span className="block">
                                                    This will permanently delete the workspace and everything inside it:
                                                </span>
                                                <ul className="list-disc list-inside space-y-1 text-sm">
                                                    <li>All projects and their tasks</li>
                                                    <li>All member access and invitations</li>
                                                    <li>All chat history and data</li>
                                                </ul>
                                                <span className="block font-medium text-foreground">
                                                    There is no undo.
                                                </span>
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
                                                        Deleting…
                                                    </>
                                                ) : (
                                                    "Yes, permanently delete"
                                                )}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
