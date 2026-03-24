"use client"

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { Task } from "@/types";
import { TaskCard } from "./task-card";
import { Skeleton } from "../ui/skeleton";
import { FolderKanban, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_ORDER = ["todo", "in-progress", "review", "done"] as const;
type StatusKey = (typeof STATUS_ORDER)[number];

const STATUS_CONFIG: Record<StatusKey, { label: string; dotClass: string }> = {
    "todo": { label: "To Do", dotClass: "bg-slate-300 dark:bg-slate-600" },
    "in-progress": { label: "In Progress", dotClass: "bg-blue-400" },
    "review": { label: "Review", dotClass: "bg-amber-400" },
    "done": { label: "Done", dotClass: "bg-emerald-500" },
};

interface StatusSectionProps {
    status: StatusKey;
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
    onDeleteTask?: (taskId: string) => void;
    canEdit?: boolean;
}

function StatusSection({ status, tasks, onTaskClick, onDeleteTask, canEdit }: StatusSectionProps) {
    const [isOpen, setIsOpen] = useState(true);
    const shouldReduceMotion = useReducedMotion();
    const config = STATUS_CONFIG[status];

    return (
        <motion.div layout="position" className="py-1">
            {/* Section header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 w-full py-2 text-left hover:text-foreground text-muted-foreground transition-colors"
                aria-expanded={isOpen}
            >
                <motion.span
                    animate={shouldReduceMotion ? {} : { rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.18 }}
                    className="inline-flex"
                >
                    <ChevronRight className="w-3.5 h-3.5" />
                </motion.span>

                <span className={cn("w-2 h-2 rounded-full shrink-0", config.dotClass)} />

                <span className="text-sm font-medium text-foreground">
                    {config.label}
                </span>

                <span className="text-xs text-muted-foreground tabular-nums">
                    {tasks.length}
                </span>
            </button>

            {/* Tasks — fade in/out, layout handles the reflow */}
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        key="tasks"
                        initial={shouldReduceMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        layout
                        className="space-y-2 pl-5 pb-2"
                    >
                        {tasks.map((task) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onClick={() => onTaskClick?.(task)}
                                onDelete={onDeleteTask}
                                canEdit={canEdit}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

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
                    <Skeleton key={i} className="h-16 w-full" />
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

    // Group by status, preserving the canonical order; skip empty groups
    const groups = STATUS_ORDER
        .map((status) => ({ status, tasks: tasks.filter((t) => t.status === status) }))
        .filter((g) => g.tasks.length > 0);

    return (
        <motion.div layout className="divide-y divide-border/40">
            {groups.map(({ status, tasks: groupTasks }) => (
                <StatusSection
                    key={status}
                    status={status}
                    tasks={groupTasks}
                    onTaskClick={onTaskClick}
                    onDeleteTask={onDeleteTask}
                    canEdit={canEdit}
                />
            ))}
        </motion.div>
    );
}
