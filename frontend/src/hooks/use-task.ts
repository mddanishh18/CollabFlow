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
            const fetchedTasks = response.data.data || response.data;
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
            const task = response.data.data || response.data;
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
            const newTask = response.data.data || response.data;
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
            const updatedTask = response.data.data || response.data;
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnected, projectId]);

    // Auto-fetch tasks when projectId changes
    useEffect(() => {
        if (projectId) {
            fetchProjectTasks(projectId).catch(console.error);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

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