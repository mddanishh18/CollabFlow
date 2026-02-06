import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, ProjectMember, ProjectRole } from '@/types';

// ===== Project Store State & Actions =====
interface ProjectState {
    // State
    projects: Project[];
    workspaceProjects: Project[];
    currentProject: Project | null;
    projectMembers: ProjectMember[];
    loading: boolean;
    error: string | null;

    // Setters
    setProjects: (projects: Project[]) => void;
    setWorkspaceProjects: (workspaceProjects: Project[]) => void;
    setCurrentProject: (project: Project | null) => void;
    setProjectMembers: (members: ProjectMember[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // Actions
    addProject: (project: Project) => void;
    updateProjectInStore: (projectId: string, updates: Partial<Project>) => void;
    removeProject: (projectId: string) => void;
    clearProjects: () => void;
    getUserProjectRole: (userId: string) => ProjectRole | null;
    canUserEdit: (userId: string) => boolean;
}

export const useProjectStore = create<ProjectState>()(
    persist(
        (set, get) => ({
            // Initial State
            projects: [],
            workspaceProjects: [],
            currentProject: null,
            projectMembers: [],
            loading: false,
            error: null,

            // Setters
            setProjects: (projects: Project[]) => set({ projects }),
            setWorkspaceProjects: (workspaceProjects: Project[]) => set({ workspaceProjects }),
            setCurrentProject: (project: Project | null) => set({ currentProject: project }),
            setProjectMembers: (members: ProjectMember[]) => set({ projectMembers: members }),
            setLoading: (loading: boolean) => set({ loading }),
            setError: (error: string | null) => set({ error }),

            // Add a project to workspaceProjects
            addProject: (project: Project) => set((state) => ({
                workspaceProjects: [project, ...state.workspaceProjects],
                projects: [project, ...state.projects]
            })),

            // Update a project in both arrays
            updateProjectInStore: (projectId: string, updates: Partial<Project>) => set((state) => ({
                workspaceProjects: state.workspaceProjects.map(p =>
                    p._id === projectId ? { ...p, ...updates } : p
                ),
                projects: state.projects.map(p =>
                    p._id === projectId ? { ...p, ...updates } : p
                ),
                currentProject: state.currentProject?._id === projectId
                    ? { ...state.currentProject, ...updates }
                    : state.currentProject
            })),

            // Remove a project from both arrays
            removeProject: (projectId: string) => set((state) => ({
                workspaceProjects: state.workspaceProjects.filter(p => p._id !== projectId),
                projects: state.projects.filter(p => p._id !== projectId),
                currentProject: state.currentProject?._id === projectId ? null : state.currentProject
            })),

            // Clear all project data (on logout or workspace switch)
            clearProjects: () => set({
                projects: [],
                workspaceProjects: [],
                currentProject: null,
                projectMembers: [],
                loading: false,
                error: null
            }),

            // Get user's role in current project
            getUserProjectRole: (userId: string): ProjectRole | null => {
                const project = get().currentProject;
                if (!project || !userId) return null;

                // Check if owner
                if ((typeof project.owner === 'string' ? project.owner : project.owner._id) === userId) {
                    return 'owner';
                }

                // Find in members
                const member = project.members?.find(
                    m => (typeof m.user === 'string' ? m.user : m.user._id) === userId
                );
                return member?.role || null;
            },

            // Check if user can edit project
            canUserEdit: (userId: string): boolean => {
                const role = get().getUserProjectRole(userId);
                return role === 'owner' || role === 'editor';
            }
        }),
        {
            name: 'project-storage',
            partialize: (state) => ({
                // Don't persist currentProject to avoid stale data issues
                // It will be fetched fresh on page load
            })
        }
    )
);
