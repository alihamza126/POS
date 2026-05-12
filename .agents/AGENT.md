# AI Agent Rules

This project is a modern offline-first Electron POS and inventory management system.

The platform is designed for:
- retail businesses
- car spare parts businesses
- pharmacy/medical stores
- warehouse inventory systems
- scalable multi-branch operations

This project is NOT cloud-first.

Local operations are primary.

Cloud sync is secondary.

---

# Core Stack

## Desktop
- Electron
- React
- TypeScript

## UI
- shadcn/ui
- Tailwind CSS
- Lucide Icons
- TanStack Table

## State Management
- Zustand

## Forms & Validation
- React Hook Form
- Zod

## Database
- SQLite
- Drizzle ORM

## Cloud
- Supabase

## Sync
- Custom background sync engine
- Queue-based synchronization

---

# Mandatory Architecture Rules

This project is STRICTLY OFFLINE-FIRST.

Required rules:
- all writes happen locally first
- SQLite is the primary database
- UI must never wait for cloud responses
- sync runs asynchronously
- local functionality must continue without internet
- sync failures must never block business operations

Required architecture:

```txt
UI
 ↓
Service Layer
 ↓
Repository Layer
 ↓
SQLite
 ↓
Sync Queue
 ↓
Background Sync
 ↓
Supabase
```

---

# Mandatory Engineering Rules

Required:
- repository pattern
- audit logging
- transaction-safe workflows
- movement-based inventory
- secure Electron IPC
- feature-based architecture
- strict TypeScript
- modular components
- deterministic workflows

Never:
- access database directly in UI
- mutate inventory directly
- bypass audit logging
- disable Electron security
- generate cloud-first workflows

---

# Inventory Rules

Inventory must use:

```txt
stock_movements
```

Never generate:

```txt
products.stock -= 1
```

Inventory changes must remain:
- auditable
- transactional
- traceable

---

# UI & Styling Rules

The UI must feel:
- modern
- minimal
- soft
- enterprise-grade
- premium
- keyboard-friendly

Required design system:
- soft shadows
- large radius
- white/light surfaces
- subtle borders
- clean spacing

Primary colors:

```txt
#24D4FE
#02025C
#F1EFF9
#FFFFFF
```

Avoid:
- harsh shadows
- cluttered layouts
- old ERP styling
- excessive gradients

Use centralized root theme variables.

---

# Electron Security Rules

Required BrowserWindow config:

```ts
contextIsolation: true
nodeIntegration: false
sandbox: true
webSecurity: true
```

Never disable these protections.

Renderer must NEVER directly access:
- filesystem
- SQLite
- Node APIs

All communication must use:
- preload APIs
- contextBridge
- secure IPC

---

# Sync Rules

Sync architecture must:
- remain queue-based
- run in background
- retry failures
- preserve local integrity
- support offline recovery

Never generate realtime websocket complexity initially.

---

# Lint & Code Quality Rules

Before completing ANY task or feature:

Mandatory validation:

```bash
npm run lint
npm run typecheck
npm run build
```

If tests exist:

```bash
npm run test
```

Never leave:
- TypeScript errors
- ESLint errors
- unresolved imports
- broken builds
- unused code
- silent failures

Strict TypeScript is mandatory.

Never abuse:

```ts
any
```

Never use:

```ts
// @ts-ignore
```

unless absolutely necessary and documented.

Generated code must:
- compile successfully
- pass lint validation
- remain modular
- remain maintainable
- follow project architecture

---

# Read Required Files Before Generating Code

## Rules

```txt
.agents/rules/architecture.md
.agents/rules/electron.md
.agents/rules/database.md
.agents/rules/sync-engine.md
.agents/rules/security.md
.agents/rules/ui-rules.md
.agents/rules/styling-and-colors.md
.agents/rules/inventory.md
.agents/rules/audit-system.md
.agents/rules/coding-standards.md
.agents/rules/business-rules.md
.agents/rules/project-structure.md
.agents/rules/lint-and-quality-rules.md
```

## Workflows

```txt
.agents/workflows/feature-development.md
.agents/workflows/database-migration.md
.agents/workflows/sync-development.md
.agents/workflows/testing-process.md
```

## Context

```txt
.agents/context/product-vision.md
```

---

# Code Generation Rules

Generated code must:
- be production-quality
- remain modular
- remain maintainable
- support offline-first workflows
- follow feature architecture
- preserve scalability
- preserve Electron security
- preserve auditability

Avoid:
- giant files
- duplicated logic
- unsafe shortcuts
- unnecessary complexity
- overengineering

---

# Engineering Priorities

Priority order:

1. Reliability
2. Offline support
3. Data integrity
4. Security
5. Auditability
6. Performance
7. Maintainability
8. Scalability
9. UI polish

---

# Final Philosophy

This project is long-term business infrastructure.

The platform should evolve into a scalable offline-first business operating system.

Every architectural decision must prioritize:
- stability
- maintainability
- offline continuity
- deterministic workflows
- business integrity

**MANDATORY: Check ALL project rules (in `.agents/rules/`) before EVERY command execution, file modification, or technical decision. Never skip rule validation.**

Build stable foundations first.