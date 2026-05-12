---
trigger: always_on
---

# Audit System Rules

## Overview

The audit system is critical business infrastructure.

The audit system must provide:
- traceability
- accountability
- fraud prevention
- operational history
- debugging visibility
- compliance support

Every important business action must be traceable.

Audit logs are immutable records.

---

# Core Audit Philosophy

This project is offline-first.

Audit logging must:
- work offline
- never depend on internet
- preserve local integrity
- survive sync failures

Audit logs are generated locally first.

Cloud sync is secondary.

---

# Mandatory Audit Rules

All important actions must generate audit records.

Examples:
- login
- logout
- invoice creation
- payment updates
- stock adjustments
- inventory transfers
- settings changes
- sync failures
- user permission changes

Never silently modify critical business data.

---

# Audit Table Structure

Required table:

```txt
audit_logs
```

Required fields:

```txt
id
user_id
device_id
branch_id
action
entity
entity_id
old_value
new_value
metadata
created_at
```

Optional:
- ip_address
- sync_status

---

# Immutable Rules

Audit logs must NEVER:
- be edited
- be overwritten
- be hard deleted

Audit logs are append-only records.

---

# Audit Trigger Rules

Audit logs must trigger automatically for:
- create actions
- update actions
- delete actions
- permission changes
- inventory changes
- financial changes

Avoid relying on manual audit creation.

---

# User Tracking Rules

Every audit record should track:
- user identity
- device identity
- branch identity

Required:

```txt
user_id
device_id
branch_id
```

This is critical for:
- investigations
- branch management
- fraud prevention

---

# Action Naming Rules

Audit action names should be explicit.

Examples:

```txt
AUTH_LOGIN
SALE_CREATED
SALE_UPDATED
PRODUCT_CREATED
PRODUCT_UPDATED
STOCK_ADJUSTMENT
PAYMENT_RECEIVED
SYNC_FAILED
SETTINGS_UPDATED
```

Avoid vague names.

---

# Entity Rules

Every audit record should reference:
- entity type
- entity ID

Examples:

```txt
entity = sale
entity_id = sale_uuid
```

This enables full traceability.

---

# Before/After Rules

Update actions should include:
- old value
- new value

Examples:

```json
{
  "old_value": {
    "price": 100
  },
  "new_value": {
    "price": 120
  }
}
```

This enables historical investigation.

---

# Metadata Rules

Metadata should contain:
- contextual information
- workflow information
- optional debug information

Examples:
- invoice number
- sync reason
- adjustment reason

Avoid storing unnecessary sensitive data.

---

# Timestamp Rules

Every audit record must contain:

```txt
created_at
```

Use UTC timestamps only.

Audit ordering must remain deterministic.

---

# Security Rules

Audit logs are security-sensitive.

Rules:
- avoid exposing audit modification APIs
- validate access permissions
- restrict audit visibility by role

Only authorized roles may view full audit history.

---

# Role Access Rules

Audit access permissions:

| Role | Access |
|------|--------|
| Owner | Full |
| Admin | Full |
| Manager | Limited |
| Cashier | Minimal |

Cashiers should not access sensitive audit history.

---

# Financial Audit Rules

Financial actions require mandatory audit logs.

Examples:
- payment received
- invoice edit
- refund
- due adjustment
- supplier payment

Financial audit history must remain permanent.

---

# Inventory Audit Rules

Inventory changes must always generate audits.

Examples:
- stock adjustment
- warehouse transfer
- inventory correction
- damaged stock

Inventory modifications must remain traceable.

---

# Authentication Audit Rules

Authentication events must generate audits.

Examples:
- login
- logout
- failed login
- permission change
- password change

Authentication history is security-critical.

---

# Settings Audit Rules

Settings changes require:
- user tracking
- previous values
- new values

Examples:
- tax configuration
- invoice settings
- branch settings

Configuration history must remain traceable.

---

# Sync Audit Rules

Sync events should generate audit records.

Examples:
- sync started
- sync failed
- sync conflict
- sync completed

Sync debugging must remain possible.

---

# Offline Rules

Audit logging must work fully offline.

Internet failure must NEVER:
- stop audit generation
- corrupt audit history
- remove traceability

Audit generation is always local-first.

---

# Performance Rules

Audit logging must:
- remain lightweight
- avoid blocking UI
- avoid blocking transactions

Audit writes should remain efficient.

---

# Search Rules

Audit history should support:
- user filtering
- date filtering
- entity filtering
- action filtering

Large audit datasets must remain searchable.

---

# Retention Rules

Audit logs should remain long-term.

Avoid:
- automatic deletion
- aggressive cleanup

Future archival systems may be added later.

---

# Export Rules

Future support may include:
- audit export
- CSV export
- PDF export

Exports must:
- preserve integrity
- remain read-only

---

# Sync Rules

Audit logs must support:
- background sync
- retry handling
- conflict-safe sync

Audit integrity must remain deterministic.

---

# Privacy Rules

Avoid storing:
- plaintext passwords
- secrets
- sensitive tokens

Audit logs should capture actions, not secrets.

---

# Error Handling Rules

Audit failures must:
- be logged
- remain recoverable
- avoid crashing workflows

Business operations should continue safely.

---

# Forbidden Patterns

Never generate:
- editable audit logs
- missing audit coverage
- silent business changes
- audit deletion APIs
- audit bypasses
- audit-free financial operations

---

# Testing Rules

Audit testing should include:
- audit generation validation
- transaction rollback handling
- inventory audit validation
- authentication audit validation
- sync audit validation

Preferred tools:
- Vitest
- SQLite test databases

---

# Final Audit Philosophy

Audit logs are the historical memory of the business.

The audit system must prioritize:
- traceability
- accountability
- reliability
- security
- offline continuity

Every important business action must be explainable.