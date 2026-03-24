'use client';

import { motion } from 'framer-motion';
import { FolderKanban, Hash, Users, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
    },
};

// --- Static data (no Math.random — hydration safe) ---

const workspaces = [
    { name: 'Design Team', projects: 5 },
    { name: 'Engineering', projects: 8 },
    { name: 'Marketing', projects: 4 },
];

const kanbanColumns = [
    {
        label: 'To Do',
        count: 3,
        dotClass: 'bg-muted-foreground/50',
        tasks: [
            { title: 'Auth refactor', progress: null },
            { title: 'API rate limiting', progress: null },
            { title: 'DB migrations', progress: null },
        ],
    },
    {
        label: 'In Progress',
        count: 2,
        dotClass: 'bg-primary',
        tasks: [
            { title: 'Workspace settings', progress: 65 },
            { title: 'Message reactions', progress: 40 },
        ],
    },
    {
        label: 'Review',
        count: 1,
        dotClass: 'bg-muted-foreground/30',
        tasks: [
            { title: 'File uploads v2', progress: null },
        ],
    },
];

const teamMembers = [
    { name: 'Sarah Chen', role: 'Designer', online: true },
    { name: 'Alex Kumar', role: 'Developer', online: true },
    { name: 'Maria Garcia', role: 'PM', online: false },
    { name: 'James Wilson', role: 'Developer', online: true },
    { name: 'Emily Taylor', role: 'Marketing', online: false },
];

const channels = ['general', 'development', 'design', 'random'];

export function BentoGrid() {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-5 gap-3 max-w-5xl mx-auto"
        >
            {/* ── Dominant cell: Kanban task board mockup ── */}
            <motion.div
                variants={itemVariants}
                className="md:col-span-3 md:row-span-2 flex flex-col border border-border bg-card rounded-xl p-6 overflow-hidden shadow-sm"
            >
                {/* Header */}
                <div className="flex items-center gap-2 mb-4 shrink-0">
                    <FolderKanban className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Engineering Sprint</span>
                    <span className="ml-auto text-xs text-muted-foreground">Q1 2026</span>
                </div>

                {/* Kanban columns */}
                <div className="flex gap-3 flex-1 min-h-0">
                    {kanbanColumns.map((col) => (
                        <div key={col.label} className="flex flex-col flex-1 min-w-0">
                            {/* Column header */}
                            <div className="flex items-center gap-1.5 mb-2.5">
                                <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', col.dotClass)} />
                                <span className="text-xs font-medium text-muted-foreground truncate">
                                    {col.label}
                                </span>
                                <span className="ml-auto text-xs text-muted-foreground">{col.count}</span>
                            </div>

                            {/* Task cards */}
                            <div className="flex flex-col gap-2">
                                {col.tasks.map((task) => (
                                    <div
                                        key={task.title}
                                        className="rounded-md border border-border/60 bg-background/70 p-2.5"
                                    >
                                        <p className="text-xs text-foreground leading-snug">{task.title}</p>
                                        {task.progress !== null && (
                                            <div className="mt-2 h-0.5 w-full rounded-full bg-border overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-primary"
                                                    style={{ width: `${task.progress}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* ── Team Online ── */}
            <motion.div
                variants={itemVariants}
                className="md:col-span-2 border border-border bg-card rounded-xl p-5 transition-colors duration-200 hover:bg-accent/20"
            >
                <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Team Online</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                        {teamMembers.filter((m) => m.online).length} of {teamMembers.length}
                    </span>
                </div>
                <div className="flex flex-col gap-1.5">
                    {teamMembers.map((user) => (
                        <div
                            key={user.name}
                            className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-accent/30 transition-colors"
                        >
                            <div className="relative shrink-0">
                                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground">
                                    {user.name[0]}
                                </div>
                                <span
                                    className={cn(
                                        'absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-card',
                                        user.online ? 'bg-primary' : 'bg-muted-foreground/30'
                                    )}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">{user.name}</p>
                                <p className="text-[10px] text-muted-foreground">{user.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* ── Channels ── */}
            <motion.div
                variants={itemVariants}
                className="md:col-span-2 border border-border bg-card rounded-xl p-5"
            >
                <div className="flex items-center gap-2 mb-3">
                    <Hash className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Channels</span>
                </div>
                <div className="flex flex-col gap-1">
                    {channels.map((channel, i) => (
                        <div
                            key={channel}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent/20 transition-colors cursor-pointer"
                        >
                            <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-sm text-foreground">{channel}</span>
                            {i === 0 && (
                                <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none">
                                    12
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* ── AI Assistant Preview ── */}
            <motion.div
                variants={itemVariants}
                className="md:col-span-5 border border-border/40 bg-muted/50 rounded-xl p-5 transition-colors duration-200 hover:border-primary/30"
            >
                <div className="flex items-start gap-4">
                    <div className="shrink-0 mt-0.5">
                        <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm font-semibold text-foreground">AI Project Assistant</span>
                            <Badge variant="secondary" className="text-[10px] px-2 py-0">
                                Coming Q2 2026
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                            Ask questions about your project's history, decisions, and context.
                        </p>
                        <div className="border border-border/50 rounded-lg p-3 bg-background/50">
                            <p className="text-xs text-muted-foreground italic mb-2">
                                "What did we decide about the authentication flow?"
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <span className="text-xs text-primary font-medium">Thinking...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
