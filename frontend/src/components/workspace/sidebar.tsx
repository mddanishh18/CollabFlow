"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useParams, useRouter } from "next/navigation"
import { WorkspaceSwitcher } from "./workspace-switcher"
import { PendingInvitationsDialog } from "./pending-invitations-dialog"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { useAuthStore } from "@/store/auth-store"
import { useWorkspace } from "@/hooks/use-workspace"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { type LucideIcon } from "lucide-react"
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    Settings,
    LogOut,
    UserPlus,
    MessageSquare,
    Info,
    Bot,
    Sparkles,
    Database,
    Shield,
    Zap,
} from "lucide-react"

interface Route {
    label: string
    icon: LucideIcon
    href: string
    active: boolean
    show: boolean
}

export function Sidebar() {
    const pathname = usePathname()
    const params = useParams()
    const router = useRouter()
    const workspaceId = params?.workspaceId as string | undefined
    const { logout, user } = useAuthStore()
    const { currentWorkspace } = useWorkspace()
    const [invitationsOpen, setInvitationsOpen] = useState(false)
    const [aiPreviewOpen, setAiPreviewOpen] = useState(false)
    const [isNavigating, setIsNavigating] = useState(false)

    // Get user's role - check userRole property first (from API), then members array
    const userRole =
        currentWorkspace?.userRole ||
        currentWorkspace?.members?.find((m: any) =>
            (typeof m.user === 'string' ? m.user : m.user?._id) === user?._id
        )?.role ||
        null

    const isAdminOrOwner = userRole === "owner" || userRole === "admin"

    // Smooth navigation handler
    const handleNavigation = (href: string, e: React.MouseEvent) => {
        if (href === pathname) return
        
        e.preventDefault()
        setIsNavigating(true)
        
        setTimeout(() => {
            router.push(href)
            setTimeout(() => setIsNavigating(false), 250)
        }, 100)
    }

    const routes: Route[] = [
        {
            label: "Overview",
            icon: LayoutDashboard,
            href: `/workspace/${workspaceId}`,
            active: pathname === `/workspace/${workspaceId}`,
            show: true,
        },
        {
            label: "Projects",
            icon: FolderKanban,
            href: `/workspace/${workspaceId}/projects`,
            active: pathname === `/workspace/${workspaceId}/projects`,
            show: true,
        },
        {
            label: "Chat",
            icon: MessageSquare,
            href: `/workspace/${workspaceId}/chat`,
            active: pathname?.startsWith(`/workspace/${workspaceId}/chat`) || false,
            show: true,
        },
        {
            label: "Members",
            icon: Users,
            href: `/workspace/${workspaceId}/members`,
            active: pathname === `/workspace/${workspaceId}/members`,
            show: true,
        },
        {
            label: "Settings",
            icon: Settings,
            href: `/workspace/${workspaceId}/settings`,
            active: pathname === `/workspace/${workspaceId}/settings`,
            show: isAdminOrOwner,
        },
        {
            label: "Help",
            icon: Info,
            href: `/workspace/${workspaceId}/help`,
            active: pathname === `/workspace/${workspaceId}/help`,
            show: true,
        },
    ]

    return (
        <>
            {/* Navigation Progress Bar */}
            {isNavigating && (
                <motion.div
                    className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary z-[9999]"
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />
            )}
            
            <div className="flex h-full w-full md:w-64 flex-col border-r bg-card/95 backdrop-blur-md shadow-lg">
                {/* Workspace Switcher */}
                <div className="p-3 md:p-4 border-b border-border/50">
                    <WorkspaceSwitcher />
                </div>

                <Separator />

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-3 md:p-4 overflow-y-auto">
                    {routes
                        .filter((route) => route.show)
                        .map((route) => (
                            <Link 
                                key={route.href} 
                                href={route.href}
                                onClick={(e) => handleNavigation(route.href, e)}
                            >
                                <Button
                                    variant={route.active ? "secondary" : "ghost"}
                                    className={`w-full justify-start text-sm md:text-base transition-all duration-300 ease-in-out ${route.active
                                        ? "bg-secondary shadow-sm"
                                        : "hover:bg-accent hover:scale-105 hover:shadow-md"
                                        } group`}
                                >
                                    <route.icon
                                        className={`mr-2 h-4 w-4 transition-transform duration-300 ${route.active
                                            ? "text-primary"
                                            : "group-hover:scale-110 group-hover:text-primary"
                                            }`}
                                    />
                                    <span className="transition-all duration-300 group-hover:translate-x-1">
                                        {route.label}
                                    </span>
                                </Button>
                            </Link>
                        ))}
                    {/* AI Assistant Preview Button */}
                    <Button
                        variant="ghost"
                        onClick={() => setAiPreviewOpen(true)}
                        className="w-full justify-start text-sm md:text-base transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md group border border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                    >
                        <Bot className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:text-primary" />
                        <span className="transition-all duration-300 group-hover:translate-x-1 flex-1 text-left">
                            AI Assistant
                        </span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Soon</Badge>
                    </Button>
                    {/* Pending Invitations Button */}
                    <Button
                        variant="ghost"
                        onClick={() => setInvitationsOpen(true)}
                        className="w-full justify-start text-sm md:text-base transition-all duration-300 ease-in-out hover:bg-accent hover:scale-105 hover:shadow-md group"
                    >
                        <UserPlus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:text-primary" />
                        <span className="transition-all duration-300 group-hover:translate-x-1">
                            Pending Invitations
                        </span>
                    </Button>
                </nav>

                <Separator />

                {/* Bottom Section */}
                <div className="p-3 md:p-4 space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-all duration-300 hover:scale-105">
                        <span className="text-xs md:text-sm text-muted-foreground">Theme</span>
                        <ThemeToggle />
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs md:text-sm text-destructive hover:text-destructive hover:bg-destructive/10 hover:scale-105 hover:shadow-md transition-all duration-300 group"
                        onClick={logout}
                    >
                        <LogOut className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                        <span className="transition-all duration-300 group-hover:translate-x-1">
                            Logout
                        </span>
                    </Button>
                </div>
            </div>

            <PendingInvitationsDialog
                open={invitationsOpen}
                onClose={() => setInvitationsOpen(false)}
            />

            {/* AI Preview Dialog */}
            <Dialog open={aiPreviewOpen} onOpenChange={setAiPreviewOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Bot className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">AI Project Assistant</DialogTitle>
                                <DialogDescription>Coming Soon</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Hero Message */}
                        <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                            <p className="text-sm leading-relaxed">
                                <Sparkles className="inline h-4 w-4 text-primary mr-1" />
                                Each project will get its own intelligent AI assistant with dedicated knowledge base.
                                Ask questions, get insights, and boost productivity.
                            </p>
                        </div>

                        {/* Features List */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <Zap className="h-4 w-4 text-primary" />
                                What You'll Get:
                            </h4>
                            
                            <div className="space-y-3">
                                <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
                                    <MessageSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Dedicated AI Per Project</p>
                                        <p className="text-xs text-muted-foreground">Each project gets its own AI assistant that understands your specific context</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
                                    <Database className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Separate Knowledge Bases</p>
                                        <p className="text-xs text-muted-foreground">Isolated knowledge per project - AI only knows what's relevant to that project</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
                                    <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Admin Controlled</p>
                                        <p className="text-xs text-muted-foreground">Project admins decide what the AI learns - tasks, files, docs, and more</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
                                    <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Real-Time Responses</p>
                                        <p className="text-xs text-muted-foreground">Get instant answers about project tasks, status, and context through chat</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Use Cases */}
                        <div className="p-4 border rounded-lg space-y-2">
                            <h4 className="text-sm font-semibold">Example Questions You Can Ask:</h4>
                            <div className="space-y-1.5 text-xs text-muted-foreground">
                                <p>• "What tasks are overdue in this project?"</p>
                                <p>• "Summarize recent activity and progress"</p>
                                <p>• "Who's working on the authentication feature?"</p>
                                <p>• "What's blocking us from completing sprint 3?"</p>
                            </div>
                        </div>

                        {/* Launch Badge */}
                        <div className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-lg">
                            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                            <span className="text-sm font-medium">Launching Soon</span>
                            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setAiPreviewOpen(false)} className="w-full">
                            Got it, can't wait!
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
