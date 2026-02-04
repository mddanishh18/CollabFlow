import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, Loader2, Trash2, User, X, Lock } from "lucide-react";
import { format } from "date-fns";
import type { Task, TaskStatus, TaskPriority } from "@/types";
import { useTasks } from "@/hooks/use-task";
import { useToast } from "@/hooks/use-toast";
import { SubtaskList } from "./subtask-list";
import { LabelPicker } from "./label-picker";

interface TaskDetailDialogProps {
    task: Task | null;
    open: boolean;
    onClose: () => void;
    projectId: string;
    projectMembers?: any[];
    canEdit?: boolean;
    canEditStatus?: boolean;
    canDelete?: boolean; // Separate permission for deletion (project owner/workspace admin)
}

export function TaskDetailDialog({
    task,
    open,
    onClose,
    projectId,
    projectMembers = [],
    canEdit = false,
    canEditStatus = false,
    canDelete = false,
}: TaskDetailDialogProps) {
    const { updateTask, deleteTask, loading } = useTasks(projectId);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: "todo" as TaskStatus,
        priority: "medium" as TaskPriority,
        assignee: "",
        dueDate: null as Date | null,
        labels: [] as { name: string; color: string }[],
        subtasks: [] as { title: string; completed: boolean }[],
    });

    const [saving, setSaving] = useState(false);

    // Populate form when task changes
    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title,
                description: task.description || "",
                status: task.status,
                priority: task.priority,
                assignee: typeof task.assignee === "object" ? task.assignee?._id : task.assignee || "",
                dueDate: task.dueDate ? new Date(task.dueDate) : null,
                labels: task.labels || [],
                subtasks: task.subtasks || [],
            });
        }
    }, [task]);

    const handleSave = async () => {
        if (!task) return;

        try {
            setSaving(true);

            // If only status edit is allowed, only send status
            const updateData = canEdit ? {
                title: formData.title.trim(),
                description: formData.description.trim(),
                status: formData.status,
                priority: formData.priority,
                assignee: formData.assignee || undefined,
                dueDate: formData.dueDate,
                labels: formData.labels,
                subtasks: formData.subtasks,
            } : {
                status: formData.status
            };

            await updateTask(task._id, updateData);

            toast({
                title: "Task updated",
                description: "Changes have been saved successfully",
            });

            // Optional: Close on save if desired, but keeping open is usually better for continued editing
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to update task",
                description: (error as Error).message,
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!task) return;

        if (!confirm("Are you sure you want to delete this task?")) return;

        try {
            await deleteTask(task._id);
            toast({
                title: "Task deleted",
                description: "The task has been removed",
            });
            onClose();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to delete task",
                description: (error as Error).message,
            });
        }
    };

    if (!task) return null;

    const assignee = typeof task.assignee === "object" ? task.assignee : null;
    const isReadOnly = !canEdit && !canEditStatus;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Task Details
                        {!canEdit && !canEditStatus && (
                            <Badge variant="secondary" className="text-xs font-normal">
                                <Lock className="w-3 h-3 mr-1" /> Read Only
                            </Badge>
                        )}
                        {!canEdit && canEditStatus && (
                            <Badge variant="outline" className="text-xs font-normal">
                                Status Only
                            </Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="task-title">Title</Label>
                        <Input
                            id="task-title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Task title"
                            disabled={!canEdit}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="task-description">Description</Label>
                        <Textarea
                            id="task-description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Add a description..."
                            rows={4}
                            disabled={!canEdit}
                        />
                    </div>

                    {/* Status & Priority Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, status: value as TaskStatus })
                                }
                                disabled={!canEdit && !canEditStatus}
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

                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, priority: value as TaskPriority })
                                }
                                disabled={!canEdit}
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

                    {/* Assignee & Due Date Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Assignee</Label>
                            <Select
                                value={formData.assignee || "unassigned"}
                                onValueChange={(value) => setFormData({ ...formData, assignee: value === "unassigned" ? "" : value })}
                                disabled={!canEdit}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Unassigned">
                                        {assignee ? (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-5 h-5">
                                                    <AvatarImage src={assignee.avatar || undefined} />
                                                    <AvatarFallback className="text-xs">
                                                        {assignee.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span>{assignee.name}</span>
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
                                    {projectMembers.map((member: any) => (
                                        <SelectItem key={member.user._id} value={member.user._id}>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-5 h-5">
                                                    <AvatarImage src={member.user.avatar} />
                                                    <AvatarFallback className="text-xs">
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

                        <div className="space-y-2">
                            <Label>Due Date</Label>
                            {canEdit ? (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.dueDate ? format(formData.dueDate, "PPP") : "No due date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={formData.dueDate || undefined}
                                            onSelect={(date) => setFormData({ ...formData, dueDate: date || null })}
                                        />
                                        {formData.dueDate && (
                                            <div className="p-3 border-t">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setFormData({ ...formData, dueDate: null })}
                                                    className="w-full"
                                                >
                                                    Clear date
                                                </Button>
                                            </div>
                                        )}
                                    </PopoverContent>
                                </Popover>
                            ) : (
                                <div className="h-10 px-3 py-2 border rounded-md text-sm text-muted-foreground bg-muted/50 flex items-center">
                                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                    {formData.dueDate ? format(formData.dueDate, "PPP") : "No due date"}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Labels */}
                    <div className="space-y-2">
                        <Label>Labels</Label>
                        {canEdit ? (
                            <LabelPicker
                                labels={formData.labels}
                                onChange={(labels) => setFormData({ ...formData, labels })}
                            />
                        ) : (
                            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-muted/50">
                                {formData.labels.length > 0 ? (
                                    formData.labels.map((label) => (
                                        <div
                                            key={label.name}
                                            className="px-2 py-0.5 rounded-full text-xs text-white"
                                            style={{ backgroundColor: label.color }}
                                        >
                                            {label.name}
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground">No labels</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Subtasks */}
                    <div className="space-y-2">
                        <Label>Subtasks</Label>
                        {canEdit ? (
                            <SubtaskList
                                subtasks={formData.subtasks}
                                onChange={(subtasks) => setFormData({ ...formData, subtasks })}
                            />
                        ) : (
                            // Read-only subtasks view
                            <div className="space-y-2 border rounded-md p-4 bg-muted/50">
                                {formData.subtasks.length > 0 ? (
                                    formData.subtasks.map((st, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className={`w-4 h-4 border rounded flex items-center justify-center ${st.completed ? "bg-primary border-primary" : "border-muted-foreground"}`}>
                                                {st.completed && <div className="w-2 h-2 bg-primary-foreground rounded-sm" />}
                                            </div>
                                            <span className={st.completed ? "line-through text-muted-foreground" : ""}>{st.title}</span>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground">No subtasks</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Metadata */}
                    <div className="pt-4 border-t text-sm text-muted-foreground">
                        <div>Created {task.createdAt ? format(new Date(task.createdAt), "PPP") : "Unknown"}</div>
                        {task.createdBy && typeof task.createdBy === "object" && (
                            <div>by {task.createdBy.name}</div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                    {canDelete ? (
                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    ) : (
                        <div></div> // Spacer
                    )}

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose} disabled={saving}>
                            Close
                        </Button>
                        {(canEdit || canEditStatus) && (
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
