"use client"

import { useEffect, useState } from "react"
import { useWorkspace } from "@/hooks/use-workspace"
import { useProjects } from "@/hooks/use-projects"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, UserPlus, Users, Check } from "lucide-react"

interface Project {
    _id: string
    name: string
}

interface Member {
    user?: any
    role: string
}

interface AddProjectMembersDialogProps {
    open: boolean
    onClose: () => void
    project: Project
    workspaceId: string
    existingMembers?: Member[]
    onSuccess?: () => void
}

type SelectedMembers = Record<string, string>

export function AddProjectMembersDialog({
    open,
    onClose,
    project,
    workspaceId,
    existingMembers = [],
    onSuccess,
}: AddProjectMembersDialogProps) {
    const { toast } = useToast()
    const {
        members: workspaceMembers,
        fetchWorkspaceMembers,
        loading: workspaceLoading,
    } = useWorkspace()
    const { addProjectMember, loading: projectLoading } = useProjects()

    const [selectedMembers, setSelectedMembers] = useState<SelectedMembers>({})
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        if (open && workspaceId) {
            fetchWorkspaceMembers(workspaceId)
            setSelectedMembers({})
        }
    }, [open, workspaceId, fetchWorkspaceMembers])

    // Filter out members already in the project
    const existingMemberIds = existingMembers.map((m) => m.user?._id || m.user)
    const availableMembers =
        workspaceMembers?.filter((m: any) => !existingMemberIds.includes(m.user?._id || m.user)) || []

    const handleToggleMember = (memberId: string) => {
        setSelectedMembers((prev) => {
            if (prev[memberId]) {
                const { [memberId]: _, ...rest } = prev
                return rest
            }
            return { ...prev, [memberId]: "editor" }
        })
    }

    const handleRoleChange = (memberId: string, role: string) => {
        setSelectedMembers((prev) => ({
            ...prev,
            [memberId]: role,
        }))
    }

    const handleAddMembers = async () => {
        const memberIds = Object.keys(selectedMembers)
        if (memberIds.length === 0) {
            toast({
                variant: "destructive",
                title: "No members selected",
                description: "Please select at least one member to add",
            })
            return
        }

        setAdding(true)
        let successCount = 0
        let errorCount = 0

        for (const memberId of memberIds) {
            try {
                await addProjectMember(project._id, memberId, selectedMembers[memberId] as "editor" | "viewer")
                successCount++
            } catch (error) {
                errorCount++
                console.error(`Failed to add member ${memberId}:`, error)
            }
        }

        if (successCount > 0) {
            toast({
                title: `Added ${successCount} member${successCount > 1 ? "s" : ""} 🎉`,
                description: `Successfully added to ${project.name}`,
            })
        }

        if (errorCount > 0) {
            toast({
                variant: "destructive",
                title: `Failed to add ${errorCount} member${errorCount > 1 ? "s" : ""}`,
                description: "Some members could not be added",
            })
        }

        setAdding(false)
        if (successCount > 0 && onSuccess) {
            onSuccess()
        }
        onClose()
    }

    const getInitials = (name?: string): string => {
        if (!name) return "?"
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const selectedCount = Object.keys(selectedMembers).length

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" />
                        Add Members to Project
                    </DialogTitle>
                    <DialogDescription>
                        Select workspace members to add to <strong>{project?.name}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {workspaceLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : availableMembers.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No available members</h3>
                            <p className="text-sm text-muted-foreground">
                                All workspace members are already in this project
                            </p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-2">
                                {availableMembers.map((member: any) => {
                                    const userId = member.user?._id || member.user
                                    const isSelected = !!selectedMembers[userId]

                                    return (
                                        <div
                                            key={userId}
                                            className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer ${isSelected
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50 hover:bg-accent/50"
                                                }`}
                                            onClick={() => handleToggleMember(userId)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => handleToggleMember(userId)}
                                                />
                                                <Avatar className="h-10 w-10">
                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                        {getInitials(member.user?.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm">{member.user?.name || "Unknown"}</p>
                                                    <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <Select
                                                    value={selectedMembers[userId]}
                                                    onValueChange={(role) => handleRoleChange(userId, role)}
                                                >
                                                    <SelectTrigger
                                                        className="w-24 h-8"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="editor">Editor</SelectItem>
                                                        <SelectItem value="viewer">Viewer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}

                                            {!isSelected && (
                                                <Badge variant="outline" className="text-xs">
                                                    {member.role}
                                                </Badge>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={adding}>
                        Cancel
                    </Button>
                    <Button onClick={handleAddMembers} disabled={adding || selectedCount === 0}>
                        {adding ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Add{" "}
                                {selectedCount > 0
                                    ? `${selectedCount} Member${selectedCount > 1 ? "s" : ""}`
                                    : "Members"}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
