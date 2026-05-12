---
description: 
---

# Database Migration Workflow

## Overview

This workflow defines how database schema changes must be handled.

Database migrations are critical because this project manages:
- invoices
- inventory
- payments
- audit logs
- customer balances

Migration safety is mandatory.

Unsafe migrations can corrupt business data.

---

# Core Migration Philosophy

This project is offline-first.

Database migrations must:
- preserve local data
- support upgrades safely
- avoid destructive changes
- maintain sync compatibility

Never risk business integrity for convenience.

---

# Migration Workflow Order

All schema changes must follow:

```txt
1. Analyze business impact
2. Update schema definitions
3. Create migration
4. Preserve backward compatibility
5. Add indexes if needed
6. Test migration
7. Test rollback
8. Verify sync compatibility
9. Verify offline recovery
```

Do not skip steps.

---

# Step 1 — Analyze Business Impact

Before changing schema:
- identify affected features
- identify affected workflows
- identify sync impact
- identify inventory impact
- identify financial impact

Critical tables require extra caution.

Examples:
- sales
- payments
- stock_movements
- audit_logs

---

# Step 2 — Update Schema Definitions

Update:
- Drizzle schema files
- relations
- types
- validators

Keep schema organized by feature.

Example:

```txt
schema/
├── auth.ts
├── sales.ts
├── inventory.ts
└── products.ts
```

---

# Step 3 — Create Migration

All schema changes require migrations.

Required:
- deterministic migrations
- versioned migrations
- safe upgrade path

Never manually edit production databases.

---

# Migration Naming Rules

Migration names should remain descriptive.

Examples:

```txt
add-product-barcode
create-stock-movements
add-sync-status-fields
```

Avoid vague migration names.

---

# Step 4 — Backward Compatibility

Migrations should:
- preserve existing data
- avoid breaking old records
- support upgrade continuity

Avoid:
- destructive renames
- sudden schema removal
- incompatible data formats

---

# Step 5 — Add Indexes

Add indexes for:
- invoice numbers
- barcodes
- SKU
- timestamps
- sync status
- foreign keys

Performance matters for POS systems.

---

# Step 6 — Test Migration

Migration testing must verify:
- data preservation
- schema integrity
- transaction safety
- query compatibility

Always test on real-like datasets.

---

# Step 7 — Test Rollback

Rollback testing is mandatory.

Verify:
- safe rollback behavior
- no corruption
- preserved integrity

Critical systems require rollback safety.

---

# Step 8 — Verify Sync Compatibility

Schema changes must remain compatible with:
- sync queue
- offline data
- cloud synchronization

Avoid sync-breaking changes.

---

# Step 9 — Verify Offline Recovery

The app must recover safely after:
- interrupted migrations
- crashes
- restart during migration

Offline continuity is mandatory.

---

# Schema Rules

All important tables should contain:

```txt
created_at
updated_at
```

Optional:

```txt
deleted_at
synced_at
```

Use UTC timestamps only.

---

# Soft Delete Rules

Critical tables must avoid hard deletes.

Use:
- is_deleted
- deleted_at

Required for:
- products
- invoices
- customers
- suppliers

Never destroy business history.

---

# Inventory Migration Rules

Inventory schema changes require extra caution.

Inventory integrity must remain:
- traceable
- deterministic
- auditable

Never:
- mutate stock directly
- bypass movement history

---

# Financial Migration Rules

Financial tables require:
- transaction-safe migrations
- audit preservation
- balance integrity

Examples:
- payments
- invoices
- due balances

Financial consistency is critical.

---

# Audit Migration Rules

Audit logs must:
- remain immutable
- preserve historical integrity

Never:
- rewrite audit history
- remove audit traceability

---

# Sync Migration Rules

Sync-related schema changes must:
- preserve queue integrity
- preserve retry state
- avoid duplicate sync creation

Sync continuity is mandatory.

---

# SQLite Rules

SQLite migrations must:
- support local upgrades
- support offline startup
- remain lightweight

Avoid:
- giant blocking migrations
- memory-heavy operations

---

# PostgreSQL Rules

Cloud schema changes should:
- remain compatible with sync engine
- preserve deterministic behavior
- avoid dangerous production locks

---

# Data Transformation Rules

Data migrations should:
- remain explicit
- remain reversible
- preserve history

Avoid hidden transformations.

---

# Validation Rules

After migration:
- validate schema
- validate constraints
- validate relations
- validate indexes

Never assume migration succeeded silently.

---

# Error Handling Rules

Migration failures must:
- fail safely
- preserve data
- support recovery

Never:
- partially corrupt schema
- silently ignore failures

---

# Performance Rules

Migrations should:
- minimize locking
- avoid long blocking operations
- support large datasets

Large migrations should:
- batch safely
- process incrementally

---

# Environment Rules

Test migrations in:
- development
- staging
- production-like environments

Never deploy untested migrations.

---

# Backup Rules

Before major migrations:
- backup SQLite
- backup PostgreSQL
- verify restore process

Backups are mandatory for critical changes.

---

# Forbidden Patterns

Never generate:
- destructive migrations
- direct production edits
- audit log deletion
- mutable inventory schema shortcuts
- unsafe column removal
- untested migrations

---

# Testing Rules

Migration testing should include:
- upgrade testing
- rollback testing
- large dataset testing
- offline recovery testing
- sync compatibility testing

Preferred tools:
- Vitest
- SQLite test databases

---

# Deployment Rules

Migration deployment should:
- remain predictable
- remain versioned
- remain recoverable

Avoid:
- surprise production schema changes
- manual emergency patches

---

# Final Migration Philosophy

Database migrations are critical infrastructure operations.

The migration system must prioritize:
- data integrity
- recoverability
- offline continuity
- auditability
- long-term stability

Protect business data above all else.