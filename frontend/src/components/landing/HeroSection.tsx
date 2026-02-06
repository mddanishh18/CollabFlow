'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { BentoGrid } from './BentoGrid';

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
            {/* Animated background glow (uses primary color from globals.css) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,var(--primary)_0%,transparent_50%)] opacity-20 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,var(--accent)_0%,transparent_50%)] opacity-15 blur-3xl" />

            <div className="container relative z-10 px-4 sm:px-6 lg:px-8 py-20">
                <div className="mx-auto max-w-5xl text-center">
                    {/* Coming Soon Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-8"
                    >
                        <Sparkles className="h-4 w-4" />
                        <span>AI Assistant: Coming Soon</span>
                    </motion.div>

                    {/* Main Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6"
                    >
                        Collaborate Smarter,{' '}
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Ship Faster
                        </span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
                    >
                        Real-time workspaces where teams align, build, and scale
                        <span className="font-semibold text-foreground"> — powered by AI that actually understands your context.</span>
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <Link href="/register">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative overflow-hidden rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg hover:shadow-xl transition-all"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Try CollabFlow Free
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.button>
                        </Link>

                        <Link href="#rag-showcase">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group px-8 py-4 text-lg font-semibold text-foreground border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
                            >
                                <span className="flex items-center gap-2">
                                    See AI in Action
                                    <Sparkles className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform" />
                                </span>
                            </motion.button>
                        </Link>
                    </motion.div>

                    {/* Bento Grid Product Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="mt-20"
                    >
                        <BentoGrid />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
