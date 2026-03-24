import { Skeleton } from "@/components/ui/skeleton"

export default function TasksLoading() {
    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pl-12 md:pl-0">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-36" />
                        <Skeleton className="h-4 w-56" />
                    </div>
                    <Skeleton className="h-9 w-28 rounded-md" />
                </div>

                {/* Kanban columns */}
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {["To Do", "In Progress", "Done"].map((col) => (
                        <div key={col} className="flex-shrink-0 w-72 space-y-3">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-5 w-6 rounded-full" />
                            </div>
                            <div className="space-y-2">
                                {[0, 1, 2].map((i) => (
                                    <div key={i} className="p-3 border rounded-lg space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-3 w-3/4" />
                                        <div className="flex items-center justify-between pt-1">
                                            <Skeleton className="h-5 w-16 rounded-full" />
                                            <Skeleton className="h-6 w-6 rounded-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
