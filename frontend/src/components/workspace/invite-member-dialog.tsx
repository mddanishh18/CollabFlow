"use client"

import { useState } from "react"
import { useWorkspace } from "@/hooks/use-workspace"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
    Mail,
    Loader2,
    AlertCircle,
    UserPlus,
    Shield,
    User,
    Check,
} from "lucide-react"

interface InviteMemberDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    workspaceId: string
    onSuccess?: () => void
}

interface FormData {
    email: string
    role: "member" | "admin" | "viewer"
}

type FormErrors = Partial<Record<keyof FormData | "submit", string>>

const ROLE_META = {
    member: {
        icon: User,
        label: "Member",
        summary: "Can view and collaborate on projects",
        permissions: [
            "Access workspace projects they're added to",
            "Create tasks and leave comments",
            "View team members",
        ],
    },
    admin: {
        icon: Shield,
        label: "Admin",
        summary: "Can manage workspace settings and members",
        permissions: [
            "Everything a member can do",
            "Invite and remove members",
            "Change workspace settings",
            "Create and delete projects",
        ],
    },
} as const

export function InviteMemberDialog({
    open,
    onOpenChange,
    workspaceId,
    onSuccess,
}: InviteMemberDialogProps) {
    const { toast } = useToast()
    const { inviteMember } = useWorkspace()

    const [formData, setFormData] = useState<FormData>({
        email: "",
        role: "member",
    })
    const [errors, setErrors] = useState<FormErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!formData.email.trim()) {
            newErrors.email = "Email address is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)
        try {
            await inviteMember(workspaceId, formData.email.trim(), formData.role)

            toast({
                title: "Invitation sent",
                description: `An invitation has been sent to ${formData.email}`,
            })

            setFormData({ email: "", role: "member" })
            setErrors({})
            onOpenChange(false)
            if (onSuccess) onSuccess()
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to send invitation",
                description: (error as Error).message || "Please try again",
            })
            setErrors({ submit: (error as Error).message })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({ email: "", role: "member" })
            setErrors({})
            onOpenChange(false)
        }
    }

    const roleMeta = ROLE_META[formData.role === "admin" ? "admin" : "member"]

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[460px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2.5 text-base">
                        <div className="p-1.5 rounded-md bg-primary/10">
                            <UserPlus className="h-4 w-4 text-primary" />
                        </div>
                        Invite to workspace
                    </DialogTitle>
                    <DialogDescription>
                        The person will receive an email with a link to join.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-5 py-2">
                        {errors.submit && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errors.submit}</AlertDescription>
                            </Alert>
                        )}

                        {/* Email */}
                        <div className="grid gap-2">
                            <Label htmlFor="invite-email">
                                Email address{" "}
                                <span className="text-destructive" aria-hidden>*</span>
                            </Label>
                            <Input
                                id="invite-email"
                                type="email"
                                placeholder="colleague@company.com"
                                value={formData.email}
                                onChange={(e) => {
                                    setFormData({ ...formData, email: e.target.value })
                                    if (errors.email) setErrors({ ...errors, email: undefined })
                                }}
                                className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
                                disabled={isSubmitting}
                                autoFocus
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive">{errors.email}</p>
                            )}
                        </div>

                        {/* Role */}
                        <div className="grid gap-2">
                            <Label htmlFor="invite-role">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, role: value as "member" | "admin" | "viewer" })
                                }
                                disabled={isSubmitting}
                            >
                                <SelectTrigger id="invite-role">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="member">
                                        <div className="flex items-center gap-2">
                                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span>Member</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="admin">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span>Admin</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Role permission card */}
                        <div className="rounded-lg border bg-muted/30 p-3.5 space-y-2.5">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                {roleMeta.label} access
                            </p>
                            <ul className="space-y-1.5">
                                {roleMeta.permissions.map((perm) => (
                                    <li key={perm} className="flex items-start gap-2 text-xs text-muted-foreground">
                                        <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                                        {perm}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <Separator className="my-4" />

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending…
                                </>
                            ) : (
                                <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send invitation
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
