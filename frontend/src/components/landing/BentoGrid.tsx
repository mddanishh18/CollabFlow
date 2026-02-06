'use client';

import { motion } from 'framer-motion';
import { FolderKanban, Hash, Users, Bot, Circle } from 'lucide-react';

export function BentoGrid() {
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

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-6 gap-4 max-w-5xl mx-auto"
        >
            {/* Workspace Selector - Large Card */}
            <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="md:col-span-3 bg-card border-2 border-border rounded-xl p-6 hover:border-primary/50 transition-all"
            >
                <div className="flex items-center gap-2 mb-4">
                    <FolderKanban className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Your Workspaces</h3>
                </div>
                <div className="space-y-3">
                    {['Design Team', 'Engineering', 'Marketing'].map((name, i) => (
                        <div
                            key={name}
                            className="flex items-center gap-3 p-3 bg-accent/5 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                                {name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">{name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {Math.floor(Math.random() * 5) + 3} projects
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Online Users - Tall Card */}
            <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="md:col-span-3 md:row-span-2 bg-card border-2 border-border rounded-xl p-6 hover:border-primary/50 transition-all"
            >
                <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Team Online</h3>
                </div>
                <div className="space-y-3">
                    {[
                        { name: 'Sarah Chen', role: 'Designer', online: true },
                        { name: 'Alex Kumar', role: 'Developer', online: true },
                        { name: 'Maria Garcia', role: 'PM', online: false },
                        { name: 'James Wilson', role: 'Developer', online: true },
                        { name: 'Emily Taylor', role: 'Marketing', online: false },
                    ].map((user) => (
                        <div
                            key={user.name}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/5 transition-colors"
                        >
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-sm font-semibold">
                                    {user.name[0]}
                                </div>
                                <Circle
                                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 ${user.online ? 'fill-green-500 text-green-500' : 'fill-muted text-muted'
                                        }`}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Channels List - Medium Card */}
            <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="md:col-span-3 bg-card border-2 border-border rounded-xl p-6 hover:border-primary/50 transition-all"
            >
                <div className="flex items-center gap-2 mb-4">
                    <Hash className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Channels</h3>
                </div>
                <div className="space-y-2">
                    {['general', 'development', 'design', 'random'].map((channel, i) => (
                        <div
                            key={channel}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer"
                        >
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">{channel}</span>
                            {i === 0 && (
                                <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                                    12
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* AI Assistant Preview - Wide Card */}
            <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="md:col-span-6 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-2 border-primary/30 rounded-xl p-6 hover:border-primary/50 transition-all relative overflow-hidden"
            >
                <div className="absolute top-2 right-2">
                    <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-semibold">
                        Coming Q2 2026
                    </span>
                </div>
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Bot className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">AI Project Assistant</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Ask questions about your project's history, decisions, and context
                        </p>
                        <div className="bg-card/50 border border-border/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground italic">
                                "What did we decide about the authentication flow?"
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-xs text-primary font-medium">AI is thinking...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
