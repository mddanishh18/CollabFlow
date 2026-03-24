import { Skeleton } from "@/components/ui/skeleton";

export function MessageSkeleton() {
    return (
        <div className="space-y-1 p-6">
            {/* Group 1 - first message */}
            <div className="flex gap-3 mb-0.5 animate-in fade-in-50" style={{ animationDelay: "0ms" }}>
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5 max-w-[60%]">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-9 w-full rounded-2xl" />
                </div>
            </div>

            {/* Group 1 - second message (no avatar, no name) */}
            <div className="flex gap-3 mb-4 animate-in fade-in-50" style={{ animationDelay: "80ms" }}>
                <div className="w-10 h-10 shrink-0 flex-none" />
                <div className="flex-1 max-w-[50%]">
                    <Skeleton className="h-9 w-full rounded-2xl rounded-tl-sm" />
                </div>
            </div>

            {/* Group 2 - single message */}
            <div className="flex gap-3 mb-4 animate-in fade-in-50" style={{ animationDelay: "160ms" }}>
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5 max-w-[45%]">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-14 w-full rounded-2xl" />
                </div>
            </div>

            {/* Own message group - right aligned */}
            <div className="flex gap-3 flex-row-reverse mb-0.5 animate-in fade-in-50" style={{ animationDelay: "240ms" }}>
                <div className="flex flex-col items-end max-w-[55%] space-y-1.5">
                    <div className="flex items-center gap-2 flex-row-reverse">
                        <Skeleton className="h-3.5 w-10" />
                        <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-9 w-full rounded-2xl" />
                </div>
            </div>

            {/* Own message group - follow-up message */}
            <div className="flex gap-3 flex-row-reverse mb-4 animate-in fade-in-50" style={{ animationDelay: "320ms" }}>
                <div className="flex flex-col items-end max-w-[40%]">
                    <Skeleton className="h-9 w-full rounded-2xl rounded-tr-sm" />
                </div>
            </div>
        </div>
    );
}
