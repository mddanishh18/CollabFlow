import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { Task } from "@/types";
import { Button } from "../ui/button";
import { CheckCircle2, Circle, CircleDot, CalendarDays, Check, Trash2 } from "lucide-react";
import { format } from "date-fns";


interface TaskCardProps {
    task: Task;
    onClick?: () => void;
    onDelete?: (taskId: string) => void;
    canEdit?: boolean;
}

const statusIcons = {
    'todo': Circle,
    'in-progress': CircleDot,
    'review': CircleDot,
    'done': CheckCircle2
};

const priorityColors = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};


export function TaskCard({ task, onClick, onDelete, canEdit }: TaskCardProps) {
    const StatusIcon = statusIcons[task.status];
    const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
    const totalSubtasks = task.subtasks?.length || 0;

    const assignee = typeof task.assignee === 'object' ? task.assignee : null;

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this task?")) {
            onDelete?.(task._id);
        }
    };

    return (
        <Card
            className="cursor-pointer hover:shadow-md transition-all duration-300 hover:border-primary/50 hover:bg-accent/50 group"
            onClick={onClick}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                        <StatusIcon className="w-4 h-4 mt-1 text-muted-foreground shrink-0" />
                        <h3 className="font-medium line-clamp-2">{task.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                        {canEdit && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={handleDelete}
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        )}
                        <Badge variant="secondary" className={priorityColors[task.priority]}>
                            {task.priority || "medium"}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {task.description}
                    </p>
                )}

                {/* labels */}
                {task.labels && task.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {task.labels.map((label, idx) => (
                            <Badge
                                key={idx}
                                variant="outline"
                                style={{ borderColor: label.color, color: label.color }}
                                className="text-xs"
                            >
                                {label.name}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                        {/* assignee */}
                        {assignee && (
                            <div className="flex items-center gap-1">
                                <Avatar className="w-5 h-5">
                                    <AvatarImage src={assignee.avatar || undefined} />
                                    <AvatarFallback className="text-[10px]">
                                        {assignee.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        )}

                        {/* subtasks */}
                        {totalSubtasks > 0 && (
                            <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                {completedSubtasks}/{totalSubtasks}
                            </span>
                        )}
                    </div>

                    {/* due date */}
                    {task.dueDate && (
                        <span className="flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {format(new Date(task.dueDate), 'MMM d')}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

