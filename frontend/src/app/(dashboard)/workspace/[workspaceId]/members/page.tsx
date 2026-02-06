"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useWorkspace } from "@/hooks/use-workspace"
import { useAuthStore } from "@/store/auth-store"
import { useToast } from "@/hooks/use-toast"
import { type WorkspaceRole } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Users,
    Plus,
    AlertCircle,
    RefreshCw,
    Mail,
    MoreVertical,
    UserMinus,
    Shield,
    Loader2,
    Search,
} from "lucide-react"

interface InviteData {
    email: string
    role: string
}

export default function MembersPage() {
    const params = useParams()
    const workspaceId = params?.workspaceId as string
    const { toast } = useToast()

    const {
        currentWorkspace,
        fetchWorkspaceById,
        inviteMember,
        removeMember,
        updateMemberRole,
        loading,
        error,
    } = useWorkspace()

    const { user } = useAuthStore()

    // Get user's role
    const currentUserRole =
        currentWorkspace?.userRole ||
        currentWorkspace?.members?.find((m: any) =>
            (typeof m.user === 'string' ? m.user : m.user?._id) === user?._id
        )?.role

    const canManage = currentUserRole === 'owner' || currentUserRole === 'admin'

    const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
    const [inviteData, setInviteData] = useState<InviteData>({ email: "", role: "member" })
    const [inviting, setInviting] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        if (workspaceId) {
            fetchWorkspaceById(workspaceId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workspaceId])

    const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!inviteData.email.trim()) {
            toast({
                variant: "destructive",
                title: "Email required",
                description: "Please enter an email address",
            })
            return
        }

        setInviting(true)
        try {
            await inviteMember(workspaceId, inviteData.email, inviteData.role as Exclude<WorkspaceRole, 'owner'>)

            toast({
                title: "Invitation sent! 📧",
                description: `Invitation sent to ${inviteData.email}`,
            })

            setInviteDialogOpen(false)
            setInviteData({ email: "", role: "member" })
            fetchWorkspaceById(workspaceId)
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Failed to send invitation",
                description: (err as Error).message || "Please try again",
            })
        } finally {
            setInviting(false)
        }
    }

    const handleRemoveMember = async (userId: string, userName: string) => {
        try {
            await removeMember(workspaceId, userId)

            toast({
                title: "Member removed",
                description: `${userName} has been removed from the workspace`,
            })

            fetchWorkspaceById(workspaceId)
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Failed to remove member",
                description: (err as Error).message || "Please try again",
            })
        }
    }

    const handleUpdateRole = async (userId: string, newRole: Exclude<WorkspaceRole, 'owner'>, userName: string) => {
        try {
            await updateMemberRole(workspaceId, userId, newRole)

            toast({
                title: "Role updated",
                description: `${userName} is now a ${newRole}`,
            })

            fetchWorkspaceById(workspaceId)
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Failed to update role",
                description: (err as Error).message || "Please try again",
            })
        }
    }

    const handleRetry = () => {
        fetchWorkspaceById(workspaceId).catch(() => {
            toast({
                variant: "destructive",
                title: "Still having issues",
                description: "Please check your connection",
            })
        })
    }

    // Error state
    if (error && !loading) {
        return (
            <div className="flex-1 p-4 md:p-6 lg:p-8">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            Failed to Load Members
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                        <Button onClick={handleRetry} className="w-full">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Loading state
    if (loading) {
        return (
            <div className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <Skeleton className="h-10 w-full max-w-md" />
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const members = currentWorkspace?.members || []
    const filteredMembers = members.filter(
        (member: any) =>
            member.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pl-12 md:pl-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Team Members</h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Manage your workspace team ({members.length} members)
                    </p>
                </div>
                {canManage && (
                    <Button onClick={() => setInviteDialogOpen(true)} className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Invite Member
                    </Button>
                )}
            </div>

            {/* Search */}
            <div className="relative max-w-md mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Members List */}
            <Card>
                <CardContent className="p-0">
                    {filteredMembers.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">
                                {searchQuery ? "No members found" : "No members yet"}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredMembers.map((member: any, index: number) => (
                                <div
                                    key={member.user?._id || index}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={member.user?.avatar} />
                                            <AvatarFallback>
                                                {member.user?.name?.charAt(0)?.toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm md:text-base">
                                                {member.user?.name || "Unknown"}
                                            </p>
                                            <p className="text-xs md:text-sm text-muted-foreground">
                                                {member.user?.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-13 sm:ml-0">
                                        <Badge
                                            variant={member.role === "owner" ? "default" : "secondary"}
                                            className="text-xs"
                                        >
                                            {member.role}
                                        </Badge>

                                        {canManage && member.role !== "owner" && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleUpdateRole(
                                                                member.user?._id,
                                                                member.role === "admin" ? "member" : "admin",
                                                                member.user?.name
                                                            )
                                                        }
                                                    >
                                                        <Shield className="mr-2 h-4 w-4" />
                                                        Make {member.role === "admin" ? "Member" : "Admin"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => handleRemoveMember(member.user?._id, member.user?.name)}
                                                    >
                                                        <UserMinus className="mr-2 h-4 w-4" />
                                                        Remove
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Invite Dialog */}
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>
                            Send an invitation email to add someone to your workspace.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleInvite}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="colleague@example.com"
                                    value={inviteData.email}
                                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                                    disabled={inviting}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={inviteData.role}
                                    onValueChange={(value) => setInviteData({ ...inviteData, role: value })}
                                    disabled={inviting}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="member">Member</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setInviteDialogOpen(false)}
                                disabled={inviting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={inviting}>
                                {inviting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="mr-2 h-4 w-4" />
                                        Send Invitation
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div >
    )
}