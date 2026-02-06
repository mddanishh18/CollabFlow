'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Bot, Database, Zap, Lock, GitBranch, FileSearch, MessageSquare, CheckCircle } from 'lucide-react';

export function RAGShowcase() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    const projects = [
        { icon: '📱', name: 'Mobile App Redesign', color: 'from-blue-500/20 to-cyan-500/20' },
        { icon: '🔧', name: 'Backend API v2', color: 'from-purple-500/20 to-pink-500/20' },
        { icon: '🌐', name: 'Marketing Website', color: 'from-green-500/20 to-emerald-500/20' },
        { icon: '💳', name: 'Payment Integration', color: 'from-orange-500/20 to-red-500/20' },
    ];

    return (
        <section id="rag-showcase" ref={ref} className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-b from-background via-accent/5 to-background">
            {/* Background decorative elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--accent)_0%,transparent_50%)] opacity-10" />

            <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={containerVariants}
                    className="mx-auto max-w-7xl"
                >
                    {/* Section Header */}
                    <motion.div variants={itemVariants} className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
                            <Bot className="h-4 w-4" />
                            <span>Coming Soon: Q2 2026</span>
                        </div>

                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                            Every Project Gets Its Own{' '}
                            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                                AI Teammate
                            </span>
                        </h2>

                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            RAG-powered chatbots scoped to each project — no hallucinations, just instant answers from your team's context
                        </p>
                    </motion.div>

                    {/* Project List Visual */}
                    <motion.div variants={itemVariants} className="mb-20">
                        <div className="max-w-2xl mx-auto bg-card border-2 border-border rounded-xl p-6 shadow-xl">
                            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground font-semibold">
                                <GitBranch className="h-4 w-4" />
                                <span>YOUR PROJECTS</span>
                            </div>
                            <div className="space-y-3">
                                {projects.map((project, index) => (
                                    <motion.div
                                        key={project.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                        transition={{ delay: 0.3 + index * 0.1 }}
                                        className={`flex items-center justify-between p-4 rounded-lg bg-gradient-to-r ${project.color} border border-border/50 hover:border-primary/50 transition-all group cursor-pointer`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{project.icon}</span>
                                            <span className="font-medium text-foreground">{project.name}</span>
                                        </div>
                                        <Bot className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* RAG Workflow Diagram */}
                    <motion.div variants={itemVariants} className="mb-20">
                        <h3 className="text-2xl font-bold text-center mb-8 text-foreground">How It Works</h3>
                        <div className="max-w-4xl mx-auto bg-card border-2 border-border rounded-xl p-8 shadow-xl">
                            <div className="space-y-6">
                                {/* Step 1 */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex items-start gap-4"
                                >
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg">
                                        1
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-foreground mb-1">Team Member Question</h4>
                                        <p className="text-muted-foreground italic">"What did we decide about authentication?"</p>
                                    </div>
                                </motion.div>

                                <div className="ml-6 border-l-2 border-dashed border-border h-8" />

                                {/* Step 2 */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                    transition={{ delay: 0.7 }}
                                    className="flex items-start gap-4"
                                >
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                        <Database className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-foreground mb-1">Project Scope Filter</h4>
                                        <p className="text-muted-foreground">Only searches "Backend API v2" project data</p>
                                    </div>
                                </motion.div>

                                <div className="ml-6 border-l-2 border-dashed border-border h-8" />

                                {/* Step 3 */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                    transition={{ delay: 0.9 }}
                                    className="flex items-start gap-4"
                                >
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                                        <FileSearch className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-foreground mb-1">Vector Search & Retrieval</h4>
                                        <p className="text-muted-foreground">Finds relevant messages, tasks, and decisions from project history</p>
                                    </div>
                                </motion.div>

                                <div className="ml-6 border-l-2 border-dashed border-border h-8" />

                                {/* Step 4 */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                    transition={{ delay: 1.1 }}
                                    className="flex items-start gap-4"
                                >
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                                        <Zap className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-foreground mb-1">LLM Generation</h4>
                                        <p className="text-muted-foreground">Creates accurate answer with context and citations</p>
                                    </div>
                                </motion.div>

                                <div className="ml-6 border-l-2 border-dashed border-border h-8" />

                                {/* Result */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                    transition={{ delay: 1.3 }}
                                    className="bg-primary/5 border-2 border-primary/30 rounded-lg p-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <Bot className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                                        <div>
                                            <p className="text-foreground mb-2">
                                                "We chose <strong>JWT with refresh tokens</strong> because of better security and stateless architecture."
                                            </p>
                                            <div className="text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle className="h-4 w-4 text-primary" />
                                                    Source: @SarahDev in #backend-chat, Task #247
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Key Differentiators Grid */}
                    <motion.div variants={itemVariants} className="mb-20">
                        <h3 className="text-2xl font-bold text-center mb-12 text-foreground">Why This Changes Everything</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    icon: <Database className="h-8 w-8" />,
                                    title: 'Project-Scoped Intelligence',
                                    description: 'Each bot only knows its project context. No cross-contamination.',
                                    iconBg: 'from-blue-500 to-cyan-500'
                                },
                                {
                                    icon: <MessageSquare className="h-8 w-8" />,
                                    title: 'Contextual Answers',
                                    description: 'Every response cites source messages, tasks, and docs.',
                                    iconBg: 'from-purple-500 to-pink-500'
                                },
                                {
                                    icon: <Zap className="h-8 w-8" />,
                                    title: 'Instant Onboarding',
                                    description: 'New devs ask "What\'s the stack?" and get instant answers.',
                                    iconBg: 'from-green-500 to-emerald-500'
                                },
                                {
                                    icon: <Lock className="h-8 w-8" />,
                                    title: 'Zero Hallucinations',
                                    description: 'Grounded in YOUR project data. No made-up information.',
                                    iconBg: 'from-orange-500 to-red-500'
                                },
                            ].map((feature, index) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ delay: 1.5 + index * 0.1 }}
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-card border-2 border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all"
                                >
                                    <div className={`mb-4 w-16 h-16 rounded-xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center text-white shadow-lg`}>
                                        {feature.icon}
                                    </div>
                                    <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* For Recruiters Callout */}
                    <motion.div
                        variants={itemVariants}
                        className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-2 border-primary/30 rounded-xl p-8"
                    >
                        <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                            <Zap className="h-6 w-6 text-primary" />
                            For Recruiters
                        </h3>
                        <p className="text-foreground mb-4">
                            This isn't just another ChatGPT wrapper. It's a <strong>scoped RAG implementation</strong> that demonstrates understanding of:
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                                <span>Multi-tenant vector databases</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                                <span>Context isolation \u0026 privacy</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                                <span>Production-grade LLM applications</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                                <span>Real-world AI product design</span>
                            </li>
                        </ul>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
