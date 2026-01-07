import { useState } from "react";
import { api } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspace-store";

export const useWorkspace = () => {
    // Get state from Zustand store (shared across all components)
    const {
        workspaces,
        currentWorkspace,
        members,
        invitations,
        setWorkspaces,
        setCurrentWorkspace,
        setMembers,
        setInvitations,
    } = useWorkspaceStore();

    // Local loading/error state (not persisted)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleError = (err) => {
        setError(err?.response?.data?.message || "Something went wrong");
    };

    const fetchUserWorkspaces = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get("/api/workspaces");
            setWorkspaces(response.data.workspaces);

            // Set first workspace as current if none is set
            if (!currentWorkspace && response.data.workspaces.length > 0) {
                setCurrentWorkspace(response.data.workspaces[0]);
            }

            return response.data.workspaces;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };


    const fetchWorkspaceById = async (id) => {
        try {
            setLoading(true);
            setError(null);

            if (!id) {
                throw new Error("Workspace ID is required");
            }

            const response = await api.get(`/api/workspaces/${id}`);

            // Merge userRole into workspace object
            const workspaceWithRole = {
                ...response.data.workspace,
                userRole: response.data.userRole
            };

            setCurrentWorkspace(workspaceWithRole);

            setWorkspaces(workspaces.map(w =>
                w._id === id ? workspaceWithRole : w
            ));

            return workspaceWithRole;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const createWorkspace = async (workspaceData) => {
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
            const newWorkspace = {
                ...response.data.workspace,
                userRole: 'owner'
            };

            setWorkspaces([newWorkspace, ...workspaces]);
            setCurrentWorkspace(newWorkspace);

            return newWorkspace;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateWorkspace = async (workspaceId, updates) => {
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

            const updatedWorkspace = {
                ...response.data.workspace,
                userRole: currentWorkspace?.userRole // Preserve userRole
            };

            setWorkspaces(workspaces.map(w =>
                w._id === workspaceId ? updatedWorkspace : w
            ));

            if (currentWorkspace?._id === workspaceId) {
                setCurrentWorkspace(updatedWorkspace);
            }

            return updatedWorkspace;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const deleteWorkspace = async (workspaceId, permanent = false) => {
        try {
            setLoading(true);
            setError(null);

            if (!workspaceId) {
                throw new Error("Workspace ID is required");
            }

            await api.delete(`/api/workspaces/${workspaceId}?permanent=${permanent}`);

            setWorkspaces(workspaces.filter(w => w._id !== workspaceId));

            if (currentWorkspace?._id === workspaceId) {
                setCurrentWorkspace(null);
            }

            return true;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkspaceMembers = async (workspaceId) => {
        try {
            setLoading(true);
            setError(null);

            if (!workspaceId) {
                throw new Error("Workspace ID is required");
            }

            const response = await api.get(`/api/workspaces/${workspaceId}/members`);

            setMembers(response.data.members);

            return response.data.members;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const inviteMember = async (workspaceId, email, role = 'member') => {
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

            if (invitations) {
                setInvitations([response.data.invitation, ...invitations]);
            }

            return response.data.invitation;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const acceptInvitation = async (token) => {
        try {
            setLoading(true);
            setError(null);

            if (!token) {
                throw new Error("Invitation token is required");
            }

            const response = await api.post(`/api/workspaces/invite/accept/${token}`);

            setWorkspaces([response.data.workspace, ...workspaces]);
            setCurrentWorkspace(response.data.workspace);

            return response.data.workspace;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const removeMember = async (workspaceId, memberId) => {
        try {
            setLoading(true);
            setError(null);

            if (!workspaceId || !memberId) {
                throw new Error("Workspace ID and Member ID are required");
            }

            await api.delete(`/api/workspaces/${workspaceId}/members/${memberId}`);

            setMembers(members.filter(m => m.user._id !== memberId));

            return true;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateMemberRole = async (workspaceId, memberId, newRole) => {
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

            setMembers(members.map(m =>
                m.user._id === memberId ? { ...m, role: newRole } : m
            ));

            return response.data.member;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const leaveWorkspace = async (workspaceId) => {
        try {
            setLoading(true);
            setError(null);

            if (!workspaceId) {
                throw new Error("Workspace ID is required");
            }

            await api.post(`/api/workspaces/${workspaceId}/leave`);

            setWorkspaces(workspaces.filter(w => w._id !== workspaceId));

            if (currentWorkspace?._id === workspaceId) {
                setCurrentWorkspace(null);
            }

            return true;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingInvitations = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get all pending invitations for current user (across all workspaces)
            const response = await api.get(`/api/workspaces/invitations/pending`);

            setInvitations(response.data.invitations);

            return response.data.invitations;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const selectWorkspace = (workspaceId) => {
        if (!workspaceId) {
            setCurrentWorkspace(null);
            return;
        }

        const workspace = workspaces.find(w => w._id === workspaceId);
        if (workspace) {
            setCurrentWorkspace(workspace);
        }
    };

    const clearError = () => {
        setError(null);
    };

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
