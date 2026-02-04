import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Workspace, WorkspaceMember, WorkspaceInvitation, WorkspaceRole } from '@/types';

// ===== Workspace Store State & Actions =====
interface WorkspaceState {
    // State
    workspaces: Workspace[];
    currentWorkspace: Workspace | null;
    members: WorkspaceMember[];
    invitations: WorkspaceInvitation[];
    loading: boolean;
    error: string | null;

    // Setters
    setWorkspaces: (workspaces: Workspace[]) => void;
    setCurrentWorkspace: (workspace: Workspace | null) => void;
    setMembers: (members: WorkspaceMember[]) => void;
    setInvitations: (invitations: WorkspaceInvitation[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // Actions
    clearWorkspace: () => void;
    getUserRole: (userId: string) => WorkspaceRole | null;
    isAdminOrOwner: (userId: string) => boolean;
}

export const useWorkspaceStore = create<WorkspaceState>()(
    persist(
        (set, get) => ({
            // Initial State
            workspaces: [],
            currentWorkspace: null,
            members: [],
            invitations: [],
            loading: false,
            error: null,

            // Setters
            setWorkspaces: (workspaces: Workspace[]) => set({ workspaces }),
            setCurrentWorkspace: (workspace: Workspace | null) => set({ currentWorkspace: workspace }),
            setMembers: (members: WorkspaceMember[]) => set({ members }),
            setInvitations: (invitations: WorkspaceInvitation[]) => set({ invitations }),
            setLoading: (loading: boolean) => set({ loading }),
            setError: (error: string | null) => set({ error }),

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
            getUserRole: (userId: string): WorkspaceRole | null => {
                const workspace = get().currentWorkspace;
                if (!workspace || !userId) return null;

                // Check userRole property first (from API)
                if (workspace.userRole) {
                    return workspace.userRole;
                }

                // Fallback: find in members array
                const member = workspace.members?.find(
                    m => (typeof m.user === 'string' ? m.user : m.user._id) === userId
                );
                return member?.role || null;
            },

            // Check if user is admin or owner
            isAdminOrOwner: (userId: string): boolean => {
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
