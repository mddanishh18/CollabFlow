"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useWorkspace } from "@/hooks/use-workspace"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { type WorkspaceInvitation, type User } from "@/types"
import { Loader2, Mail, UserPlus, Clock, Check, Building2, Shield, User as UserIcon } from "lucide-react"

interface PendingInvitationsDialogProps {
    open: boolean
    onClose: () => void
}

function getExpiryInfo(expiresAt: Date): { label: string; urgent: boolean } {
    const date = new Date(expiresAt)
    const now = new Date()
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) return { label: "Expired", urgent: true }
    if (diffDays === 1) return { label: "Expires tomorrow", urgent: true }
    if (diffDays <= 3) return { label: `Expires in ${diffDays} days`, urgent: true }
    return { label: `Expires in ${diffDays} days`, urgent: false }
}

export function PendingInvitationsDialog({ open, onClose }: PendingInvitationsDialogProps) {
    const router = useRouter()
    const { toast } = useToast()
    const { invitations, fetchPendingInvitations, acceptInvitation, loading } = useWorkspace()
    const [processingId, setProcessingId] = useState<string | null>(null)

    useEffect(() => {
        if (open) {
            fetchPendingInvitations().catch((err: Error) => {
                console.error("Failed to fetch invitations:", err)
            })
        }
    }, [open, fetchPendingInvitations])

    const handleAccept = async (invitation: WorkspaceInvitation) => {
        setProcessingId(invitation.token)
        try {
            await acceptInvitation(invitation.token)
            const ws = typeof invitation.workspace === "string" ? null : invitation.workspace
            toast({
                title: "Invitation accepted",
                description: `You've joined ${ws?.name ?? "the workspace"}`,
            })
            await fetchPendingInvitations()
            router.push(`/workspace/${ws?._id}`)
            onClose()
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to accept invitation",
                description: (error as Error).message || "Please try again",
            })
        } finally {
            setProcessingId(null)
        }
    }

    const RoleIcon = ({ role }: { role: string }) =>
        role === "admin" ? (
            <Shield className="h-3 w-3" />
        ) : (
            <UserIcon className="h-3 w-3" />
        )

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2.5 text-base">
                        <div className="p-1.5 rounded-md bg-primary/10">
                            <Mail className="h-4 w-4 text-primary" />
                        </div>
                        Pending Invitations
                    </DialogTitle>
                    <DialogDescription>
                        Workspace invitations waiting for your response
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2].map((i) => (
                                <Skeleton key={i} className="h-28 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : invitations.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                <UserPlus className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium">No pending invitations</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Invitations will appear here when someone adds you to a workspace
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {(invitations as WorkspaceInvitation[]).map((invitation, index) => {
                                const expiry = getExpiryInfo(invitation.expiresAt)
                                const isProcessing = processingId === invitation.token
                                const ws = typeof invitation.workspace === "string" ? null : invitation.workspace
                                const inviter = typeof invitation.invitedBy === "string" ? null : (invitation.invitedBy as User | null)

                                return (
                                    <div key={invitation.token}>
                                        {index > 0 && <Separator className="mb-3" />}
                                        <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3 hover:border-primary/40 transition-colors duration-200">
                                            {/* Workspace identity */}
                                            <div className="flex items-start gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Building2 className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm leading-tight truncate">
                                                        {ws?.name || "Unknown Workspace"}
                                                    </p>
                                                    {ws?.description && (
                                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                                            {ws.description}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Invited by{" "}
                                                        <span className="text-foreground font-medium">
                                                            {inviter?.name || inviter?.email || "Unknown"}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Role + expiry metadata */}
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs flex items-center gap-1"
                                                >
                                                    <RoleIcon role={invitation.role} />
                                                    {invitation.role}
                                                </Badge>
                                                <span
                                                    className={cn(
                                                        "text-xs flex items-center gap-1",
                                                        expiry.urgent
                                                            ? "text-amber-600 dark:text-amber-400 font-medium"
                                                            : "text-muted-foreground"
                                                    )}
                                                >
                                                    <Clock className="h-3 w-3" />
                                                    {expiry.label}
                                                </span>
                                            </div>

                                            {/* Action */}
                                            <Button
                                                size="sm"
                                                className="w-full"
                                                onClick={() => handleAccept(invitation)}
                                                disabled={isProcessing || processingId !== null}
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                                                        Joining…
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="h-3.5 w-3.5 mr-2" />
                                                        Accept & join workspace
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
