# Phase 3 Frontend: Step-by-Step File Creation Order

> **REVISED VERSION** - Matches existing codebase patterns  
> Create files in THIS order to avoid import errors

**Goal:** Task Management UI + Real-Time WebSocket Sync

---

## Prerequisites

Phase 3 backend must be running on `localhost:5000`.

**Install Dependencies:**
```bash
cd frontend
npm install socket.io-client
npx shadcn@latest add badge select textarea popover calendar
```

---

## STEP 1: Add Task Types
**File:** `src/types/index.ts` (ADD TO EXISTING FILE)

Add these types at the end of the file:

```typescript
// ===== Task Types =====
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface SubTask {
    title: string;
    completed: boolean;
}

export interface Label {
    name: string;
    color: string;
}

export interface Task {
    _id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignee?: User | string;
    project: Project | string;
    workspace: Workspace | string;
    dueDate?: Date;
    subtasks: SubTask[];
    labels: Label[];
    createdBy: User | string;
    createdAt: Date;
    updatedAt: Date;
}

// ===== Task Response Types =====
export interface TasksResponse {
    tasks: Task[];
}

export interface TaskResponse {
    task: Task;
}

// ===== Task Form Data Types =====
export interface CreateTaskData {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    projectId: string;
    assignee?: string;
    dueDate?: Date | null;
    labels?: Label[];
}

export interface UpdateTaskData {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignee?: string;
    dueDate?: Date | null;
    subtasks?: SubTask[];
    labels?: Label[];
}

// ===== Task State Types =====
export interface TaskState {
    tasks: Task[];
    projectTasks: Task[];
    currentTask: Task | null;
}
```

---

## STEP 2: Create Task Store
**File:** `src/store/task-store.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskStatus, TaskPriority } from '@/types';

// ===== Task Store State & Actions =====
interface TaskState {
    // State
    tasks: Task[];
    projectTasks: Task[];
    currentTask: Task | null;

    // Setters
    setTasks: (tasks: Task[]) => void;
    setProjectTasks: (tasks: Task[]) => void;
    setCurrentTask: (task: Task | null) => void;
    
    // Actions
    addTask: (task: Task) => void;
    updateTaskInStore: (taskId: string, updates: Partial<Task>) => void;
    removeTask: (taskId: string) => void;
    clearTasks: () => void;

    // Filter helpers
    filterByStatus: (status: TaskStatus | null) => Task[];
    filterByPriority: (priority: TaskPriority | null) => Task[];
}

export const useTaskStore = create<TaskState>()(
    persist(
        (set, get) => ({
            // Initial State
            tasks: [],
            projectTasks: [],
            currentTask: null,

            // Setters
            setTasks: (tasks: Task[]) => set({ tasks }),
            setProjectTasks: (tasks: Task[]) => set({ projectTasks: tasks }),
            setCurrentTask: (task: Task | null) => set({ currentTask: task }),

            // Add new task
            addTask: (task: Task) => set((state) => ({
                projectTasks: [task, ...state.projectTasks],
                tasks: [task, ...state.tasks]
            })),

            // Update task in both lists
            updateTaskInStore: (taskId: string, updates: Partial<Task>) => set((state) => ({
                tasks: state.tasks.map(t => 
                    t._id === taskId ? { ...t, ...updates } : t
                ),
                projectTasks: state.projectTasks.map(t => 
                    t._id === taskId ? { ...t, ...updates } : t
                ),
                currentTask: state.currentTask?._id === taskId 
                    ? { ...state.currentTask, ...updates } 
                    : state.currentTask
            })),

            // Remove task from both lists
            removeTask: (taskId: string) => set((state) => ({
                tasks: state.tasks.filter(t => t._id !== taskId),
                projectTasks: state.projectTasks.filter(t => t._id !== taskId),
                currentTask: state.currentTask?._id === taskId ? null : state.currentTask
            })),

            // Clear all tasks (on logout/workspace change)
            clearTasks: () => set({
                tasks: [],
                projectTasks: [],
                currentTask: null
            }),

            // Filter by status
            filterByStatus: (status: TaskStatus | null): Task[] => {
                const tasks = get().projectTasks;
                if (!status) return tasks;
                return tasks.filter(t => t.status === status);
            },

            // Filter by priority
            filterByPriority: (priority: TaskPriority | null): Task[] => {
                const tasks = get().projectTasks;
                if (!priority) return tasks;
                return tasks.filter(t => t.priority === priority);
            }
        }),
        {
            name: 'task-storage',
            partialize: (state) => ({
                currentTask: state.currentTask
            })
        }
    )
);
```

---

## STEP 3: Socket.io Client Setup
**File:** `src/lib/socket.ts`

```typescript
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const initializeSocket = (token: string): Socket => {
    // Return existing socket if already connected
    if (socket?.connected) {
        return socket;
    }

    // Create new socket connection
    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
    });

    // Connection events
    socket.on('connect', () => {
        console.log('✅ Socket connected:', socket?.id);
    });

    socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
    });

    return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log('🔌 Socket manually disconnected');
    }
};
```

---

## STEP 4: Socket Connection Hook
**File:** `src/hooks/use-socket.ts`

```typescript
import { useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { initializeSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth-store';

interface UseSocketReturn {
    socket: Socket | null;
    isConnected: boolean;
    emit: (event: string, data: any) => void;
    on: (event: string, callback: (...args: any[]) => void) => (() => void) | undefined;
}

export const useSocket = (): UseSocketReturn => {
    const token = useAuthStore((state) => state.token);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // Initialize socket when authenticated
    useEffect(() => {
        if (isAuthenticated && token) {
            initializeSocket(token);
        }
        
        // Don't disconnect on unmount - socket persists
        return () => {
            // Only disconnect on logout (handled elsewhere)
        };
    }, [isAuthenticated, token]);

    // Emit event helper
    const emit = useCallback((event: string, data: any) => {
        const socket = getSocket();
        if (socket?.connected) {
            socket.emit(event, data);
        } else {
            console.warn('⚠️ Socket not connected. Cannot emit:', event);
        }
    }, []);

    // Event listener helper
    const on = useCallback((event: string, callback: (...args: any[]) => void) => {
        const socket = getSocket();
        if (socket) {
            socket.on(event, callback);
            return () => socket.off(event, callback);
        }
    }, []);

    return {
        socket: getSocket(),
        isConnected: getSocket()?.connected || false,
        emit,
        on
    };
};
```

---

## STEP 5: Task Management Hook
**File:** `src/hooks/use-tasks.ts`

```typescript
import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import { useTaskStore } from '@/store/task-store';
import { useSocket } from '@/hooks/use-socket';
import type {
    Task,
    CreateTaskData,
    UpdateTaskData,
    TaskStatus,
    TaskPriority
} from '@/types';

// ===== Types =====
interface ApiErrorResponse {
    message?: string;
}

interface UseTasksReturn {
    tasks: Task[];
    projectTasks: Task[];
    currentTask: Task | null;
    loading: boolean;
    error: string | null;

    fetchProjectTasks: (projectId: string) => Promise<Task[]>;
    fetchTaskById: (taskId: string) => Promise<Task>;
    createTask: (data: CreateTaskData) => Promise<Task>;
    updateTask: (taskId: string, updates: UpdateTaskData) => Promise<Task>;
    deleteTask: (taskId: string) => Promise<boolean>;
    filterByStatus: (status: TaskStatus | null) => Task[];
    filterByPriority: (priority: TaskPriority | null) => Task[];
    selectTask: (taskId: string | null) => void;
    clearError: () => void;
}

export const useTasks = (projectId?: string): UseTasksReturn => {
    // Get state and setters from Zustand store using individual selectors
    const tasks = useTaskStore((state) => state.tasks);
    const projectTasks = useTaskStore((state) => state.projectTasks);
    const currentTask = useTaskStore((state) => state.currentTask);
    const setProjectTasks = useTaskStore((state) => state.setProjectTasks);
    const setCurrentTask = useTaskStore((state) => state.setCurrentTask);
    const addTask = useTaskStore((state) => state.addTask);
    const updateTaskInStore = useTaskStore((state) => state.updateTaskInStore);
    const removeTask = useTaskStore((state) => state.removeTask);

    // Local loading/error state (not persisted)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Socket for real-time updates
    const { emit, on, isConnected } = useSocket();

    const handleError = useCallback((err: unknown): void => {
        const error = err as Error & { response?: { data: ApiErrorResponse } };
        setError(error?.response?.data?.message || error.message || 'Something went wrong');
    }, []);

    // Fetch all tasks for a project
    const fetchProjectTasks = useCallback(async (projectId: string): Promise<Task[]> => {
        try {
            setLoading(true);
            setError(null);

            if (!projectId) {
                throw new Error('Project ID is required');
            }

            const response = await api.get(`/api/tasks/project/${projectId}`);
            const fetchedTasks = response.data.tasks;
            setProjectTasks(fetchedTasks);

            return fetchedTasks;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setProjectTasks, handleError]);

    // Fetch single task by ID
    const fetchTaskById = useCallback(async (taskId: string): Promise<Task> => {
        try {
            setLoading(true);
            setError(null);

            if (!taskId) {
                throw new Error('Task ID is required');
            }

            const response = await api.get(`/api/tasks/${taskId}`);
            const task = response.data.task;
            setCurrentTask(task);

            return task;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setCurrentTask, handleError]);

    // Create new task
    const createTask = useCallback(async (data: CreateTaskData): Promise<Task> => {
        try {
            setLoading(true);
            setError(null);

            if (!data.title || !data.projectId) {
                throw new Error('Title and Project ID are required');
            }

            const payload = {
                projectId: data.projectId,
                title: data.title.trim(),
                description: data.description?.trim() || '',
                status: data.status || 'todo',
                priority: data.priority || 'medium',
                assignee: data.assignee || null,
                dueDate: data.dueDate || null,
                labels: data.labels || [],
                subtasks: data.subtasks || []
            };

            const response = await api.post('/api/tasks', payload);
            const newTask = response.data.task;
            addTask(newTask);

            // Broadcast via WebSocket (backend handles this automatically)
            
            return newTask;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [addTask, handleError]);

    // Update task
    const updateTask = useCallback(async (taskId: string, updates: UpdateTaskData): Promise<Task> => {
        try {
            setLoading(true);
            setError(null);

            if (!taskId) {
                throw new Error('Task ID is required');
            }

            if (!updates || Object.keys(updates).length === 0) {
                throw new Error('No updates provided');
            }

            const response = await api.patch(`/api/tasks/${taskId}`, updates);
            const updatedTask = response.data.task;
            updateTaskInStore(taskId, updatedTask);

            // Update current task if it's the one being updated
            const current = useTaskStore.getState().currentTask;
            if (current?._id === taskId) {
                setCurrentTask(updatedTask);
            }

            return updatedTask;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [updateTaskInStore, setCurrentTask, handleError]);

    // Delete task
    const deleteTask = useCallback(async (taskId: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            if (!taskId) {
                throw new Error('Task ID is required');
            }

            await api.delete(`/api/tasks/${taskId}`);
            removeTask(taskId);

            return true;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [removeTask, handleError]);

    // Real-time event listeners
    useEffect(() => {
        if (!isConnected || !projectId) return;

        // Join project room
        emit('join:project', projectId);

        // Listen for tasks created by others
        const unsubCreated = on?.('task:created', (data: { task: Task }) => {
            addTask(data.task);
        });

        // Listen for tasks updated by others
        const unsubUpdated = on?.('task:updated', (data: { task: Task }) => {
            updateTaskInStore(data.task._id, data.task);
        });

        // Listen for tasks deleted by others
        const unsubDeleted = on?.('task:deleted', (data: { taskId: string }) => {
            removeTask(data.taskId);
        });

        return () => {
            unsubCreated?.();
            unsubUpdated?.();
            unsubDeleted?.();
            emit('leave:project', projectId);
        };
    }, [isConnected, projectId, emit, on, addTask, updateTaskInStore, removeTask]);

    // Auto-fetch tasks when projectId changes
    useEffect(() => {
        if (projectId) {
            fetchProjectTasks(projectId).catch(console.error);
        }
    }, [projectId, fetchProjectTasks]);

    // Filter functions
    const filterByStatus = useCallback((status: TaskStatus | null): Task[] => {
        const currentTasks = useTaskStore.getState().projectTasks;
        if (!status) return currentTasks;
        return currentTasks.filter(t => t.status === status);
    }, []);

    const filterByPriority = useCallback((priority: TaskPriority | null): Task[] => {
        const currentTasks = useTaskStore.getState().projectTasks;
        if (!priority) return currentTasks;
        return currentTasks.filter(t => t.priority === priority);
    }, []);

    const selectTask = useCallback((taskId: string | null): void => {
        if (!taskId) {
            setCurrentTask(null);
            return;
        }

        const state = useTaskStore.getState();
        const task = state.tasks.find(t => t._id === taskId) ||
            state.projectTasks.find(t => t._id === taskId);
        if (task) {
            setCurrentTask(task);
        }
    }, [setCurrentTask]);

    const clearError = useCallback((): void => {
        setError(null);
    }, []);

    return {
        tasks,
        projectTasks,
        currentTask,
        loading,
        error,
        fetchProjectTasks,
        fetchTaskById,
        createTask,
        updateTask,
        deleteTask,
        filterByStatus,
        filterByPriority,
        selectTask,
        clearError
    };
};
```

---

## STEP 6: Task Card Component
**File:** `src/components/task/task-card.tsx`

```typescript
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Task } from '@/types';
import { CalendarDays, CheckCircle2, Circle, CircleDot } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
    task: Task;
    onClick?: () => void;
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

export function TaskCard({ task, onClick }: TaskCardProps) {
    const StatusIcon = statusIcons[task.status];
    const completedSubtasks = task.subtasks.filter(st => st.completed).length;
    const totalSubtasks = task.subtasks.length;
    
    const assignee = typeof task.assignee === 'object' ? task.assignee : null;

    return (
        <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={onClick}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                        <StatusIcon className="w-4 h-4 mt-1 text-muted-foreground shrink-0" />
                        <h3 className="font-medium line-clamp-2">{task.title}</h3>
                    </div>
                    <Badge variant="secondary" className={priorityColors[task.priority]}>
                        {task.priority}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {task.description}
                    </p>
                )}

                {/* Labels */}
                {task.labels.length > 0 && (
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

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                        {/* Assignee */}
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

                        {/* Subtasks */}
                        {totalSubtasks > 0 && (
                            <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                {completedSubtasks}/{totalSubtasks}
                            </span>
                        )}
                    </div>

                    {/* Due Date */}
                    {task.dueDate && (
                        <span className="flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {format(new Date(task.dueDate), 'MMM d')}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
```

---

## STEP 7: Task List Component
**File:** `src/components/task/task-list.tsx`

```typescript
import type { Task } from '@/types';
import { TaskCard } from './task-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';

interface TaskListProps {
    tasks: Task[];
    loading?: boolean;
    onTaskClick?: (task: Task) => void;
    onCreateClick?: () => void;
}

export function TaskList({
    tasks,
    loading,
    onTaskClick,
    onCreateClick
}: TaskListProps) {
    // Loading state with skeletons
    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                ))}
            </div>
        );
    }

    // Empty state
    if (tasks.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No tasks yet</p>
                {onCreateClick && (
                    <Button onClick={onCreateClick}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Task
                    </Button>
                )}
            </div>
        );
    }

    // Task list
    return (
        <div className="space-y-3">
            {tasks.map((task) => (
                <TaskCard
                    key={task._id}
                    task={task}
                    onClick={() => onTaskClick?.(task)}
                />
            ))}
        </div>
    );
}
```

---

## STEP 8: Create Task Dialog
**File:** `src/components/task/create-task-dialog.tsx`

```typescript
"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTasks } from '@/hooks/use-tasks';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import type { CreateTaskData, TaskStatus, TaskPriority } from '@/types';

interface CreateTaskDialogProps {
    open: boolean;
    onClose: (success?: boolean) => void;
    projectId: string;
}

interface FormData {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
}

type FormErrors = Partial<Record<keyof FormData | 'submit', string>>;

export function CreateTaskDialog({ open, onClose, projectId }: CreateTaskDialogProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { createTask, clearError } = useTasks(projectId);

    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium'
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Task title is required';
        } else if (formData.title.length > 200) {
            newErrors.title = 'Title cannot exceed 200 characters';
        }

        if (formData.description && formData.description.length > 1000) {
            newErrors.description = 'Description cannot exceed 1000 characters';
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
                description: formData.description.trim()
            });

            toast({
                title: 'Task created! 🎉',
                description: `${task.title} has been added.`,
            });

            // Reset form
            setFormData({
                title: '',
                description: '',
                status: 'todo',
                priority: 'medium'
            });
            setErrors({});

            // Close dialog
            onClose(true);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Failed to create task',
                description: (error as Error).message || 'Please try again',
            });
            setErrors({ submit: (error as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({
                title: '',
                description: '',
                status: 'todo',
                priority: 'medium'
            });
            setErrors({});
            clearError();
            onClose(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                        Add a new task to this project.
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
                                className={errors.title ? 'border-destructive' : ''}
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
                                className={`min-h-[80px] resize-none ${errors.description ? 'border-destructive' : ''}`}
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
                                'Create Task'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
```

---

## STEP 9: User Presence Component
**File:** `src/components/realtime/user-presence.tsx`

```typescript
"use client"

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

interface UserPresenceProps {
    projectId: string;
}

export function UserPresence({ projectId }: UserPresenceProps) {
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const { emit, on, isConnected } = useSocket();

    useEffect(() => {
        if (!isConnected || !projectId) return;

        // Join project room
        emit('join:project', projectId);

        // Listen for online users
        const unsubUsers = on?.('room:users', (data: { users: string[] }) => {
            setOnlineUsers(data.users);
        });

        const unsubJoined = on?.('user:joined', (data: { userId: string }) => {
            setOnlineUsers(prev => [...prev, data.userId]);
        });

        const unsubLeft = on?.('user:left', (data: { userId: string }) => {
            setOnlineUsers(prev => prev.filter(id => id !== data.userId));
        });

        return () => {
            unsubUsers?.();
            unsubJoined?.();
            unsubLeft?.();
        };
    }, [isConnected, projectId, emit, on]);

    if (!isConnected || onlineUsers.length === 0) return null;

    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{onlineUsers.length} online</span>
            <div className="flex -space-x-2">
                {onlineUsers.slice(0, 3).map((userId, idx) => (
                    <Avatar key={userId} className="w-6 h-6 border-2 border-background">
                        <AvatarFallback className="text-[10px]">
                            {idx + 1}
                        </AvatarFallback>
                    </Avatar>
                ))}
                {onlineUsers.length > 3 && (
                    <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px]">
                        +{onlineUsers.length - 3}
                    </div>
                )}
            </div>
        </div>
    );
}
```

---

## STEP 10: Tasks Page
**File:** `src/app/(dashboard)/workspace/[workspaceId]/projects/[projectId]/tasks/page.tsx`

```typescript
"use client"

import { useState } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { TaskList } from '@/components/task/task-list';
import { CreateTaskDialog } from '@/components/task/create-task-dialog';
import { UserPresence } from '@/components/realtime/user-presence';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface TasksPageProps {
    params: {
        workspaceId: string;
        projectId: string;
    };
}

export default function TasksPage({ params }: TasksPageProps) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const { projectTasks, loading, createTask } = useTasks(params.projectId);

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tasks</h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Manage and track your project tasks
                    </p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                    <UserPresence projectId={params.projectId} />
                    <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        New Task
                    </Button>
                </div>
            </div>

            {/* Task List */}
            <TaskList
                tasks={projectTasks}
                loading={loading}
                onCreateClick={() => setCreateDialogOpen(true)}
            />

            {/* Create Dialog */}
            <CreateTaskDialog
                open={createDialogOpen}
                onOpenChange={(open) => {
                    if (!open) setCreateDialogOpen(false);
                }}
                onClose={() => setCreateDialogOpen(false)}
                projectId={params.projectId}
            />
        </div>
    );
}
```

---

## ✅ Complete Order Summary:

1. ✅ Add task types to `types/index.ts`
2. ✅ Create task store (`store/task-store.ts`)
3. ✅ Socket.io client (`lib/socket.ts`)
4. ✅ Socket hook (`hooks/use-socket.ts`)
5. ✅ Task management hook (`hooks/use-tasks.ts`)
6. ✅ Task card component (`components/task/task-card.tsx`)
7. ✅ Task list component (`components/task/task-list.tsx`)
8. ✅ Create task dialog (`components/task/create-task-dialog.tsx`)
9. ✅ User presence component (`components/realtime/user-presence.tsx`)
10. ✅ Tasks page (`app/.../tasks/page.tsx`)

**All patterns now match your existing codebase!**
- ✅ Zustand store with persist middleware
- ✅ Proper TypeScript interfaces
- ✅ Hook pattern following use-workspace & use-projects
- ✅ Dialog component matching workspace dialogs
- ✅ Consistent error handling and loading states
