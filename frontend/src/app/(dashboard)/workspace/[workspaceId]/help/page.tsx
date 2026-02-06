"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    Crown,
    Shield,
    User,
    Eye,
    FolderKanban,
    Info,
    Check,
    X
} from "lucide-react"

export default function HelpPage() {
    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            {/* Header */}
            <div className="mb-8 pl-12 md:pl-0">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Help & Permissions</h1>
                <p className="text-muted-foreground">
                    Learn about roles, permissions, and how to use CollabFlow effectively
                </p>
            </div>

            {/* Quick Info */}
            <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                    Your access level determines what actions you can perform. If you don't see a button or option, you may not have the required permissions.
                </AlertDescription>
            </Alert>

            {/* Workspace Roles Section */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Workspace Roles
                    </CardTitle>
                    <CardDescription>
                        Roles that apply across the entire workspace
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Accordion type="single" collapsible className="w-full">
                        {/* Owner */}
                        <AccordionItem value="owner">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2">
                                    <Crown className="h-4 w-4 text-yellow-500" />
                                    <span className="font-semibold">Owner</span>
                                    <Badge variant="secondary" className="ml-2">Full Control</Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-2 pl-6">
                                <p className="text-sm text-muted-foreground mb-3">
                                    The workspace creator with complete control over everything
                                </p>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                        <span>Manage workspace settings</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                        <span>Invite and remove members</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                        <span>Create, edit, and delete any project</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                        <span>Change member roles</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                        <span>Delete the workspace</span>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Admin */}
                        <AccordionItem value="admin">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-blue-500" />
                                    <span className="font-semibold">Admin</span>
                                    <Badge variant="secondary" className="ml-2">Manager</Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-2 pl-6">
                                <p className="text-sm text-muted-foreground mb-3">
                                    Helps manage the workspace and its members
                                </p>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                        <span>Invite and remove members</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                        <span>Create and manage projects</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                        <span>Manage project settings (for any project)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <X className="h-3.5 w-3.5 text-red-500" />
                                        <span className="text-muted-foreground">Cannot delete workspace</span>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Member */}
                        <AccordionItem value="member">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-green-500" />
                                    <span className="font-semibold">Member</span>
                                    <Badge variant="secondary" className="ml-2">Contributor</Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-2 pl-6">
                                <p className="text-sm text-muted-foreground mb-3">
                                    Regular workspace participant
                                </p>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                        <span>View workspace projects</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                        <span>Work on projects they're added to</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <X className="h-3.5 w-3.5 text-red-500" />
                                        <span className="text-muted-foreground">Cannot create new projects</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <X className="h-3.5 w-3.5 text-red-500" />
                                        <span className="text-muted-foreground">Cannot invite members</span>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Viewer */}
                        <AccordionItem value="viewer">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-gray-500" />
                                    <span className="font-semibold">Viewer</span>
                                    <Badge variant="secondary" className="ml-2">Read-Only</Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-2 pl-6">
                                <p className="text-sm text-muted-foreground mb-3">
                                    Can only view workspace content
                                </p>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                        <span>View workspace projects</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <X className="h-3.5 w-3.5 text-red-500" />
                                        <span className="text-muted-foreground">Cannot create or edit anything</span>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            {/* Project Roles Section */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FolderKanban className="h-5 w-5" />
                        Project Roles
                    </CardTitle>
                    <CardDescription>
                        Roles specific to individual projects
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Accordion type="single" collapsible className="w-full">
                        {/* Project Owner */}
                        <AccordionItem value="project-owner">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2">
                                    <Crown className="h-4 w-4 text-yellow-500" />
                                    <span className="font-semibold">Project Owner</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-2 pl-6">
                                <p className="text-sm text-muted-foreground mb-3">
                                    The person who created the project
                                </p>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                        <span>Full control over project settings</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                        <span>Add and remove project members</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                        <span>Create, edit, and delete tasks</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                        <span>Delete the project</span>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Project Editor */}
                        <AccordionItem value="project-editor">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-blue-500" />
                                    <span className="font-semibold">Editor</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-2 pl-6">
                                <p className="text-sm text-muted-foreground mb-3">
                                    Can actively work on and modify project content
                                </p>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                        <span>Create and edit tasks</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                        <span>Update task status and details</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <X className="h-3.5 w-3.5 text-red-500" />
                                        <span className="text-muted-foreground">Cannot manage project members</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <X className="h-3.5 w-3.5 text-red-500" />
                                        <span className="text-muted-foreground">Cannot access project settings</span>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Project Viewer */}
                        <AccordionItem value="project-viewer">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-gray-500" />
                                    <span className="font-semibold">Viewer</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-2 pl-6">
                                <p className="text-sm text-muted-foreground mb-3">
                                    Can only view project information
                                </p>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                        <span>View project details and tasks</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <X className="h-3.5 w-3.5 text-red-500" />
                                        <span className="text-muted-foreground">Cannot create or modify anything</span>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            {/* Common Questions */}
            <Card>
                <CardHeader>
                    <CardTitle>Common Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="q1">
                            <AccordionTrigger>
                                Why can't I see the "New Project" button?
                            </AccordionTrigger>
                            <AccordionContent className="text-sm text-muted-foreground">
                                Only workspace Owners and Admins can create new projects. If you're a Member or Viewer, you won't see this button. Contact a workspace admin if you need to create a project.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="q2">
                            <AccordionTrigger>
                                Why can't I see project settings?
                            </AccordionTrigger>
                            <AccordionContent className="text-sm text-muted-foreground">
                                Project settings are only visible to project owners and workspace admins. If you're a project editor or viewer, you won't see the settings option.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="q3">
                            <AccordionTrigger>
                                Can I create tasks in any project?
                            </AccordionTrigger>
                            <AccordionContent className="text-sm text-muted-foreground">
                                You can only create tasks in projects where you're the owner or an editor. Project viewers cannot create tasks.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="q4">
                            <AccordionTrigger>
                                What's the difference between workspace and project roles?
                            </AccordionTrigger>
                            <AccordionContent className="text-sm text-muted-foreground">
                                Workspace roles apply across the entire workspace, while project roles are specific to individual projects. You can be a workspace member but a project owner, for example.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    )
}
