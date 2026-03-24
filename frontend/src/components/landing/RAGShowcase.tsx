'use client'

import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { CheckCircle2, Terminal, BookOpen } from 'lucide-react'

const pipelineSteps = [
    { label: 'scope_filter', detail: 'Backend API v2', ms: '2ms' },
    { label: 'vector_search', detail: '847 passages indexed', ms: '38ms' },
    { label: 'context_assembly', detail: '3 relevant passages found', ms: '12ms' },
    { label: 'llm_generate', detail: 'Response ready', ms: '640ms' },
]

const sources = [
    { author: '@sarah', channel: '#backend-chat', date: 'Nov 12' },
    { author: 'Task #247', channel: 'Auth Decision', date: 'Nov 12' },
    { author: '@mike', channel: '#standup', date: 'Nov 14' },
]

const properties = [
    {
        label: 'Project-scoped',
        description:
            'Each assistant sees only its project. No cross-contamination between workspaces.',
    },
    {
        label: 'Citation-grounded',
        description:
            'Every answer includes the source messages, tasks, and decisions it drew from.',
    },
    {
        label: 'Onboarding-ready',
        description:
            'New team members ask questions on day one. No waiting for context.',
    },
    {
        label: 'Zero hallucinations',
        description:
            'Grounded retrieval means answers stay within what your team actually wrote.',
    },
]

export function RAGShowcase() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })
    const shouldReduceMotion = useReducedMotion()

    const y = shouldReduceMotion ? 0 : 16

    return (
        <section ref={ref} id="rag-showcase" className="py-24 sm:py-32 bg-muted/20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
                    transition={{ duration: 0.4 }}
                    className="mb-16 max-w-2xl"
                >
                    <p className="text-sm font-medium text-primary mb-3 tracking-widest uppercase">
                        Coming Q2 2026
                    </p>
                    <h2
                        className="text-4xl sm:text-5xl font-bold text-foreground mb-4"
                        style={{ letterSpacing: '-0.03em' }}
                    >
                        Project-scoped AI
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Each project gets a RAG assistant trained on its own messages, tasks, and decisions.
                        Ask anything. Get answers from your team&apos;s actual history.
                    </p>
                </motion.div>

                {/* Two-panel demo */}
                <motion.div
                    initial={{ opacity: 0, y }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
                    transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : 0.1 }}
                    className="mb-20"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border rounded-xl border border-border overflow-hidden shadow-sm">
                        {/* Left: Pipeline trace */}
                        <div className="bg-card p-6 sm:p-8">
                            <div className="flex items-center gap-2 mb-6 text-xs font-mono text-muted-foreground">
                                <Terminal className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="truncate">
                                    rag.query(project=&quot;backend-api-v2&quot;)
                                </span>
                            </div>

                            <div className="mb-6 font-mono text-sm">
                                <span className="text-muted-foreground select-none">› </span>
                                <span className="text-foreground">
                                    &quot;What did we decide about authentication?&quot;
                                </span>
                            </div>

                            <div className="space-y-3">
                                {pipelineSteps.map((step, i) => (
                                    <motion.div
                                        key={step.label}
                                        initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -12 }}
                                        animate={
                                            isInView
                                                ? { opacity: 1, x: 0 }
                                                : { opacity: 0, x: shouldReduceMotion ? 0 : -12 }
                                        }
                                        transition={{
                                            delay: shouldReduceMotion ? 0 : 0.3 + i * 0.15,
                                            duration: 0.3,
                                        }}
                                        className="flex items-start gap-3 font-mono text-xs"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-foreground">{step.label}</span>
                                            <span className="text-muted-foreground"> — {step.detail}</span>
                                        </div>
                                        <span className="text-muted-foreground/60 flex-shrink-0 tabular-nums">
                                            {step.ms}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Answer */}
                        <div className="bg-card p-6 sm:p-8">
                            <div className="flex items-center gap-2 mb-6 text-xs font-mono text-muted-foreground">
                                <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>response</span>
                            </div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                                transition={{ delay: shouldReduceMotion ? 0 : 0.9, duration: 0.4 }}
                            >
                                <p className="text-sm text-foreground leading-relaxed mb-6">
                                    We chose{' '}
                                    <span className="font-semibold text-primary">
                                        JWT with refresh tokens
                                    </span>{' '}
                                    based on the Nov 12 architecture review. The decision
                                    prioritized stateless auth for horizontal scaling and reduced
                                    server-side session state.
                                </p>

                                <div className="space-y-2.5">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                                        Sources
                                    </p>
                                    {sources.map((source) => (
                                        <div
                                            key={source.author}
                                            className="flex items-center gap-2 text-xs text-muted-foreground"
                                        >
                                            <div className="w-1 h-1 rounded-full bg-primary/50 flex-shrink-0" />
                                            <span className="font-medium text-foreground">
                                                {source.author}
                                            </span>
                                            <span>in {source.channel}</span>
                                            <span className="ml-auto text-muted-foreground/60 tabular-nums">
                                                {source.date}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Properties grid */}
                <motion.div
                    initial={{ opacity: 0, y }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
                    transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-8"
                >
                    {properties.map((prop) => (
                        <div key={prop.label} className="flex gap-4">
                            <div className="w-0.5 bg-border flex-shrink-0 rounded-full mt-1" />
                            <div>
                                <h4 className="text-sm font-semibold text-foreground mb-1">
                                    {prop.label}
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {prop.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Implementation note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : 0.3 }}
                    className="mt-12 pt-8 border-t border-border"
                >
                    <p className="text-xs text-muted-foreground font-mono">
                        <span className="text-primary">→</span>{' '}
                        Implementation: multi-tenant vector store · context isolation ·
                        scoped LLM generation · cited responses
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
