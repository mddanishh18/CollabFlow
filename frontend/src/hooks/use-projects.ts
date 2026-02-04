import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useProjectStore } from "@/store/project-store";
import type {
    Project,
    ProjectMember,
    ProjectRole,
    ProjectStatus,
    ProjectPriority,
    CreateProjectData
} from "@/types";
import { AxiosError } from "axios";

// ===== Types =====
interface ApiErrorResponse {
    message?: string;
}

interface ProjectResponse {
    project: Project;
    userRole?: ProjectRole;
    permissions?: string[];
}

interface UseProjectsReturn {
    projects: Project[];
    workspaceProjects: Project[];
    currentProject: Project | null;
    members: ProjectMember[];
    loading: boolean;
    error: string | null;

    fetchUserProjects: () => Promise<Project[]>;
    fetchWorkspaceProjects: (workspaceId: string) => Promise<Project[]>;
    fetchProjectById: (projectId: string) => Promise<ProjectResponse>;
    createProject: (projectData: CreateProjectData & { workspace: string }) => Promise<Project>;
    updateProject: (projectId: string, updates: Partial<Project>) => Promise<Project>;
    deleteProject: (projectId: string, permanent?: boolean) => Promise<boolean>;
    fetchProjectMembers: (projectId: string) => Promise<ProjectMember[]>;
    addProjectMember: (projectId: string, userId: string, role?: Exclude<ProjectRole, 'owner'>) => Promise<boolean>;
    removeProjectMember: (projectId: string, memberId: string) => Promise<boolean>;
    updateProjectMemberRole: (projectId: string, memberId: string, newRole: Exclude<ProjectRole, 'owner'>) => Promise<ProjectMember>;
    leaveProject: (projectId: string) => Promise<boolean>;
    updateProjectProgress: (projectId: string, progress: number) => Promise<Project>;
    updateProjectStatus: (projectId: string, newStatus: ProjectStatus) => Promise<Project>;
    filterProjectsByStatus: (status: ProjectStatus | null) => Project[];
    filterProjectsByPriority: (priority: ProjectPriority | null) => Project[];
    searchProjects: (query: string) => Project[];
    selectProject: (projectId: string | null) => void;
    getUserProjectRole: (projectId: string) => ProjectRole | null;
    canUserEditProject: (projectId: string) => boolean;
    clearError: () => void;
}

export const useProjects = (): UseProjectsReturn => {
    // Get state and stable setters from Zustand store using individual selectors
    const projects = useProjectStore((state) => state.projects);
    const workspaceProjects = useProjectStore((state) => state.workspaceProjects);
    const currentProject = useProjectStore((state) => state.currentProject);
    const projectMembers = useProjectStore((state) => state.projectMembers);
    const setProjects = useProjectStore((state) => state.setProjects);
    const setWorkspaceProjects = useProjectStore((state) => state.setWorkspaceProjects);
    const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
    const setProjectMembers = useProjectStore((state) => state.setProjectMembers);
    const addProject = useProjectStore((state) => state.addProject);
    const updateProjectInStore = useProjectStore((state) => state.updateProjectInStore);
    const removeProject = useProjectStore((state) => state.removeProject);

    // Local loading/error state (not persisted)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleError = useCallback((err: unknown): void => {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        setError(axiosError?.response?.data?.message || "Something went wrong");
    }, []);

    const fetchUserProjects = useCallback(async (): Promise<Project[]> => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get("/api/projects");
            setProjects(response.data.projects);

            return response.data.projects;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setProjects, handleError]);

    const fetchWorkspaceProjects = useCallback(async (workspaceId: string): Promise<Project[]> => {
        try {
            setLoading(true);
            setError(null);

            if (!workspaceId) {
                throw new Error("Workspace ID is required");
            }

            const response = await api.get(`/api/projects/workspace/${workspaceId}`);
            setWorkspaceProjects(response.data.projects);

            return response.data.projects;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setWorkspaceProjects, handleError]);

    const fetchProjectById = useCallback(async (projectId: string): Promise<ProjectResponse> => {
        try {
            setLoading(true);
            setError(null);

            if (!projectId) {
                throw new Error("Project ID is required");
            }

            const response = await api.get(`/api/projects/${projectId}`);

            // Merge userRole into project object
            const projectWithRole: Project = {
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
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setCurrentProject, updateProjectInStore, handleError]);

    const createProject = useCallback(async (projectData: CreateProjectData & { workspace: string }): Promise<Project> => {
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
            };

            const response = await api.post(`/api/projects`, payload);

            // Add to store with owner role
            const newProject: Project = {
                ...response.data.project,
                userRole: 'owner'
            };

            addProject(newProject);
            setCurrentProject(newProject);

            return newProject;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [addProject, setCurrentProject, handleError]);

    const updateProject = useCallback(async (projectId: string, updates: Partial<Project>): Promise<Project> => {
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
            const current = useProjectStore.getState().currentProject;
            const updatedProject: Project = {
                ...response.data.project,
                userRole: current?.userRole
            };

            updateProjectInStore(projectId, updatedProject);

            if (current?._id === projectId) {
                setCurrentProject(updatedProject);
            }

            return updatedProject;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [updateProjectInStore, setCurrentProject, handleError]);

    const deleteProject = useCallback(async (projectId: string, permanent = false): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            if (!projectId) {
                throw new Error("Project ID is required");
            }

            await api.delete(`/api/projects/${projectId}?permanent=${permanent}`);

            removeProject(projectId);

            return true;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [removeProject, handleError]);

    const fetchProjectMembers = useCallback(async (projectId: string): Promise<ProjectMember[]> => {
        try {
            setLoading(true);
            setError(null);

            if (!projectId) {
                throw new Error("Project ID is required");
            }

            const response = await api.get(`/api/projects/${projectId}/members`);

            setProjectMembers(response.data.members);

            return response.data.members;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setProjectMembers, handleError]);

    const addProjectMember = useCallback(async (
        projectId: string,
        userId: string,
        role: Exclude<ProjectRole, 'owner'> = 'editor'
    ): Promise<boolean> => {
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

            // Refetch members to get updated list
            const membersResponse = await api.get(`/api/projects/${projectId}/members`);
            setProjectMembers(membersResponse.data.members);

            return true;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setProjectMembers, handleError]);

    const removeProjectMember = useCallback(async (projectId: string, memberId: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            if (!projectId || !memberId) {
                throw new Error("Project ID and Member ID are required");
            }

            await api.delete(`/api/projects/${projectId}/members/${memberId}`);

            const currentMembers = useProjectStore.getState().projectMembers;
            setProjectMembers(currentMembers.filter(m => {
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
    }, [setProjectMembers, handleError]);

    const updateProjectMemberRole = useCallback(async (
        projectId: string,
        memberId: string,
        newRole: Exclude<ProjectRole, 'owner'>
    ): Promise<ProjectMember> => {
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

            const currentMembers = useProjectStore.getState().projectMembers;
            setProjectMembers(currentMembers.map(m => {
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
    }, [setProjectMembers, handleError]);

    const leaveProject = useCallback(async (projectId: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            if (!projectId) {
                throw new Error("Project ID is required");
            }

            await api.post(`/api/projects/${projectId}/leave`, null);

            removeProject(projectId);

            return true;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [removeProject, handleError]);

    const updateProjectProgress = useCallback(async (projectId: string, progress: number): Promise<Project> => {
        if (progress < 0 || progress > 100) {
            throw new Error("Progress must be between 0 and 100");
        }

        try {
            setLoading(true);
            setError(null);

            const response = await api.patch(`/api/projects/${projectId}`, { progress });

            const current = useProjectStore.getState().currentProject;
            const updatedProject: Project = {
                ...response.data.project,
                userRole: current?.userRole
            };

            updateProjectInStore(projectId, updatedProject);

            if (current?._id === projectId) {
                setCurrentProject(updatedProject);
            }

            return updatedProject;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [updateProjectInStore, setCurrentProject, handleError]);

    const updateProjectStatus = useCallback(async (projectId: string, newStatus: ProjectStatus): Promise<Project> => {
        const validStatuses: ProjectStatus[] = ['planning', 'active', 'on-hold', 'completed', 'archived'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error("Invalid status");
        }

        try {
            setLoading(true);
            setError(null);

            const response = await api.patch(`/api/projects/${projectId}`, { status: newStatus });

            const current = useProjectStore.getState().currentProject;
            const updatedProject: Project = {
                ...response.data.project,
                userRole: current?.userRole
            };

            updateProjectInStore(projectId, updatedProject);

            if (current?._id === projectId) {
                setCurrentProject(updatedProject);
            }

            return updatedProject;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [updateProjectInStore, setCurrentProject, handleError]);

    const filterProjectsByStatus = useCallback((status: ProjectStatus | null): Project[] => {
        const currentWorkspaceProjects = useProjectStore.getState().workspaceProjects;
        if (!status) return currentWorkspaceProjects;
        return currentWorkspaceProjects.filter(p => p.status === status);
    }, []);

    const filterProjectsByPriority = useCallback((priority: ProjectPriority | null): Project[] => {
        const currentWorkspaceProjects = useProjectStore.getState().workspaceProjects;
        if (!priority) return currentWorkspaceProjects;
        return currentWorkspaceProjects.filter(p => p.priority === priority);
    }, []);

    const searchProjects = useCallback((query: string): Project[] => {
        const currentWorkspaceProjects = useProjectStore.getState().workspaceProjects;
        if (!query) return currentWorkspaceProjects;
        const normalizedQuery = query.toLowerCase().trim();
        return currentWorkspaceProjects.filter(p =>
            p.name.toLowerCase().includes(normalizedQuery) ||
            p.description?.toLowerCase().includes(normalizedQuery)
        );
    }, []);

    const selectProject = useCallback((projectId: string | null): void => {
        if (!projectId) {
            setCurrentProject(null);
            return;
        }

        const state = useProjectStore.getState();
        const project = state.projects.find(p => p._id === projectId) ||
            state.workspaceProjects.find(p => p._id === projectId);
        if (project) {
            setCurrentProject(project);
        }
    }, [setCurrentProject]);

    const getUserProjectRole = useCallback((projectId: string): ProjectRole | null => {
        const state = useProjectStore.getState();
        const project = state.projects.find(p => p._id === projectId) ||
            state.workspaceProjects.find(p => p._id === projectId);
        if (!project) return null;
        return project.userRole || null;
    }, []);

    const canUserEditProject = useCallback((projectId: string): boolean => {
        const state = useProjectStore.getState();
        const project = state.projects.find(p => p._id === projectId) ||
            state.workspaceProjects.find(p => p._id === projectId);
        if (!project) return false;
        const role = project.userRole;
        return role === 'owner' || role === 'editor';
    }, []);

    const clearError = useCallback((): void => {
        setError(null);
    }, []);

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
