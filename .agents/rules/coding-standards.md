---
trigger: always_on
---

# Coding Standards

## Overview

This project uses strict engineering standards to maintain:
- scalability
- maintainability
- readability
- consistency
- long-term stability

Code quality is mandatory.

The codebase should remain understandable as the application grows.

---

# Core Philosophy

The project prioritizes:
- simplicity
- maintainability
- modularity
- explicitness
- consistency

Avoid unnecessary complexity.

Readable code is preferred over clever code.

---

# Technology Standards

Required stack:

- TypeScript
- React
- Electron
- shadcn/ui
- Tailwind CSS
- Zustand
- Drizzle ORM
- Zod

Avoid introducing unnecessary libraries.

---

# TypeScript Rules

Strict TypeScript is mandatory.

Required:
- strict mode enabled
- explicit typing
- typed return values
- typed props
- typed services

Avoid:
- any
- unknown abuse
- unsafe casting

Forbidden:

```ts
const data: any = response;
```

---

# File Naming Rules

Use:

```txt
kebab-case
```

Examples:

```txt
product-table.tsx
create-sale-dialog.tsx
inventory-service.ts
```

Avoid:
- spaces
- inconsistent casing
- vague names

---

# Component Naming Rules

React components use:

```txt
PascalCase
```

Examples:

```txt
ProductTable
CreateInvoiceDialog
InventoryAdjustmentModal
```

---

# Hook Naming Rules

Hooks must start with:

```txt
use
```

Examples:

```txt
useProducts
useInvoice
useInventorySearch
```

---

# Constant Naming Rules

Constants use:

```txt
UPPER_SNAKE_CASE
```

Examples:

```txt
MAX_RETRY_COUNT
DEFAULT_PAGE_SIZE
SYNC_INTERVAL_MS
```

---

# Folder Structure Rules

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
├── hooks/
├── stores/
├── shared/
└── electron/
```

Avoid:
- random utility folders
- dumping unrelated logic together

---

# Feature Architecture Rules

Features must remain isolated.

Example:

```txt
features/
 ├── sales/
 ├── products/
 ├── inventory/
 └── customers/
```

Each feature may contain:
- components
- hooks
- services
- types
- validators

---

# Component Rules

Components must:
- remain reusable
- stay focused
- separate logic from presentation
- remain small

Preferred size:

```txt
< 250 lines
```

Avoid giant monolithic components.

---

# Business Logic Rules

Business logic belongs in:
- services
- repositories

Business logic must NOT exist inside:
- UI components
- dialogs
- pages

---

# Repository Rules

Repositories are responsible for:
- database access
- persistence
- transactions
- query abstraction

Only repositories may access database directly.

---

# Service Rules

Services are responsible for:
- workflows
- business rules
- orchestration
- validation coordination

Examples:
- create invoice
- process payment
- inventory transfer

---

# React Rules

Use:
- functional components
- hooks
- composition patterns

Avoid:
- class components
- prop drilling
- giant state trees

---

# State Management Rules

Use:
- Zustand for global state
- local state for UI-specific state

Avoid:
- duplicated state
- unnecessary global stores

---

# Form Rules

Use:
- React Hook Form
- Zod validation

Forms must:
- validate inputs
- display clear errors
- avoid duplicated validation logic

---

# Validation Rules

All external input must be validated.

Use:
- Zod schemas
- typed DTOs

Validate:
- form input
- IPC payloads
- sync payloads
- API responses

Never trust external input.

---

# Error Handling Rules

Errors must:
- remain understandable
- support recovery
- avoid crashing app

Avoid:
- silent failures
- swallowed exceptions
- vague error messages

---

# Async Rules

Prefer:
- async/await

Avoid:
- nested promise chains
- unhandled promises

Always handle async failures safely.

---

# Import Rules

Prefer:
- absolute imports
- grouped imports
- consistent ordering

Avoid:
- deeply nested relative paths

---

# Styling Rules

Use:
- Tailwind CSS
- shadcn/ui primitives

Avoid:
- inline styles
- random CSS files
- duplicated styles

---

# Comment Rules

Comments should explain:
- why
- architecture decisions
- complex business rules

Avoid obvious comments.

Bad:

```ts
// increment counter
count++;
```

Good:

```ts
// inventory adjustments must remain auditable
```

---

# Function Rules

Functions should:
- do one thing
- remain predictable
- avoid side effects

Preferred:
- small functions
- explicit naming

Avoid:
- giant multifunction utilities

---

# Magic Value Rules

Avoid magic values.

Use constants instead.

Bad:

```ts
setTimeout(fn, 5000);
```

Good:

```ts
setTimeout(fn, SYNC_RETRY_DELAY_MS);
```

---

# Dependency Rules

Avoid:
- unnecessary dependencies
- overlapping libraries
- abandoned packages

Favor:
- stable libraries
- long-term maintainability

---

# Logging Rules

Logs should:
- help debugging
- avoid secrets
- remain structured

Avoid:
- noisy console spam
- plaintext sensitive data

---

# Performance Rules

Code should:
- avoid unnecessary re-renders
- support lazy loading
- minimize heavy computations

Performance matters for:
- POS workflows
- inventory search
- large datasets

---

# Testing Rules

Critical systems require tests.

Examples:
- invoice creation
- inventory calculations
- sync queue
- audit logging
- authentication

Preferred tools:
- Vitest
- Playwright

---

# Security Rules

Never:
- expose secrets
- disable Electron protections
- trust renderer input
- bypass validation

Security is mandatory.

---

# Forbidden Patterns

Never generate:
- any abuse
- giant components
- direct DB access in UI
- inline SQL in components
- duplicated business logic
- mutable inventory state
- unsafe Electron configs
- silent failures

---

# Refactoring Rules

When refactoring:
- preserve behavior
- preserve offline-first architecture
- avoid unnecessary rewrites
- improve maintainability gradually

Avoid large risky rewrites.

---

# AI Code Generation Rules

Generated code must:
- follow existing patterns
- remain maintainable
- remain modular
- preserve offline-first design

Avoid:
- overengineering
- premature abstraction
- unnecessary complexity

---

# Final Coding Philosophy

The codebase is long-term business infrastructure.

The project must prioritize:
- clarity
- stability
- maintainability
- consistency
- scalability

Good architecture is more valuable than clever shortcuts.