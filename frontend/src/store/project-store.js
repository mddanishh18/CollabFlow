import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useProjectStore = create(
    persist(
        (set, get) => ({
            // State
            projects: [],
            workspaceProjects: [],
            currentProject: null,
            projectMembers: [],
            loading: false,
            error: null,

            // Setters
            setProjects: (projects) => set({ projects }),
            setWorkspaceProjects: (workspaceProjects) => set({ workspaceProjects }),
            setCurrentProject: (project) => set({ currentProject: project }),
            setProjectMembers: (members) => set({ projectMembers: members }),
            setLoading: (loading) => set({ loading }),
            setError: (error) => set({ error }),

            // Add a project to workspaceProjects
            addProject: (project) => set((state) => ({
                workspaceProjects: [project, ...state.workspaceProjects],
                projects: [project, ...state.projects]
            })),

            // Update a project in both arrays
            updateProjectInStore: (projectId, updates) => set((state) => ({
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
            removeProject: (projectId) => set((state) => ({
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
            getUserProjectRole: (userId) => {
                const project = get().currentProject;
                if (!project || !userId) return null;

                // Check if owner
                if ((project.owner?._id || project.owner) === userId) {
                    return 'owner';
                }

                // Find in members
                const member = project.members?.find(
                    m => (m.user?._id || m.user) === userId
                );
                return member?.role || null;
            },

            // Check if user can edit project
            canUserEdit: (userId) => {
                const role = get().getUserProjectRole(userId);
                return role === 'owner' || role === 'editor';
            }
        }),
        {
            name: 'project-storage',
            partialize: (state) => ({
                currentProject: state.currentProject
            })
        }
    )
);
