---
trigger: always_on
---

# Electron Rules

## Overview

This project uses Electron for building a secure offline-first desktop POS system.

Electron architecture must prioritize:

- Security
- Stability
- Offline reliability
- Performance
- Process isolation
- Safe IPC communication

This project handles sensitive business and financial data.

Security is mandatory.

---

# Electron Process Architecture

Electron must use proper multi-process architecture.

```txt
Main Process
 ├── App lifecycle
 ├── Window management
 ├── IPC handlers
 ├── Native APIs
 ├── File system access
 └── Background services

Renderer Process
 ├── React UI
 ├── User interaction
 ├── Presentation logic
 └── State management

Preload Process
 └── Secure bridge between renderer and main
```

---

# Mandatory Security Settings

Every BrowserWindow must use:

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

# BrowserWindow Rules

All windows must:
- use preload scripts
- isolate renderer
- avoid exposing Node APIs
- block unsafe navigation

Required structure:

```ts
new BrowserWindow({
  webPreferences: {
    preload,
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
    webSecurity: true
  }
})
```

---

# Preload Rules

Preload is the ONLY bridge between:
- renderer
- main process

Responsibilities:
- expose safe APIs
- whitelist IPC channels
- validate IPC access
- isolate native APIs

Never expose:
- fs
- path
- child_process
- raw ipcRenderer

Renderer must NEVER access Node directly.

---

# IPC Architecture

All communication must use:

```txt
Renderer
 ↓
Preload
 ↓
IPC
 ↓
Main Process
```

Never bypass preload layer.

---

# IPC Rules

Allowed:
- ipcMain.handle
- ipcRenderer.invoke
- whitelisted events

Avoid:
- sendSync
- unrestricted channels
- raw event forwarding

All IPC input must be validated.

Never trust renderer input.

---

# IPC Naming Convention

Use namespaced channels.

Examples:

```txt
auth:login
products:create
sales:create
inventory:update
sync:start
```

Avoid:
- generic channel names
- duplicated channel names

---

# Main Process Responsibilities

Main process should handle:
- app lifecycle
- native APIs
- printing
- filesystem access
- updater
- secure storage
- IPC orchestration
- background sync workers

Main process must remain lightweight.

Avoid business logic overload.

---

# Renderer Responsibilities

Renderer handles:
- UI rendering
- forms
- dialogs
- tables
- user interactions
- local UI state

Renderer must NOT:
- access filesystem
- access SQLite directly
- execute system commands
- contain sensitive logic

---

# File System Rules

Filesystem access is allowed ONLY in:
- main process
- approved preload APIs

Never expose unrestricted filesystem access.

All file operations must:
- validate paths
- sanitize input
- avoid unsafe writes

---

# Electron Security Rules

Forbidden:
- eval()
- new Function()
- remote module
- unsafe shell.openExternal()
- loading untrusted remote content
- preload bypasses

Never use:
- inline script injection
- unsafe HTML rendering

---

# External URL Rules

All external URLs must:
- be validated
- use allowlists
- avoid arbitrary opening

Never trust user-provided URLs.

---

# Local Storage Rules

Use:
- SQLite
- secure Electron storage
- encrypted session storage

Avoid:
- localStorage for sensitive data
- plaintext secrets
- exposed credentials

---

# Printing Architecture

Printing must be handled in:
- main process
- secure print service

Future support:
- thermal printers
- ESC/POS
- A4 invoices
- PDF export

Renderer should not directly control printers.

---

# Barcode Scanner Rules

Barcode scanners should behave as:
- keyboard input devices

POS search fields must:
- support instant scan input
- auto-focus when needed
- support rapid cashier workflows

---

# Auto Update Rules

Auto updates must:
- use signed builds
- use HTTPS only
- validate update integrity

Never allow unsigned updates.

---

# Build Rules

Required:
- electron-builder
- signed production builds
- environment separation
- production-safe configs

Production builds must:
- disable dev tools
- disable debug logs
- remove test APIs

---

# Environment Rules

Separate:
- development
- staging
- production

Never hardcode:
- secrets
- API keys
- credentials

Use environment variables.

---

# Logging Rules

Need:
- app logs
- sync logs
- crash logs
- IPC error logs

Logs must:
- avoid sensitive data exposure
- support debugging
- support audit investigations

---

# Error Handling Rules

Electron app must never crash because:
- internet disconnected
- sync failed
- Supabase unavailable
- invalid external data

Failures must degrade gracefully.

---

# Performance Rules

Avoid:
- blocking main process
- heavy synchronous operations
- giant preload scripts
- unnecessary IPC traffic

Prefer:
- async operations
- background workers
- lazy loading

---

# Window Management Rules

App must:
- restore window state
- support safe reloads
- prevent duplicate windows
- manage memory correctly

Destroy unused windows properly.

---

# Forbidden Patterns

Never generate:
- direct Node access in renderer
- nodeIntegration enabled
- contextIsolation disabled
- sendSync IPC
- filesystem access in React components
- giant preload files
- unsafe shell.openExternal()
- unrestricted IPC channels

---

# Testing Rules

Electron features requiring tests:
- IPC communication
- preload APIs
- window lifecycle
- printing flow
- sync recovery
- offline startup

Preferred tools:
- Playwright
- Vitest

---

# Final Electron Philosophy

Electron is the secure desktop shell for the offline-first POS platform.

Security and stability are more important than shortcuts.

Always prioritize:
- process isolation
- safe IPC
- offline reliability
- maintainability
- secure native integration