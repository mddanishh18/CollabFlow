"use client"

import { useState } from "react";
import { useTasks } from "@/hooks/use-task";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, User, Calendar as CalendarIcon, Tag, Plus, Info } from "lucide-react";
import type { TaskStatus, TaskPriority, Label as LabelType } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LabelPicker } from "./label-picker";

interface CreateTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onClose: (success?: boolean) => void;
    projectId: string;
    projectMembers?: any[];
}

interface FormData {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignee: string;
    dueDate?: Date;
    labels: LabelType[];
}

type FormErrors = Partial<Record<keyof FormData | "submit", string>>;

export function CreateTaskDialog({ open, onOpenChange, onClose, projectId, projectMembers = [] }: CreateTaskDialogProps) {
    const { toast } = useToast();
    const { createTask, clearError } = useTasks(projectId);

    const [formData, setFormData] = useState<FormData>({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        assignee: "",
        labels: []
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = "Task title is required";
        } else if (formData.title.length > 200) {
            newErrors.title = "Title cannot exceed 200 characters";
        }

        if (formData.description && formData.description.length > 1000) {
            newErrors.description = "Description cannot exceed 1000 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const task = await createTask({
                ...formData,
                projectId,
                title: formData.title.trim(),
                description: formData.description.trim(),
                assignee: formData.assignee || undefined,
                dueDate: formData.dueDate,
                labels: formData.labels
            });

            toast({
                title: "Task created! 🎉",
                description: `${task.title} has been added.`,
            });

            // Reset form
            setFormData({
                title: "",
                description: "",
                status: "todo",
                priority: "medium",
                assignee: "",
                labels: [],
                dueDate: undefined
            });
            setErrors({});

            // Close dialog
            onClose(true);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to create task",
                description: (error as Error).message || "Please try again",
            });
            setErrors({ submit: (error as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({
                title: "",
                description: "",
                status: "todo",
                priority: "medium",
                assignee: "",
                labels: [],
                dueDate: undefined
            });
            setErrors({});
            clearError();
            onClose(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            handleClose();
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                        Add a new task to this project.
                    </DialogDescription>
                </DialogHeader>

                <Alert className="mb-4">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                        <strong>Creating a task</strong>
                        <ul className="mt-2 ml-4 list-disc space-y-0.5 text-muted-foreground">
                            <li>Only project owners and editors can create tasks</li>
                            <li>You can assign tasks to any project member</li>
                            <li>Tasks are visible to all project members</li>
                        </ul>
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Error Alert */}
                        {errors.submit && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errors.submit}</AlertDescription>
                            </Alert>
                        )}

                        {/* Task Title */}
                        <div className="grid gap-2">
                            <Label htmlFor="title">
                                Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="title"
                                placeholder="Task title..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className={errors.title ? "border-destructive" : ""}
                                disabled={isSubmitting}
                                autoFocus
                            />
                            {errors.title && (
                                <p className="text-xs text-destructive">{errors.title}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe the task..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className={`min-h-[80px] resize-none ${errors.description ? "border-destructive" : ""}`}
                                disabled={isSubmitting}
                            />
                            {errors.description && (
                                <p className="text-xs text-destructive">{errors.description}</p>
                            )}
                        </div>

                        {/* Status & Priority */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: TaskStatus) =>
                                        setFormData({ ...formData, status: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todo">To Do</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="review">Review</SelectItem>
                                        <SelectItem value="done">Done</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value: TaskPriority) =>
                                        setFormData({ ...formData, priority: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Assignee */}
                        <div className="grid gap-2">
                            <Label>Assignee (Optional)</Label>
                            <Select
                                value={formData.assignee || "unassigned"}
                                onValueChange={(value) => setFormData({ ...formData, assignee: value === "unassigned" ? "" : value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Unassigned">
                                        {formData.assignee && projectMembers?.find(m => m.user._id === formData.assignee) ? (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-5 h-5">
                                                    <AvatarImage src={projectMembers?.find(m => m.user._id === formData.assignee)?.user.avatar} />
                                                    <AvatarFallback className="text-[10px]">
                                                        {projectMembers?.find(m => m.user._id === formData.assignee)?.user.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span>{projectMembers?.find(m => m.user._id === formData.assignee)?.user.name}</span>
                                            </div>
                                        ) : (
                                            "Unassigned"
                                        )}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Unassigned
                                        </div>
                                    </SelectItem>
                                    {projectMembers?.map((member: any) => (
                                        <SelectItem key={member.user._id} value={member.user._id}>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-5 h-5">
                                                    <AvatarImage src={member.user.avatar} />
                                                    <AvatarFallback className="text-[10px]">
                                                        {member.user.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span>{member.user.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Due Date & Labels */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Due Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !formData.dueDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick a date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={formData.dueDate}
                                            onSelect={(date) => setFormData({ ...formData, dueDate: date })}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="grid gap-2">
                                <Label>Labels</Label>
                                <LabelPicker
                                    labels={formData.labels}
                                    onChange={(labels) => setFormData({ ...formData, labels })}
                                />
                            </div>
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
                                "Create Task"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
