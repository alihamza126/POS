---
trigger: always_on
---

# UI Rules

## Overview

This project uses a modern enterprise desktop UI architecture optimized for:

- POS workflows
- Inventory management
- Fast cashier operations
- Keyboard-driven navigation
- Large datasets
- Long-term scalability

The UI must prioritize:
- speed
- simplicity
- readability
- consistency
- usability

The UI should feel modern, clean, and professional.

---

# UI Stack

Required technologies:

- shadcn/ui
- Tailwind CSS
- Lucide Icons
- TanStack Table
- React Hook Form
- Zod
- Zustand

Avoid introducing additional UI frameworks unless necessary.

---

# Design Philosophy

The UI must be:

- modern
- minimal
- enterprise-grade
- dark-mode first
- keyboard-friendly
- responsive
- fast to navigate

Avoid:
- cluttered layouts
- excessive animations
- heavy gradients
- outdated ERP styling
- unnecessary visual noise

---

# POS Workflow Priority

POS workflows are the highest UI priority.

The cashier experience must be:
- fast
- intuitive
- low-click
- keyboard optimized

The cashier should:
- search quickly
- scan products rapidly
- create invoices instantly
- process payments efficiently

---

# Layout Architecture

Required layout structure:

```txt
<AppLayout>
 ├── Sidebar
 ├── Topbar
 ├── Main Content
 └── Global Dialog Layer
```

Use consistent layout structure across all pages.

---

# Sidebar Rules

Sidebar should:
- remain minimal
- support icons
- support collapse mode
- maintain consistent navigation

Avoid:
- deep nested navigation
- excessive menu groups

---

# Topbar Rules

Topbar may contain:
- search
- profile menu
- notifications
- branch selector
- sync status

Keep topbar lightweight.

---

# POS Screen Layout

Recommended structure:

```txt
-------------------------------------------------
| Product Search                                |
-------------------------------------------------
| Product Grid        | Invoice Panel           |
|                     |                         |
|                     |                         |
-------------------------------------------------
```

Requirements:
- instant search
- keyboard shortcuts
- barcode support
- sticky invoice section
- rapid product selection

---

# Form Rules

Use:
- React Hook Form
- Zod validation

Forms must:
- validate immediately
- show clear errors
- support keyboard navigation
- avoid unnecessary steps

Avoid:
- giant forms
- modal overload
- confusing validation messages

---

# Dialog Rules

Dialogs should:
- remain focused
- avoid excessive nesting
- support keyboard closing
- trap focus correctly

Avoid:
- multiple stacked dialogs
- giant fullscreen dialogs unless necessary

---

# Table Rules

Use:
- TanStack Table

Tables must support:
- pagination
- sorting
- filtering
- virtualization for large datasets
- responsive resizing

Large tables must use virtualization.

---

# Search Rules

Search is critical.

Requirements:
- instant feedback
- debounce where necessary
- barcode support
- keyboard navigation

Product search should feel immediate.

---

# Keyboard Navigation Rules

The application must support:
- tab navigation
- enter key workflows
- escape key closing
- arrow key navigation

POS operations should minimize mouse usage.

---

# Component Rules

Components must:
- remain reusable
- remain composable
- separate UI from business logic
- avoid duplication

Preferred component size:

```txt
< 250 lines
```

Avoid giant components.

---

# Shared Component Rules

Reusable UI belongs in:

```txt
components/
```

Examples:
- tables
- dialogs
- forms
- buttons
- cards
- layout components

Avoid feature-specific logic inside shared components.

---

# Feature Component Rules

Feature-specific UI belongs inside:

```txt
features/
```

Example:

```txt
features/sales/components/
features/products/components/
```

---

# Styling Rules

Use:
- Tailwind CSS
- shadcn/ui primitives

Avoid:
- inline styles
- inconsistent spacing
- random colors
- large custom CSS files

---

# Spacing Rules

Use consistent spacing scale.

Preferred spacing:
- 2
- 4
- 6
- 8

Avoid inconsistent padding/margins.

---

# Color Rules

The UI should use:
- neutral palettes
- strong contrast
- accessible colors

Avoid:
- excessive bright colors
- gradient-heavy UI
- inconsistent color systems

Status colors:
- success
- warning
- destructive
- info

must remain consistent.

---

# Typography Rules

Typography should:
- remain clean
- prioritize readability
- support dense business data

Avoid:
- oversized typography
- inconsistent font scales

---

# Dark Mode Rules

Dark mode is primary.

All components must:
- support dark mode
- maintain accessible contrast
- avoid washed colors

Never hardcode light-only colors.

---

# Loading State Rules

All async operations should support:
- loading indicators
- skeleton loaders
- disabled states

Avoid blocking entire screens unnecessarily.

---

# Empty State Rules

Empty states should:
- explain clearly
- guide next action
- avoid blank screens

Example:
- no products
- no invoices
- no customers

---

# Error State Rules

Errors must:
- remain understandable
- avoid technical jargon
- support recovery actions

Never expose raw internal errors to users.

---

# Toast Rules

Use toast notifications for:
- success messages
- sync updates
- warnings
- recoverable errors

Avoid excessive toast spam.

---

# Mobile Responsiveness Rules

The primary target is desktop.

However:
- layouts should remain responsive
- avoid fixed overflow issues
- support future tablet layouts

---

# Accessibility Rules

Required:
- keyboard accessibility
- focus visibility
- semantic HTML
- accessible contrast

Avoid inaccessible interactions.

---

# Animation Rules

Animations should:
- remain subtle
- improve UX
- avoid distraction

Avoid:
- heavy transitions
- slow animations
- excessive motion

---

# Performance Rules

UI must:
- avoid unnecessary re-renders
- support virtualization
- lazy load heavy screens
- remain responsive during sync

POS screens must feel instant.

---

# State Rules

Use:
- Zustand for global state
- local state for isolated UI

Avoid:
- prop drilling
- giant global stores
- duplicated state

---

# Forbidden Patterns

Never generate:
- inline styles
- giant monolithic components
- duplicated UI logic
- blocking loaders
- excessive modals
- unnecessary animations
- direct DB access in UI
- business logic inside presentation components

---

# Testing Rules

UI testing should include:
- keyboard navigation
- dialog behavior
- table interactions
- POS workflows
- responsive layouts

Preferred tools:
- Playwright
- Vitest

---

# Final UI Philosophy

The UI is a productivity tool for businesses.

The interface must prioritize:
- speed
- clarity
- reliability
- efficiency
- maintainability

Good business UI reduces friction and increases operational speed.