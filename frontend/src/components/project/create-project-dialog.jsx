"use client";

import { useState } from "react";
import { useProjects } from "@/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    FolderKanban,
    Loader2,
    AlertCircle,
    Lock,
    Globe,
    Users,
    Plus
} from "lucide-react";

/**
 * Reusable create project dialog component
 * @param {boolean} open - Dialog open state
 * @param {function} onOpenChange - Dialog state change handler
 * @param {string} workspaceId - Workspace ID to create project in
 * @param {string} workspaceName - Workspace name for display
 * @param {function} onSuccess - Callback after successful creation
 */
export function CreateProjectDialog({
    open,
    onOpenChange,
    workspaceId,
    workspaceName,
    onSuccess
}) {
    const { toast } = useToast();
    const { createProject } = useProjects();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        visibility: "workspace",
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Project name is required";
        } else if (formData.name.length < 2) {
            newErrors.name = "Name must be at least 2 characters";
        } else if (formData.name.length > 100) {
            newErrors.name = "Name cannot exceed 100 characters";
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = "Description cannot exceed 500 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const project = await createProject({
                name: formData.name.trim(),
                description: formData.description.trim(),
                visibility: formData.visibility,
                workspace: workspaceId,
            });

            toast({
                title: "Project created! 🎉",
                description: `${project.name} is ready to use`,
            });

            // Reset form
            setFormData({ name: "", description: "", visibility: "workspace" });
            setErrors({});

            // Close dialog and notify parent
            onOpenChange(false);
            if (onSuccess) onSuccess(project);

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to create project",
                description: error.message || "Please try again",
            });
            setErrors({ submit: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({ name: "", description: "", visibility: "workspace" });
            setErrors({});
            onOpenChange(false);
        }
    };

    const visibilityOptions = [
        {
            value: "private",
            icon: Lock,
            label: "Private",
            description: "Only assigned members can access"
        },
        {
            value: "workspace",
            icon: Users,
            label: "Workspace",
            description: "All workspace members can access"
        },
        {
            value: "public",
            icon: Globe,
            label: "Public",
            description: "Anyone can view this project"
        }
    ];

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FolderKanban className="h-5 w-5 text-primary" />
                        Create New Project
                    </DialogTitle>
                    <DialogDescription>
                        Add a new project to {workspaceName || "your workspace"}
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

                        {/* Project Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="project-name">
                                Project Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="project-name"
                                placeholder="My Awesome Project"
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
                            <Label htmlFor="project-description">Description (Optional)</Label>
                            <Textarea
                                id="project-description"
                                placeholder="What's this project about?"
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

                        {/* Visibility */}
                        <div className="grid gap-2">
                            <Label htmlFor="project-visibility">Visibility</Label>
                            <Select
                                value={formData.visibility}
                                onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger id="project-visibility">
                                    <SelectValue placeholder="Select visibility" />
                                </SelectTrigger>
                                <SelectContent>
                                    {visibilityOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            <div className="flex items-center gap-2">
                                                <option.icon className="h-4 w-4" />
                                                <div>
                                                    <span className="font-medium">{option.label}</span>
                                                    <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
                                                        - {option.description}
                                                    </span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {visibilityOptions.find(o => o.value === formData.visibility)?.description}
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
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
    );
}
