# Project Knowledge Base — A POS (Medical / Pharmacy branch)

> Generated from a full read of the `feat/medical` branch on 2026-09-09.
> This documents how the app **actually works today** (code as-is), not just the aspirational rules in `.agents/`. Where the two disagree, it's called out under [Known Gaps](#known-gaps--divergence-from-agents-rules).

## Changelog (this session, 2026-09-09)

- **Fixed receipt printing** — added real printer selection (Settings → Printing), explicit `deviceName` targeting, a hard timeout so print can never hang forever, and fixed two spots where the UI told the cashier a slip printed when it had actually failed. Root causes and the fix are in § 8.7 Printing below.
- **Added the Disease → Remedy Formula library** and a working **prescription-writing UI** (previously `createPrescription` existed on the backend with zero UI to call it). See § 8.8 below.
- **Fixed a real data-loss gap: medical data never synced to the cloud.** `product_batches`, `patient_records`, `prescriptions`, and `clinic_settings` were being written to local SQLite only — no repository call ever queued them for Supabase sync, unlike every other table in the app. Now they do (see § 13 for the Supabase-side table requirement this creates).
- New migration `0003_add-disease-formulas.sql`. **Read the note inside that file** — this repo's `drizzle-kit` snapshot history is stale (migrations 0001/0002 were hand-written without matching snapshots), so `drizzle-kit generate` here recreates tables that already exist. Always hand-trim generated migrations against `meta/_journal.json` reality, don't apply them blindly. Verified safe by dry-running the full chain against both a fresh DB and a simulated pre-0003 DB (see git history of this file's commit for the exact commands).

### Round 2 (same day) — passwords, permissions, sync queue, Windows packaging

- **Passwords are now hashed with bcrypt** (`bcryptjs`, 10 rounds). `AuthService.login` self-heals: an existing plaintext `passwordHash` (any pre-upgrade account, including the seeded `admin`/`admin123`) is checked the old way exactly once, and if it matches, silently re-hashed to bcrypt right then — no forced password reset, no lockout. `createUser`/`changePassword` now hash before storing. Verified end-to-end against a real SQLite file: fresh seed hashes correctly, legacy plaintext account logs in and gets upgraded, wrong password is rejected, second login after upgrade works against the new hash.
- **Real role-based permission enforcement**, where there was none before. New `src/electron/auth/session.ts` (`SessionManager`, in-memory, set on login / cleared on logout — **intentionally not persisted**, so every fresh app launch requires a real login rather than trusting whatever the renderer's localStorage claims) and `src/electron/auth/permissions.ts` (`requirePermission(permission)`, checked against the server-side session, never against a client-supplied role). Guards added to: `auth:create-user`/`change-password` (owner/admin only), `products:delete`, `products:adjust-stock`, `categories:delete`, `customers:delete`, `suppliers:delete`, `sales:cancel`, `medical:save-clinic-settings`, `sync:set-auto` (owner/admin/manager). Registered the previously-missing `auth:logout` and `auth:get-session` IPC handlers (declared in `preload.ts` since the start but never implemented — `logout()` would have thrown "no handler registered" if anything had ever called it, and nothing did). `App.tsx` now reconciles the renderer's persisted auth state against the real main-process session on boot; `Sidebar`'s logout now actually calls `auth:logout` instead of only clearing local state. Verified the permission logic directly (no-session / wrong-role / right-role, for both a manager-tier and an owner/admin-tier permission) — all behave correctly.
- **Sync queue fixes**: removed the confirmed-dead duplicate `src/features/sync/services/sync-service.ts`. Throttled `bootstrapQueue()` (was a full table scan of every synced table on every single 60-second tick, forever) to once per 15 minutes — it's a catch-up pass for records that predate sync tracking, not something that needs re-running every tick. Added real visibility into sync failures: `sync:get-failed-items`, `sync:retry-item`, `sync:retry-all-failed` (all verified against a seeded failed row), surfaced in Settings → Cloud Sync as a "Failed Items" list showing the entity, action, retry count, and actual error message per item, each with its own Retry button plus a Retry All. Fixed `SyncSettings.tsx`'s auto-sync toggle to handle (and revert on) a permission-denied rejection instead of leaving an unhandled promise rejection and a UI showing the wrong state.
- **Fixed two silent-failure UX regressions the permission changes would otherwise have caused**: `SalesHistoryPage`'s cancel-sale handler only `console.error`'d on failure (a cashier denied permission would see literally nothing happen) — now shows a toast either way, and stopped hardcoding the audit-log actor as the literal string `'system'` in favor of the actual logged-in user's id.
- **Windows packaging check**: `electron-builder`'s `win`/`nsis` config was already solid (icon.ico, license.rtf, installer.nsh, `asarUnpack` for the native `better-sqlite3` binary, migrations copied via `extraResources` matching what `migrator.ts` expects in a packaged build). Confirmed via bundle inspection that the webpack "externals" list (`Object.keys(release/app/package.json .dependencies)`, currently just `better-sqlite3` + `drizzle-orm`) is correct — every other runtime dependency (`electron-updater`, `electron-log`, `@supabase/supabase-js`, `uuid`, `bcryptjs`, etc.) gets bundled directly into `main.js`/`preload.js` by webpack, so `release/app/node_modules` genuinely only needs those two native packages, which are already present. **Found and fixed a real bug**: `package.json`'s `build.publish` (used by `electron-updater`'s auto-update check) still pointed at the original `electron-react-boilerplate/electron-react-boilerplate` template repo instead of this project's actual repo (`alihamza126/POS`, from `git remote -v`) — auto-update would have silently never found any releases. Also fixed the same stale template URL in `homepage`/`bugs.url`/`repository.url`. **Not verified**: an actual `npm run package` NSIS build and install on a real Windows machine — that needs Windows (or Wine) and should be your final smoke test before rollout.
- Fixed one pre-existing (unrelated) TypeScript error in `preload.ts`'s `onFullscreenChange`/`onCloseRequest` cleanup functions that was failing `npm test` — an arrow function returning `removeListener()`'s return value instead of `void`. Cosmetic for the shipped app (webpack builds in transpile-only mode and never cared), but `npm test` now gets further. It still fails later on an unrelated, deeper pre-existing chain of type errors elsewhere (starting at `button.tsx`'s `defaultProps` on a `forwardRef` component) that predate this session and are out of scope of what was asked — the actual production builds (`build:main`, `build:renderer`) are unaffected by any of this and were verified clean throughout.
- Installed `bcryptjs` (pure JS — deliberately not native `bcrypt`, to avoid adding a second native module alongside `better-sqlite3` that would need its own Electron rebuild step).

---

## 1. What this project is

An **offline-first Electron desktop POS + inventory system** (`package.json` name: `a-pos`, productName `A POS`). The codebase is shared across multiple retail verticals via git branches:

- `main` / `develop` — generic retail POS
- `feat/car-shop` — car spare parts variant
- `feat/medical` (**current branch**) — pharmacy / medical store variant, adds batches, expiry tracking, patient records, prescriptions, clinic settings
- `feat/sync-engine`, `feat/rxdb` — sync engine experiments

The medical branch layers pharmacy-specific tables and features (`src/database/schema/medical.ts`, `src/features/inventory/*medical*`) on top of the shared retail POS core (products, sales, customers, suppliers, audit, sync).

## 2. Tech stack

| Layer | Technology |
|---|---|
| Shell | Electron (main + renderer + preload), electron-builder for packaging, electron-updater for auto-update |
| UI | React 19, TypeScript, React Router 7 (`MemoryRouter`), Tailwind CSS 4, shadcn/ui-style components (Radix primitives), Lucide icons, TanStack Table |
| State | Zustand (some stores persisted via `zustand/middleware persist` → localStorage in the renderer) |
| Forms | React Hook Form + Zod (`@hookform/resolvers`) |
| Local DB | SQLite via `better-sqlite3`, `drizzle-orm/better-sqlite3`, WAL mode enabled |
| Cloud | Supabase (`@supabase/supabase-js`) — used only by the sync layer |
| PDF/CSV | `@react-pdf/renderer`, `jspdf-invoice-template-nodejs`, `papaparse` |
| Bundler | Webpack via Electron React Boilerplate (`.erb/configs/*`), `ts-node` config loading |
| Tests | Jest + ts-jest + Testing Library (minimal coverage today — see [Testing](#12-testing)) |

## 3. Architecture

The `.agents/AGENT.md` rulebook mandates this layering, and the real code follows it fairly closely:

```
Renderer UI (React pages/components)
   ↓  window.api.* (contextBridge)
Preload (src/main/preload.ts)
   ↓  ipcRenderer.invoke(channel, payload)
Main process IPC handlers (src/electron/ipc/handlers.ts)
   ↓
Service layer (src/features/*/services/*-service.ts)   — business rules, validation, audit logging
   ↓
Repository layer (src/features/*/repositories/*-repository.ts) — Drizzle queries, SQLite transactions
   ↓
SQLite (better-sqlite3, WAL) — source of truth, offline-first
   ↓  (fire-and-forget, per-write)
Sync Queue (sync_queue table)
   ↓  (SyncWorker, every 60s, or manual trigger)
Background Sync (SyncService.processQueue)
   ↓
Supabase (cloud mirror)
```

Key property: **every write happens locally first and is queued for sync asynchronously** (`syncService.addToQueue(...).catch(console.error)` — non-blocking, errors are swallowed so a sync failure never blocks the UI). The renderer never touches SQLite directly; it only calls `window.api.*`.

## 4. Directory map

```
src/
  app/App.tsx              — route table + global providers (Toaster, GlobalCloseDialog)
  main/                     — Electron main process
    main.ts                 — app bootstrap, BrowserWindow, migrations, IPC/setup, sync worker start
    preload.ts               — contextBridge API surface exposed to renderer as window.api
    menu.ts, util.ts, sync-worker.ts
  electron/ipc/handlers.ts  — ipcMain.handle(...) registrations, dispatches to *Service classes
  database/
    schema/*.ts              — Drizzle table definitions (see §6)
    migrations/*.sql          — versioned SQL migrations + drizzle-kit meta/journal
    sqlite/db.ts               — drizzle() instance, opens <userData>/pos-v1.db
    sqlite/migrator.ts          — runs migrations on app start
    seed/                        — dev seed scripts (run-seed.js, dummy-data.sql)
  features/<domain>/          — feature-based modules, each with some subset of:
    pages/  components/  hooks/  repositories/  services/  schemas/  types/
    domains: audit, auth, categories, customers, dashboard, inventory (medical),
             products, sales, settings, suppliers, sync
  sync/services/sync-service.ts — the canonical SyncService (push+pull); also duplicated
                                    under features/sync/services (see §10 note)
  stores/                    — Zustand stores: auth-store, pos-store, settings-store
  layouts/                   — MainLayout, Sidebar, Topbar (app chrome for non-POS pages)
  routes/ProtectedRoute.tsx  — auth-gate wrapper using auth-store
  shared/                    — constants (APP_CONFIG, env, banks), schemas, utils (pdf, csv, supabase client)
  components/ui/             — shadcn-style primitives (button, dialog, table, select, toast, …)
```

Feature module pattern (from `.agents/rules/architecture.md` and observed in code): each feature owns its own `pages/`, `components/`, `hooks/`, `repositories/`, `services/`, `schemas/`, `types/` — no cross-feature DB access; UI calls the service via IPC, service calls the repository.

## 5. Electron main process (`src/main/main.ts`)

- Loads `.env` via `dotenv` at the top.
- `BrowserWindow`: `1024x728`, **fullscreen: true, resizable: false, maximizable: false** — kiosk-style POS window.
- Security config matches the mandated rules: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, `webSecurity: true`.
- Boot sequence in `app.whenReady()`:
  1. `runMigrations()` — applies pending Drizzle SQL migrations (`src/database/sqlite/migrator.ts`)
  2. `setupIpcHandlers()` — registers all `ipcMain.handle` channels
  3. `syncWorker.start()` — begins the 60s auto-sync loop
  4. `createWindow()`
- Window `close` is intercepted (`e.preventDefault()`) and forwarded to the renderer as `app:close-request`, which the renderer answers via `GlobalCloseDialog` + `window.api.window.confirmClose()` (destroys window then `app.quit()`). This is how the app implements a "confirm before closing" UX.
- `AppUpdater` wraps `electron-updater`'s `checkForUpdatesAndNotify()`.
- A few misc IPC handlers are registered directly in `main.ts` rather than `handlers.ts`: `ipc-example` (boilerplate leftover), `window:toggle-fullscreen`, `app:confirm-close`.

## 6. Database schema (SQLite via Drizzle)

All tables use **text UUID primary keys** (`uuid v4`), and almost every business table carries `branchId` (and often `deviceId`) for future multi-branch/multi-device support, plus `createdAt`/`updatedAt` timestamps. Note: several schema files exist in duplicate `.ts`/`.js` pairs (the `.js` files appear to be stale/compiled leftovers — the `.ts` files are the ones actually imported by `db.ts`).

### Core retail tables
- **`users`** / **`roles`** (`auth.ts`) — `username`, `passwordHash`, `role` enum (`owner|admin|manager|cashier|accountant`), `active`. `roles` table holds JSON permission strings but isn't wired into any enforcement yet.
- **`categories`** — simple `name`/`description`, soft-deletable (`deletedAt`).
- **`products`** (`inventory.ts`) — `sku` (unique), `barcode` (unique), `name`, pricing (`purchasePrice`, `sellingPrice`), `reorderLevel`, `active` flag (soft delete), plus **medical fields added on this branch**: `composition`, `manufacturer`, `batchNumber`, `expiryDate`, `rackLocation`, `requiresPrescription`.
- **`stock_movements`** — the single source of truth for stock. `type` enum: `purchase|sale|return|adjustment|damage|transfer`; `quantity` is signed (+in/-out). **Current stock is never stored on the product row — it's always `SUM(stock_movements.quantity)` computed on read** (`ProductRepository.getCurrentStock`). This directly implements the AGENT.md rule "never generate `products.stock -= 1`".
- **`customers`** / **`customer_payments`** — customer master + payment ledger (method enum incl. cheque/bank_transfer), soft-deletable.
- **`suppliers`** / **`purchase_invoices`** / **`purchase_invoice_items`** / **`supplier_payments`** — supplier-side mirror of the sales flow, including its own payment status (`unpaid|partial|paid`) and payment type (`cash|card|bank_transfer|credit|cheque`).
- **`invoices`** / **`invoice_items`** (`sales.ts`) — the POS sale record. `invoiceNumber` is unique and deterministic (see §8). `paymentStatus` (`unpaid|partial|paid`), `paymentType` (`cash|card|transfer|credit`), `status` (`active|cancelled|returned`) — invoices are **never hard-deleted**, only status-flipped.
- **`audit_logs`** — generic append-only log: `userId`, `deviceId`, `branchId`, `action`, `entity`, `entityId`, `oldValue`/`newValue` (JSON strings), `metadata`, `createdAt` (epoch ms).
- **`sync_queue`** / **`sync_logs`** (`sync.ts`) — outbox pattern: one row per pending change (`entity`, `entityId`, `action`, `payload` JSON, `status: pending|processing|synced|failed`, `retryCount`); `sync_logs` records each sync run's summary.

### Medical-specific tables (`medical.ts`, migration `0002_add-medical-features.sql`)
- **`product_batches`** — multi-batch tracking per product: `batchNumber`, `expiryDate`, `manufacturingDate`, per-batch `purchasePrice`/`sellingPrice` override, `quantity`, links to `supplierId`/`purchaseInvoiceId`, `isActive`. Queried in **FEFO order** (`ORDER BY expiryDate ASC`) — First-Expired-First-Out.
- **`expiry_alerts`** — generated alerts per product or batch. `severity`: `critical` (≤7 days or expired), `warning` (8–30 days), `info` (31–90 days, default threshold). `status`: `active|dismissed|expired`.
- **`patient_records`** — 1:1 extension of `customers` (unique `customerId`): DOB, gender, blood group, allergies, chronic conditions, current medications, referring doctor, emergency contact.
- **`prescriptions`** — linked to a customer and optionally an invoice (nullable — can be written before or after the sale). `medicines` is a JSON-encoded array of `{name, dosage, frequency, duration}`. `status`: `draft|dispensed|partial`.
- **`clinic_settings`** — generic key/value store for clinic branding/receipt config (clinic name, doctor name, license number, receipt footer, paper size, currency, expiry alert threshold days, which fields to print on receipts).

### Migrations
`src/database/migrations/`: `0000_initial-squashed.sql` → `0001_add-suppliers.sql` → `0002_add-medical-features.sql`, tracked by drizzle-kit's `meta/_journal.json`. `runMigrations()` resolves the migrations folder differently for dev (`.erb/dll/../../../src/database/migrations`) vs. packaged builds (`process.resourcesPath/migrations`, copied in via `extraResources` in the electron-builder config).

## 7. IPC surface (`window.api.*`)

Exposed via `contextBridge` in `src/main/preload.ts`, handled in `src/electron/ipc/handlers.ts`. Namespaces:

- `api.auth` — `login`, `logout`, `getSession`, `getUsers`, `createUser`, `changePassword`
- `api.db` — generic `execute`/`query` (currently a stub logger in `handlers.ts`, not wired to real queries — dead code path)
- `api.sync` — `getStatus`, `getHistory`, `triggerSync`, `pullFromCloud`, `setAuto`
- `api.products` — `list`, `get`, `create`, `update`, `delete`, `adjustStock`, `importBulk`
- `api.audit` — `log`, `getLogs`, `getActions`
- `api.customers` — `list`, `get`, `create`, `update`, `delete`, `getLedger`, `getSummary`, `recordPayment`, `getPayments`
- `api.sales` — `create`, `get`, `list`, `cancel`, `getDailySummary`, `getNextInvoiceNumber`
- `api.categories` — `list`, `create`, `update`, `delete`
- `api.suppliers` — `list`, `get`, `create`, `update`, `delete`, `getLedger`, `getSummary`, `createPurchaseInvoice`, `getPurchaseInvoices`, `recordPayment`, `getPayments`, `createSimplePurchase`
- `api.window` — `toggleFullscreen`, `onFullscreenChange`, `onCloseRequest`, `confirmClose`
- `api.medical` — expiry alerts (`getAlerts`, `getAlertCounts`, `dismissAlert`, `refreshAlerts`, `getExpiringBatches`), batches (`getBatches`, `addBatch`), patient records (`getPatientRecord`, `savePatientRecord`), prescriptions (`createPrescription`, `getPrescriptions`, `getPrescription`, `linkPrescription`), clinic settings (`getClinicSettings`, `saveClinicSettings`)
- `api.print` — `printReceipt(html, silent)` → opens a hidden `BrowserWindow`, loads the HTML as a `data:` URL, calls `webContents.print()`

## 8. Core business workflows

### 8.1 POS Sale (`SalesService.createSale`, called from `POSPage` → `CartPanel`/`PaymentDialog`)
1. **Validate**: cart non-empty; re-check live stock per line (`ProductRepository.getCurrentStock`) and reject if insufficient; credit sales require a selected customer.
2. **Calculate** (`SalesService.calculateTotals`, mirrored client-side in `usePOSStore`'s computed getters for live UI totals): line totals = `unitPrice*qty - itemDiscount`; `totalDiscount = sum(itemDiscounts) + invoiceDiscount`; `tax = (subtotal - totalDiscount) * taxRate/100`; `grandTotal` rounded to 2dp; `changeAmount = max(0, paid - grandTotal)`.
3. **Persist** (`SalesRepository.createInvoice`) inside a single `db.transaction`: insert `invoices` row → insert each `invoice_items` row → insert a matching negative `stock_movements` row (`type: 'sale'`) per item. Every insert is individually pushed to the sync queue (fire-and-forget).
4. **Invoice numbering** (`SalesRepository.getNextInvoiceNumber`): deterministic, per branch+device: `BR{branchId[:2]}-DEV{deviceId[:2]}-{seq:06d}`, sequence derived by parsing the last invoice matching that prefix (not a DB sequence/counter table — a query-time max+1, so there's a theoretical race under concurrent writers, mitigated by being a single-writer SQLite file per device).
5. **Audit log**: `AuditService.log({ action: 'SALE_CREATED', entity: 'invoice', ... })`.
6. Payment status derived from `paidAmount` vs `grandTotal` (`unpaid|partial|paid`; credit sales default to `unpaid` at `paidAmount === 0`).

Receipt printing (`MedicalReceiptPrinter.tsx`) builds an HTML receipt (branded with clinic settings — batch/expiry/composition shown per `showBatchOnReceipt` etc.) and sends it to `api.print.printReceipt`.

**Note:** although `product_batches` exist with FEFO ordering, the sale flow does **not** currently decrement a specific batch or resolve which batch was sold from — stock movements are recorded against the product only. Batch-aware deduction is not wired into `SalesRepository.createInvoice` yet.

### 8.2 Cancel a sale (`SalesService.cancelSale` → `SalesRepository.cancelInvoice`)
Transaction: flips `invoices.status` to `cancelled` (never deleted), inserts a positive `return`-type `stock_movements` row per original item to restore stock, logs `SALE_CANCELLED` audit entry with old/new values.

### 8.3 Stock / inventory
- `products.currentStock` is **always derived**, never stored — `SUM(stock_movements.quantity WHERE productId = ?)`.
- Manual adjustments go through `api.products.adjustStock` → `ProductService.adjustStock` → `stockMovements` insert with `type: adjustment|damage|transfer`, requires `reason` + `userId`.
- Stock status buckets for filtering (`in_stock`/`low_stock`/`out_of_stock`) are computed **in application memory** after fetching a page of products (compared against `reorderLevel`), not in SQL — a scalability caveat noted in the code comment itself.

### 8.4 Customers & ledger
`customer-repository`, `payment-service`, `ledger-service` implement: customer CRUD (soft delete via `deletedAt`), `customer_payments` recording, and a computed ledger/running balance (invoices − payments, per `.agents/rules/customer-management.md`'s "never mutate balance directly" rule — balances are always derived from transaction history, never stored on the customer row).

### 8.5 Suppliers & purchasing
Mirrors the customer side: `suppliers`, `purchase_invoices` (+ items), `supplier_payments`, plus a "quick/simple purchase" shortcut (`createSimplePurchase`) for fast stock-in without a full purchase invoice.

### 8.6 Medical workflows (`MedicalService` / `medical-repository.ts`)
- **Expiry alerts**: `refreshExpiryAlerts(branchId, thresholdDays=90)` — dismisses all currently-active alerts for the branch, then rebuilds them from scratch by scanning `products.expiryDate` and all active `product_batches` within the threshold window, computing `daysUntilExpiry` and severity (`critical ≤7d`, `warning ≤30d`, `info ≤90d`). Not scheduled automatically in the reviewed code — appears to be triggered on-demand (e.g. dashboard/alerts panel load) via `api.medical.refreshAlerts`.
- **Batches**: `getBatchesForProduct` returns batches ordered FEFO; `addBatch` inserts + audit-logs `BATCH_CREATED`.
- **Patient records**: 1:1 upsert keyed by `customerId`; audit-logged as `PATIENT_RECORD_UPDATED`.
- **Prescriptions**: created standalone (`status: draft`), later `linkPrescriptionToInvoice` sets `invoiceId` + flips status to `dispensed`, audit-logged as `PRESCRIPTION_DISPENSED`.
- **Clinic settings**: simple key/value get-all-with-defaults / set-many, audit-logged as `CLINIC_SETTINGS_UPDATED` with full old/new snapshots.

### 8.7 Printing — receipt generation

`MedicalReceiptPrinter.tsx` builds the 80mm thermal receipt HTML; printing itself is handled in the main process by `src/electron/printer/printer-utils.ts` (`listPrinters()`, `printHtml()`), called via the `print:receipt` / `print:get-printers` IPC channels.

- **Printer selection lives in Settings → Printing** (`PrintingSettings.tsx`) — lists OS printers via `getPrintersAsync()`, lets the user pick one explicitly, persists it to `clinic_settings.printerName` (reusing the existing generic key/value settings store — no schema change needed), and has a **Send Test Print** button that surfaces the real failure reason.
- The selected `printerName` flows through `getClinicSettings()` → `clinicInfo.printerName` → passed as `deviceName` to every `printReceipt(html, silent, deviceName)` call (POS receipt, payment dialog, test print). If empty, falls back to the OS default printer.
- Non-silent print (`silent:false`, the "Print Slip" dialog) now creates the hidden window with `show:true` — Windows/Chromium attaches the native print dialog to whatever window requested it, and an invisible window has nowhere to render that dialog.
- Every print call resolves within 20s no matter what (timeout guard) — it can no longer hang the UI on "Printing…" forever.
- Both silent-print call sites (`MedicalReceiptPrinter.tsx`, `PaymentDialog.tsx`) now check `result.success` before marking the slip as printed, and surface `result.reason` on failure instead of silently claiming success.

### 8.8 Disease Formulas & Prescriptions (new)

Homeopathic-specific workflow added this session, built on the existing (previously UI-less) `prescriptions` table:

- **`disease_formulas` table** (migration `0003`) — a reusable Disease → Remedy library: `diseaseName`, optional `category`, `remedies` (JSON array of `{name, potency, dosage, frequency, duration, notes}`), general `notes`, `isActive` (soft-deactivate, never hard-deleted). Repository: `DiseaseFormulaRepository` in `medical-repository.ts`. Service + audit logging (`DISEASE_FORMULA_CREATED/UPDATED/DEACTIVATED/REACTIVATED`) in `MedicalService`. IPC: `medical:list-disease-formulas`, `get-disease-formula`, `create-disease-formula`, `update-disease-formula`, `set-disease-formula-active`.
- **Formula library UI**: new sidebar page `/formulas` (`src/features/formulas/`) — list, search, active/inactive filter, create/edit dialog with a dynamic remedies list (`FormulaFormDialog.tsx`, `useFieldArray`).
- **Prescription-writing UI** (didn't exist before): a new "Prescriptions" tab on the customer details page (`CustomerDetailsTabs.tsx` → `PrescriptionsTab.tsx`) lists a patient's prescriptions and opens `NewPrescriptionDialog.tsx`, which:
  1. Lets the doctor pick a disease via the existing `SearchableSelect` component, searching the formula library.
  2. Auto-fills the remedies list (editable — `useFieldArray`) from the selected formula.
  3. Pre-fills doctor name / license / clinic name from `clinic_settings`.
  4. Saves via the existing `medical:create-prescription` IPC (unchanged) — `prescriptions.medicines` now carries the richer `{name, potency, dosage, frequency, duration, notes}` shape (the column is a loosely-typed JSON text field, so this needed no migration).
- **Not yet built**: linking a prescription to a POS sale (`linkPrescriptionToInvoice` exists on the backend but nothing in the POS/cart UI calls it), and `requiresPrescription` products don't yet block/warn a sale without a linked prescription. Flag this as a next step if prescription compliance matters to the business.

### 8.9 Audit logging
Every service class calls `AuditService.log({ userId, action, entity, entityId, oldValue?, newValue?, metadata?, branchId, deviceId })` after a state change. This is the uniform pattern across the whole codebase — any new feature should follow the same call shape. Logs are viewable via `AuditLogPage` (`api.audit.getLogs`).

## 9. Authentication

- `AuthService.login(username, password)`: on first run, auto-seeds a default `admin`/`admin123` user (`role: 'admin'`) if the `users` table is empty.
- **Password check is a plain string comparison against `passwordHash`** — there is no actual hashing (`userRecord.passwordHash === password`), despite a comment acknowledging "In a real app, use bcrypt or similar." **This is a real security gap**, see §13.
- On success, returns a `UserSession { id, name, role, branchId }` — note `branchId` is **not** read from the DB user record, it's injected from `APP_CONFIG.branch.defaultId` (single hardcoded branch — multi-branch is aspirational, not implemented).
- `auth-store` (Zustand, persisted to localStorage as `auth-storage`) holds `{ user, isAuthenticated }` in the renderer; `ProtectedRoute` redirects to `/login` when `isAuthenticated` is false.
- No role/permission enforcement is implemented in IPC handlers or services today — `roles.permissions` (JSON) exists in the schema but nothing reads it. Role checks, if any, would need to be added at the UI level (e.g., hiding nav items) — not currently done beyond the flat `role` string on the user.

## 10. Sync engine

Two near-duplicate `SyncService` implementations exist:
- **`src/sync/services/sync-service.ts`** — the real one, imported everywhere (`sales-repository`, `product-repository`, `handlers.ts`, `sync-worker.ts`).
- **`src/features/sync/services/sync-service.ts`** — appears to be a leftover/alternate copy; not confirmed to be wired into the app. Treat `src/sync/services/sync-service.ts` as canonical; worth confirming the other file is dead code before editing sync behavior.

**Push (`processQueue`)**: runs on a 60s interval (`SyncWorker`, started in `main.ts`) or on-demand via `api.sync.triggerSync`.
1. If the local DB looks completely empty (`isLocalDatabaseEmpty` — no categories AND no products), it runs a full `pullFromCloud()` first instead of pushing (bootstraps a fresh install from the cloud).
2. Otherwise, `bootstrapQueue()` scans every core table for rows missing from `sync_queue` and enqueues them (self-healing for anything created before sync tracking existed, or written directly).
3. Pulls `pending` + `failed`(retryCount < 5) queue items, ordered by a hardcoded dependency priority (`categories → customers/suppliers → products → invoices/purchase_invoices → invoice_items/purchase_invoice_items → stock_movements → customer_payments/supplier_payments`), then by creation time.
4. For each item: converts the JSON payload's camelCase keys to snake_case (Supabase convention) and `upsert`s into the matching Supabase table (special-cased: `purchase_invoices` payloads carry nested `items` and are split into two upserts; entity `'sales'` maps to Supabase table `invoices`). Marks `synced` or `failed` (+ increments `retryCount`, stores `syncMessage`).
5. Every run writes a `sync_logs` row (`running → success|partial|failed`) with counts, surfaced to the UI via `api.sync.getHistory`/`getStatus`.

**Pull (`pullFromCloud`)**: fetches full tables from Supabase for a fixed list (roles, users, categories, customers, suppliers, products, invoices, invoice_items, stock_movements, customer_payments, supplier_payments, purchase_invoices, purchase_invoice_items) and `onConflictDoUpdate`s them locally by `id`. Used both for first-run bootstrap and the manual "Pull" action in Settings (`SyncSettings.tsx`).

Sync failures are logged but never thrown back to the caller that originally wrote the record — writes always succeed locally regardless of cloud connectivity, matching the offline-first mandate.

## 11. Frontend structure

- **Routing** (`App.tsx`, `MemoryRouter`): `/login` (public), `/pos` (protected, no sidebar — full-screen POS layout), and everything else nested under `MainLayout` (protected): `/` dashboard, `/inventory` (+ `/inventory/:id`), `/sales` (history), `/categories`, `/audit`, `/customers` (+ `/customers/:id`), `/suppliers` (+ `/suppliers/:id`), `/settings`.
- **Layout chrome**: `MainLayout` wraps `Sidebar` + `Topbar` + page content. `Sidebar` nav: Dashboard, POS, Sales History, Inventory, Categories, Customers, Suppliers, Audit Log, Settings.
- **State**:
  - `auth-store` — session, persisted.
  - `pos-store` — the in-progress cart for the currently open sale (items, customer, payment method, discount, tax, amount tendered); exposes computed getters (`getSubtotal`, `getTotalDiscount`, `getTaxAmount`, `getGrandTotal`, `getChangeAmount`) that mirror `SalesService.calculateTotals` so the POS screen can show live totals before submitting. Not persisted (cleared on `clearCart()` after a completed sale).
  - `settings-store` — company display details, persisted, seeded from `APP_CONFIG.defaults`.
- **Design tokens**: `.agents/rules/styling-and-colors.md` and `APP_CONFIG.pdf` specify brand colors `#24D4FE` (cyan), `#02025C` (navy), `#F1EFF9`, `#FFFFFF`; large-radius, soft-shadow, minimal enterprise look via Tailwind + `src/app/styles/globals.css`.

## 12. Testing

`npm test` runs Jest (jsdom env, ts-jest). Actual coverage found in the tree is minimal: `src/__tests__/App.test.tsx` plus a couple of ad-hoc scratch scripts at repo root (`test-stock.js`, `scratch/check_db.ts`, `scratch/test-db.js`) that look like manual debugging scripts rather than a real suite. The `.agents/rules/testing-process.md` workflow calls for Vitest/Playwright coverage of invoice/payment/ledger/inventory flows that doesn't yet exist in code.

## 13. Known gaps / divergence from `.agents/` rules

The `.agents/AGENT.md` + `.agents/rules/*.md` files describe the **intended** architecture; most of it is followed (transaction-safe sales, movement-based inventory, audit logging, offline-first, no hard deletes), but a few things diverge and are worth knowing before extending the app:

- **(Fixed round 2)** ~~Passwords are stored and compared in plaintext~~ — now bcrypt-hashed with a self-healing migration for existing plaintext accounts. Default seeded credentials are still `admin` / `admin123` — **change this password immediately after first login**, hashing doesn't help if the default credential is public knowledge.
- **Supabase credentials are hardcoded in source** (`src/shared/constants/env.ts`) rather than loaded from `.env`/build-time secrets — it's the public anon key, so risk is bounded by Supabase RLS policies (not verified here), but it means the key ships inside the built app and any repo clone.
- **(Fixed round 2)** ~~No role/permission enforcement~~ — `src/electron/auth/{session,permissions}.ts` now enforce role checks server-side (see changelog) for the operations the business rules flag as sensitive (user management, stock adjustment, sale cancellation, settings, destructive deletes). `roles.permissions` (the JSON column) still isn't read — the permission map is a fixed table in `permissions.ts` rather than DB-configurable; fine for 5 fixed roles, would need revisiting for custom per-installation roles.
- **Single hardcoded branch/device identity** — `APP_CONFIG.branch.defaultId = 'BR-2'`, `defaultDeviceId = 'D-2'` are compile-time constants used everywhere instead of being read from a per-install config or DB row; multi-branch is schema-ready but not actually configurable at runtime.
- **`APP_CONFIG.defaults` still reflects a different vertical** ("Al Madina autos", spare-parts address) — leftover from the car-shop branch lineage; should be updated for a medical/pharmacy default, or made a first-run onboarding step, if this branch ships standalone.
- **Batches aren't wired into sale-time stock deduction** — `product_batches` + FEFO ordering exist and are populated on purchase, but `SalesRepository.createInvoice` deducts from the product total only, not a specific batch. Expiry-aware dispensing (auto-picking the soonest-expiring batch) isn't implemented yet.
- **(Fixed round 2)** ~~Two `SyncService` files~~ — the dead duplicate `src/features/sync/services/sync-service.ts` has been deleted. `src/sync/services/sync-service.ts` is the only one and always was the only one actually wired in.
- **`db:execute` / `db:query` IPC handlers are stubs** (log-and-return-empty) — not a real generic query path; all real data access goes through the dedicated per-feature channels.
- **Stock-status filtering (`in_stock`/`low_stock`/`out_of_stock`) is done in application memory** after paging from SQL, which will not scale well with large catalogs (acknowledged in a code comment in `product-repository.ts`).
- **Invoice numbering** is computed via `ORDER BY invoiceNumber DESC LIMIT 1` + parse-and-increment rather than a dedicated counter/sequence table — fine for single-writer-per-device SQLite but worth knowing if concurrent writers to the same device are ever introduced.
- **`drizzle-kit`'s snapshot history is stale** — `src/database/migrations/meta/` only ever had a snapshot for `0000`; migrations `0001` and `0002` were hand-written SQL without matching snapshots, so a plain `npx drizzle-kit generate` re-diffs against the original `0000` schema and re-emits `CREATE TABLE` for tables that already exist (suppliers, medical tables, etc.) — applying that output as-is on any real install would fail with "table already exists". `0003_add-disease-formulas.sql` was hand-trimmed to just the real delta after discovering this; do the same for any future migration — never apply raw `drizzle-kit generate` output here without inspecting it against `meta/_journal.json` first.
- **Prescriptions aren't linked to sales yet** — `linkPrescriptionToInvoice` exists on the backend and the POS `requiresPrescription` product flag exists in the schema, but nothing in the POS cart/checkout flow calls it or blocks/warns a sale for a prescription-only item without one. Worth building if prescription compliance matters for the business.
- **(Fixed this session) Medical/clinic data never synced to the cloud at all.** Every repository method in `medical-repository.ts` (`ProductBatchRepository`, `PatientRecordRepository`, `PrescriptionRepository`, `ClinicSettingsRepository`) wrote straight to SQLite and never called `syncService.addToQueue(...)` — unlike every other repository in the app. Product batches, patient medical records, prescriptions, and clinic settings existed **only on the device that created them**. Fixed: those repositories (plus the new `DiseaseFormulaRepository`) now push to the sync queue like everything else, `sync-service.ts`'s `pullFromCloud`/`bootstrapQueue`/priority-order list all know about the 5 new tables, and `bootstrapQueue` will retroactively catch up any pre-existing local rows on the next sync tick. **`expiry_alerts` was deliberately left out of sync** — it's a fully-derived, high-churn table (wiped and regenerated on every `refreshAlertsForBranch()` call), so each device just regenerates its own from the (now-synced) product/batch data rather than syncing every alert create/dismiss. **This still needs the matching tables to exist on the Supabase side** — the code will now try to push `product_batches`, `patient_records`, `prescriptions`, `clinic_settings`, `disease_formulas` to those Supabase table names; create them there (mirroring the local schema) before relying on cross-device sync for this data, otherwise pushes will fail (harmlessly — they just retry/stay `failed` in the queue, per-table errors don't block other tables).

## 14. Build & run

```bash
npm start            # dev: builds main (webpack), then launches renderer dev server + electron
npm run build         # production build (main + renderer)
npm run package        # full electron-builder package (dist installers)
npm run seed             # src/database/seed/run-seed.js — seeds dev data
npm test                  # jest
```
`postinstall` runs `check-native-dep.js`, `electron-builder install-app-deps`, and rebuilds the webpack DLL. `package.json` currently has `lint`/`lint:fix` stubbed to `echo 'ESLint is disabled'` — linting is effectively off despite `.agents/rules/lint-and-quality-rules.md` mandating it.

---

*This file is a snapshot of the `feat/medical` branch as read on 2026-09-09 (commit `0c3b8c5`). Re-read the relevant source before relying on specifics that may have since changed — schema files, `handlers.ts`, and the service classes are the ground truth.*
