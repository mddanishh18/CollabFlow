"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    FolderKanban,
    MoreVertical,
    Edit,
    Trash2,
    Users,
    Lock,
    Globe,
    Calendar,
    ExternalLink
} from "lucide-react";
import Link from "next/link";

/**
 * Project card component for displaying project info
 * @param {Object} project - Project data
 * @param {string} workspaceId - Parent workspace ID
 * @param {function} onEdit - Edit callback
 * @param {function} onDelete - Delete callback
 * @param {function} onViewMembers - View members callback
 */
export function ProjectCard({
    project,
    workspaceId,
    onEdit,
    onDelete,
    onViewMembers,
    showActions = true
}) {
    const getVisibilityIcon = (visibility) => {
        switch (visibility) {
            case "private": return <Lock className="h-3 w-3" />;
            case "public": return <Globe className="h-3 w-3" />;
            default: return <Users className="h-3 w-3" />;
        }
    };

    const getVisibilityColor = (visibility) => {
        switch (visibility) {
            case "private": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
            case "public": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            default: return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
        }
    };

    return (
        <Card className="hover:border-primary/50 hover:shadow-lg transition-all duration-300 group h-full">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                            <FolderKanban className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-base font-semibold truncate group-hover:text-primary transition-colors">
                                {project.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground truncate">
                                {project.members?.length || 0} members
                            </p>
                        </div>
                    </div>

                    {showActions && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {onEdit && (
                                    <DropdownMenuItem onClick={() => onEdit(project)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                )}
                                {onViewMembers && (
                                    <DropdownMenuItem onClick={() => onViewMembers(project)}>
                                        <Users className="mr-2 h-4 w-4" />
                                        Manage Members
                                    </DropdownMenuItem>
                                )}
                                {onDelete && (
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => onDelete(project._id, project.name)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>

            <CardContent className="pt-2">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px]">
                    {project.description || "No description provided"}
                </p>

                <div className="flex items-center justify-between gap-2">
                    <Badge
                        variant="secondary"
                        className={`text-xs flex items-center gap-1 ${getVisibilityColor(project.visibility)}`}
                    >
                        {getVisibilityIcon(project.visibility)}
                        {project.visibility || "workspace"}
                    </Badge>

                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(project.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: project.createdAt?.includes(new Date().getFullYear()) ? undefined : "numeric"
                        })}
                    </span>
                </div>

                {/* Project Link */}
                {workspaceId && (
                    <Link
                        href={`/workspace/${workspaceId}/projects/${project._id}`}
                        className="mt-4 block"
                    >
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full group/btn hover:bg-primary hover:text-primary-foreground transition-all"
                        >
                            <ExternalLink className="mr-2 h-3 w-3 group-hover/btn:scale-110 transition-transform" />
                            Open Project
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}
