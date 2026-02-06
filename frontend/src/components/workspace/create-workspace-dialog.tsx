"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useWorkspace } from "@/hooks/use-workspace"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"

interface CreateWorkspaceDialogProps {
    open: boolean
    onClose: (success?: boolean) => void
}

interface FormData {
    name: string
    description: string
}

type FormErrors = Partial<Record<keyof FormData | "submit", string>>

export function CreateWorkspaceDialog({ open, onClose }: CreateWorkspaceDialogProps) {
    const router = useRouter()
    const { toast } = useToast()
    const { createWorkspace, loading, clearError } = useWorkspace()

    const [formData, setFormData] = useState<FormData>({
        name: "",
        description: "",
    })
    const [errors, setErrors] = useState<FormErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = "Workspace name is required"
        } else if (formData.name.length < 2) {
            newErrors.name = "Name must be at least 2 characters"
        } else if (formData.name.length > 100) {
            newErrors.name = "Name cannot exceed 100 characters"
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = "Description cannot exceed 500 characters"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)
        try {
            const workspace = await createWorkspace({
                name: formData.name.trim(),
                description: formData.description.trim(),
            })

            toast({
                title: "Workspace created! 🎉",
                description: `${workspace.name} is ready to use.`,
            })

            // Reset form
            setFormData({ name: "", description: "" })
            setErrors({})

            // Close dialog and redirect
            onClose(true)
            router.push(`/workspace/${workspace._id}`)
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to create workspace",
                description: (error as Error).message || "Please try again",
            })
            setErrors({ submit: (error as Error).message })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({ name: "", description: "" })
            setErrors({})
            clearError()
            onClose(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Workspace</DialogTitle>
                    <DialogDescription>
                        Set up a new workspace for your team to collaborate.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Error Alert */}
                        {errors.submit && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errors.submit}</AlertDescription>
                            </Alert>
                        )}

                        {/* Workspace Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                Workspace Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="My Awesome Workspace"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={errors.name ? "border-destructive" : ""}
                                disabled={isSubmitting}
                                autoFocus
                            />
                            {errors.name && (
                                <p className="text-xs text-destructive">{errors.name}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="What's this workspace for?"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className={`min-h-[80px] resize-none ${errors.description ? "border-destructive" : ""}`}
                                disabled={isSubmitting}
                            />
                            {errors.description && (
                                <p className="text-xs text-destructive">{errors.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {formData.description.length}/500 characters
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Workspace"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
