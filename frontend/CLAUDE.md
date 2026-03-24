# Frontend-specific Rules

## Component Hierarchy
- `src/components/ui/` — shadcn/ui base components (do not modify unless adding variants)
- `src/components/auth/` — Login and register forms
- `src/components/chat/` — Real-time chat UI
- `src/components/task/` — Task board and cards
- `src/components/project/` — Project management UI
- `src/components/workspace/` — Sidebar, nav, workspace switcher
- `src/components/landing/` — Marketing/landing page sections

## Landing Page Components
HeroSection → BentoGrid → FeaturesGrid → RAGShowcase → TechStack → FinalCTA
These are the primary upgrade targets for visual improvements.

## Dashboard Components
Sidebar (workspace/sidebar.tsx) is the navigation backbone.
Workspace switcher, mobile nav, and connection status are in workspace/.

## Real-time Architecture
Socket hooks: `use-socket.ts`, `use-chat.ts`, `use-workspace-presence.ts`
Connection status component: `components/realtime/connection-status.tsx`
Never add direct socket calls outside these hooks.
