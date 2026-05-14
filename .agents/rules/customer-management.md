---
trigger: always_on
---

# Customer Management Rules

## Overview

The customer management system is one of the core business modules of the application.

The system must support:
- customer records
- customer ledger
- customer balance tracking
- invoice history
- payment history
- due management
- account statements
- printable customer reports

This module is critical for:
- wholesalers
- car spare part businesses
- pharmacies
- distributors
- inventory businesses

---

# Core Customer Philosophy

Customers are financial entities.

Customer history must remain:
- auditable
- traceable
- immutable
- deterministic

Never lose customer financial history.

---

# Customer System Requirements

The customer module must support:

```txt
Customer List
Customer Details
Customer Ledger
Customer Payments
Customer Statements
Customer Due Tracking
Customer Invoice History
Customer Activity History
```

---

# Customer List Rules

Customer list should display:
- customer name
- phone number
- address
- current balance
- total purchases
- last transaction
- customer status

Support:
- search
- filters
- pagination
- sorting

---

# Customer Details Page

Customer details page should contain tabs:

```txt
Overview
Invoices
Payments
Ledger
Notes
Activity
```

The details page should feel:
- modern
- organized
- accounting-friendly

---

# Customer Ledger Rules

The ledger is one of the most important features.

Ledger must display:

| Field | Description |
|---|---|
| Type | Invoice / Payment |
| Date | Transaction date |
| Number | Invoice/payment number |
| Memo | Notes or bank details |
| Debit | Customer purchased |
| Credit | Customer paid |
| Balance | Running balance |

The ledger must remain fully traceable.

---

# Running Balance Rules

Customer balances must NEVER be manually mutated.

Forbidden:

```txt
customer.balance += 5000
```

Balance must be calculated from:
- invoices
- payments
- returns
- adjustments

Correct calculation:

```txt
Total Invoices
- Total Payments
- Total Returns
= Current Balance
```

---

# Payment Rules

Customer payments must support:
- cash payments
- bank transfer
- partial payments
- advance payments

Payment records should contain:
- payment method
- bank name
- reference number
- notes
- timestamp

Payments must remain auditable.

---

# Due Management Rules

The system must support:
- customer due balances
- partial payments
- overdue tracking
- advance balances

Customer due history must remain deterministic.

---

# Invoice Integration Rules

Invoices must:
- link to customers
- update ledger automatically
- update running balance automatically

Invoice creation must:
- create ledger entries
- create audit logs
- remain transactional

---

# Return Rules

Sales returns must:
- reduce customer balance
- remain linked to invoices
- remain auditable

Returns must never silently alter balances.

---

# Customer Statement Rules

The system must support printable customer statements.

Statement should include:
- customer information
- invoice history
- payment history
- running balance
- totals
- date filters

Supported:
- PDF export
- print support

---

# Customer Statement Layout

Recommended columns:

| Column | Description |
|---|---|
| Type | Invoice / Payment |
| Date | Transaction date |
| Num | Invoice number |
| Memo | Bank/payment details |
| Debit | Sales amount |
| Credit | Payment amount |
| Balance | Running balance |

The statement must resemble professional accounting reports.

---

# Customer Search Rules

Search should support:
- customer name
- phone number
- invoice number
- payment reference

Search performance must remain fast.

---

# Customer Notes Rules

Support customer notes:
- warnings
- business notes
- special instructions

Notes should remain auditable.

---

# Customer Activity Rules

Track:
- invoices
- payments
- returns
- adjustments
- account changes

Customer activity history must remain traceable.

---

# Database Rules

Required tables:

```txt
customers
customer_payments
sales
sales_returns
customer_notes
```

Optional future tables:

```txt
customer_activity
customer_credit_limits
customer_groups
```

---

# Customer Schema Rules

Customers should support:

```txt
id
name
phone
email
address
branch_id
created_at
updated_at
```

Optional:
- NTN
- company name
- credit limit

---

# Ledger Calculation Rules

Ledger calculations must remain deterministic.

Example:

| Type | Debit | Credit |
|---|---|---|
| Invoice | 5000 | |
| Payment | | 2000 |

Balance:

```txt
5000 - 2000 = 3000
```

Never trust manually edited balances.

---

# Audit Rules

Customer operations require audit logs.

Examples:
- customer creation
- payment creation
- payment update
- customer edit
- invoice changes

Financial traceability is mandatory.

---

# Offline Rules

Customer management must work fully offline.

Support:
- offline invoices
- offline payments
- offline ledger lookup
- offline statements

Internet must never block customer workflows.

---

# Sync Rules

Customer sync must:
- preserve financial integrity
- avoid duplicate payments
- preserve ledger order
- remain retry-safe

Customer financial history must never become inconsistent.

---

# UI Rules

Customer UI should feel:
- accounting-friendly
- modern
- lightweight
- professional

Use:
- tables
- tabs
- statement layouts
- summary cards

Avoid:
- cluttered layouts
- confusing financial displays

---

# Dashboard Rules

Customer dashboard should support:
- total receivables
- overdue balances
- top customers
- recent payments

Future support:
- customer analytics
- aging reports

---

# Security Rules

Customer financial data is sensitive.

Permissions required for:
- payment deletion
- invoice editing
- due adjustments
- customer deletion

Never expose financial data improperly.

---

# Soft Delete Rules

Customers must use soft deletes.

Never permanently remove:
- customer ledger
- customer payments
- customer invoices

Financial history must remain preserved.

---

# Performance Rules

Customer queries must support:
- large ledgers
- fast pagination
- fast filtering
- statement generation

Performance is critical for wholesalers.

---

# Future Scalability Rules

Architecture should support future:
- customer credit limits
- aging reports
- customer groups
- multi-company accounting
- CRM integration

Current implementation should remain simple and stable.

---

# Forbidden Patterns

Never generate:
- mutable customer balances
- silent balance adjustments
- payment deletion without audit logs
- financial operations without transactions
- cloud-dependent customer workflows

---

# Testing Rules

Customer testing must include:
- ledger calculations
- partial payments
- due calculations
- statement generation
- invoice/payment integration
- offline customer workflows

Preferred tools:
- Vitest
- SQLite test databases

---

# Final Customer Philosophy

The customer system is financial infrastructure.

The architecture must prioritize:
- financial integrity
- auditability
- traceability
- offline continuity
- deterministic calculations

Every customer balance must always be explainable.
