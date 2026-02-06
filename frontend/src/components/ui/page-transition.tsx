"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { ReactNode, useEffect, useState } from "react"

interface PageTransitionProps {
    children: ReactNode
}

// View Transitions API support check
const supportsViewTransitions = typeof document !== 'undefined' && 'startViewTransition' in document

export function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname()
    const [displayChildren, setDisplayChildren] = useState(children)
    const [isTransitioning, setIsTransitioning] = useState(false)

    useEffect(() => {
        // Trigger transition when path changes
        if (supportsViewTransitions) {
            // Use native View Transitions API for supporting browsers
            const transition = (document as any).startViewTransition(() => {
                setDisplayChildren(children)
            })
            
            transition.finished.finally(() => {
                setIsTransitioning(false)
            })
        } else {
            // Fallback to Framer Motion
            setDisplayChildren(children)
        }
    }, [children])

    // For browsers supporting View Transitions API
    if (supportsViewTransitions) {
        return (
            <div className="h-full view-transition-page">
                {displayChildren}
            </div>
        )
    }

    // Fallback for browsers without View Transitions API
    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={pathname}
                initial={{ 
                    opacity: 0, 
                    y: 24,
                    scale: 0.96,
                }}
                animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: 1,
                }}
                exit={{ 
                    opacity: 0, 
                    y: -24,
                    scale: 0.96,
                }}
                transition={{
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1], // easeOutExpo for smooth, natural motion
                    opacity: { duration: 0.4 },
                }}
                className="h-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}
