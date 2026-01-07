import { useState } from "react";
import { api } from "@/lib/api";
import { useProjectStore } from "@/store/project-store";

export const useProjects = () => {
    // Get state from Zustand store (shared across all components)
    const {
        projects,
        workspaceProjects,
        currentProject,
        projectMembers,
        setProjects,
        setWorkspaceProjects,
        setCurrentProject,
        setProjectMembers,
        addProject,
        updateProjectInStore,
        removeProject,
    } = useProjectStore();

    // Local loading/error state (not persisted)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleError = (err) => {
        setError(err?.response?.data?.message || "Something went wrong");
    };

    const fetchUserProjects = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get("/api/projects");
            setProjects(response.data.projects);

            return response.data.projects;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkspaceProjects = async (workspaceId) => {
        try {
            setLoading(true);
            setError(null);

            if (!workspaceId) {
                throw new Error("Workspace ID is required");
            }

            const response = await api.get(`/api/projects/workspace/${workspaceId}`);
            setWorkspaceProjects(response.data.projects);

            return response.data.projects;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectById = async (projectId) => {
        try {
            setLoading(true);
            setError(null);

            if (!projectId) {
                throw new Error("Project ID is required");
            }

            const response = await api.get(`/api/projects/${projectId}`);

            // Merge userRole into project object
            const projectWithRole = {
                ...response.data.project,
                userRole: response.data.userRole
            };

            setCurrentProject(projectWithRole);

            // Update in both arrays
            updateProjectInStore(projectId, projectWithRole);

            return {
                project: projectWithRole,
                userRole: response.data.userRole,
                permissions: response.data.permissions
            };
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const createProject = async (projectData) => {
        try {
            setLoading(true);
            setError(null);

            if (!projectData.name) {
                throw new Error("Project name is required");
            }

            if (projectData.name.length < 2) {
                throw new Error("Project name must be at least 2 characters");
            }

            if (!projectData.workspace) {
                throw new Error("Workspace ID is required");
            }

            const payload = {
                name: projectData.name.trim(),
                description: projectData.description || '',
                workspace: projectData.workspace,
                status: projectData.status || 'planning',
                priority: projectData.priority || 'medium',
                startDate: projectData.startDate || null,
                dueDate: projectData.dueDate || null,
                tags: projectData.tags || [],
                color: projectData.color || '#3B82F6',
                visibility: projectData.visibility || 'workspace',
                settings: {
                    allowComments: projectData.settings?.allowComments ?? true,
                    notifyOnTaskUpdate: projectData.settings?.notifyOnTaskUpdate ?? true,
                    enableRealTimeEditing: projectData.settings?.enableRealTimeEditing ?? true
                }
            };

            const response = await api.post(`/api/projects`, payload);

            // Add to store with owner role
            const newProject = {
                ...response.data.project,
                userRole: 'owner'
            };

            addProject(newProject);
            setCurrentProject(newProject);

            return newProject;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateProject = async (projectId, updates) => {
        try {
            setLoading(true);
            setError(null);

            if (!projectId) {
                throw new Error("Project ID is required");
            }

            if (!updates || Object.keys(updates).length === 0) {
                throw new Error("No updates provided");
            }

            const response = await api.patch(`/api/projects/${projectId}`, updates);

            // Preserve userRole
            const updatedProject = {
                ...response.data.project,
                userRole: currentProject?.userRole
            };

            updateProjectInStore(projectId, updatedProject);

            if (currentProject?._id === projectId) {
                setCurrentProject(updatedProject);
            }

            return updatedProject;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const deleteProject = async (projectId, permanent = false) => {
        try {
            setLoading(true);
            setError(null);

            if (!projectId) {
                throw new Error("Project ID is required");
            }

            await api.delete(`/api/projects/${projectId}?permanent=${permanent}`);

            removeProject(projectId);

            return true;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectMembers = async (projectId) => {
        try {
            setLoading(true);
            setError(null);

            if (!projectId) {
                throw new Error("Project ID is required");
            }

            const response = await api.get(`/api/projects/${projectId}/members`);

            setProjectMembers(response.data.members);

            return response.data.members;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const addProjectMember = async (projectId, userId, role = 'editor') => {
        try {
            setLoading(true);
            setError(null);

            if (!projectId || !userId) {
                throw new Error("Project ID and User ID are required");
            }

            if (!['editor', 'viewer'].includes(role)) {
                throw new Error("Invalid role");
            }

            const payload = { userId, role };

            await api.post(`/api/projects/${projectId}/members`, payload);

            await fetchProjectMembers(projectId);

            return true;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const removeProjectMember = async (projectId, memberId) => {
        try {
            setLoading(true);
            setError(null);

            if (!projectId || !memberId) {
                throw new Error("Project ID and Member ID are required");
            }

            await api.delete(`/api/projects/${projectId}/members/${memberId}`);

            setProjectMembers(projectMembers.filter(m => (m.user?._id || m.user) !== memberId));

            return true;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateProjectMemberRole = async (projectId, memberId, newRole) => {
        try {
            setLoading(true);
            setError(null);

            if (!projectId || !memberId || !newRole) {
                throw new Error("Project ID, Member ID, and role are required");
            }

            if (!['editor', 'viewer'].includes(newRole)) {
                throw new Error("Invalid role");
            }

            const response = await api.patch(`/api/projects/${projectId}/members/${memberId}/role`, { role: newRole });

            setProjectMembers(projectMembers.map(m =>
                (m.user?._id || m.user) === memberId ? { ...m, role: newRole } : m
            ));

            return response.data.member;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const leaveProject = async (projectId) => {
        try {
            setLoading(true);
            setError(null);

            if (!projectId) {
                throw new Error("Project ID is required");
            }

            await api.post(`/api/projects/${projectId}/leave`);

            removeProject(projectId);

            return true;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateProjectProgress = async (projectId, progress) => {
        if (progress < 0 || progress > 100) {
            throw new Error("Progress must be between 0 and 100");
        }
        return await updateProject(projectId, { progress });
    };

    const updateProjectStatus = async (projectId, newStatus) => {
        const validStatuses = ['planning', 'active', 'on-hold', 'completed', 'archived'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error("Invalid status");
        }
        return await updateProject(projectId, { status: newStatus });
    };

    const filterProjectsByStatus = (status) => {
        if (!status) return workspaceProjects;
        return workspaceProjects.filter(p => p.status === status);
    };

    const filterProjectsByPriority = (priority) => {
        if (!priority) return workspaceProjects;
        return workspaceProjects.filter(p => p.priority === priority);
    };

    const searchProjects = (query) => {
        if (!query) return workspaceProjects;
        const normalizedQuery = query.toLowerCase().trim();
        return workspaceProjects.filter(p =>
            p.name.toLowerCase().includes(normalizedQuery) ||
            p.description?.toLowerCase().includes(normalizedQuery)
        );
    };

    const selectProject = (projectId) => {
        if (!projectId) {
            setCurrentProject(null);
            return;
        }

        const project = projects.find(p => p._id === projectId) ||
            workspaceProjects.find(p => p._id === projectId);
        if (project) {
            setCurrentProject(project);
        }
    };

    const getUserProjectRole = (projectId) => {
        const project = projects.find(p => p._id === projectId) ||
            workspaceProjects.find(p => p._id === projectId);
        if (!project) return null;
        return project.userRole || null;
    };

    const canUserEditProject = (projectId) => {
        const role = getUserProjectRole(projectId);
        if (!role) return false;
        return role === 'owner' || role === 'editor';
    };

    const clearError = () => {
        setError(null);
    };

    return {
        projects,
        workspaceProjects,
        currentProject,
        members: projectMembers,
        loading,
        error,
        fetchUserProjects,
        fetchWorkspaceProjects,
        fetchProjectById,
        createProject,
        updateProject,
        deleteProject,
        fetchProjectMembers,
        addProjectMember,
        removeProjectMember,
        updateProjectMemberRole,
        leaveProject,
        updateProjectProgress,
        updateProjectStatus,
        filterProjectsByStatus,
        filterProjectsByPriority,
        searchProjects,
        selectProject,
        getUserProjectRole,
        canUserEditProject,
        clearError,
    };
};
