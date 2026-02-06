'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Code2 } from 'lucide-react';

export function TechStack() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const technologies = [
        { name: 'Next.js 15', color: 'from-gray-700 to-gray-900', textColor: 'text-white' },
        { name: 'TypeScript', color: 'from-blue-600 to-blue-800', textColor: 'text-white' },
        { name: 'Node.js', color: 'from-green-600 to-green-800', textColor: 'text-white' },
        { name: 'MongoDB', color: 'from-green-500 to-green-700', textColor: 'text-white' },
        { name: 'Socket.io', color: 'from-gray-800 to-black', textColor: 'text-white' },
        { name: 'RAG (LangChain)', color: 'from-purple-600 to-pink-600', textColor: 'text-white', badge: 'Coming' },
    ];

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
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5 }
        }
    };

    return (
        <section ref={ref} className="py-24 sm:py-32 bg-gradient-to-b from-muted/30 to-background">
            <div className="container px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={containerVariants}
                    className="mx-auto max-w-5xl text-center"
                >
                    {/* Section Header */}
                    <motion.div variants={itemVariants} className="mb-12">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
                            <Code2 className="h-4 w-4" />
                            <span>Built with Modern Tech</span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
                            Production-Ready Stack
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Built with industry-standard technologies for scalability, performance, and maintainability
                        </p>
                    </motion.div>

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-4 justify-center items-center">
                        {technologies.map((tech, index) => (
                            <motion.div
                                key={tech.name}
                                variants={itemVariants}
                                whileHover={{ scale: 1.1, rotate: [0, -2, 2, 0] }}
                                className="relative"
                            >
                                <div className={`px-6 py-3 rounded-full bg-gradient-to-r ${tech.color} ${tech.textColor} font-semibold shadow-lg hover:shadow-xl transition-all relative overflow-hidden group`}>
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative z-10">{tech.name}</span>
                                    {tech.badge && (
                                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-bold">
                                            {tech.badge}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
