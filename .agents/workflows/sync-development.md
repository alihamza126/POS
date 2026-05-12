---
description: 
---

# Sync Development Workflow

## Overview

This workflow defines how sync-related features and cloud synchronization must be implemented.

The sync system is responsible for:
- offline recovery
- cloud synchronization
- queue processing
- retry handling
- conflict prevention

The sync engine must NEVER interrupt local business operations.

Local reliability is always primary.

---

# Core Sync Philosophy

This project is strictly offline-first.

Rules:
- all writes happen locally first
- SQLite is primary
- sync happens asynchronously
- internet is optional
- sync failures must not break workflows

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
Background Sync Worker
 ↓
Supabase Cloud
```

Never generate cloud-first workflows.

---

# Sync Development Order

All sync-related features must follow:

```txt
1. Define sync requirements
2. Define local-first behavior
3. Create queue integration
4. Add retry handling
5. Add conflict prevention
6. Add audit logging
7. Add background worker handling
8. Test offline behavior
9. Test sync recovery
10. Test conflict handling
```

Do not skip steps.

---

# Step 1 — Define Sync Requirements

Before implementing sync:
- identify synced entities
- identify sync direction
- identify conflict risks
- identify retry behavior
- identify branch isolation needs

Every sync workflow must remain deterministic.

---

# Step 2 — Local-First Behavior

All operations must:
- save locally first
- complete without internet
- avoid cloud dependency

Never:
- wait for cloud response
- block UI during sync
- require internet for invoices

Offline continuity is mandatory.

---

# Step 3 — Queue Integration

All synced operations must create queue entries.

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

Queue creation must happen inside transactions when required.

---

# Step 4 — Retry Handling

Failed sync operations must retry automatically.

Recommended retry strategy:

```txt
1 min
5 min
15 min
30 min
1 hour
```

Track:
- retry count
- failure reason
- timestamps

Never retry infinitely.

---

# Step 5 — Conflict Prevention

Architecture should minimize conflicts.

Use:
- deterministic IDs
- branch isolation
- device-aware invoice numbers

Example:

```txt
BR01-DEV01-000001
```

Avoid conflict-prone workflows initially.

---

# Step 6 — Audit Logging

Sync workflows must generate audit records.

Examples:
- sync started
- sync failed
- sync retried
- sync completed
- sync conflict

Sync debugging must remain traceable.

---

# Step 7 — Background Workers

Sync workers must:
- run asynchronously
- avoid blocking UI
- survive app restart
- resume safely after failure

Heavy sync operations belong in:
- background workers
- isolated services

Never run heavy sync logic inside React components.

---

# Step 8 — Offline Testing

Verify:
- app works fully offline
- invoices work offline
- inventory works offline
- sync resumes after reconnect

Offline reliability is mandatory.

---

# Step 9 — Sync Recovery Testing

Test:
- internet interruption
- app restart during sync
- duplicate prevention
- partial failure recovery

The app must recover safely.

---

# Step 10 — Conflict Testing

Conflict testing should verify:
- deterministic behavior
- no silent overwrites
- preserved local integrity
- preserved financial integrity

Conflicts must remain traceable.

---

# Push Sync Rules

Push sync must:
- upload pending local changes
- preserve queue order
- avoid duplicate uploads
- confirm success before marking synced

Never mark synced before confirmation.

---

# Pull Sync Rules

Pull sync must:
- fetch latest changes
- avoid duplicate inserts
- preserve local consistency
- support incremental updates

Avoid destructive replacement syncs.

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

Never silently discard failed items.

---

# Conflict Resolution Rules

Conflict priority:
1. preserve local integrity
2. avoid data loss
3. log conflicts
4. allow manual resolution later

Never silently overwrite financial or inventory data.

---

# Device Rules

Every device must support:

```txt
device_id
branch_id
```

Device tracking is required for:
- invoices
- sync history
- audit logs
- conflict prevention

---

# Branch Rules

All synced entities should support:

```txt
branch_id
```

Branch isolation must remain deterministic.

Never merge branch data unintentionally.

---

# Sync Payload Rules

Sync payloads must:
- remain minimal
- remain validated
- avoid unnecessary data
- support deterministic processing

Never trust external payloads blindly.

---

# API Rules

Sync APIs must:
- validate payloads
- support idempotency
- avoid duplicate creation
- support retry-safe behavior

All sync APIs must remain deterministic.

---

# Offline Queue Rules

Queue persistence must survive:
- app restart
- crash recovery
- internet loss

Queue integrity is mandatory.

---

# Error Handling Rules

Sync failures must:
- remain recoverable
- avoid crashing app
- preserve local data
- preserve queue state

Never silently swallow sync failures.

---

# Performance Rules

Sync operations must:
- batch safely
- paginate large syncs
- avoid UI blocking
- minimize bandwidth usage

Large sync jobs should process incrementally.

---

# Security Rules

Sync operations must:
- validate permissions
- validate branch ownership
- validate device ownership

Never expose:
- secrets
- admin credentials
- unsafe sync endpoints

---

# Logging Rules

Sync logging should include:
- retries
- failures
- conflict reasons
- processing times

Logs should support debugging.

---

# Future Scaling Rules

Architecture should support future:
- PowerSync
- ElectricSQL
- realtime subscriptions
- multi-device sync

Current implementation should remain:
- simple
- deterministic
- queue-based

---

# Forbidden Patterns

Never generate:
- cloud-first writes
- sync-dependent invoice creation
- blocking sync workflows
- silent conflict overwrites
- sync logic inside React components
- realtime websocket complexity initially

---

# Testing Rules

Sync testing should include:
- offline startup
- internet recovery
- duplicate prevention
- queue persistence
- retry handling
- app restart recovery
- conflict handling

Preferred tools:
- Vitest
- Playwright

---

# Final Sync Philosophy

The sync engine exists to synchronize data safely.

It must NEVER become a dependency for local business operations.

The sync system must prioritize:
- local reliability
- offline continuity
- deterministic behavior
- data integrity
- recoverability

Cloud sync is secondary.