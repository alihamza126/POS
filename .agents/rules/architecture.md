---
trigger: always_on
---

# Architecture Rules

## System Overview

This project is a modern offline-first POS and inventory management desktop application built using Electron.

The system must prioritize:

- Offline-first reliability
- Security
- Scalability
- Maintainability
- Auditability
- Modular architecture
- High-performance UX

This project is NOT cloud-first.

The application must continue functioning without internet connectivity.

---

# Core Stack

## Frontend

- React
- TypeScript
- shadcn/ui
- Tailwind CSS
- Zustand

## Desktop

- Electron

## Database

- SQLite (local primary database)
- Drizzle ORM
- Supabase PostgreSQL (cloud sync database)

## Validation

- Zod
- React Hook Form

---

# Offline-First Architecture

Offline-first is mandatory.

Rules:

- All writes happen locally first
- SQLite is the primary database
- UI must never wait for cloud response
- Sync happens in background
- Internet failures must never stop business operations

Correct flow:

```txt
User Action
 ↓
SQLite Write
 ↓
Audit Log
 ↓
Sync Queue
 ↓
Background Sync
 ↓
Supabase Cloud
```

Never generate cloud-first workflows.

---

# Application Layers

The application must use layered architecture.

```txt
UI Layer
 ↓
Service Layer
 ↓
Repository Layer
 ↓
SQLite Database
```

Responsibilities:

## UI Layer

Responsible for:
- rendering UI
- user interaction
- forms
- dialogs
- tables

UI must NOT:
- access database directly
- contain business logic
- contain SQL queries

---

## Service Layer

Responsible for:
- business logic
- workflows
- validation coordination
- transaction orchestration

Examples:
- create invoice
- process payment
- stock adjustment
- customer balance update

---

## Repository Layer

Responsible for:
- database queries
- persistence
- transactions
- query abstraction
- sync preparation

Repositories are the ONLY layer allowed to access database directly.

---

# Feature-Based Architecture

Organize code by feature.

Required structure:

```txt
features/
 ├── auth/
 ├── products/
 ├── inventory/
 ├── sales/
 ├── customers/
 ├── suppliers/
 ├── payments/
 └── settings/
```

Avoid generic dumping folders.

---

# Shared Layer Rules

Shared folder may contain:

```txt
shared/
 ├── types/
 ├── constants/
 ├── enums/
 ├── schemas/
 └── utils/
```

Shared folder must NOT contain:
- feature-specific logic
- database queries
- business workflows

---

# Electron Architecture

Electron must follow secure multi-process architecture.

Processes:

```txt
Main Process
 ├── app lifecycle
 ├── windows
 ├── IPC
 ├── native APIs
 └── filesystem

Renderer Process
 ├── React UI
 ├── user interaction
 └── presentation logic

Preload Process
 └── secure bridge
```

---

# Electron Security Rules

Mandatory:

```ts
contextIsolation: true
nodeIntegration: false
sandbox: true
webSecurity: true
```

Never disable these protections.

All renderer communication must use:
- preload APIs
- contextBridge
- whitelisted IPC channels

---

# State Management

Use:

- Zustand for global state
- local state for isolated UI
- React Hook Form for forms

Avoid:
- giant stores
- prop drilling
- duplicated state

---

# Database Architecture

SQLite is primary while offline.

Supabase is used for:
- cloud sync
- backup
- multi-device support
- analytics

Never depend on internet for critical operations.

---

# Inventory Architecture

Inventory must use movement-based design.

Never mutate stock directly.

Forbidden:

```txt
products.stock -= 1
```

Required:

```txt
stock_movements
```

Examples:
- purchase
- sale
- return
- damage
- adjustment

Current stock must be calculated from movement history.

---

# Audit System

All sensitive actions must create audit logs.

Required audit actions:
- login
- logout
- product updates
- stock adjustments
- invoice changes
- payment updates
- settings changes
- sync failures

Audit logs must be immutable.

---

# Sync Architecture

Sync must:
- run in background
- retry failures
- preserve local integrity
- never block UI
- survive internet interruption

All sync operations must use:

```txt
sync_queue
```

Every sync item should contain:
- entity
- action
- payload
- retry_count
- status
- created_at

---

# Performance Rules

The app must feel instant.

Requirements:
- fast product search
- virtualized tables
- minimal re-renders
- background sync only
- lazy load heavy modules
- avoid UI thread blocking

---

# Component Rules

Components must:
- be reusable
- remain small
- separate UI from business logic
- follow composition patterns

Preferred component size:

```txt
< 250 lines
```

---

# TypeScript Rules

Mandatory:
- strict mode
- explicit types
- avoid any
- validate external input using Zod

Never disable TypeScript strictness.

---

# Forbidden Patterns

Never generate:
- direct DB access in React components
- inline SQL in UI
- cloud-dependent invoice creation
- unsafe Electron configs
- giant monolithic files
- mutable inventory state
- duplicated business logic
- realtime websocket complexity initially

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

This project is a scalable offline-first business operating system foundation.

All architectural decisions must prioritize:
- stability
- simplicity
- maintainability
- scalability
- auditability

Avoid unnecessary complexity.

Build stable foundations first.