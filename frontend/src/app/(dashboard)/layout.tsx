import { ReactNode } from "react"
import { DashboardClientWrapper } from "@/components/workspace/DashboardClientWrapper"

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return <DashboardClientWrapper>{children}</DashboardClientWrapper>
}
