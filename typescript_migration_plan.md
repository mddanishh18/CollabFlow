# TypeScript Migration Plan
## CollabFlow - JavaScript to TypeScript Full Migration

> **Estimated Time:** 3-4 hours
> **Risk Level:** Medium (mitigated by phased approach)
> **Strategy:** Bottom-up migration (types → libs → stores → hooks → components → pages)
> **Research Date:** January 2026

---

## 🔬 Research-Based Best Practices

### Key Migration Strategies (Industry Best Practices 2024-2026)

Based on extensive research from dev.to, Medium, Microsoft, Mongoose docs, and Zustand documentation:

#### 1. Incremental Adoption is Paramount
- **Don't rewrite everything at once** - TypeScript supports gradual transition
- **Enable `allowJs` and `checkJs`** in tsconfig to allow JS/TS coexistence initially
- Start with utility functions, isolated modules, and non-UI logic
- Prioritize files with clearer contracts and fewer dependencies

#### 2. Configuration First Approach
- Install TypeScript and create `tsconfig.json` before touching any code
- Configure ESLint with `@typescript-eslint` plugin
- Ensure build tools (Webpack, Next.js, etc.) handle `.ts` and `.tsx` files
- Use `ts-node-dev` for Express.js development workflow

#### 3. Type Annotations Strategy
- Start with function arguments, return types, and object shapes
- Use JSDoc comments for JS files that haven't been converted yet
- Avoid `any` type - prefer `unknown` for safer handling
- Use interfaces for objects, type aliases for unions and primitives

#### 4. Strict Mode Gradual Enablement
- Start with less strict settings to ease initial migration
- Enable `strictNullChecks` and `noImplicitAny` progressively
- Goal: Full strict mode for maximum type safety

---

### ⚠️ Common Pitfalls to AVOID

| Pitfall | Why It's Bad | Solution |
|---------|--------------|----------|
| **Overusing `any`** | Defeats TypeScript's purpose | Use `unknown`, proper types, or generics |
| **Misusing `as Type`** | Runtime errors if wrong | Use type guards instead |
| **Skipping strict mode** | Weakens type safety | Enable gradually, not skip entirely |
| **Ignoring `undefined`/`null`** | Runtime crashes | Proper type narrowing and null checks |
| **All-at-once migration** | Overwhelming, breaks things | Gradual, file-by-file approach |
| **Missing `@types` packages** | Type errors for libs | Install before migrating files |
| **Overcomplicating generics** | Hard to understand code | Start simple, add complexity as needed |
| **Not using `readonly`** | Unintended mutations | Mark immutable properties as readonly |

---

### 🎯 Technology-Specific Guidelines

#### Next.js Migration (App Router)
```typescript
// Page props typing for dynamic routes
interface PageProps {
  params: { workspaceId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function Page({ params }: PageProps) {
  // ...
}
```

#### Express.js Backend
- Use `ts-node-dev` for hot-reload during development
- Replace `require()` with ES module `import` syntax
- Set `esModuleInterop: true` for CommonJS compatibility
- Create `AuthenticatedRequest` interface extending Express `Request`

```typescript
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    _id: Types.ObjectId;
    email: string;
    name: string;
  };
}
```

#### Mongoose Models (Critical Pattern)
- **Do NOT extend `mongoose.Document`** directly in interfaces
- Use separate interfaces for raw data, methods, and statics
- Use `HydratedDocument<T>` for document instances

```typescript
// Raw document interface (pure data shape)
interface IUser {
  name: string;
  email: string;
  password: string;
}

// Methods interface
interface IUserMethods {
  comparePassword(password: string): Promise<boolean>;
}

// Model type with methods and statics
type UserModel = Model<IUser, {}, IUserMethods>;

// Create schema with generics
const userSchema = new Schema<IUser, UserModel, IUserMethods>({...});
```

#### Zustand Stores
- Define store interface with state AND actions together
- Use the `create<StoreInterface>()` generic pattern
- Type the persist middleware properly

```typescript
interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  // Actions
  setWorkspaces: (workspaces: Workspace[]) => void;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
}

const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      workspaces: [],
      currentWorkspace: null,
      setWorkspaces: (workspaces) => set({ workspaces }),
      setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
    }),
    { name: 'workspace-storage' }
  )
);
```

---

### 🚀 Migration Order (Research-Backed)

The research confirms our bottom-up approach:

1. **Types/Interfaces first** - Foundation for everything else
2. **Utilities/Libs** - Low dependencies, high reuse
3. **Stores** - Central state, used by many components
4. **Hooks** - Business logic layer
5. **Components** - UI layer (depends on hooks/stores)
6. **Pages** - Top-level, highest dependencies

---



## 📊 Project Inventory

### Frontend Files (45 files)

| Category | Files | Priority |
|----------|-------|----------|
| **App Pages** | 10 | Phase 5 |
| **Components - UI** | 20 | Phase 4 |
| **Components - Feature** | 15 | Phase 4 |
| **Hooks** | 4 | Phase 3 |
| **Stores** | 3 | Phase 3 |
| **Lib/Utils** | 2 | Phase 2 |

### Backend Files (17 files)

| Category | Files | Priority |
|----------|-------|----------|
| **Models** | 3 | Phase 2 |
| **Controllers** | 3 | Phase 3 |
| **Routes** | 3 | Phase 4 |
| **Middleware** | 2 | Phase 3 |
| **Utils** | 3 | Phase 2 |
| **Config** | 2 | Phase 1 |
| **Entry Points** | 2 | Phase 5 |

---

## 🎯 Phase Overview

```
Phase 1: Configuration Setup
Phase 2: Types & Interfaces Definition
Phase 3: Stores, Hooks, Utilities
Phase 4: Components
Phase 5: Pages & Entry Points
Phase 6: Testing & Cleanup
```

---

## 📁 Phase 1: Configuration Setup

### 1.1 Frontend TypeScript Configuration

**New Files to Create:**
- `frontend/tsconfig.json`

**Files to Modify:**
- `frontend/package.json` - Add TypeScript dependencies
- `frontend/next.config.js` → `frontend/next.config.ts` (optional, can stay .js)

**Dependencies to Install:**
```bash
npm install --save-dev typescript @types/node @types/react @types/react-dom
```

**tsconfig.json Content:**
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    },
    "baseUrl": "."
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

### 1.2 Backend TypeScript Configuration

**New Files to Create:**
- `backend/tsconfig.json`
- `backend/src/types/index.ts`

**Files to Modify:**
- `backend/package.json` - Add TypeScript dependencies

**Dependencies to Install:**
```bash
npm install --save-dev typescript @types/node @types/express @types/bcryptjs @types/jsonwebtoken @types/cors
npm install --save-dev ts-node-dev @types/mongoose
```

**tsconfig.json Content:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Update package.json scripts:**
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

---

## 📁 Phase 2: Types & Interfaces Definition

### 2.1 Frontend Types

**Create: `frontend/src/types/index.ts`**

```typescript
// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: 'user' | 'admin';
  workspaces: string[];
  isEmailVerified: boolean;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Workspace Types
export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface WorkspaceMember {
  user: User | string;
  role: WorkspaceRole;
  joinedAt: Date;
}

export interface WorkspaceInvitation {
  email: string;
  role: Exclude<WorkspaceRole, 'owner'>;
  invitedBy: User | string;
  token: string;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface WorkspaceSettings {
  isPublic: boolean;
  allowMemberInvites: boolean;
  defaultProjectVisibility: 'private' | 'workspace' | 'public';
}

export interface Workspace {
  _id: string;
  name: string;
  description: string;
  owner: User | string;
  members: WorkspaceMember[];
  invitations: WorkspaceInvitation[];
  settings: WorkspaceSettings;
  isArchived: boolean;
  userRole?: WorkspaceRole;
  createdAt: Date;
  updatedAt: Date;
}

// Project Types
export type ProjectRole = 'owner' | 'editor' | 'viewer';
export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'archived';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectVisibility = 'private' | 'workspace' | 'public';

export interface ProjectMember {
  user: User | string;
  role: ProjectRole;
  addedAt: Date;
}

export interface ProjectSettings {
  allowComments: boolean;
  notifyOnTaskUpdate: boolean;
  enableRealTimeEditing: boolean;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  workspace: Workspace | string;
  owner: User | string;
  members: ProjectMember[];
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: Date | null;
  dueDate: Date | null;
  progress: number;
  tags: string[];
  color: string;
  visibility: ProjectVisibility;
  settings: ProjectSettings;
  isArchived: boolean;
  userRole?: ProjectRole;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Component Props Types
export interface DialogProps {
  open: boolean;
  onClose: () => void;
}
```

---

### 2.2 Backend Types

**Create: `backend/src/types/index.ts`**

```typescript
import { Request } from 'express';
import { Types, Document } from 'mongoose';

// Extended Request with user
export interface AuthenticatedRequest extends Request {
  user: {
    _id: Types.ObjectId;
    email: string;
    name: string;
  };
}

// User Document Interface
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar?: string | null;
  role: 'user' | 'admin';
  workspaces: Types.ObjectId[];
  isEmailVerified: boolean;
  lastActive: Date;
}

// Workspace Types
export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface IWorkspaceMember {
  user: Types.ObjectId | IUser;
  role: WorkspaceRole;
  joinedAt: Date;
}

export interface IWorkspaceInvitation {
  email: string;
  role: Exclude<WorkspaceRole, 'owner'>;
  invitedBy: Types.ObjectId;
  token: string;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface IWorkspace extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  owner: Types.ObjectId | IUser;
  members: IWorkspaceMember[];
  invitations: IWorkspaceInvitation[];
  settings: {
    isPublic: boolean;
    allowMemberInvites: boolean;
    defaultProjectVisibility: 'private' | 'workspace' | 'public';
  };
  isArchived: boolean;
  isMember(userId: Types.ObjectId | string): boolean;
  getMemberRole(userId: Types.ObjectId | string): WorkspaceRole | null;
  hasPermission(userId: Types.ObjectId | string, permission: string): boolean;
}

// Project Types
export type ProjectRole = 'owner' | 'editor' | 'viewer';
export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'archived';

export interface IProjectMember {
  user: Types.ObjectId | IUser;
  role: ProjectRole;
  addedAt: Date;
}

export interface IProject extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  workspace: Types.ObjectId | IWorkspace;
  owner: Types.ObjectId | IUser;
  members: IProjectMember[];
  status: ProjectStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: Date | null;
  dueDate: Date | null;
  progress: number;
  tags: string[];
  color: string;
  visibility: 'private' | 'workspace' | 'public';
  settings: {
    allowComments: boolean;
    notifyOnTaskUpdate: boolean;
    enableRealTimeEditing: boolean;
  };
  isArchived: boolean;
  isMember(userId: Types.ObjectId | string): boolean;
  getMemberRole(userId: Types.ObjectId | string): ProjectRole | null;
  canEdit(userId: Types.ObjectId | string): boolean;
  canView(userId: Types.ObjectId | string): boolean;
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}
```

---

### Phase 3: Stores, Hooks, Utilities

### 3.1 Frontend - Stores (3 files)

**Migrate in order:**

| # | From | To | Changes |
|---|------|----|---------|
| 1 | `store/auth-store.js` | `store/auth-store.ts` | Add User type, login params type |
| 2 | `store/workspace-store.js` | `store/workspace-store.ts` | Add Workspace, WorkspaceMember types |
| 3 | `store/project-store.js` | `store/project-store.ts` | Add Project, ProjectMember types |

**Key Changes:**
- Import types from `@/types`
- Type the store state and actions
- Type the `create()` function with `StateCreator`

---

### 3.2 Frontend - Hooks (4 files)

| # | From | To | Changes |
|---|------|----|---------|
| 1 | `hooks/use-toast.js` | `hooks/use-toast.ts` | Add Toast type |
| 2 | `hooks/use-theme.js` | `hooks/use-theme.ts` | Add Theme type |
| 3 | `hooks/use-workspace.js` | `hooks/use-workspace.ts` | Add return types, params types |
| 4 | `hooks/use-projects.js` | `hooks/use-projects.ts` | Add return types, params types |

---

### 3.3 Frontend - Lib/Utils (2 files)

| # | From | To | Changes |
|---|------|----|---------|
| 1 | `lib/api.js` | `lib/api.ts` | Type axios instance, ApiResponse |
| 2 | `lib/utils.js` | `lib/utils.ts` | Type cn() function parameters |

---

### 3.4 Backend - Utils (3 files)

| # | From | To | Changes |
|---|------|----|---------|
| 1 | `utils/jwt.js` | `utils/jwt.ts` | Add JwtPayload type |
| 2 | `utils/bcrypt.js` | `utils/bcrypt.ts` | Type parameters and returns |
| 3 | `utils/validationSchemas.js` | `utils/validationSchemas.ts` | Import z.infer for schema types |

---

### 3.5 Backend - Middleware (2 files)

| # | From | To | Changes |
|---|------|----|---------|
| 1 | `middleware/auth.middleware.js` | `middleware/auth.middleware.ts` | Use AuthenticatedRequest |
| 2 | `middleware/validation.middleware.js` | `middleware/validation.middleware.ts` | Type Request, Response, NextFunction |

---

### 3.6 Backend - Config (2 files)

| # | From | To | Changes |
|---|------|----|---------|
| 1 | `config/db.js` | `config/db.ts` | Type mongoose connection |
| 2 | `config/env.js` | `config/env.ts` | Type environment variables |

---

## 📁 Phase 4: Components

### 4.1 UI Components (20 files)

**These are Shadcn components - minimal changes needed:**

All files in `components/ui/`:
- `alert-dialog.jsx` → `alert-dialog.tsx`
- `alert.jsx` → `alert.tsx`
- `avatar.jsx` → `avatar.tsx`
- `badge.jsx` → `badge.tsx`
- `button.jsx` → `button.tsx`
- `card.jsx` → `card.tsx`
- `checkbox.jsx` → `checkbox.tsx`
- `dialog.jsx` → `dialog.tsx`
- `dropdown-menu.jsx` → `dropdown-menu.tsx`
- `form.jsx` → `form.tsx`
- `input.jsx` → `input.tsx`
- `label.jsx` → `label.tsx`
- `progress.jsx` → `progress.tsx`
- `scroll-area.jsx` → `scroll-area.tsx`
- `select.jsx` → `select.tsx`
- `separator.jsx` → `separator.tsx`
- `skeleton.jsx` → `skeleton.tsx`
- `sonner.jsx` → `sonner.tsx`
- `tabs.jsx` → `tabs.tsx`
- `textarea.jsx` → `textarea.tsx`

**Changes:** Add `React.forwardRef` generic types, props interfaces

---

### 4.2 Theme Components (2 files)

| # | From | To | Changes |
|---|------|----|---------|
| 1 | `components/theme/theme-provider.jsx` | `theme-provider.tsx` | Type children prop |
| 2 | `components/theme/theme-toggle.jsx` | `theme-toggle.tsx` | Type useTheme return |

---

### 4.3 Auth Components (2 files)

| # | From | To | Changes |
|---|------|----|---------|
| 1 | `components/auth/login-form.jsx` | `login-form.tsx` | Type form values, handlers |
| 2 | `components/auth/register-form.jsx` | `register-form.tsx` | Type form values, handlers |

---

### 4.4 Workspace Components (5 files)

| # | From | To | Props to Type |
|---|------|----|---------------|
| 1 | `workspace/sidebar.jsx` | `sidebar.tsx` | None (uses hooks) |
| 2 | `workspace/workspace-switcher.jsx` | `workspace-switcher.tsx` | None (uses hooks) |
| 3 | `workspace/create-workspace-dialog.jsx` | `create-workspace-dialog.tsx` | `DialogProps` |
| 4 | `workspace/invite-member-dialog.jsx` | `invite-member-dialog.tsx` | `DialogProps & { workspaceId: string }` |
| 5 | `workspace/pending-invitations-dialog.jsx` | `pending-invitations-dialog.tsx` | `DialogProps` |

---

### 4.5 Project Components (6 files)

| # | From | To | Props to Type |
|---|------|----|---------------|
| 1 | `project/project-card.jsx` | `project-card.tsx` | `{ project: Project }` |
| 2 | `project/project-list.jsx` | `project-list.tsx` | `{ projects: Project[] }` |
| 3 | `project/create-project-dialog.jsx` | `create-project-dialog.tsx` | `DialogProps & { workspaceId: string }` |
| 4 | `project/add-project-members-dialog.jsx` | `add-project-members-dialog.tsx` | `DialogProps & { project: Project, ... }` |
| 5 | `project/project-members-dialog.jsx` | `project-members-dialog.tsx` | `DialogProps & { project: Project, ... }` |
| 6 | `project/index.js` | `index.ts` | Just re-exports |

---

## 📁 Phase 5: Pages & Entry Points

### 5.1 Frontend Pages (10 files)

**App Root:**
| # | From | To |
|---|------|----| 
| 1 | `app/layout.js` | `app/layout.tsx` |
| 2 | `app/page.jsx` | `app/page.tsx` |

**Auth Pages:**
| # | From | To |
|---|------|----| 
| 3 | `app/(auth)/login/page.jsx` | `page.tsx` |
| 4 | `app/(auth)/register/page.jsx` | `page.tsx` |

**Dashboard Pages:**
| # | From | To |
|---|------|----|
| 5 | `app/(dashboard)/layout.jsx` | `layout.tsx` |
| 6 | `app/(dashboard)/workspace/[workspaceId]/page.jsx` | `page.tsx` |
| 7 | `app/(dashboard)/workspace/[workspaceId]/projects/page.jsx` | `page.tsx` |
| 8 | `app/(dashboard)/workspace/[workspaceId]/projects/[projectId]/page.jsx` | `page.tsx` |
| 9 | `app/(dashboard)/workspace/[workspaceId]/members/page.jsx` | `page.tsx` |
| 10 | `app/(dashboard)/workspace/[workspaceId]/settings/page.jsx` | `page.tsx` |

**Changes:** Add params type for dynamic routes

```typescript
interface PageProps {
  params: { workspaceId: string };
}
```

---

### 5.2 Backend Models (3 files)

| # | From | To | Changes |
|---|------|----|---------|
| 1 | `models/User.js` | `models/User.ts` | Use IUser interface |
| 2 | `models/Workspace.js` | `models/Workspace.ts` | Use IWorkspace interface |
| 3 | `models/Project.js` | `models/Project.ts` | Use IProject interface |

---

### 5.3 Backend Controllers (3 files)

| # | From | To | Changes |
|---|------|----|---------|
| 1 | `controllers/authController.js` | `authController.ts` | Use AuthenticatedRequest |
| 2 | `controllers/workspaceController.js` | `workspaceController.ts` | Type all exports |
| 3 | `controllers/projectController.js` | `projectController.ts` | Type all exports |

---

### 5.4 Backend Routes (3 files)

| # | From | To | Changes |
|---|------|----|---------|
| 1 | `routes/auth.routes.js` | `auth.routes.ts` | Type Router |
| 2 | `routes/workspace.routes.js` | `workspace.routes.ts` | Type Router |
| 3 | `routes/project.routes.js` | `project.routes.ts` | Type Router |

---

### 5.5 Backend Entry Points (2 files)

| # | From | To | Changes |
|---|------|----|---------|
| 1 | `app.js` | `app.ts` | Type Express app |
| 2 | `server.js` | `server.ts` | Type server startup |

---

## 📁 Phase 6: Testing & Cleanup

### 6.1 Verification Steps

1. **Build Test (Frontend)**
   ```bash
   cd frontend && npm run build
   ```

2. **Build Test (Backend)**
   ```bash
   cd backend && npm run build
   ```

3. **Type Check**
   ```bash
   cd frontend && npx tsc --noEmit
   cd backend && npx tsc --noEmit
   ```

4. **Runtime Test**
   - Start both servers
   - Test login/register
   - Test workspace operations
   - Test project operations

### 6.2 Cleanup

- Delete any remaining `.js`/`.jsx` files
- Remove `allowJs: true` from tsconfig (optional)
- Update ESLint config for TypeScript

---

## ⚠️ Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Type errors break build | Use `// @ts-expect-error` temporarily, fix later |
| Third-party libs missing types | Install `@types/*` packages |
| Breaking changes during migration | Commit after each phase |
| Mongoose types complexity | Use `mongoose.Types.ObjectId` |

---

## 📋 Migration Checklist

### Phase 1: Configuration
- [ ] Install TypeScript dependencies (frontend)
- [ ] Install TypeScript dependencies (backend)
- [ ] Create `tsconfig.json` (frontend)
- [ ] Create `tsconfig.json` (backend)
- [ ] Update `package.json` scripts (backend)

### Phase 2: Types
- [ ] Create `frontend/src/types/index.ts`
- [ ] Create `backend/src/types/index.ts`

### Phase 3: Core Files
- [ ] Migrate stores (3 files)
- [ ] Migrate hooks (4 files)
- [ ] Migrate lib/utils (2 files)
- [ ] Migrate backend utils (3 files)
- [ ] Migrate backend middleware (2 files)
- [ ] Migrate backend config (2 files)

### Phase 4: Components
- [ ] Migrate UI components (20 files)
- [ ] Migrate theme components (2 files)
- [ ] Migrate auth components (2 files)
- [ ] Migrate workspace components (5 files)
- [ ] Migrate project components (6 files)

### Phase 5: Pages & Backend
- [ ] Migrate frontend pages (10 files)
- [ ] Migrate backend models (3 files)
- [ ] Migrate backend controllers (3 files)
- [ ] Migrate backend routes (3 files)
- [ ] Migrate backend entry points (2 files)

### Phase 6: Cleanup
- [ ] Build test frontend
- [ ] Build test backend
- [ ] Runtime test all features
- [ ] Delete old .js files

---

## 📝 Notes for Execution

1. **Always commit after each sub-phase** to allow rollback
2. **Run type checker frequently** with `npx tsc --noEmit`
3. **Keep terminal open** to catch compile errors immediately
4. **Migrate related files together** (e.g., store + hook that uses it)
5. **Don't skip any file** - even small files need migration

---

*This plan will be used as the reference for the complete TypeScript migration.*
