---
trigger: always_on
---

# Database Rules

## Overview

This project uses SQLite as the primary local database and Supabase PostgreSQL as the cloud sync database.

The database architecture must prioritize:

- Offline-first reliability
- Data integrity
- Auditability
- Maintainability
- Sync compatibility
- Transaction safety

SQLite is the primary source of truth while offline.

Cloud sync is secondary.

---

# Database Stack

## Local Database

- SQLite
- Drizzle ORM

## Cloud Database

- Supabase PostgreSQL

---

# Offline-First Rules

This project is strictly offline-first.

Rules:

- All writes happen locally first
- SQLite is primary during offline mode
- UI must never wait for cloud response
- Cloud sync happens asynchronously
- App must continue functioning without internet

Correct flow:

```txt
User Action
 ↓
SQLite Transaction
 ↓
Audit Log
 ↓
Sync Queue
 ↓
Background Sync
 ↓
Supabase
```

Never generate cloud-first database workflows.

---

# Database Access Rules

UI components must NEVER directly access database.

Required architecture:

```txt
UI
 ↓
Service Layer
 ↓
Repository Layer
 ↓
Database
```

Only repositories may interact with database directly.

---

# Repository Rules

Repositories are responsible for:
- queries
- transactions
- persistence
- sync preparation
- mapping database models

Repositories must:
- remain feature-focused
- avoid UI logic
- avoid business workflow logic

Examples:

```txt
ProductRepository
SalesRepository
InventoryRepository
CustomerRepository
```

---

# Drizzle ORM Rules

Required:
- Drizzle ORM
- typed schema definitions
- migrations
- explicit relations

Avoid:
- raw SQL in UI
- scattered schema definitions
- unsafe dynamic queries

---

# Schema Organization

Required structure:

```txt
database/
 ├── schema/
 ├── migrations/
 ├── seed/
 └── sqlite/
```

Each feature should have separate schema file.

Example:

```txt
schema/
 ├── auth.ts
 ├── products.ts
 ├── inventory.ts
 ├── sales.ts
 └── customers.ts
```

---

# Migration Rules

All schema changes must use migrations.

Rules:
- never manually edit production schema
- preserve backward compatibility
- avoid destructive changes
- test migration rollback

Never:
- drop tables carelessly
- remove critical columns without migration strategy

---

# Transaction Rules

Critical operations must use transactions.

Required examples:
- invoice creation
- payment processing
- stock adjustment
- inventory transfer
- purchase creation

Transactions must guarantee:
- consistency
- rollback safety
- inventory integrity

---

# ID Strategy

Preferred:
- UUIDs
- deterministic identifiers

Examples:

```txt
sale_id
product_id
customer_id
```

Invoice numbers should use:

```txt
BR01-DEV01-000001
```

to prevent offline conflicts.

---

# Inventory Rules

Inventory must use movement-based architecture.

Never mutate stock directly.

Forbidden:

```txt
products.stock -= 1
```

Required architecture:

```txt
stock_movements
```

Movement types:
- purchase
- sale
- return
- adjustment
- damage
- transfer

Current stock must be calculated from movement history.

---

# Soft Delete Rules

Critical business data must never be hard deleted.

Use:

```txt
is_deleted
deleted_at
```

Required for:
- products
- customers
- invoices
- suppliers

Avoid permanent deletion.

---

# Audit Logging Rules

All sensitive operations must create audit logs.

Required actions:
- insert
- update
- delete
- login
- settings changes
- sync errors

Audit logs must include:
- user_id
- action
- entity
- old_value
- new_value
- created_at

Audit logs must be immutable.

---

# Sync Compatibility Rules

Database design must support:
- offline sync
- retry queues
- conflict handling
- device isolation
- branch isolation

Every synced entity must support:
- created_at
- updated_at
- sync status
- device_id
- branch_id

---

# Timestamp Rules

Every important table should contain:

```txt
created_at
updated_at
```

Optional:

```txt
deleted_at
synced_at
```

Use UTC timestamps.

---

# Validation Rules

All external input must be validated.

Use:
- Zod schemas
- typed DTOs

Never trust:
- UI input
- IPC payloads
- sync payloads

---

# Query Rules

Queries must:
- be indexed properly
- avoid unnecessary joins
- support large datasets
- support offline performance

Avoid:
- N+1 queries
- giant nested queries
- unbounded queries

---

# Indexing Rules

Index:
- invoice numbers
- product barcode
- SKU
- customer phone
- timestamps
- sync status

Performance is critical for POS systems.

---

# Performance Rules

Database operations must:
- remain fast offline
- support large inventories
- avoid UI blocking
- use pagination where needed

Product search should feel instant.

---

# Backup Rules

System must support:
- local backups
- cloud backups
- export/import
- restore safety

Backups must preserve:
- inventory
- invoices
- audit logs
- customers
- sync state

---

# Security Rules

Sensitive data must:
- avoid plaintext secrets
- use secure storage
- protect credentials
- validate permissions

Never expose:
- database paths
- credentials
- admin secrets

---

# Forbidden Patterns

Never generate:
- direct DB access in React components
- inline SQL in UI
- mutable stock state
- hard deletes for critical data
- cloud-dependent transactions
- unvalidated queries
- duplicated schema logic

---

# Testing Rules

Database testing should include:
- migration testing
- transaction rollback testing
- sync conflict testing
- inventory integrity testing
- performance testing

Preferred tools:
- Vitest
- SQLite test databases

---

# Final Database Philosophy

The database is the foundation of the business system.

Architecture must prioritize:
- reliability
- integrity
- auditability
- offline support
- scalability

Avoid shortcuts that risk business data integrity.