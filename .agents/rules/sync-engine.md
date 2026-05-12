---
trigger: always_on
---

# Sync Engine Rules

## Overview

This project uses a custom offline-first sync engine architecture.

The sync engine is responsible for:

- cloud synchronization
- offline recovery
- retry management
- queue processing
- device consistency
- branch isolation

The sync engine must NEVER interrupt local business operations.

Local functionality is always primary.

---

# Offline-First Philosophy

This project is strictly offline-first.

Rules:

- All writes happen locally first
- SQLite is primary during offline mode
- Sync runs asynchronously
- UI must never wait for cloud response
- Internet failure must never stop business operations

Correct flow:

```txt
User Action
 ↓
SQLite Transaction
 ↓
Audit Log
 ↓
Sync Queue Entry
 ↓
Background Sync
 ↓
Supabase Cloud
```

Never generate cloud-first architecture.

---

# Sync Architecture

The sync engine must use queue-based synchronization.

Required structure:

```txt
Local Database
 ↓
sync_queue
 ↓
Background Worker
 ↓
Supabase API
 ↓
Cloud Database
```

---

# Sync Queue Rules

All synced operations must create sync queue entries.

Required table:

```txt
sync_queue
```

Required fields:

```txt
id
entity
entity_id
action
payload
status
retry_count
created_at
updated_at
last_attempt_at
device_id
branch_id
```

---

# Queue Status Rules

Allowed statuses:

```txt
pending
processing
synced
failed
conflict
```

Never delete failed sync records automatically.

---

# Sync Worker Rules

The sync worker must:
- run in background
- never block UI
- retry failures
- preserve queue order
- support app restart recovery
- support internet recovery

Sync worker must be resilient.

---

# Retry Rules

Failed sync operations must retry automatically.

Recommended retry strategy:

```txt
1 min
5 min
15 min
30 min
1 hour
```

Retry count must be tracked.

Never retry infinitely.

---

# Conflict Handling Rules

Initial sync strategy should minimize conflicts.

Required:
- deterministic updates
- branch isolation
- device-aware invoice IDs

Invoice format:

```txt
BR01-DEV01-000001
```

This prevents invoice collisions during offline operation.

---

# Conflict Resolution Rules

If conflicts occur:

Priority:
1. preserve local integrity
2. avoid data loss
3. log conflicts
4. allow manual resolution later

Never silently overwrite business data.

---

# Device Rules

Every device must contain:

```txt
device_id
branch_id
```

Devices must sync independently.

Device identity is required for:
- invoices
- audit logs
- sync history
- conflict resolution

---

# Branch Rules

All business records should support:

```txt
branch_id
```

Branch isolation must remain deterministic.

Never mix inventory unintentionally between branches.

---

# Pull Sync Rules

Background sync must:
- fetch latest updates
- update local database safely
- preserve local consistency

Pull sync should:
- avoid duplicate inserts
- support incremental sync
- use timestamps/versioning

---

# Push Sync Rules

Push sync must:
- upload pending local changes
- preserve transaction order
- support retries
- avoid duplicate submissions

Never mark synced before confirmation.

---

# Sync Safety Rules

Sync failures must NEVER:
- crash application
- corrupt local database
- block invoice creation
- stop inventory operations

The app must remain fully usable offline.

---

# Background Processing Rules

Sync must:
- run asynchronously
- avoid blocking renderer
- avoid blocking SQLite writes

Heavy sync logic should run:
- in background workers
- outside UI rendering

---

# Timestamp Rules

Every synced entity should contain:

```txt
created_at
updated_at
synced_at
```

Use UTC timestamps only.

---

# Data Integrity Rules

Sync engine must preserve:
- inventory consistency
- invoice integrity
- payment accuracy
- audit history

Never skip validation during sync.

---

# Audit Rules

Sync actions must create audit records.

Required audit examples:
- sync started
- sync failed
- sync retried
- sync conflict
- sync completed

Sync failures must remain traceable.

---

# Network Rules

The sync engine must handle:
- unstable internet
- slow internet
- reconnection
- partial failures
- server downtime

Network instability is expected behavior.

---

# API Rules

Sync APIs must:
- validate payloads
- support idempotency
- avoid duplicate creation
- return deterministic responses

Never trust client payloads blindly.

---

# Performance Rules

Sync operations must:
- avoid large blocking batches
- support pagination
- support incremental sync
- minimize bandwidth usage

Large sync operations should process in chunks.

---

# Security Rules

Sync payloads must:
- validate permissions
- validate branch ownership
- validate device ownership

Never expose:
- secrets
- admin credentials
- internal sync metadata

---

# Forbidden Patterns

Never generate:
- cloud-first writes
- synchronous sync workflows
- UI-blocking sync logic
- direct cloud dependency for invoices
- silent conflict overwrites
- realtime websocket complexity initially
- sync logic inside React components

---

# Future Scaling Rules

Future sync upgrades may include:
- PowerSync
- ElectricSQL
- realtime subscriptions

But current architecture must remain:
- queue-based
- deterministic
- offline-safe

---

# Testing Rules

Sync testing must include:
- offline startup
- internet recovery
- duplicate prevention
- retry validation
- conflict handling
- queue persistence
- app restart recovery

Preferred tools:
- Vitest
- Playwright

---

# Final Sync Philosophy

The sync engine exists to synchronize data safely.

It must NEVER become a dependency for local business operations.

Primary priority:
- local reliability
- data integrity
- offline continuity

Cloud synchronization is secondary.