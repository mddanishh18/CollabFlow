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
import {
    Mail,
    Loader2,
    AlertCircle,
    UserPlus,
    Shield,
    User,
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
                title: "Invitation sent! 📧",
                description: `An invitation has been sent to ${formData.email}`,
            })

            // Reset form
            setFormData({ email: "", role: "member" })
            setErrors({})

            // Close dialog and notify parent
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

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" />
                        Invite Team Member
                    </DialogTitle>
                    <DialogDescription>
                        Send an email invitation to add someone to your workspace.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Error Alert */}
                        {errors.submit && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errors.submit}</AlertDescription>
                            </Alert>
                        )}

                        {/* Email Input */}
                        <div className="grid gap-2">
                            <Label htmlFor="invite-email">
                                Email Address <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="invite-email"
                                type="email"
                                placeholder="colleague@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={errors.email ? "border-destructive" : ""}
                                disabled={isSubmitting}
                                autoFocus
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive">{errors.email}</p>
                            )}
                        </div>

                        {/* Role Select */}
                        <div className="grid gap-2">
                            <Label htmlFor="invite-role">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) => setFormData({ ...formData, role: value as "member" | "admin" | "viewer" })}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger id="invite-role">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="member">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            <div>
                                                <span className="font-medium">Member</span>
                                                <span className="text-xs text-muted-foreground ml-2">
                                                    Can view and edit projects
                                                </span>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="admin">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            <div>
                                                <span className="font-medium">Admin</span>
                                                <span className="text-xs text-muted-foreground ml-2">
                                                    Can manage workspace settings
                                                </span>
                                            </div>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {formData.role === "admin"
                                    ? "Admins can invite members and change settings"
                                    : "Members can view and collaborate on projects"}
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
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
    )
}
