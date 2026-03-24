import { Skeleton } from "@/components/ui/skeleton"

export default function ProjectsLoading() {
    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="space-y-6">
                {/* Header row */}
                <div className="flex items-center justify-between pl-12 md:pl-0">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-9 w-32 rounded-md" />
                </div>

                {/* Project cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="space-y-3 p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <div className="flex items-center gap-2 pt-2">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <Skeleton className="h-4 w-20 ml-auto" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
