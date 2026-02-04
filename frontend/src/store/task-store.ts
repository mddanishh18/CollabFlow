import { create } from "zustand";
import type { Task, TaskStatus, TaskPriority } from "@/types";


interface TaskState {
    //state
    tasks: Task[];
    projectTasks: Task[];
    currentTask: Task | null;

    //setters
    setTasks: (tasks: Task[]) => void;
    setProjectTasks: (tasks: Task[]) => void;
    setCurrentTask: (task: Task | null) => void;

    //actions
    addTask: (task: Task) => void;
    updateTaskInStore: (taskId: string, updates: Partial<Task>) => void;
    removeTask: (taskId: string) => void;
    clearTasks: () => void;

    //filter helpers
    filterByStatus: (status: TaskStatus | null) => Task[];
    filterByPriority: (priority: TaskPriority | null) => Task[];
}


export const useTaskStore = create<TaskState>()((set, get) => ({
    //initial state
    tasks: [],
    projectTasks: [],
    currentTask: null,

    //setters
    setTasks: (tasks: Task[]) => set({ tasks }),
    setProjectTasks: (tasks: Task[]) => set({ projectTasks: tasks }),
    setCurrentTask: (task: Task | null) => set({ currentTask: task }),

    //add new task
    addTask: (task: Task) => set((state) => {
        // Prevent duplicates
        if (state.projectTasks.some(t => t._id === task._id)) {
            return state;
        }
        return {
            projectTasks: [task, ...state.projectTasks],
            tasks: [task, ...state.tasks]
        };
    }),

    //update task
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

    //remove task
    removeTask: (taskId: string) => set((state) => ({
        tasks: state.tasks.filter(t => t._id !== taskId),
        projectTasks: state.projectTasks.filter(t => t._id !== taskId),
        currentTask: state.currentTask?._id === taskId ? null : state.currentTask
    })),

    //clear all tasks
    clearTasks: () => set({
        tasks: [],
        projectTasks: [],
        currentTask: null
    }),

    //filter helpers
    filterByStatus: (status: TaskStatus | null): Task[] => {
        const tasks = get().projectTasks;
        if (!status) return tasks;
        return tasks.filter(t => t.status === status);
    },

    filterByPriority: (priority: TaskPriority | null): Task[] => {
        const tasks = get().projectTasks;
        if (!priority) return tasks;
        return tasks.filter(t => t.priority === priority);
    }
}));
