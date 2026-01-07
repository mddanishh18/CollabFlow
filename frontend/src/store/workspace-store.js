import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWorkspaceStore = create(
    persist(
        (set, get) => ({
            workspaces: [],
            currentWorkspace: null,
            members: [],
            invitations: [],
            loading: false,
            error: null,

            // Setters
            setWorkspaces: (workspaces) => set({ workspaces }),
            setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
            setMembers: (members) => set({ members }),
            setInvitations: (invitations) => set({ invitations }),
            setLoading: (loading) => set({ loading }),
            setError: (error) => set({ error }),

            // Clear workspace data (on logout)
            clearWorkspace: () => set({
                workspaces: [],
                currentWorkspace: null,
                members: [],
                invitations: [],
                loading: false,
                error: null
            }),

            // Get user role in current workspace
            getUserRole: (userId) => {
                const workspace = get().currentWorkspace;
                if (!workspace || !userId) return null;

                // Check userRole property first (from API)
                if (workspace.userRole) {
                    return workspace.userRole;
                }

                // Fallback: find in members array
                const member = workspace.members?.find(
                    m => (m.user?._id || m.user) === userId
                );
                return member?.role || null;
            },

            // Check if user is admin or owner
            isAdminOrOwner: (userId) => {
                const role = get().getUserRole(userId);
                return role === 'owner' || role === 'admin';
            }
        }),
        {
            name: 'workspace-storage',
            partialize: (state) => ({
                currentWorkspace: state.currentWorkspace,
                workspaces: state.workspaces
            })
        }
    )
);
