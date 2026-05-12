---
description: 
---

# Feature Development Workflow

## Overview

This workflow defines how new features must be built inside the offline-first POS system.

All features must follow:
- modular architecture
- offline-first design
- repository pattern
- auditability
- sync compatibility
- maintainability

Features must integrate safely with:
- SQLite
- sync engine
- audit system
- Electron security model

---

# Core Workflow Philosophy

Every feature must:
- work offline first
- remain deterministic
- support audit logging
- support sync architecture
- remain modular

Never build cloud-dependent features.

---

# Feature Development Order

Every feature should follow this sequence:

```txt
1. Define business requirements
2. Create database schema
3. Create repository
4. Create service layer
5. Add audit logging
6. Add sync integration
7. Create UI
8. Add validation
9. Add testing
10. Verify offline support
```

Do not skip workflow steps.

---

# Step 1 — Define Business Requirements

Before writing code:
- identify workflows
- identify business rules
- identify permissions
- identify audit requirements
- identify inventory impact
- identify sync requirements

Every feature must have:
- clear inputs
- clear outputs
- deterministic behavior

---

# Step 2 — Database Schema

If feature requires persistence:

Create:
- schema definitions
- migrations
- indexes
- timestamps

Required:
- created_at
- updated_at

Optional:
- deleted_at
- synced_at

Never manually modify production schema.

---

# Step 3 — Repository Layer

Create repositories for:
- database access
- persistence
- transactions
- query abstraction

Repositories must:
- remain feature-focused
- avoid UI logic
- avoid workflow orchestration

Examples:

```txt
product-repository.ts
sales-repository.ts
inventory-repository.ts
```

Only repositories may access database directly.

---

# Step 4 — Service Layer

Services handle:
- business workflows
- orchestration
- validation coordination
- transaction coordination

Examples:
- create invoice
- process payment
- inventory adjustment

Services should:
- remain deterministic
- avoid UI dependencies

---

# Step 5 — Audit Integration

All important feature actions require audit logs.

Examples:
- create
- update
- delete
- payment actions
- inventory changes

Audit logs must include:
- user_id
- device_id
- branch_id
- action
- entity
- timestamp

Audit logging is mandatory.

---

# Step 6 — Sync Integration

If feature data syncs to cloud:

Create:
- sync queue entries
- sync-safe payloads
- retry-safe operations

Rules:
- sync must never block UI
- sync failures must not break feature
- local operations remain primary

Every synced entity should support:
- sync status
- timestamps
- device identity

---

# Step 7 — UI Development

UI must follow:
- shadcn/ui
- Tailwind CSS
- accessibility
- keyboard-first workflows

Requirements:
- loading states
- error states
- validation states
- responsive layouts

Avoid:
- giant components
- business logic inside UI

---

# Step 8 — Validation

All external input requires validation.

Validate:
- forms
- IPC payloads
- sync payloads
- route params

Use:
- Zod
- typed DTOs

Never trust frontend input.

---

# Step 9 — Testing

Every feature requires testing.

Minimum:
- repository tests
- service tests
- business rule tests

Critical workflows require:
- E2E tests

Examples:
- invoice creation
- inventory adjustment
- payment processing

Preferred tools:
- Vitest
- Playwright

---

# Step 10 — Offline Verification

Every feature must be tested offline.

Verify:
- no internet dependency
- local persistence
- sync recovery
- app restart recovery

Offline reliability is mandatory.

---

# Feature Folder Structure

Recommended structure:

```txt
features/
└── feature-name/
    ├── components/
    ├── hooks/
    ├── services/
    ├── repositories/
    ├── schemas/
    ├── types/
    ├── utils/
    └── pages/
```

Keep features isolated.

---

# Permission Workflow

Sensitive features require permissions.

Examples:
- stock adjustment
- invoice deletion
- refund processing
- settings changes

Permissions must:
- work offline
- remain auditable

---

# Inventory Workflow Rules

If feature affects inventory:
- create stock movements
- use transactions
- generate audit logs

Never mutate stock directly.

Forbidden:

```txt
products.stock -= 1
```

Required:
- stock_movements

---

# Financial Workflow Rules

Financial operations require:
- transactions
- audit logs
- rollback safety

Examples:
- payments
- refunds
- due adjustments

Financial consistency is mandatory.

---

# Error Handling Workflow

Features must:
- fail safely
- preserve local integrity
- avoid partial transactions

Never:
- swallow errors
- silently fail
- corrupt data

---

# Performance Workflow

Features must:
- avoid blocking UI
- support large datasets
- remain responsive offline

Heavy operations should:
- paginate
- virtualize
- background process

---

# Refactoring Workflow

When improving existing features:
- preserve behavior
- preserve offline support
- preserve auditability

Avoid unnecessary rewrites.

---

# Documentation Workflow

Complex features require documentation.

Examples:
- sync workflows
- inventory logic
- financial calculations

Documentation should explain:
- why
- architecture decisions
- workflow constraints

---

# Forbidden Patterns

Never generate:
- direct DB access in UI
- business logic inside components
- sync-dependent workflows
- mutable inventory state
- audit-free business operations
- giant feature files

---

# Pull Request Checklist

Before completing a feature:

Verify:
- offline support works
- audit logging exists
- sync integration exists
- permissions validated
- transactions safe
- UI accessible
- tests added

---

# Final Workflow Philosophy

Features are long-term business infrastructure.

Every feature must prioritize:
- reliability
- offline continuity
- maintainability
- auditability
- deterministic behavior

Stable workflows are more important than rapid shortcuts.