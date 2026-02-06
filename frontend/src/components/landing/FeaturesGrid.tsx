'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FolderKanban, MessageSquare, CheckSquare, Users } from 'lucide-react';

export function FeaturesGrid() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const features = [
        {
            icon: <FolderKanban className="h-10 w-10" />,
            title: 'Workspaces & Projects',
            description: 'Organize by team, client, or goal. Keep everything structured and accessible.',
            iconBg: 'from-blue-500 to-cyan-500',
        },
        {
            icon: <MessageSquare className="h-10 w-10" />,
            title: 'Real-Time Chat',
            description: 'Public channels, private DMs, instant sync. Never miss a conversation.',
            iconBg: 'from-purple-500 to-pink-500',
        },
        {
            icon: <CheckSquare className="h-10 w-10" />,
            title: 'Task Management',
            description: 'Organize tasks, set assignees and due dates. Track progress in real-time.',
            iconBg: 'from-green-500 to-emerald-500',
        },
        {
            icon: <Users className="h-10 w-10" />,
            title: 'Live Collaboration',
            description: 'See who\'s online, typing, editing. Stay in sync with your team.',
            iconBg: 'from-orange-500 to-red-500',
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
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

    return (
        <section ref={ref} className="py-24 sm:py-32 bg-gradient-to-b from-background to-muted/30">
            <div className="container px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={containerVariants}
                    className="mx-auto max-w-7xl"
                >
                    {/* Section Header */}
                    <motion.div variants={itemVariants} className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-6">
                            Everything Your Team Needs,{' '}
                            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                One Platform
                            </span>
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Built-in tools to collaborate, manage tasks, and ship faster — all in real-time
                        </p>
                    </motion.div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                variants={itemVariants}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="group relative"
                            >
                                <div className="h-full bg-card border-2 border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-xl transition-all">
                                    {/* Icon */}
                                    <div className="mb-4 relative">
                                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center text-white shadow-lg`}>
                                            {feature.icon}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-semibold text-foreground mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
