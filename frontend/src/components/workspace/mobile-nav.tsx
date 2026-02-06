"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"

export function MobileNav() {
    const [open, setOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`fixed top-4 left-4 z-40 md:hidden h-10 w-10 transition-opacity ${open ? "opacity-0 pointer-events-none" : "opacity-100"
                        }`}
                    aria-label="Open navigation menu"
                >
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
                <Sidebar />
            </SheetContent>
        </Sheet>
    )
}
