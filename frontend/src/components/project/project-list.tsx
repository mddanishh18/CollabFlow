"use client"

import { useState } from "react"
import { ProjectCard } from "./project-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FolderKanban, Plus, Search, LayoutGrid, List, SortAsc } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Project {
    _id: string
    name: string
    description?: string
    visibility?: string
    members?: any[]
    createdAt: string
}

interface ProjectListProps {
    projects?: Project[]
    workspaceId?: string
    loading?: boolean
    onEdit?: (project: Project) => void
    onDelete?: (projectId: string, projectName: string) => void
    onViewMembers?: (project: Project) => void
    onCreate?: () => void
    showCreateButton?: boolean
}

type SortOption = "newest" | "oldest" | "name" | "members"
type ViewMode = "grid" | "list"

export function ProjectList({
    projects = [],
    workspaceId,
    loading = false,
    onEdit,
    onDelete,
    onViewMembers,
    onCreate,
    showCreateButton = true,
}: ProjectListProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState<SortOption>("newest")
    const [viewMode, setViewMode] = useState<ViewMode>("grid")

    // Filter projects
    const filteredProjects = projects.filter(
        (project) =>
            project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Sort projects
    const sortedProjects = [...filteredProjects].sort((a, b) => {
        switch (sortBy) {
            case "newest":
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            case "oldest":
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            case "name":
                return a.name.localeCompare(b.name)
            case "members":
                return (b.members?.length || 0) - (a.members?.length || 0)
            default:
                return 0
        }
    })

    // Loading state
    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <Skeleton className="h-10 w-full sm:w-64" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-10" />
                    </div>
                </div>
                <div
                    className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
                >
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-48" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Sort */}
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                        <SelectTrigger className="w-[130px]">
                            <SortAsc className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="oldest">Oldest</SelectItem>
                            <SelectItem value="name">Name (A-Z)</SelectItem>
                            <SelectItem value="members">Most Members</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* View Toggle */}
                    <div className="flex border rounded-md">
                        <Button
                            variant={viewMode === "grid" ? "secondary" : "ghost"}
                            size="icon"
                            className="h-9 w-9 rounded-r-none"
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="icon"
                            className="h-9 w-9 rounded-l-none"
                            onClick={() => setViewMode("list")}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Create Button */}
                    {showCreateButton && onCreate && (
                        <Button onClick={onCreate} className="hidden sm:flex">
                            <Plus className="mr-2 h-4 w-4" />
                            New Project
                        </Button>
                    )}
                </div>
            </div>

            {/* Mobile Create Button */}
            {showCreateButton && onCreate && (
                <Button onClick={onCreate} className="w-full sm:hidden">
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                </Button>
            )}

            {/* Results Count */}
            {searchQuery && (
                <p className="text-sm text-muted-foreground">
                    Found {sortedProjects.length} project{sortedProjects.length !== 1 ? "s" : ""}
                    {searchQuery && ` matching "${searchQuery}"`}
                </p>
            )}

            {/* Empty State */}
            {sortedProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed rounded-lg">
                    <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                        {searchQuery ? "No projects found" : "No projects yet"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                        {searchQuery
                            ? "Try a different search term or clear your search"
                            : "Create your first project to start organizing your work"}
                    </p>
                    {!searchQuery && onCreate && (
                        <Button onClick={onCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create First Project
                        </Button>
                    )}
                    {searchQuery && (
                        <Button variant="outline" onClick={() => setSearchQuery("")}>
                            Clear Search
                        </Button>
                    )}
                </div>
            ) : (
                /* Projects Grid/List */
                <div
                    className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 max-w-2xl"}`}
                >
                    {sortedProjects.map((project) => (
                        <ProjectCard
                            key={project._id}
                            project={project}
                            workspaceId={workspaceId}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onViewMembers={onViewMembers}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
