---
trigger: always_on
---

# Business Rules

## Overview

This project is a scalable offline-first POS and inventory management system.

Business rules must prioritize:
- data integrity
- financial accuracy
- auditability
- offline reliability
- deterministic workflows

Business logic must remain consistent across:
- offline mode
- sync mode
- multi-device usage
- multi-branch usage

---

# Core Business Philosophy

The system must support real-world business operations safely.

Rules:
- financial records must remain traceable
- inventory changes must remain auditable
- invoices must remain deterministic
- offline workflows must remain reliable

Business integrity is mandatory.

---

# Offline-First Rules

This project is strictly offline-first.

Rules:
- invoices must work offline
- customer balances must work offline
- inventory lookup must work offline
- payments must work offline

Cloud sync is secondary.

Local operations are primary.

---

# Branch Rules

The system must support:
- single branch initially
- multi-branch architecture later

Every important record should support:

```txt
branch_id
```

Examples:
- invoices
- products
- inventory
- customers
- audit logs

---

# Device Rules

Every device should contain:

```txt
device_id
```

Device identity is required for:
- sync tracking
- invoice generation
- audit logs
- conflict prevention

---

# Invoice Rules

Invoices are immutable financial records.

Invoice creation must:
- use transactions
- generate audit logs
- reduce inventory safely
- support offline operation

Invoice numbers should remain deterministic.

Example:

```txt
BR01-DEV01-000001
```

---

# Invoice Editing Rules

Invoice edits must:
- remain auditable
- preserve historical data
- require permissions

Recommended approach:
- avoid destructive editing
- prefer corrections or reversals

---

# Invoice Cancellation Rules

Cancelled invoices must:
- remain visible historically
- preserve audit history
- reverse inventory safely

Never hard delete invoices.

---

# Payment Rules

Payments must:
- remain transactional
- generate audit logs
- update balances safely

Supported payment types:
- cash
- card
- bank transfer
- credit payment

Future:
- digital wallet
- online payments

---

# Customer Balance Rules

Customer balances must:
- update automatically
- remain deterministic
- remain traceable

Customer statements should include:
- invoices
- payments
- adjustments
- balance history

---

# Supplier Rules

Suppliers should support:
- purchase history
- supplier balances
- payment history
- due tracking

Supplier transactions must remain auditable.

---

# Due Payment Rules

The system must support:
- customer dues
- supplier dues
- partial payments
- balance tracking

All due operations require:
- audit logs
- transaction safety

---

# Inventory Rules

Inventory changes must:
- generate movement records
- remain transactional
- remain auditable

Never modify stock silently.

Inventory integrity is critical.

---

# Pricing Rules

Products should support:
- purchase price
- selling price
- optional discount
- optional tax

Future support:
- wholesale pricing
- customer-specific pricing
- branch pricing

---

# Discount Rules

Discounts should:
- remain traceable
- support permissions
- support invoice-level discounts
- support item-level discounts

Large discounts may require authorization later.

---

# Tax Rules

Tax calculations must:
- remain deterministic
- support future tax systems
- remain configurable

Tax settings should remain auditable.

---

# Return Rules

The system must support:
- sales returns
- purchase returns

Returns must:
- reverse inventory safely
- preserve invoice linkage
- generate audit logs

Returns should never silently modify financial records.

---

# Refund Rules

Refunds must:
- remain auditable
- require permissions
- preserve invoice linkage

Refund workflows should remain transactional.

---

# Stock Adjustment Rules

Stock adjustments require:
- reason
- user tracking
- audit logging

Examples:
- damaged stock
- expired stock
- inventory correction

Adjustments must remain traceable.

---

# User Rules

System users should support:
- roles
- permissions
- branch restrictions

Roles:
- Owner
- Admin
- Manager
- Cashier
- Accountant

---

# Permission Rules

Sensitive operations require permissions.

Examples:
- deleting invoices
- stock adjustment
- settings changes
- refund processing
- user management

Permissions must remain enforceable offline.

---

# Reporting Rules

Reports must remain:
- deterministic
- traceable
- reproducible

Examples:
- sales reports
- inventory reports
- due reports
- profit reports

Reports should support:
- date filters
- branch filters
- user filters

---

# Sync Rules

Business workflows must remain safe during sync.

Rules:
- sync failures must not corrupt invoices
- duplicate prevention required
- financial integrity is mandatory

Cloud sync must never become required for sales.

---

# Multi-Branch Rules

Future architecture should support:
- branch inventory
- branch invoices
- branch reporting
- branch permissions

Branch data isolation is mandatory.

---

# Multi-Warehouse Rules

Future support may include:
- warehouse transfers
- warehouse inventory
- warehouse-level stock

Architecture should remain extensible.

---

# Audit Rules

Important business actions require audit logs.

Examples:
- invoice changes
- payment changes
- inventory adjustments
- settings updates
- user permission changes

Audit history must remain immutable.

---

# Soft Delete Rules

Critical business data must not be hard deleted.

Use:
- is_deleted
- cancelled_at
- archived_at

Avoid permanent deletion.

---

# Performance Rules

Business workflows must feel fast.

Critical workflows:
- invoice creation
- product search
- barcode scanning
- payment processing

The system must remain responsive offline.

---

# Validation Rules

Business rules must validate:
- inventory availability
- payment totals
- invoice integrity
- customer balances
- permissions

Never trust frontend-only validation.

---

# Error Handling Rules

Business errors should:
- remain understandable
- avoid corruption
- support recovery

Avoid silent financial inconsistencies.

---

# Forbidden Patterns

Never generate:
- mutable invoice history
- direct stock mutation
- cloud-dependent invoice workflows
- hard-deleted invoices
- silent payment changes
- inventory changes without movement logs
- financial operations without audit logs

---

# Testing Rules

Business testing should include:
- invoice creation
- payment workflows
- customer balances
- inventory consistency
- returns
- refunds
- sync recovery

Preferred tools:
- Vitest
- Playwright

---

# Future Scalability Rules

Architecture should support future:
- ERP modules
- accounting integration
- advanced reporting
- warehouse systems
- CRM functionality
- multi-company support

Current implementation should remain simple and stable.

---

# Final Business Philosophy

This system manages critical business operations.

The architecture must prioritize:
- financial integrity
- inventory integrity
- auditability
- offline reliability
- deterministic workflows

Every business action must remain traceable and explainable.