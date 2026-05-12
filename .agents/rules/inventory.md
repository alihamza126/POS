---
trigger: always_on
---

# Inventory Rules

## Overview

The inventory system is one of the most critical parts of the application.

Inventory architecture must prioritize:
- accuracy
- auditability
- consistency
- offline reliability
- scalability
- transaction safety

Inventory mistakes directly affect business operations.

The inventory system must be deterministic and traceable.

---

# Core Inventory Philosophy

This project uses movement-based inventory architecture.

Inventory must NEVER rely on mutable stock fields.

Forbidden:

```txt
products.stock -= 1
```

Required:

```txt
stock_movements
```

Current stock is calculated from movement history.

---

# Inventory Movement Architecture

All inventory changes must create movement records.

Examples:
- purchase
- sale
- return
- adjustment
- transfer
- damage
- expired items

Inventory history must always remain traceable.

---

# Required Tables

Core inventory tables:

```txt
products
stock_movements
inventory_adjustments
purchase_items
sale_items
warehouse_transfers
```

Optional future tables:

```txt
batches
serial_numbers
expiry_tracking
warehouse_locations
```

---

# Product Rules

Products must support:
- SKU
- barcode
- category
- brand
- unit
- purchase price
- selling price
- reorder level

Optional:
- batch tracking
- serial tracking
- expiry tracking

---

# SKU Rules

Every product should contain:
- unique SKU
- barcode support

SKUs must remain unique per branch.

Barcode lookup must remain fast.

---

# Stock Calculation Rules

Current stock should be calculated using:

```txt
SUM(stock_movements)
```

Movement examples:

| Type | Quantity |
|------|----------|
| purchase | +10 |
| sale | -2 |
| return | +1 |
| damage | -1 |

Never trust manually edited stock counts.

---

# Inventory Transaction Rules

Critical inventory operations must use transactions.

Examples:
- invoice creation
- purchase creation
- stock adjustment
- warehouse transfer

Inventory consistency is mandatory.

---

# Inventory Adjustment Rules

Inventory adjustments require:
- reason
- authorized user
- audit log
- timestamp

Examples:
- damaged stock
- expired stock
- manual correction
- theft/loss

Adjustments must remain traceable.

---

# Warehouse Rules

Future warehouse support must allow:
- multi-location inventory
- branch isolation
- transfer tracking

Every stock movement should support:

```txt
branch_id
warehouse_id
```

---

# Branch Isolation Rules

Inventory must remain isolated per branch.

Never mix:
- branch inventory
- branch invoices
- branch adjustments

Branch-aware inventory is mandatory.

---

# Transfer Rules

Transfers between branches or warehouses must:
- reduce source inventory
- increase destination inventory
- remain transactional
- generate audit logs

Transfers must never partially complete.

---

# Purchase Rules

Purchases must:
- create stock movements
- update supplier balances
- remain transactional

Purchase creation should:
- increase inventory
- create audit logs
- create sync queue entries

---

# Sales Rules

Sales must:
- reduce inventory
- create stock movements
- remain transactional
- support rollback

Invoice creation must:
- never partially fail
- preserve inventory consistency

---

# Return Rules

Returns must:
- reverse inventory safely
- preserve invoice linkage
- remain auditable

Return types:
- sales return
- purchase return

---

# Damage Rules

Damaged inventory must:
- create stock adjustments
- require reasons
- remain auditable

Never silently reduce stock.

---

# Inventory Validation Rules

Inventory operations must validate:
- available stock
- branch ownership
- product existence
- permissions

Never allow negative stock silently unless business rules permit it.

---

# Negative Stock Rules

Initial recommendation:
- avoid negative stock

If enabled later:
- require permissions
- generate warnings
- remain auditable

---

# Batch Tracking Rules

Future support may include:
- batch numbers
- expiry dates
- manufacturing dates

Architecture should remain extensible for:
- pharmacy
- medical inventory
- food inventory

---

# Serial Number Rules

Future support:
- serial number tracking
- unique item tracking

Required for:
- electronics
- automotive parts
- high-value inventory

---

# Barcode Rules

Barcode support must:
- remain fast
- support scanner input
- support duplicate lookup prevention

Barcode search should feel instant.

---

# Inventory Search Rules

Inventory search must support:
- SKU
- barcode
- product name
- category
- brand

Search performance is critical.

---

# Inventory Performance Rules

Inventory queries must:
- support indexing
- support pagination
- avoid heavy joins where possible
- remain fast offline

Large inventories should remain responsive.

---

# Inventory Sync Rules

Inventory sync must:
- preserve consistency
- avoid duplicate movements
- support retries
- remain deterministic

Inventory conflicts must never silently overwrite data.

---

# Audit Rules

All inventory changes must create audit logs.

Required audit events:
- stock adjustment
- stock transfer
- purchase creation
- invoice creation
- return processing

Audit logs must remain immutable.

---

# Offline Rules

Inventory must work fully offline.

The system must:
- allow offline sales
- allow offline purchases
- allow offline stock lookup
- preserve local inventory integrity

Internet must never block inventory operations.

---

# Inventory UI Rules

Inventory screens must:
- remain fast
- support keyboard navigation
- support barcode scanning
- support bulk operations

Avoid cluttered inventory interfaces.

---

# Forbidden Patterns

Never generate:
- mutable stock state
- direct stock edits without movement logs
- inventory operations without transactions
- inventory operations without audit logs
- cloud-dependent stock operations
- silent inventory corrections

---

# Inventory Testing Rules

Inventory testing must include:
- transaction rollback
- duplicate prevention
- stock calculation validation
- transfer validation
- return validation
- offline inventory operations

Preferred tools:
- Vitest
- SQLite test databases

---

# Future Scalability Rules

Architecture should support future:
- multi-warehouse
- batch tracking
- serial tracking
- expiry tracking
- advanced inventory analytics

Current implementation must remain simple and stable.

---

# Final Inventory Philosophy

Inventory integrity is critical business infrastructure.

The inventory system must prioritize:
- consistency
- traceability
- auditability
- offline reliability
- transaction safety

Every stock change must be explainable and traceable.