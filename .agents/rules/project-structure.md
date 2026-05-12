---
trigger: always_on
---

# Project Structure Rules

## Overview

This project uses a modular feature-based architecture designed for:
- scalability
- maintainability
- offline-first workflows
- Electron desktop architecture
- long-term business growth

The project structure must remain:
- organized
- predictable
- consistent
- easy to navigate

Avoid chaotic folder organization.

---

# Core Structure Philosophy

The project must separate:
- UI
- business logic
- database logic
- sync logic
- Electron logic

Each layer must have clear responsibilities.

Avoid tightly coupled architecture.

---

# Root Structure

Required root structure:

```txt
root/
├── .agents/
├── src/
├── public/
├── resources/
├── database/
├── tests/
├── scripts/
├── package.json
├── tsconfig.json
└── electron-builder.yml
```

---

# Source Structure

Required structure:

```txt
src/
├── app/
├── components/
├── features/
├── services/
├── repositories/
├── database/
├── sync/
├── stores/
├── hooks/
├── shared/
├── layouts/
├── pages/
├── routes/
├── electron/
└── types/
```

---

# Feature Architecture

Business modules must live inside:

```txt
features/
```

Examples:

```txt
features/
 ├── auth/
 ├── products/
 ├── inventory/
 ├── sales/
 ├── customers/
 ├── suppliers/
 ├── payments/
 ├── reports/
 └── settings/
```

Each feature owns its internal logic.

---

# Feature Folder Rules

Each feature may contain:

```txt
feature-name/
├── components/
├── hooks/
├── services/
├── repositories/
├── schemas/
├── types/
├── utils/
└── pages/
```

Avoid mixing unrelated feature logic.

---

# Shared Folder Rules

Shared folder contains reusable global code.

Allowed:

```txt
shared/
├── constants/
├── enums/
├── types/
├── schemas/
├── utils/
└── validators/
```

Shared folder must NOT contain:
- feature business logic
- feature-specific UI
- database workflows

---

# Components Structure

Reusable UI components belong in:

```txt
components/
```

Examples:

```txt
components/
├── ui/
├── forms/
├── tables/
├── dialogs/
├── layout/
└── shared/
```

---

# shadcn/ui Rules

shadcn components belong in:

```txt
components/ui/
```

Do not mix business logic into shadcn primitives.

---

# Service Layer Structure

Business workflows belong in:

```txt
services/
```

Examples:
- invoice service
- payment service
- inventory service

Services orchestrate workflows.

---

# Repository Structure

Database access belongs in:

```txt
repositories/
```

Examples:

```txt
repositories/
├── product-repository.ts
├── sales-repository.ts
├── customer-repository.ts
```

Only repositories may access database directly.

---

# Database Structure

Required structure:

```txt
database/
├── schema/
├── migrations/
├── seed/
└── sqlite/
```

Schema files should remain feature-oriented.

Example:

```txt
schema/
├── auth.ts
├── products.ts
├── sales.ts
└── inventory.ts
```

---

# Sync Structure

Sync logic belongs in:

```txt
sync/
```

Examples:

```txt
sync/
├── queue/
├── workers/
├── services/
├── handlers/
└── utils/
```

Sync logic must remain isolated from UI.

---

# Electron Structure

Electron-specific code belongs in:

```txt
electron/
```

Examples:

```txt
electron/
├── main/
├── preload/
├── ipc/
├── updater/
└── security/
```

Renderer code must remain separate.

---

# Hook Structure

Reusable hooks belong in:

```txt
hooks/
```

Feature-specific hooks belong inside feature folders.

Examples:

```txt
hooks/
├── use-theme.ts
├── use-online-status.ts
```

---

# Store Structure

Global state belongs in:

```txt
stores/
```

Examples:

```txt
stores/
├── auth-store.ts
├── settings-store.ts
├── sync-store.ts
```

Avoid giant global stores.

---

# Route Structure

Routing belongs in:

```txt
routes/
```

Examples:
- protected routes
- route definitions
- route guards

---

# Layout Structure

Layouts belong in:

```txt
layouts/
```

Examples:
- app layout
- auth layout
- POS layout

---

# Page Structure

Pages belong in:

```txt
pages/
```

Pages should:
- compose features
- avoid business logic
- remain lightweight

---

# Type Structure

Global types belong in:

```txt
types/
```

Feature-specific types belong inside features.

Avoid giant shared type files.

---

# Utility Rules

Utilities should remain:
- pure
- reusable
- isolated

Avoid giant utility dumping files.

---

# File Naming Rules

Use:

```txt
kebab-case
```

Examples:

```txt
create-sale-dialog.tsx
inventory-service.ts
sync-worker.ts
```

---

# Component Naming Rules

Components use:

```txt
PascalCase
```

Examples:

```txt
InvoiceTable
ProductSearch
PaymentDialog
```

---

# Hook Naming Rules

Hooks must begin with:

```txt
use
```

Examples:

```txt
useInventory
useProducts
useSyncStatus
```

---

# Import Rules

Prefer:
- absolute imports
- grouped imports
- consistent ordering

Avoid:
- deep relative paths
- circular imports

---

# Dependency Rules

Avoid:
- unnecessary dependencies
- duplicated libraries
- abandoned packages

Favor:
- stable
- maintainable
- long-term libraries

---

# Separation Rules

Never mix:
- UI and database logic
- sync and rendering logic
- Electron and React concerns
- feature logic and shared utilities

Keep responsibilities isolated.

---

# Scalability Rules

Architecture must support future:
- multi-branch
- warehouse systems
- ERP modules
- accounting modules
- analytics
- CRM features

Structure must remain extensible.

---

# Offline-First Rules

Offline-first architecture must remain visible in structure.

Examples:
- sync isolation
- repository abstraction
- local-first services

Avoid cloud-coupled structure.

---

# Forbidden Patterns

Never generate:
- dumping folders
- giant shared utility files
- feature cross-dependencies
- direct DB access in UI
- mixed Electron/UI logic
- duplicated business workflows

---

# Refactoring Rules

Refactoring should:
- improve clarity
- preserve architecture
- reduce coupling
- avoid large rewrites

Maintain stability during refactors.

---

# Testing Structure

Tests should support:

```txt
tests/
├── unit/
├── integration/
└── e2e/
```

Preferred tools:
- Vitest
- Playwright

---

# Documentation Rules

Important systems require documentation:
- sync engine
- Electron security
- inventory architecture
- database schema
- business workflows

Documentation must stay updated.

---

# Final Project Philosophy

Project structure is long-term architecture.

The structure must prioritize:
- clarity
- scalability
- maintainability
- modularity
- offline-first design

A clean structure reduces future complexity.