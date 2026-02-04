"use client"

import { useState } from "react"
import { useProjects } from "@/hooks/use-projects"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, MoreVertical, Trash2, UserCog, Crown, Loader2 } from "lucide-react"

interface Project {
    _id: string
    name: string
    owner?: any
    members?: Member[]
}

interface Member {
    user?: any
    role: string
    isOwner?: boolean
}

interface ProjectMembersDialogProps {
    open: boolean
    onClose: () => void
    project: Project
    workspaceId: string
    onMemberRemoved?: () => void
    canManageMembers?: boolean // Whether current user can manage members
}

export function ProjectMembersDialog({
    open,
    onClose,
    project,
    workspaceId,
    onMemberRemoved,
    canManageMembers = false,
}: ProjectMembersDialogProps) {
    const { toast } = useToast()
    const { removeProjectMember, updateProjectMemberRole, loading } = useProjects()

    const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)
    const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false)
    const [selectedMember, setSelectedMember] = useState<Member | null>(null)

    const getInitials = (name?: string): string => {
        if (!name) return "?"
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const handleRemoveMember = async () => {
        if (!selectedMember) return

        setRemovingMemberId(selectedMember.user?._id || selectedMember.user)
        try {
            await removeProjectMember(project._id, selectedMember.user?._id || selectedMember.user)
            toast({
                title: "Member removed",
                description: `${selectedMember.user?.name || "Member"} has been removed from the project`,
            })
            if (onMemberRemoved) {
                onMemberRemoved()
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to remove member",
                description: (error as Error).message || "Please try again",
            })
        } finally {
            setRemovingMemberId(null)
            setConfirmRemoveOpen(false)
            setSelectedMember(null)
        }
    }

    const handleRoleChange = async (member: Member, newRole: "editor" | "viewer") => {
        try {
            await updateProjectMemberRole(project._id, member.user?._id || member.user, newRole)
            toast({
                title: "Role updated",
                description: `${member.user?.name || "Member"} is now ${newRole}`,
            })
            if (onMemberRemoved) {
                onMemberRemoved() // Refresh project data
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to update role",
                description: (error as Error).message || "Please try again",
            })
        }
    }

    const getRoleBadgeVariant = (role: string): "default" | "secondary" | "outline" => {
        switch (role) {
            case "owner":
                return "default"
            case "editor":
                return "secondary"
            default:
                return "outline"
        }
    }

    const allMembers: Member[] = [
        // Owner first
        {
            user: project?.owner,
            role: "owner",
            isOwner: true,
        },
        // Then other members
        ...(project?.members?.filter(
            (m) => (m.user?._id || m.user) !== (project?.owner?._id || project?.owner)
        ) || []),
    ]

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Project Members
                        </DialogTitle>
                        <DialogDescription>
                            Manage members of <strong>{project?.name}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="max-h-[400px] pr-4">
                        <div className="space-y-2 py-4">
                            {allMembers.map((member, index) => {
                                const memberId = member.user?._id || member.user
                                const isRemoving = removingMemberId === memberId

                                return (
                                    <div
                                        key={memberId || index}
                                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback
                                                    className={`text-sm ${member.isOwner
                                                        ? "bg-primary/10 text-primary"
                                                        : "bg-muted text-muted-foreground"
                                                        }`}
                                                >
                                                    {getInitials(member.user?.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-sm">{member.user?.name || "Unknown"}</p>
                                                    {member.isOwner && <Crown className="h-3.5 w-3.5 text-yellow-500" />}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Badge variant={getRoleBadgeVariant(member.role)}>{member.role}</Badge>

                                            {!member.isOwner && canManageMembers && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            disabled={isRemoving}
                                                        >
                                                            {isRemoving ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <MoreVertical className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => handleRoleChange(member, "editor" as const)}
                                                            disabled={member.role === "editor"}
                                                        >
                                                            <UserCog className="mr-2 h-4 w-4" />
                                                            Make Editor
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleRoleChange(member, "viewer" as const)}
                                                            disabled={member.role === "viewer"}
                                                        >
                                                            <UserCog className="mr-2 h-4 w-4" />
                                                            Make Viewer
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => {
                                                                setSelectedMember(member)
                                                                setConfirmRemoveOpen(true)
                                                            }}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Remove
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {/* Confirm Remove Dialog */}
            <AlertDialog open={confirmRemoveOpen} onOpenChange={setConfirmRemoveOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Member?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove <strong>{selectedMember?.user?.name}</strong> from
                            this project? They will lose access to all project tasks and data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemoveMember}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
