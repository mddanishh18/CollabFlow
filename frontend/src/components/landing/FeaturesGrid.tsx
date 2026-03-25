'use client';

import { useReducedMotion } from 'framer-motion';
import { type LucideIcon, FolderKanban, MessageSquare, CheckSquare, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollReveal } from './ScrollReveal';

interface Feature {
    icon: LucideIcon;
    title: string;
    description: string;
    wide?: boolean;
    detail?: React.ReactNode;
}

const features: Feature[] = [
    {
        icon: FolderKanban,
        title: 'Workspaces & Projects',
        description: 'Organize by team, client, or goal. Structured, accessible, and always in sync.',
        wide: true,
        detail: (
            <div className="mt-4 flex flex-col gap-1.5">
                {[
                    { name: 'Design System Refresh', status: 'In Progress' },
                    { name: 'API v3 Integration', status: 'Review' },
                    { name: 'Marketing Campaign Q2', status: 'To Do' },
                ].map(({ name, status }) => (
                    <div key={name} className="flex items-center justify-between text-xs">
                        <span className="text-foreground/80 truncate">{name}</span>
                        <span className="text-muted-foreground ml-3 shrink-0">{status}</span>
                    </div>
                ))}
            </div>
        ),
    },
    {
        icon: MessageSquare,
        title: 'Real-Time Chat',
        description: 'Public channels, private DMs, instant sync. Never miss a conversation.',
    },
    {
        icon: CheckSquare,
        title: 'Task Management',
        description: 'Organize tasks, set assignees and due dates. Track progress in real-time.',
    },
    {
        icon: Users,
        title: 'Live Collaboration',
        description: "See who's online, typing, and editing. Stay in sync with your team.",
        wide: true,
        detail: (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
                {[
                    { initials: 'SC', online: true },
                    { initials: 'AK', online: true },
                    { initials: 'MG', online: false },
                    { initials: 'JW', online: true },
                ].map(({ initials, online }) => (
                    <div key={initials} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <div className="relative">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-foreground">
                                {initials}
                            </div>
                            <span
                                className={cn(
                                    'absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-card',
                                    online ? 'bg-primary' : 'bg-muted-foreground/40'
                                )}
                            />
                        </div>
                        <span>{online ? 'Online' : 'Away'}</span>
                    </div>
                ))}
            </div>
        ),
    },
];

export function FeaturesGrid() {
    const shouldReduceMotion = useReducedMotion();

    return (
        <section className="py-24 sm:py-32 bg-linear-to-b from-background to-muted/30">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <ScrollReveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-12">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">
                            Everything your team needs.
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Built-in tools to collaborate, manage tasks, and ship — all in real-time.
                        </p>
                    </div>
                    <span className="text-sm text-muted-foreground shrink-0 sm:text-right">
                        One platform.
                        <br className="hidden sm:block" />
                        No integrations needed.
                    </span>
                </ScrollReveal>

                {/* Z-pattern grid: 2+1 / 1+2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {features.map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                            <ScrollReveal
                                key={feature.title}
                                delay={shouldReduceMotion ? 0 : i * 0.08}
                                className={cn(
                                    'rounded-xl border border-border bg-card p-6 transition-colors duration-200 hover:bg-accent/30',
                                    feature.wide && 'md:col-span-2'
                                )}
                            >
                                <Icon className="w-6 h-6 text-primary mb-4" />
                                <h3 className="text-base font-semibold text-foreground mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                                {feature.detail}
                            </ScrollReveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
