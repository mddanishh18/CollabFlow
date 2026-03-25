'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { type ReactNode } from 'react';

interface ScrollRevealProps {
    children: ReactNode;
    className?: string;
    /** Initial Y offset (pixels). Default: 28 */
    y?: number;
    /** Delay in seconds. Default: 0 */
    delay?: number;
    /** Duration in seconds. Default: 0.5 */
    duration?: number;
    /** Animate once (down only) or every time (both directions). Default: false */
    once?: boolean;
}

/**
 * Wraps children with a fade + slide-up on scroll-into-view.
 * Animates in both directions (down AND up) by default.
 */
export function ScrollReveal({
    children,
    className,
    y = 28,
    delay = 0,
    duration = 0.5,
    once = false,
}: ScrollRevealProps) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once, margin: '-60px' }}
            transition={{
                duration,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
        >
            {children}
        </motion.div>
    );
}
