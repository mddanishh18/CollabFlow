# Project: Collaborative Workspace App

Full-stack monorepo. Frontend is Next.js 16 (App Router) deployed on Vercel.
Backend is Express + Socket.IO + MongoDB + Redis deployed separately.

## Monorepo Structure
- `frontend/` — Next.js 16 app with React 19, shadcn/ui, Tailwind CSS v4, Zustand, TanStack Query
- `backend/` — Express TypeScript API with Socket.IO real-time, MongoDB via Mongoose, Redis

## Frontend Stack (IMPORTANT — do not deviate)
- Next.js 16.1.1 with React 19 and App Router
- shadcn/ui (Radix UI primitives) — components in `frontend/src/components/ui/`
- Tailwind CSS v4 with tw-animate-css
- Zustand v5 for global state (`frontend/src/store/`)
- TanStack Query v5 for server state
- Framer Motion v12 for animations
- react-hook-form + zod v4 for forms
- next-themes for dark/light mode
- Socket.IO client for real-time features
- TypeScript strict mode throughout

## Color Scheme — NEVER CHANGE THIS
Preserve the existing CSS variables defined in `frontend/src/app/globals.css`.
When upgrading components, ONLY adjust layout, spacing, typography, and animation.
Do NOT change `--background`, `--foreground`, `--primary`, `--secondary`,
`--accent`, `--muted`, `--card`, or any color-related CSS variables.
Check the current values before touching any color.

## Frontend Commands
```bash
cd frontend
npm run dev       # Start dev server (port 3000)
npm run build     # Production build
npm run lint      # ESLint check
```

## Code Style
- TypeScript strict mode — no `any` types
- Named exports only (no default exports except page components)
- Functional components with hooks, no class components
- Import order: React → third-party → internal (absolute) → relative
- Use `cn()` utility from `@/lib/utils` for conditional Tailwind classes
- Server Components by default; add `"use client"` only when necessary
- All new components must be in `frontend/src/components/`

## Architecture Rules
- State: Zustand stores in `frontend/src/store/` — do not add new state libraries
- API calls: axios via `frontend/src/lib/api.ts` — do not call APIs directly in components
- Real-time: Socket.IO client via `frontend/src/lib/socket.ts` and hooks in `src/hooks/`
- Do NOT touch backend code unless explicitly asked

## Testing
No test suite currently set up. Run TypeScript check manually:
```bash
cd frontend && npx tsc --noEmit
```

## Important Notes
- `reactStrictMode: false` in next.config.mjs — intentional, prevents double-mount issues with Socket.IO
- `reactCompiler: true` is enabled — avoid patterns that break the React Compiler
- Vercel deployment: frontend is the root deploy target
- NEVER commit `.env.local` or `.env` files
