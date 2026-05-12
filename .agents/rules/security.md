---
trigger: always_on
---

# Security Rules

## Overview

This project handles sensitive business and financial data.

Security is mandatory.

The application must prioritize:
- secure Electron architecture
- protected business data
- safe authentication
- auditability
- secure IPC communication
- offline-safe security

Security must never be sacrificed for convenience.

---

# Core Security Philosophy

This project is offline-first.

Rules:
- local operations must remain secure
- internet loss must not reduce security
- permissions must remain enforceable offline
- audit trails must remain intact

Never generate insecure fallback behavior.

---

# Electron Security Rules

Mandatory BrowserWindow settings:

```ts
contextIsolation: true
nodeIntegration: false
sandbox: true
webSecurity: true
```

Never disable these protections.

Forbidden:

```ts
nodeIntegration: true
contextIsolation: false
webSecurity: false
```

---

# Renderer Security Rules

Renderer process must NEVER:
- access Node APIs directly
- access filesystem directly
- execute system commands
- access raw ipcRenderer
- store secrets

Renderer is considered untrusted.

---

# Preload Security Rules

Preload responsibilities:
- expose safe APIs only
- whitelist IPC channels
- isolate native functionality
- validate exposed methods

Never expose:
- fs
- child_process
- unrestricted shell access
- unrestricted IPC

---

# IPC Security Rules

All IPC communication must:
- use whitelisted channels
- validate payloads
- sanitize input
- reject invalid requests

Allowed:
- ipcMain.handle
- ipcRenderer.invoke

Avoid:
- sendSync
- unrestricted events
- arbitrary IPC forwarding

---

# Authentication Rules

Authentication must support:
- secure login
- session locking
- role-based access
- offline validation

Future support:
- PIN login
- biometric login

Passwords must never be stored in plaintext.

---

# Session Rules

Sessions must:
- expire safely
- support lock screen
- require reauthentication
- avoid exposing sensitive state

On app restart:
- authentication required again

---

# Role-Based Access Rules

System must support roles:

```txt
Owner
Admin
Manager
Cashier
Accountant
```

Permissions must:
- be enforced locally
- be validated server-side later
- protect sensitive actions

---

# Permission Rules

Sensitive operations require permissions.

Examples:
- deleting invoices
- stock adjustment
- settings access
- user management
- payment reversal

Never rely on frontend-only restrictions.

---

# Secure Storage Rules

Sensitive data should use:
- encrypted local storage
- secure Electron storage
- protected session handling

Avoid:
- plaintext secrets
- exposed tokens
- localStorage for sensitive data

---

# Secret Management Rules

Never hardcode:
- API keys
- secrets
- tokens
- admin credentials

Use:
- environment variables
- secure configuration loading

---

# Database Security Rules

Database access must:
- use repositories only
- validate permissions
- protect sensitive queries

Never:
- expose raw DB access to renderer
- bypass authorization
- trust client payloads blindly

---

# Audit Security Rules

Audit logs are security-critical.

Audit logs must:
- be immutable
- track sensitive actions
- support investigations
- include user/device info

Required fields:
- user_id
- device_id
- branch_id
- action
- timestamp

Audit logs must never be editable.

---

# Sync Security Rules

Sync payloads must:
- validate branch ownership
- validate device ownership
- validate user permissions

Never trust:
- client-provided permissions
- unverified payloads

---

# File System Security Rules

Filesystem access allowed only in:
- main process
- approved preload APIs

All file operations must:
- validate paths
- sanitize filenames
- avoid unsafe writes

Never expose unrestricted filesystem APIs.

---

# External URL Rules

All external URLs must:
- use allowlists
- validate domains
- avoid arbitrary opening

Never trust user-provided URLs.

Forbidden:
- unsafe shell.openExternal()
- arbitrary redirects

---

# Printing Security Rules

Printing must:
- use controlled print services
- sanitize printable content
- avoid arbitrary system access

Renderer should not directly access printers.

---

# Barcode Security Rules

Barcode input must:
- sanitize input
- validate format
- avoid injection risks

Never trust raw scanner input blindly.

---

# Error Handling Rules

Security-related errors must:
- avoid leaking internals
- avoid exposing stack traces
- log safely

Users should receive:
- understandable messages
- safe recovery guidance

---

# Logging Rules

Logs must:
- avoid secrets
- avoid plaintext credentials
- support debugging
- support investigations

Sensitive data must never appear in logs.

---

# Network Security Rules

All APIs must use:
- HTTPS
- authenticated requests
- validated payloads

Avoid:
- insecure endpoints
- unencrypted communication

---

# CSP Rules

Electron windows should use:
- strict Content Security Policy
- self-hosted assets where possible

Avoid:
- unsafe-inline scripts
- eval()
- dynamic script injection

---

# Forbidden Patterns

Never generate:
- nodeIntegration enabled
- contextIsolation disabled
- plaintext passwords
- raw ipcRenderer exposure
- direct filesystem access in renderer
- unrestricted shell access
- insecure token storage
- unsafe eval usage
- exposed secrets
- bypassed permissions

---

# Security Testing Rules

Security testing should include:
- IPC validation
- permission validation
- authentication flow
- offline permission handling
- session recovery
- malicious input testing

Preferred tools:
- Playwright
- Vitest

---

# Incident Recovery Rules

The system should:
- survive crashes safely
- preserve audit logs
- preserve inventory integrity
- preserve local data

Security failures must not corrupt business data.

---

# Final Security Philosophy

Security is part of the architecture.

The system must protect:
- business data
- financial records
- inventory integrity
- audit history
- user permissions

Always prioritize:
- process isolation
- least privilege
- validation
- auditability
- secure defaults

Never trade security for convenience.
