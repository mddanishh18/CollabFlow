'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
    MessageSquare,
    CheckSquare,
    FolderOpen,
    Bot,
    Building2,
    Database,
    Zap,
    Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Static data ──────────────────────────────────────────────────────────────

const FEATURES = [
    { id: 'workspace', label: 'Workspaces', Icon: Building2 },
    { id: 'chat', label: 'Chat', Icon: MessageSquare },
    { id: 'projects', label: 'Projects', Icon: FolderOpen },
    { id: 'tasks', label: 'Tasks', Icon: CheckSquare },
    { id: 'ai', label: 'AI', Icon: Bot },
] as const;

type FeatureId = (typeof FEATURES)[number]['id'];

const EVENTS: Record<FeatureId, string> = {
    workspace: 'New workspace created',
    chat: '3 messages sent',
    projects: 'Sprint updated',
    tasks: 'Task moved to Done',
    ai: 'Query answered · 680ms',
};

const USERS = [
    { initials: 'SK', online: true },
    { initials: 'AM', online: true },
    { initials: 'JR', online: false },
    { initials: 'MT', online: true },
];

const DATA_NODES = [
    { id: 'mongodb', label: 'MongoDB', Icon: Database },
    { id: 'redis', label: 'Redis', Icon: Zap },
    { id: 'vector', label: 'Vector Store', Icon: Brain },
];

const ROTATION: FeatureId[] = ['chat', 'tasks', 'projects', 'ai', 'workspace'];

// ─── SVG layout constants ─────────────────────────────────────────────────────

const SVG_W = 680;
const SVG_H = 420;
const UR = 22; // user circle radius

const UY = 58; // user tier center-y
const FY = 215; // feature tier center-y
const DY = 370; // data tier center-y

const UX = [85, 255, 425, 595] as const; // 4 users
const FX = [68, 204, 340, 476, 612] as const; // 5 features
const DX = [112, 340, 568] as const; // 3 data nodes

const FH = 24; // feature rect half-height
const FW = 44; // feature rect half-width
const DH = 18; // data rect half-height
const DW = 48; // data rect half-width

// Connection edges
const U_F_EDGES: [number, number][] = [
    [0, 0], [0, 1],
    [1, 1], [1, 2],
    [2, 2], [2, 3],
    [3, 3], [3, 4],
];

const F_D_EDGES: [number, number][] = [
    [0, 0], // Workspace → MongoDB
    [1, 1], // Chat → Redis
    [2, 0], // Projects → MongoDB
    [3, 1], // Tasks → Redis
    [4, 2], // AI → Vector Store
];

// ─── Animated travel dot ──────────────────────────────────────────────────────

function TravelDot({
    x1, y1, x2, y2, delay = 0,
}: {
    x1: number; y1: number; x2: number; y2: number; delay?: number;
}) {
    return (
        <motion.circle
            r={2.5}
            style={{ fill: 'var(--primary)' }}
            initial={{ cx: x1, cy: y1 }}
            animate={{
                cx: [x1, x2],
                cy: [y1, y2],
                opacity: [0, 1, 1, 0],
            }}
            transition={{
                duration: 1.2,
                repeat: Infinity,
                repeatDelay: 0.6,
                delay,
                ease: 'easeInOut',
                times: [0, 0.1, 0.85, 1],
            }}
        />
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductVisualization() {
    const shouldReduceMotion = useReducedMotion();
    const [activeIdx, setActiveIdx] = useState(0);
    const [eventVisible, setEventVisible] = useState(true);

    const activeId = ROTATION[activeIdx];
    const activeFIdx = FEATURES.findIndex((f) => f.id === activeId);

    useEffect(() => {
        if (shouldReduceMotion) return;
        const id = setInterval(() => {
            setEventVisible(false);
            setTimeout(() => {
                setActiveIdx((i) => (i + 1) % ROTATION.length);
                setEventVisible(true);
            }, 350);
        }, 2200);
        return () => clearInterval(id);
    }, [shouldReduceMotion]);

    const activeUF = U_F_EDGES.filter(([, fi]) => fi === activeFIdx);
    const activeFD = F_D_EDGES.filter(([fi]) => fi === activeFIdx);

    // Event bubble position as % of container (mapped from SVG coords)
    const eventPctX = (FX[activeFIdx] / SVG_W) * 100;
    const eventPctY = ((FY - FH - 20) / SVG_H) * 100;

    return (
        <section id="product-visualization" className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <motion.div
                    className="mb-16"
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: '-60px' }}
                    transition={{ duration: 0.5 }}
                >
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                        Platform
                    </p>
                    <h2
                        className="text-4xl sm:text-5xl font-bold text-foreground mb-4"
                        style={{ letterSpacing: '-0.03em' }}
                    >
                        One platform. Everything connected.
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                        Every feature works together in real-time — chat, tasks, projects, and AI.
                    </p>
                </motion.div>

                {/* ── Desktop visualization ── */}
                <div className="hidden md:flex justify-center">
                    <div
                        className="relative w-full"
                        style={{ maxWidth: SVG_W, aspectRatio: `${SVG_W} / ${SVG_H}` }}
                    >
                        <svg
                            viewBox={`-50 0 ${SVG_W + 50} ${SVG_H}`}
                            className="absolute inset-0 w-full h-full overflow-visible"
                            style={{ fontFamily: 'inherit' }}
                            aria-hidden="true"
                        >
                            {/* ── Tier labels ── */}
                            {(
                                [
                                    { label: 'USERS', y: UY },
                                    { label: 'PLATFORM', y: FY },
                                    { label: 'DATA', y: DY },
                                ] as const
                            ).map(({ label, y }) => (
                                <text
                                    key={label}
                                    x={-42}
                                    y={y}
                                    dominantBaseline="central"
                                    fontSize={7}
                                    fontWeight={600}
                                    letterSpacing={1.5}
                                    style={{ fill: 'var(--muted-foreground)', opacity: 0.75 }}
                                >
                                    {label}
                                </text>
                            ))}

                            {/* ── Connection lines: user → feature ── */}
                            {U_F_EDGES.map(([ui, fi], idx) => {
                                const isActive = fi === activeFIdx;
                                return (
                                    <motion.line
                                        key={`uf-${idx}`}
                                        x1={UX[ui]}
                                        y1={UY + UR}
                                        x2={FX[fi]}
                                        y2={FY - FH}
                                        style={{ stroke: 'var(--primary)' }}
                                        strokeWidth={isActive ? 1.5 : 1}
                                        animate={{ opacity: isActive ? 0.5 : 0.1 }}
                                        transition={{ duration: 0.4 }}
                                    />
                                );
                            })}

                            {/* ── Connection lines: feature → data ── */}
                            {F_D_EDGES.map(([fi, di], idx) => {
                                const isActive = fi === activeFIdx;
                                return (
                                    <motion.line
                                        key={`fd-${idx}`}
                                        x1={FX[fi]}
                                        y1={FY + FH}
                                        x2={DX[di]}
                                        y2={DY - DH}
                                        style={{ stroke: 'var(--primary)' }}
                                        strokeWidth={isActive ? 1.5 : 1}
                                        animate={{ opacity: isActive ? 0.5 : 0.1 }}
                                        transition={{ duration: 0.4 }}
                                    />
                                );
                            })}

                            {/* ── Travel dots on active connections ── */}
                            {!shouldReduceMotion &&
                                activeUF.map(([ui, fi], idx) => (
                                    <TravelDot
                                        key={`dot-uf-${activeId}-${idx}`}
                                        x1={UX[ui]}
                                        y1={UY + UR}
                                        x2={FX[fi]}
                                        y2={FY - FH}
                                        delay={idx * 0.45}
                                    />
                                ))}

                            {!shouldReduceMotion &&
                                activeFD.map(([fi, di], idx) => (
                                    <TravelDot
                                        key={`dot-fd-${activeId}-${idx}`}
                                        x1={FX[fi]}
                                        y1={FY + FH}
                                        x2={DX[di]}
                                        y2={DY - DH}
                                        delay={idx * 0.45 + 0.3}
                                    />
                                ))}

                            {/* ── User nodes ── */}
                            {USERS.map((user, i) => {
                                const isConnected = U_F_EDGES.some(
                                    ([ui, fi]) => ui === i && fi === activeFIdx
                                );
                                return (
                                    <g key={`user-${i}`}>
                                        <motion.circle
                                            cx={UX[i]}
                                            cy={UY}
                                            r={UR}
                                            style={{
                                                fill: 'var(--muted)',
                                                stroke: isConnected
                                                    ? 'var(--primary)'
                                                    : 'var(--border)',
                                            }}
                                            strokeWidth={1.5}
                                            animate={{ opacity: isConnected ? 1 : 0.55 }}
                                            transition={{ duration: 0.4 }}
                                        />
                                        <text
                                            x={UX[i]}
                                            y={UY + 1}
                                            textAnchor="middle"
                                            dominantBaseline="central"
                                            fontSize={9}
                                            fontWeight={600}
                                            style={{ fill: 'var(--foreground)' }}
                                        >
                                            {user.initials}
                                        </text>
                                        {/* Presence dot */}
                                        <circle
                                            cx={UX[i] + UR - 6}
                                            cy={UY - UR + 6}
                                            r={5}
                                            style={{
                                                fill: user.online
                                                    ? 'var(--primary)'
                                                    : 'var(--muted-foreground)',
                                                stroke: 'var(--background)',
                                                strokeWidth: 2,
                                                opacity: user.online ? 1 : 0.4,
                                            }}
                                        />
                                    </g>
                                );
                            })}

                            {/* ── Feature nodes ── */}
                            {FEATURES.map((feature, i) => {
                                const isActive = i === activeFIdx;
                                return (
                                    <g key={`feature-${i}`}>
                                        {/* Glow ring */}
                                        {isActive && !shouldReduceMotion && (
                                            <motion.rect
                                                x={FX[i] - FW - 5}
                                                y={FY - FH - 5}
                                                width={FW * 2 + 10}
                                                height={FH * 2 + 10}
                                                rx={11}
                                                fill="none"
                                                style={{ stroke: 'var(--primary)' }}
                                                strokeWidth={1}
                                                animate={{ opacity: [0.15, 0.45, 0.15] }}
                                                transition={{
                                                    duration: 1.8,
                                                    repeat: Infinity,
                                                    ease: 'easeInOut',
                                                }}
                                            />
                                        )}
                                        {/* Card */}
                                        <motion.rect
                                            x={FX[i] - FW}
                                            y={FY - FH}
                                            width={FW * 2}
                                            height={FH * 2}
                                            rx={8}
                                            style={{
                                                fill: 'var(--card)',
                                                stroke: isActive
                                                    ? 'var(--primary)'
                                                    : 'var(--border)',
                                            }}
                                            strokeWidth={1.5}
                                            animate={{ opacity: isActive ? 1 : 0.72 }}
                                            transition={{ duration: 0.4 }}
                                        />
                                        {/* Label */}
                                        <text
                                            x={FX[i]}
                                            y={FY + 2}
                                            textAnchor="middle"
                                            dominantBaseline="central"
                                            fontSize={9.5}
                                            fontWeight={isActive ? 600 : 400}
                                            style={{
                                                fill: isActive
                                                    ? 'var(--foreground)'
                                                    : 'var(--muted-foreground)',
                                            }}
                                        >
                                            {feature.label}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* ── Data nodes ── */}
                            {DATA_NODES.map((node, i) => {
                                const isActive = activeFD.some(([, di]) => di === i);
                                return (
                                    <g key={`data-${i}`}>
                                        <motion.rect
                                            x={DX[i] - DW}
                                            y={DY - DH}
                                            width={DW * 2}
                                            height={DH * 2}
                                            rx={6}
                                            style={{
                                                fill: 'var(--muted)',
                                                stroke: 'var(--border)',
                                            }}
                                            strokeWidth={1}
                                            animate={{ opacity: isActive ? 1 : 0.4 }}
                                            transition={{ duration: 0.4 }}
                                        />
                                        <text
                                            x={DX[i]}
                                            y={DY + 1}
                                            textAnchor="middle"
                                            dominantBaseline="central"
                                            fontSize={9}
                                            fontWeight={500}
                                            style={{ fill: 'var(--muted-foreground)' }}
                                        >
                                            {node.label}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>

                        {/* ── Event bubble (HTML overlay) ── */}
                        <AnimatePresence>
                            {eventVisible && !shouldReduceMotion && (
                                <motion.div
                                    key={activeId}
                                    className="absolute pointer-events-none z-10"
                                    style={{
                                        left: `${eventPctX}%`,
                                        top: `${eventPctY}%`,
                                        transform: 'translateX(-50%)',
                                    }}
                                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="bg-primary text-primary-foreground text-[10px] leading-none px-2.5 py-1.5 rounded-full font-medium whitespace-nowrap shadow-md">
                                        {EVENTS[activeId]}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── Mobile fallback ── */}
                <div className="md:hidden space-y-4">
                    <div className="grid grid-cols-2 gap-2.5">
                        {FEATURES.map((feature) => {
                            const { Icon } = feature;
                            const isActive = feature.id === activeId;
                            return (
                                <div
                                    key={feature.id}
                                    className={cn(
                                        'flex items-center gap-2.5 rounded-xl border bg-card p-3.5 transition-colors duration-300',
                                        isActive
                                            ? 'border-primary/40 bg-primary/5'
                                            : 'border-border'
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            'w-4 h-4 shrink-0',
                                            isActive ? 'text-primary' : 'text-muted-foreground'
                                        )}
                                    />
                                    <span className="text-sm font-medium text-foreground">
                                        {feature.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex flex-wrap gap-5 pt-1">
                        {DATA_NODES.map((node) => {
                            const { Icon } = node;
                            return (
                                <div
                                    key={node.id}
                                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                                >
                                    <Icon className="w-3 h-3" />
                                    <span>{node.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
