"use client"

import { Card } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { Task } from "@/types";
import { Button } from "../ui/button";
import { CalendarDays, CheckCircle2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";

interface TaskCardProps {
    task: Task;
    onClick?: () => void;
    onDelete?: (taskId: string) => void;
    canEdit?: boolean;
}

// Status dot — same color language as the section header dots
const statusDotClasses: Record<string, string> = {
    "todo": "bg-slate-400 dark:bg-slate-500",
    "in-progress": "bg-blue-400",
    "review": "bg-amber-400",
    "done": "bg-emerald-500",
};

// Priority = text weight. No badge needed.
const priorityTitleClasses: Record<string, string> = {
    low: "font-normal text-muted-foreground",
    medium: "font-medium",
    high: "font-semibold",
};

export function TaskCard({ task, onClick, onDelete, canEdit }: TaskCardProps) {
    const shouldReduceMotion = useReducedMotion();
    const completedSubtasks = task.subtasks?.filter((st) => st.completed).length ?? 0;
    const totalSubtasks = task.subtasks?.length ?? 0;
    const assignee = typeof task.assignee === "object" ? task.assignee : null;
    const hasSecondary = assignee !== null || totalSubtasks > 0;

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this task?")) {
            onDelete?.(task._id);
        }
    };

    return (
        <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
            transition={{ duration: 0.12 }}
        >
            <Card
                className="cursor-pointer group transition-shadow duration-200 hover:shadow-sm"
                onClick={onClick}
            >
                <div className="px-4 py-3">
                    {/* Title row: status dot + title (priority weight) + delete */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                            {/* Status dot — consistent with section header */}
                            <span
                                className={cn(
                                    "mt-[5px] w-1.5 h-1.5 rounded-full shrink-0",
                                    statusDotClasses[task.status] ?? "bg-slate-400"
                                )}
                            />
                            <h3
                                className={cn(
                                    "text-sm leading-snug line-clamp-2",
                                    priorityTitleClasses[task.priority] ?? "font-medium"
                                )}
                            >
                                {task.title}
                            </h3>
                        </div>
                        {canEdit && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 shrink-0 -mt-0.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={handleDelete}
                                tabIndex={-1}
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        )}
                    </div>

                    {/* Hover-reveal: assignee + subtask progress */}
                    {hasSecondary && (
                        <div className="mt-2 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150 h-5 pl-3.5">
                            {assignee && (
                                <div className="flex items-center gap-1.5">
                                    <Avatar className="w-4 h-4">
                                        <AvatarImage src={assignee.avatar || undefined} />
                                        <AvatarFallback className="text-[8px]">
                                            {assignee.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                                        {assignee.name}
                                    </span>
                                </div>
                            )}
                            {totalSubtasks > 0 && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {completedSubtasks}/{totalSubtasks}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Due date */}
                    {task.dueDate && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground pl-3.5">
                            <CalendarDays className="w-3 h-3" />
                            {format(new Date(task.dueDate), "MMM d")}
                        </div>
                    )}
                </div>
            </Card>
        </motion.div>
    );
}
