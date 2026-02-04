"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { WorkspaceSwitcher } from "./workspace-switcher"
import { PendingInvitationsDialog } from "./pending-invitations-dialog"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { useAuthStore } from "@/store/auth-store"
import { useWorkspace } from "@/hooks/use-workspace"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { type LucideIcon } from "lucide-react"
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    Settings,
    LogOut,
    UserPlus,
    MessageSquare,
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
    const workspaceId = params?.workspaceId as string | undefined
    const { logout, user } = useAuthStore()
    const { currentWorkspace } = useWorkspace()
    const [invitationsOpen, setInvitationsOpen] = useState(false)

    // Get user's role - check userRole property first (from API), then members array
    const userRole =
        currentWorkspace?.userRole ||
        currentWorkspace?.members?.find((m: any) =>
            (typeof m.user === 'string' ? m.user : m.user?._id) === user?._id
        )?.role ||
        null

    const isAdminOrOwner = userRole === "owner" || userRole === "admin"

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
    ]

    return (
        <>
            <div className="flex h-full w-full md:w-64 flex-col border-r bg-card">
                {/* Workspace Switcher */}
                <div className="p-3 md:p-4">
                    <WorkspaceSwitcher />
                </div>

                <Separator />

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-3 md:p-4 overflow-y-auto">
                    {routes
                        .filter((route) => route.show)
                        .map((route) => (
                            <Link key={route.href} href={route.href}>
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
        </>
    )
}
