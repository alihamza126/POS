---
trigger: always_on
---

# Styling & Color System Rules

## Overview

This project uses a modern soft enterprise UI design system optimized for:
- desktop POS workflows
- inventory management
- long business usage sessions
- modern SaaS aesthetics
- clean readability
- dark/light adaptability

The design language must feel:
- premium
- clean
- soft
- modern
- professional
- calm
- highly usable

Avoid aggressive enterprise styling.

---

# Design Philosophy

The UI should feel like:
- modern SaaS platforms
- Linear
- Notion
- Stripe Dashboard
- Raycast
- modern inventory systems

The interface must prioritize:
- clarity
- spacing
- soft surfaces
- subtle depth
- readability
- productivity

Avoid:
- sharp harsh UI
- heavy borders
- cluttered layouts
- excessive gradients
- noisy dashboards

---

# Primary Color Palette

## Primary Brand Colors

```txt
Primary Cyan:
#24D4FE

Primary Navy:
#02025C
```

---

# Background Colors

## Main Background

```txt
#F1EFF9
```

Use for:
- app background
- dashboard surfaces
- layout background

---

## Card / Surface Background

```txt
#FFFFFF
```

Use for:
- cards
- tables
- dialogs
- modals
- forms
- panels

---

# Accent Usage Rules

## Cyan Accent (#24D4FE)

Use for:
- active states
- buttons
- focused inputs
- selected navigation
- highlights
- sync indicators

Avoid overusing cyan.

It should feel:
- clean
- premium
- focused

---

## Navy Accent (#02025C)

Use for:
- headings
- primary text
- sidebar
- important UI emphasis

Navy is the main anchor color.

---

# Neutral Color Rules

Use soft neutrals.

Recommended:
- slate
- zinc
- gray

Avoid:
- pure black text
- harsh contrast
- overly saturated colors

Preferred text tone:

```txt
Primary Text:
#111827

Secondary Text:
#6B7280
```

---

# Surface Rules

UI surfaces should:
- feel layered softly
- remain airy
- avoid visual heaviness

Use:
- white surfaces
- subtle shadows
- soft borders
- generous spacing

Avoid:
- dark heavy cards
- thick borders
- excessive elevation

---

# Shadow Rules

Use soft modern shadows.

Preferred shadow style:

```css
box-shadow:
0 2px 10px rgba(2, 2, 92, 0.04),
0 8px 24px rgba(2, 2, 92, 0.06);
```

Cards should feel:
- floating softly
- lightweight
- modern

Avoid:
- hard shadows
- large black shadows
- aggressive neumorphism

---

# Border Rules

Borders should remain subtle.

Preferred border color:

```txt
rgba(2, 2, 92, 0.08)
```

Avoid:
- strong dark borders
- thick outlines

---

# Radius Rules

The entire application should use consistent rounded corners.

## Global Radius System

```txt
Small Radius: 10px
Medium Radius: 14px
Large Radius: 18px
XL Radius: 24px
```

---

# Component Radius Rules

## Buttons

```txt
12px
```

## Cards

```txt
18px
```

## Inputs

```txt
14px
```

## Dialogs / Modals

```txt
24px
```

## Tables

```txt
18px
```

---

# Root Styling Rules

Define root variables globally.

Required location:

```txt
src/app/styles/
```

Example files:

```txt
globals.css
theme.css
tailwind.css
```

---

# Root CSS Variables

Required root variables:

```css
:root {
  --background: #F1EFF9;
  --surface: #FFFFFF;

  --primary: #24D4FE;
  --primary-dark: #02025C;

  --text-primary: #111827;
  --text-secondary: #6B7280;

  --border: rgba(2, 2, 92, 0.08);

  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 18px;
  --radius-xl: 24px;

  --shadow-soft:
    0 2px 10px rgba(2, 2, 92, 0.04),
    0 8px 24px rgba(2, 2, 92, 0.06);
}
```

---

# Background Rules

Application background:

```txt
#F1EFF9
```

Cards and elevated surfaces:

```txt
#FFFFFF
```

Avoid:
- dark noisy backgrounds
- gradient-heavy backgrounds

---

# Button Rules

Buttons should:
- feel soft
- feel modern
- avoid sharp edges

Primary buttons:
- cyan background
- white text
- subtle shadow

Secondary buttons:
- white background
- navy text
- soft border

Avoid:
- glossy buttons
- aggressive gradients
- thick borders

---

# Input Rules

Inputs should:
- remain soft
- use subtle borders
- use navy focus rings
- support clean spacing

Focus state:
- cyan outline
- soft glow
- accessible contrast

---

# Card Rules

Cards should:
- use white surfaces
- use soft shadows
- maintain large spacing
- feel breathable

Avoid crowded cards.

---

# Sidebar Rules

Sidebar should:
- use deep navy tones
- maintain minimal navigation
- use soft active indicators

Suggested sidebar color:

```txt
#02025C
```

Active item:
- cyan accent
- soft highlight

---

# Table Rules

Tables should:
- remain clean
- avoid heavy borders
- support zebra softness
- use large row spacing

Hover states should feel subtle.

---

# Modal Rules

Dialogs should:
- use large radius
- soft shadows
- white surfaces
- clean spacing

Avoid:
- fullscreen harsh modals
- cluttered dialogs

---

# Typography Rules

Typography should feel:
- modern
- clean
- readable
- enterprise-grade

Recommended:
- Inter
- Geist
- Plus Jakarta Sans

Avoid:
- decorative fonts
- condensed fonts

---

# Spacing Rules

Use generous spacing.

Preferred spacing scale:

```txt
4
8
12
16
20
24
32
40
```

Avoid cramped layouts.

---

# Animation Rules

Animations should:
- remain subtle
- improve UX
- avoid distraction

Use:
- soft fades
- smooth hover transitions
- subtle scaling

Avoid:
- bouncing animations
- flashy transitions
- excessive motion

---

# Dark Mode Rules

Future dark mode should:
- preserve softness
- avoid pitch-black surfaces
- use layered dark grays

Dark mode should still feel premium.

---

# Accessibility Rules

Maintain:
- readable contrast
- visible focus states
- keyboard accessibility

Accessibility is mandatory.

---

# Tailwind Rules

Tailwind should use:
- centralized theme tokens
- reusable utility classes
- consistent spacing

Avoid:
- arbitrary random values everywhere

---

# Component Style Philosophy

Every component should feel:
- soft
- modern
- lightweight
- premium
- calm

The UI should reduce visual stress during long business usage.

---

# Forbidden Styling Patterns

Never generate:
- harsh black shadows
- sharp square UI
- cluttered dashboards
- thick borders
- outdated ERP styling
- aggressive gradients
- excessive colors
- cramped spacing

---

# Final Styling Philosophy

The design system should feel like a premium modern business operating platform.

The UI must prioritize:
- calmness
- clarity
- usability
- elegance
- long-term maintainability

The application should look trustworthy, modern, and highly polished.