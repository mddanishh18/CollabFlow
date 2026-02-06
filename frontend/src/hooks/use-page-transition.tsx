"use client"

import { useState, useTransition } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export function usePageTransition() {
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()
    const [isNavigating, setIsNavigating] = useState(false)

    const navigate = (href: string) => {
        if (href === pathname) return

        setIsNavigating(true)
        
        // Smooth transition timing
        setTimeout(() => {
            startTransition(() => {
                router.push(href)
                // Allow time for the page transition to complete
                setTimeout(() => {
                    setIsNavigating(false)
                }, 400)
            })
        }, 150)
    }

    return { navigate, isNavigating: isNavigating || isPending }
}

// Enhanced loading bar with shimmer effect
export function NavigationProgress({ isNavigating }: { isNavigating: boolean }) {
    return (
        <AnimatePresence>
            {isNavigating && (
                <>
                    <motion.div
                        className="fixed top-0 left-0 right-0 h-1 bg-linear-to-r from-primary/30 via-primary to-primary/30 z-9999 origin-left shadow-lg shadow-primary/50"
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 0.7, opacity: 1 }}
                        exit={{ scaleX: 1, opacity: 0 }}
                        transition={{ 
                            scaleX: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                            opacity: { duration: 0.3 }
                        }}
                    />
                    <motion.div
                        className="fixed top-0 left-0 h-1 w-32 bg-linear-to-r from-transparent via-white to-transparent z-10000"
                        initial={{ x: "-100%" }}
                        animate={{ x: "400%" }}
                        transition={{ 
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{ opacity: 0.6 }}
                    />
                </>
            )}
        </AnimatePresence>
    )
}
