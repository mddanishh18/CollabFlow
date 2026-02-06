'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Rocket } from 'lucide-react';
import Link from 'next/link';

export function FinalCTA() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="relative py-32 overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--primary)_0%,transparent_70%)] opacity-20 animate-pulse" />

            <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-4xl text-center"
                >
                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : { scale: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mb-8 shadow-xl"
                    >
                        <Rocket className="h-10 w-10 text-primary-foreground" />
                    </motion.div>

                    {/* Headline */}
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6"
                    >
                        Ready to Transform Your{' '}
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Workflow?
                        </span>
                    </motion.h2>

                    {/* Subtext */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="text-xl text-muted-foreground mb-10"
                    >
                        Join teams building better products together. Free during beta.
                    </motion.p>

                    {/* CTA Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                    >
                        <Link href="/register">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-accent px-10 py-5 text-xl font-bold text-primary-foreground shadow-2xl hover:shadow-3xl transition-all"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    Get Early Access
                                    <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.button>
                        </Link>
                    </motion.div>

                    {/* Subtext */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        className="mt-8 text-sm text-muted-foreground"
                    >
                        Already have an account? <Link href="/login" className="text-primary hover:underline font-semibold">Sign in</Link>
                    </motion.p>
                </motion.div>
            </div>
        </section>
    );
}
