---
trigger: always_on
---

# Lint & Code Quality Rules

## Overview

This project uses strict linting and quality validation rules to maintain:
- scalability
- maintainability
- readability
- consistency
- production stability

Code quality validation is mandatory.

Generated code must pass:
- lint checks
- type checks
- formatting checks
- build validation

before being considered complete.

---

# Core Quality Philosophy

The codebase is long-term business infrastructure.

Rules:
- broken code is unacceptable
- warnings should be minimized
- type safety is mandatory
- code consistency is mandatory

Never leave unresolved errors.

---

# Mandatory Validation Workflow

Before completing ANY feature or code generation:

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

If tests exist:

```bash
npm run test
```

Never finalize code without validation.

---

# TypeScript Rules

Strict TypeScript is mandatory.

Required:
- strict mode enabled
- explicit types
- typed returns
- typed props

Avoid:
- any
- unsafe casting
- ignored type errors

Forbidden:

```ts
// @ts-ignore
```

unless absolutely necessary and documented.

---

# ESLint Rules

ESLint errors must be fixed immediately.

Never:
- ignore lint errors
- disable lint globally
- use massive eslint-disable blocks

Allowed only when justified:

```ts
// eslint-disable-next-line
```

with explanation comments.

---

# Prettier Rules

Formatting must remain consistent.

Use:
- Prettier
- consistent import ordering
- consistent spacing

Avoid:
- inconsistent formatting
- mixed styling conventions

---

# Build Validation Rules

Generated code must:
- compile successfully
- avoid runtime crashes
- avoid import errors
- avoid unresolved modules

Always verify:
- production build
- Electron build
- renderer build

---

# Import Rules

Imports must:
- remain organized
- avoid duplicates
- avoid unused imports

Prefer:
- absolute imports
- grouped imports

Avoid:
- circular imports
- deep relative imports

---

# Unused Code Rules

Avoid:
- unused variables
- unused imports
- dead components
- abandoned utility functions

Generated code should remain clean.

---

# Console Log Rules

Avoid excessive console logging.

Allowed:
- structured debug logging
- development debugging

Forbidden:
- noisy production logs
- sensitive data logging

Remove temporary debug logs before completion.

---

# Error Handling Rules

Never leave:
- unhandled promises
- empty catch blocks
- silent failures

Bad:

```ts
catch (e) {}
```

Good:

```ts
catch (error) {
  logger.error(error);
}
```

---

# Async Rules

All async operations must:
- use proper await handling
- handle failures safely
- avoid floating promises

Avoid:
- nested promise chains
- ignored async errors

---

# React Rules

React code must:
- avoid unnecessary re-renders
- avoid giant components
- avoid prop drilling

Components should:
- remain modular
- remain typed
- remain reusable

---

# Hook Rules

Hooks must:
- follow React hook rules
- avoid conditional hooks
- avoid side effects during render

Custom hooks should remain isolated.

---

# Tailwind Rules

Avoid:
- duplicated utility chaos
- arbitrary random values everywhere

Prefer:
- reusable classes
- theme variables
- centralized styling tokens

---

# Electron Rules

Electron code must:
- preserve security defaults
- avoid unsafe IPC
- avoid Node exposure in renderer

Required:

```ts
contextIsolation: true
nodeIntegration: false
sandbox: true
```

Never disable security protections.

---

# Database Rules

Database code must:
- use repositories
- avoid inline SQL in UI
- preserve transaction safety

Never access SQLite directly inside React components.

---

# Inventory Rules

Inventory logic must:
- use stock_movements
- remain transactional
- remain auditable

Forbidden:

```txt
products.stock -= 1
```

---

# Sync Rules

Sync logic must:
- remain queue-based
- remain background-only
- avoid blocking UI

Never:
- require internet for core workflows
- generate cloud-first operations

---

# Performance Rules

Code should:
- remain lightweight
- avoid blocking UI
- support lazy loading
- support large datasets

Avoid:
- unnecessary rerenders
- heavy synchronous operations

---

# File Size Rules

Preferred limits:

```txt
Components < 250 lines
Services < 300 lines
Repositories < 300 lines
```

Large files should be refactored.

---

# Duplication Rules

Avoid duplicated:
- business logic
- validation logic
- utility logic
- styling patterns

Prefer reusable abstractions.

---

# Security Validation Rules

Never:
- expose secrets
- disable Electron protections
- trust renderer input
- bypass validation

Security validation is mandatory.

---

# Dependency Rules

Avoid:
- unnecessary libraries
- abandoned packages
- overlapping dependencies

Favor:
- stable
- maintained
- long-term libraries

---

# Testing Rules

Critical workflows should include:
- unit tests
- integration tests
- E2E tests where necessary

Critical systems:
- inventory
- sync engine
- invoices
- payments

---

# Final Validation Checklist

Before completing work verify:

```txt
✓ No TypeScript errors
✓ No ESLint errors
✓ Build passes
✓ Imports resolved
✓ No unused code
✓ Offline-first preserved
✓ Electron security preserved
✓ Repository pattern followed
✓ Audit logging preserved
✓ Inventory architecture preserved
```

---

# Forbidden Patterns

Never generate:
- ignored type errors
- unresolved imports
- broken builds
- unsafe any abuse
- giant monolithic files
- console spam
- silent catch blocks
- disabled security protections

---

# Final Quality Philosophy

Code quality is part of system architecture.

The project must prioritize:
- reliability
- consistency
- maintainability
- type safety
- production readiness

Clean code reduces long-term business risk.