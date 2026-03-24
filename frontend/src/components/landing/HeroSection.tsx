'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BentoGrid } from './BentoGrid';

export function HeroSection() {
    const shouldReduceMotion = useReducedMotion();
    const translateY = shouldReduceMotion ? 0 : 24;

    const stagger = {
        hidden: {},
        visible: {
            transition: { staggerChildren: 0.11, delayChildren: 0.05 },
        },
    };

    const reveal = {
        hidden: { opacity: 0, y: translateY },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
        },
    };

    return (
        <section className="relative overflow-hidden bg-background pt-24 pb-16">
            {/* Atmospheric orb — single, top-right corner, very low opacity */}
            <div
                className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
                    opacity: 0.11,
                }}
            />

            <div className="container relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Text block — left-aligned on desktop, centered on mobile */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                    className="flex flex-col items-center md:items-start"
                >
                    {/* Badge */}
                    <motion.div
                        variants={reveal}
                        className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                        <Sparkles className="h-3 w-3" />
                        <span>AI Assistant: Coming Soon</span>
                    </motion.div>

                    {/* Headline — weight + scale only, no gradient */}
                    <motion.h1
                        variants={reveal}
                        className="font-extrabold leading-none text-foreground mb-6 text-center md:text-left"
                        style={{
                            fontSize: 'clamp(3.5rem, 7vw, 7rem)',
                            letterSpacing: '-0.04em',
                        }}
                    >
                        Work together.
                        <br />
                        Actually together.
                    </motion.h1>

                    {/* Sub-headline — one line, 13 words */}
                    <motion.p
                        variants={reveal}
                        className="mb-10 max-w-lg text-center md:text-left text-xl font-normal leading-relaxed text-muted-foreground"
                    >
                        Real-time workspaces where teams align, build, and ship together.
                    </motion.p>

                    {/* CTAs — no whileHover scale, shadcn Button */}
                    <motion.div
                        variants={reveal}
                        className="flex flex-col sm:flex-row gap-3 items-center md:items-start"
                    >
                        <Button size="lg" asChild className="group">
                            <Link href="/register">
                                Try CollabFlow Free
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                            </Link>
                        </Button>

                        <Button size="lg" variant="outline" asChild>
                            <Link href="#rag-showcase">
                                See AI in Action
                            </Link>
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Bento Grid — full container width, delayed reveal */}
                <motion.div
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-20"
                >
                    <BentoGrid />
                </motion.div>
            </div>
        </section>
    );
}
