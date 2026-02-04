"use client"

import type { Task } from "@/types";
import { TaskCard } from "./task-card";
import { Skeleton } from "../ui/skeleton";
import { FolderKanban } from "lucide-react";

interface TaskListProps {
    tasks: Task[];
    loading?: boolean;
    onTaskClick?: (task: Task) => void;
    onDeleteTask?: (taskId: string) => void;
    canEdit?: boolean;
}

export function TaskList({ tasks, loading, onTaskClick, onDeleteTask, canEdit }: TaskListProps) {
    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                ))}
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
                <p className="text-sm text-muted-foreground">
                    Create your first task to get started
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {tasks.map((task) => (
                <TaskCard
                    key={task._id}
                    task={task}
                    onClick={() => onTaskClick?.(task)}
                    onDelete={onDeleteTask}
                    canEdit={canEdit}
                />
            ))}
        </div>
    );
}
