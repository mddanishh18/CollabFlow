'use client'

import { useReducedMotion } from 'framer-motion'

const technologies = [
    'Next.js 16',
    'React 19',
    'TypeScript',
    'Node.js',
    'Socket.IO',
    'MongoDB',
    'Redis',
    'Tailwind CSS v4',
    'Zod',
    'Framer Motion',
    'RAG · LangChain',
]

export function TechStack() {
    const shouldReduceMotion = useReducedMotion()
    const doubled = [...technologies, ...technologies]

    return (
        <section className="py-16 border-y border-border/60 overflow-hidden">
            {!shouldReduceMotion && (
                <style>{`
                    @keyframes tech-scroll {
                        from { transform: translateX(0); }
                        to { transform: translateX(-50%); }
                    }
                    .tech-marquee {
                        animation: tech-scroll 36s linear infinite;
                        will-change: transform;
                    }
                    .tech-marquee:hover {
                        animation-play-state: paused;
                    }
                `}</style>
            )}

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                    Stack
                </p>
            </div>

            {shouldReduceMotion ? (
                <div className="flex flex-wrap gap-x-6 gap-y-3 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    {technologies.map((name) => (
                        <span key={name} className="text-sm text-muted-foreground">
                            {name}
                        </span>
                    ))}
                </div>
            ) : (
                <div className="tech-marquee flex items-center gap-0 w-max">
                    {doubled.map((name, i) => (
                        <span key={i} className="flex items-center">
                            <span className="text-sm text-foreground/70 whitespace-nowrap px-5 font-medium">
                                {name}
                            </span>
                            <span className="text-muted-foreground/30 select-none" aria-hidden="true">
                                ·
                            </span>
                        </span>
                    ))}
                </div>
            )}
        </section>
    )
}
