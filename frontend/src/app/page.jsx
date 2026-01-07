"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // Only redirect after hydration is complete
    if (_hasHydrated) {
      if (isAuthenticated) {
        router.push("/workspace");
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, _hasHydrated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted/20">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 md:h-10 md:w-10 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
