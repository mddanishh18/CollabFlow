import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspace-store";
import type {
    Workspace,
    WorkspaceMember,
    WorkspaceInvitation,
    WorkspaceRole,
    CreateWorkspaceData
} from "@/types";
import { AxiosError } from "axios";

// ===== Types =====
interface ApiErrorResponse {
    message?: string;
}

interface UseWorkspaceReturn {
    workspaces: Workspace[];
    currentWorkspace: Workspace | null;
    members: WorkspaceMember[];
    invitations: WorkspaceInvitation[];
    loading: boolean;
    error: string | null;

    fetchUserWorkspaces: () => Promise<Workspace[]>;
    fetchWorkspaceById: (id: string) => Promise<Workspace>;
    createWorkspace: (workspaceData: CreateWorkspaceData) => Promise<Workspace>;
    updateWorkspace: (workspaceId: string, updates: Partial<Workspace>) => Promise<Workspace>;
    deleteWorkspace: (workspaceId: string, permanent?: boolean) => Promise<boolean>;
    fetchWorkspaceMembers: (workspaceId: string) => Promise<WorkspaceMember[]>;
    inviteMember: (workspaceId: string, email: string, role?: Exclude<WorkspaceRole, 'owner'>) => Promise<WorkspaceInvitation>;
    acceptInvitation: (token: string) => Promise<Workspace>;
    removeMember: (workspaceId: string, memberId: string) => Promise<boolean>;
    updateMemberRole: (workspaceId: string, memberId: string, newRole: Exclude<WorkspaceRole, 'owner'>) => Promise<WorkspaceMember>;
    leaveWorkspace: (workspaceId: string) => Promise<boolean>;
    fetchPendingInvitations: () => Promise<WorkspaceInvitation[]>;
    selectWorkspace: (workspaceId: string | null) => void;
    setCurrentWorkspace: (workspace: Workspace | null) => void;
    clearError: () => void;
}

export const useWorkspace = (): UseWorkspaceReturn => {
    // Get state and stable setters from Zustand store
    const workspaces = useWorkspaceStore((state) => state.workspaces);
    const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
    const members = useWorkspaceStore((state) => state.members);
    const invitations = useWorkspaceStore((state) => state.invitations);
    const setWorkspaces = useWorkspaceStore((state) => state.setWorkspaces);
    const setCurrentWorkspace = useWorkspaceStore((state) => state.setCurrentWorkspace);
    const setMembers = useWorkspaceStore((state) => state.setMembers);
    const setInvitations = useWorkspaceStore((state) => state.setInvitations);

    // Local loading/error state (not persisted)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleError = useCallback((err: unknown): void => {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        setError(axiosError?.response?.data?.message || "Something went wrong");
    }, []);

    const fetchUserWorkspaces = useCallback(async (): Promise<Workspace[]> => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get("/api/workspaces");
            const fetchedWorkspaces = response.data.workspaces;
            setWorkspaces(fetchedWorkspaces);

            // Set first workspace as current if none is set
            const current = useWorkspaceStore.getState().currentWorkspace;
            if (!current && fetchedWorkspaces.length > 0) {
                setCurrentWorkspace(fetchedWorkspaces[0]);
            }

            return fetchedWorkspaces;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setWorkspaces, setCurrentWorkspace, handleError]);

    const fetchWorkspaceById = useCallback(async (id: string): Promise<Workspace> => {
        try {
            setLoading(true);
            setError(null);

            if (!id) {
                throw new Error("Workspace ID is required");
            }

            const response = await api.get(`/api/workspaces/${id}`);

            // Merge userRole into workspace object

            // [OLD VERSION]
            // const workspaceWithRole: Workspace = {
            //     ...response.data.workspace,
            //     userRole: response.data.userRole
            // };

            // [NEW VERSION] - userRole is already inside response.data.workspace
            const workspaceWithRole: Workspace = response.data.workspace;

            setCurrentWorkspace(workspaceWithRole);

            // Update in workspaces array
            const currentWorkspaces = useWorkspaceStore.getState().workspaces;
            setWorkspaces(currentWorkspaces.map(w =>
                w._id === id ? workspaceWithRole : w
            ));

            return workspaceWithRole;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setCurrentWorkspace, setWorkspaces, handleError]);

    const createWorkspace = useCallback(async (workspaceData: CreateWorkspaceData): Promise<Workspace> => {
        try {
            setLoading(true);
            setError(null);

            if (!workspaceData.name) {
                throw new Error("Workspace name is required");
            }

            if (workspaceData.name.length < 2) {
                throw new Error("Workspace name must be at least 2 characters");
            }

            const payload = {
                name: workspaceData.name.trim(),
                description: workspaceData.description || '',
                settings: {
                    isPublic: workspaceData.settings?.isPublic ?? false,
                    allowMemberInvites: workspaceData.settings?.allowMemberInvites ?? false,
                    defaultProjectVisibility: workspaceData.settings?.defaultProjectVisibility ?? 'workspace'
                }
            };

            const response = await api.post('/api/workspaces', payload);

            // Add userRole for the creator (they're the owner)
            const newWorkspace: Workspace = {
                ...response.data.workspace,
                userRole: 'owner'
            };

            const currentWorkspaces = useWorkspaceStore.getState().workspaces;
            setWorkspaces([newWorkspace, ...currentWorkspaces]);
            setCurrentWorkspace(newWorkspace);

            return newWorkspace;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setWorkspaces, setCurrentWorkspace, handleError]);

    const updateWorkspace = useCallback(async (workspaceId: string, updates: Partial<Workspace>): Promise<Workspace> => {
        try {
            setLoading(true);
            setError(null);

            if (!workspaceId) {
                throw new Error("Workspace ID is required");
            }

            if (!updates || Object.keys(updates).length === 0) {
                throw new Error("No updates provided");
            }

            const response = await api.patch(`/api/workspaces/${workspaceId}`, updates);

            const current = useWorkspaceStore.getState().currentWorkspace;
            const updatedWorkspace: Workspace = {
                ...response.data.workspace,
                userRole: current?.userRole // Preserve userRole
            };

            const currentWorkspaces = useWorkspaceStore.getState().workspaces;
            setWorkspaces(currentWorkspaces.map(w =>
                w._id === workspaceId ? updatedWorkspace : w
            ));

            if (current?._id === workspaceId) {
                setCurrentWorkspace(updatedWorkspace);
            }

            return updatedWorkspace;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setWorkspaces, setCurrentWorkspace, handleError]);

    const deleteWorkspace = useCallback(async (workspaceId: string, permanent = false): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            if (!workspaceId) {
                throw new Error("Workspace ID is required");
            }

            await api.delete(`/api/workspaces/${workspaceId}?permanent=${permanent}`);

            const currentWorkspaces = useWorkspaceStore.getState().workspaces;
            setWorkspaces(currentWorkspaces.filter(w => w._id !== workspaceId));

            const current = useWorkspaceStore.getState().currentWorkspace;
            if (current?._id === workspaceId) {
                setCurrentWorkspace(null);
            }

            return true;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setWorkspaces, setCurrentWorkspace, handleError]);

    const fetchWorkspaceMembers = useCallback(async (workspaceId: string): Promise<WorkspaceMember[]> => {
        try {
            setLoading(true);
            setError(null);

            if (!workspaceId) {
                throw new Error("Workspace ID is required");
            }

            const response = await api.get(`/api/workspaces/${workspaceId}/members`);

            setMembers(response.data.members);

            return response.data.members;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setMembers, handleError]);

    const inviteMember = useCallback(async (
        workspaceId: string,
        email: string,
        role: Exclude<WorkspaceRole, 'owner'> = 'member'
    ): Promise<WorkspaceInvitation> => {
        try {
            setLoading(true);
            setError(null);

            if (!workspaceId) {
                throw new Error("Workspace ID is required");
            }

            if (!email) {
                throw new Error("Email is required");
            }

            const payload = {
                email: email.toLowerCase().trim(),
                role: role || 'member'
            };

            const response = await api.post(`/api/workspaces/${workspaceId}/invite`, payload);

            const currentInvitations = useWorkspaceStore.getState().invitations;
            if (currentInvitations) {
                setInvitations([response.data.invitation, ...currentInvitations]);
            }

            return response.data.invitation;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setInvitations, handleError]);

    const acceptInvitation = useCallback(async (token: string): Promise<Workspace> => {
        try {
            setLoading(true);
            setError(null);

            if (!token) {
                throw new Error("Invitation token is required");
            }

            const response = await api.post(`/api/workspaces/invite/accept/${token}`, null);

            const currentWorkspaces = useWorkspaceStore.getState().workspaces;
            setWorkspaces([response.data.workspace, ...currentWorkspaces]);
            setCurrentWorkspace(response.data.workspace);

            return response.data.workspace;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setWorkspaces, setCurrentWorkspace, handleError]);

    const removeMember = useCallback(async (workspaceId: string, memberId: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            if (!workspaceId || !memberId) {
                throw new Error("Workspace ID and Member ID are required");
            }

            await api.delete(`/api/workspaces/${workspaceId}/members/${memberId}`);

            const currentMembers = useWorkspaceStore.getState().members;
            setMembers(currentMembers.filter(m => {
                const mUserId = typeof m.user === 'string' ? m.user : m.user._id;
                return mUserId !== memberId;
            }));

            return true;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setMembers, handleError]);

    const updateMemberRole = useCallback(async (
        workspaceId: string,
        memberId: string,
        newRole: Exclude<WorkspaceRole, 'owner'>
    ): Promise<WorkspaceMember> => {
        try {
            setLoading(true);
            setError(null);

            if (!workspaceId || !memberId || !newRole) {
                throw new Error("Workspace ID, Member ID, and role are required");
            }

            if (!['admin', 'member', 'viewer'].includes(newRole)) {
                throw new Error("Invalid role");
            }

            const response = await api.patch(`/api/workspaces/${workspaceId}/members/${memberId}/role`, { role: newRole });

            const currentMembers = useWorkspaceStore.getState().members;
            setMembers(currentMembers.map(m => {
                const mUserId = typeof m.user === 'string' ? m.user : m.user._id;
                return mUserId === memberId ? { ...m, role: newRole } : m;
            }));

            return response.data.member;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setMembers, handleError]);

    const leaveWorkspace = useCallback(async (workspaceId: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            if (!workspaceId) {
                throw new Error("Workspace ID is required");
            }

            await api.post(`/api/workspaces/${workspaceId}/leave`, null);

            const currentWorkspaces = useWorkspaceStore.getState().workspaces;
            setWorkspaces(currentWorkspaces.filter(w => w._id !== workspaceId));

            const current = useWorkspaceStore.getState().currentWorkspace;
            if (current?._id === workspaceId) {
                setCurrentWorkspace(null);
            }

            return true;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setWorkspaces, setCurrentWorkspace, handleError]);

    const fetchPendingInvitations = useCallback(async (): Promise<WorkspaceInvitation[]> => {
        try {
            setLoading(true);
            setError(null);

            // Get all pending invitations for current user (across all workspaces)
            const response = await api.get(`/api/workspaces/invitations/pending`);

            setInvitations(response.data.invitations);

            return response.data.invitations;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setInvitations, handleError]);

    const selectWorkspace = useCallback((workspaceId: string | null): void => {
        if (!workspaceId) {
            setCurrentWorkspace(null);
            return;
        }

        const currentWorkspaces = useWorkspaceStore.getState().workspaces;
        const workspace = currentWorkspaces.find(w => w._id === workspaceId);
        if (workspace) {
            setCurrentWorkspace(workspace);
        }
    }, [setCurrentWorkspace]);

    const clearError = useCallback((): void => {
        setError(null);
    }, []);

    return {
        workspaces,
        currentWorkspace,
        members,
        invitations,
        loading,
        error,
        fetchUserWorkspaces,
        fetchWorkspaceById,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        fetchWorkspaceMembers,
        inviteMember,
        acceptInvitation,
        removeMember,
        updateMemberRole,
        leaveWorkspace,
        fetchPendingInvitations,
        selectWorkspace,
        setCurrentWorkspace,
        clearError,
    };
};
