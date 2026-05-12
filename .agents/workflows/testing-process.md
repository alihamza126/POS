---
description: 
---

# Testing Process Workflow

## Overview

This workflow defines how testing must be handled across the application.

Testing is mandatory because this project manages:
- invoices
- inventory
- payments
- customer balances
- audit logs
- offline sync

Critical business workflows must remain reliable.

---

# Core Testing Philosophy

The application must prioritize:
- reliability
- deterministic behavior
- offline continuity
- recoverability
- business integrity

Testing should prevent:
- financial corruption
- inventory corruption
- sync failures
- regression bugs

---

# Required Testing Types

The project should include:

```txt
Unit Tests
Integration Tests
E2E Tests
Offline Tests
Sync Recovery Tests
```

Critical workflows require deeper testing.

---

# Recommended Testing Stack

Preferred tools:

```txt
Vitest
Playwright
SQLite Test Databases
```

---

# Testing Workflow Order

Every major feature should follow:

```txt
1. Validate business rules
2. Create unit tests
3. Create integration tests
4. Test offline workflows
5. Test sync behavior
6. Test edge cases
7. Create E2E tests
8. Verify regression safety
```

---

# Unit Testing Rules

Unit tests should verify:
- services
- repositories
- utility functions
- validation logic
- inventory calculations

Unit tests should remain:
- isolated
- deterministic
- fast

Avoid unnecessary mocking.

---

# Repository Testing Rules

Repositories require tests for:
- queries
- transactions
- persistence
- rollback behavior

Use SQLite test databases.

Never test repositories against production databases.

---

# Service Testing Rules

Services should test:
- workflows
- business rules
- orchestration
- validation coordination

Examples:
- invoice creation
- payment processing
- inventory adjustment

Business integrity is critical.

---

# Inventory Testing Rules

Inventory testing is mandatory.

Verify:
- stock calculations
- movement generation
- rollback safety
- transfer behavior
- return processing

Never allow inventory corruption.

---

# Financial Testing Rules

Financial workflows require:
- transaction tests
- rollback tests
- balance validation
- refund validation

Examples:
- invoice totals
- due balances
- payment reconciliation

Financial consistency is mandatory.

---

# Sync Testing Rules

Sync tests should verify:
- queue persistence
- retry handling
- duplicate prevention
- conflict handling
- offline recovery

Sync failures must remain recoverable.

---

# Offline Testing Rules

Offline testing is mandatory.

Verify:
- app startup offline
- invoice creation offline
- inventory lookup offline
- sync recovery after reconnect

Internet must never become required.

---

# E2E Testing Rules

Critical workflows require E2E tests.

Examples:
- create invoice
- scan product
- process payment
- adjust inventory
- customer due payment

E2E tests should simulate real workflows.

---

# UI Testing Rules

UI tests should verify:
- keyboard navigation
- dialogs
- tables
- form validation
- responsive layouts

POS workflows must remain efficient.

---

# Authentication Testing Rules

Authentication tests should verify:
- login
- logout
- session locking
- permissions
- restricted actions

Security validation is mandatory.

---

# Audit Testing Rules

Audit testing should verify:
- audit generation
- immutable logs
- action tracking
- sync audit events

Every critical action should remain traceable.

---

# Migration Testing Rules

Migration tests should verify:
- schema upgrades
- rollback safety
- data preservation
- sync compatibility

Migration safety is critical.

---

# IPC Testing Rules

Electron IPC tests should verify:
- payload validation
- preload safety
- secure communication
- permission enforcement

Renderer input must never be trusted blindly.

---

# Performance Testing Rules

Performance testing should verify:
- large inventory handling
- table virtualization
- product search speed
- sync responsiveness

POS workflows must remain fast.

---

# Edge Case Testing Rules

Test:
- duplicate submissions
- interrupted sync
- app restart during operations
- invalid input
- partial failures

Edge cases must remain safe.

---

# Error Handling Testing Rules

Verify:
- safe failure recovery
- transaction rollback
- readable error messages
- offline continuity

Never silently fail.

---

# Regression Testing Rules

Before major releases:
- rerun critical workflows
- rerun inventory workflows
- rerun payment workflows
- rerun sync recovery tests

Prevent regressions aggressively.

---

# Mocking Rules

Avoid excessive mocking.

Prefer:
- realistic SQLite test environments
- real workflow testing

Mock only external dependencies when necessary.

---

# Test Data Rules

Test data should:
- remain isolated
- avoid production secrets
- support repeatability

Avoid shared mutable test state.

---

# CI Testing Rules

CI should run:
- unit tests
- integration tests
- lint checks
- type checks

Critical failures should block deployment.

---

# Coverage Rules

Critical systems require high coverage:
- inventory
- payments
- sync engine
- audit system
- authentication

Coverage is more important for business logic than UI cosmetics.

---

# Release Validation Rules

Before production release:
- verify offline startup
- verify invoice workflows
- verify sync recovery
- verify audit generation

Release confidence is mandatory.

---

# Forbidden Patterns

Never:
- skip inventory testing
- skip payment testing
- rely only on manual testing
- trust unvalidated workflows
- ignore sync recovery testing

---

# Documentation Rules

Complex tests should document:
- workflow purpose
- edge cases
- business expectations

Tests should remain understandable.

---

# Final Testing Philosophy

Testing protects business integrity.

The testing system must prioritize:
- reliability
- offline continuity
- deterministic workflows
- recoverability
- financial safety

Stable business operations are more important than shipping quickly.