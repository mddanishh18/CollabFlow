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
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, Mail, UserPlus, Clock, Check, X } from "lucide-react"

interface PendingInvitationsDialogProps {
    open: boolean
    onClose: () => void
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleAccept = async (invitation: any) => {
        setProcessingId(invitation.token)
        try {
            await acceptInvitation(invitation.token)
            toast({
                title: "Invitation accepted! 🎉",
                description: `You've joined ${invitation.workspace?.name}`,
            })
            // Refresh invitations list
            await fetchPendingInvitations()
            // Navigate to the workspace
            router.push(`/workspace/${invitation.workspace?._id}`)
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

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString)
        const now = new Date()
        const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays <= 0) return "Expired"
        if (diffDays === 1) return "Expires tomorrow"
        return `Expires in ${diffDays} days`
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        Pending Invitations
                    </DialogTitle>
                    <DialogDescription>
                        Workspace invitations waiting for your response
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-4">
                    {loading ? (
                        // Loading state
                        <div className="space-y-3">
                            {[1, 2].map((i) => (
                                <Skeleton key={i} className="h-24 w-full" />
                            ))}
                        </div>
                    ) : invitations.length === 0 ? (
                        // Empty state
                        <div className="text-center py-8">
                            <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No pending invitations</h3>
                            <p className="text-sm text-muted-foreground">
                                You'll see invitations here when someone invites you to a workspace
                            </p>
                        </div>
                    ) : (
                        // Invitations list
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        invitations.map((invitation: any) => (
                            <Card
                                key={invitation.token}
                                className="hover:border-primary/50 transition-all duration-300"
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-base truncate">
                                                {invitation.workspace?.name || "Unknown Workspace"}
                                            </h4>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Invited by {invitation.invitedBy?.name || invitation.invitedBy?.email || "Unknown"}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="secondary" className="text-xs">
                                                    {invitation.role}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDate(invitation.expiresAt)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleAccept(invitation)}
                                                disabled={processingId === invitation.token}
                                            >
                                                {processingId === invitation.token ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Check className="h-4 w-4 mr-1" />
                                                        Accept
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
