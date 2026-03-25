'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from './ScrollReveal'

const TRUST_SIGNALS = [
    'No credit card',
    'Free during beta',
    '2-minute setup',
    'Cancel anytime',
]

export function FinalCTA() {
    return (
        <section className="relative overflow-hidden py-32 border-t border-border bg-card">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute inset-x-0 -top-32 flex justify-center">
                <div className="h-[500px] w-[900px] rounded-full bg-primary/5 blur-[100px]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <ScrollReveal y={24} duration={0.55} className="text-center max-w-3xl mx-auto">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-6">
                        CollabFlow Beta
                    </p>
                    <h2
                        className="text-5xl sm:text-6xl font-bold text-foreground mb-6"
                        style={{ letterSpacing: '-0.04em', lineHeight: 1.05 }}
                    >
                        Build with your team,
                        <br />
                        starting now.
                    </h2>
                    <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl mx-auto">
                        Free during beta. No credit card required. Real-time collaboration
                        and AI that knows your project.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
                        <Button asChild size="lg" className="group h-12 px-8 text-base">
                            <Link href="/register">
                                Get early access
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
                            <Link href="/login">Sign in</Link>
                        </Button>
                    </div>

                    {/* Trust signals */}
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
                        {TRUST_SIGNALS.map((signal) => (
                            <span
                                key={signal}
                                className="flex items-center gap-2 text-sm text-muted-foreground"
                            >
                                <span className="w-1 h-1 rounded-full bg-primary/50 inline-block shrink-0" />
                                {signal}
                            </span>
                        ))}
                    </div>
                </ScrollReveal>
            </div>
        </section>
    )
}
