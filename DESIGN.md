---
version: alpha
name: GreenFactory Insight
description: Industrial sustainability platform. Calm forest-green brand from the logo, dense enterprise data surfaces, Thai-first typography, tabular numerals everywhere a number is compared.

colors:
  primary: "#0b5c43"
  primary-hover: "#094d38"
  primary-press: "#073d2d"
  primary-soft: "#e7f2ec"
  on-primary: "#ffffff"
  accent: "#9ccb12"
  accent-ink: "#3f5605"
  forest-900: "#062e22"
  control-room: "#073d2d"
  ink: "#16201b"
  ink-secondary: "#46524b"
  ink-mute: "#66726b"
  canvas: "#f4f6f3"
  surface: "#ffffff"
  surface-sunken: "#eef2ef"
  hairline: "#e2e8e4"
  hairline-strong: "#cdd6d0"
  focus-ring: "#2e8f69"
  status-good: "#0ca30c"
  status-warning: "#fab219"
  status-serious: "#ec835a"
  status-critical: "#d03b3b"
  series-1: "#2a78d6"
  series-2: "#eb6834"
  series-3: "#1baf7a"
  series-4: "#eda100"
  series-5: "#e87ba4"
  series-6: "#008300"
  series-7: "#6250d6"
  series-8: "#e34948"
  dark-canvas: "#0c110e"
  dark-surface: "#141b17"
  dark-hairline: "#25302a"
  dark-ink: "#e8eee9"
  dark-ink-mute: "#9aa79f"
  dark-primary: "#a3d92b"
  dark-on-primary: "#0c110e"

typography:
  display:
    fontFamily: "Bai Jamjuree, IBM Plex Sans Thai, system-ui, sans-serif"
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: "Bai Jamjuree, IBM Plex Sans Thai, system-ui, sans-serif"
    fontSize: 30px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em
  headline-md:
    fontFamily: "IBM Plex Sans Thai, IBM Plex Sans, system-ui, sans-serif"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "IBM Plex Sans Thai, IBM Plex Sans, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
  body-md:
    fontFamily: "IBM Plex Sans Thai, IBM Plex Sans, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "IBM Plex Sans Thai, IBM Plex Sans, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "IBM Plex Sans Thai, IBM Plex Sans, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.02em
  metric-xl:
    fontFamily: "Bai Jamjuree, IBM Plex Sans, system-ui, sans-serif"
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.02em
    fontFeature: tnum
  metric-md:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
    fontFeature: tnum
  code:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  full: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  huge: 64px
  sidebar: 256px
  content-max: 1440px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: 8px 14px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: 8px 14px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 8px 12px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 20px
  stat-tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.metric-xl}"
    rounded: "{rounded.lg}"
    padding: 20px
  sidebar:
    backgroundColor: "{colors.forest-900}"
    textColor: "{colors.on-primary}"
    width: "{spacing.sidebar}"
  badge:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 2px 8px
---

# GreenFactory Insight — Design System

## Overview

GreenFactory Insight helps Thai factories measure electricity, water, fuel and carbon, then act on it. Users are plant managers reading trends, operators recording meter readings on a phone at the machine, company admins configuring the plant, and platform admins running the service.

The UI should feel like a precise industrial instrument: calm, trustworthy, information-dense, never decorative. Green is the brand, not the background. Most of the screen is neutral so that data, status and the one primary action stand out.

Reference lineage: structure and numeric rigor from Stripe's dashboard, density and grid discipline from IBM Carbon, brand colors from the GreenFactory logo. We borrow principles, not their branding.

### Direction: the plant control room

The subject is utility metering in Thai factories: meter dials, readout digits, machine nameplates, the plant control room. Visual choices come from there, not from a SaaS template.

- **One bold element per screen.** Dashboards open with an *instrument band*: a control-room green strip (`control-room`) holding the 3–4 readings that matter, separated by vertical hairlines, each with a sparkline. Everything below is quiet.
- **Readings first.** Numbers and page titles are set in **Bai Jamjuree** (Cadson Demak's squared technical face, like stamped readout plates); units are small and muted next to them.
- **Nameplates.** Machine, checkpoint and QR codes render as small bordered nameplate tags, not monospace text.
- **Panels, not a card grid.** Content sits on flat white panels whose size follows importance. Inside a panel, use lists with dividers, never cards inside cards.
- **Lime is a signal, not a color scheme.** Only for "live/connected" dots and the active nav marker.

Generated-UI tells we do not use: dot-joined meta strings ("A · B · C"), "WORD — fragment" labels, arrows appended to links, ALL-CAPS tracked eyebrows, monospace for small labels, identical rounded cards with the same shadow, gradient washes, a fade-in on every section.

## Colors

- **Forest (#0b5c43, `primary`):** the logo's deep green. Primary buttons, active nav, links, focus. One primary action per view.
- **Lime (#9ccb12, `accent`):** the logo's lime. Small highlights only: the active-nav indicator, the logo dot, a "live" pulse. Never text on white (fails contrast). On dark surfaces it becomes the primary (`dark-primary`).
- **Deep forest (#062e22):** app sidebar and marketing footer.
- **Ink / ink-secondary / ink-mute:** three text levels. Body text is `ink`; captions and metadata `ink-mute` (4.9:1 on white).
- **Canvas (#f6f8f6) and surface (#ffffff):** page background vs cards. Separation comes from hairlines, not shadows.
- **Status:** good / warning / serious / critical are reserved for state (alerts, thresholds, machine status). Always shipped with an icon and a text label. Never used as a chart series.
- **Series 1–8:** categorical chart colors, validated for color-vision deficiency on both surfaces (adjacent CVD ΔE ≥ 8.4). Assigned to entities in fixed order, never cycled, never re-assigned by rank. Fixed mapping: electricity = series-1, water = series-2... in the order of `RESOURCE_TYPES`. Series 3, 4, 5 are below 3:1 on white, so every chart ships a legend plus direct labels or a table view.
- **Dark mode:** selected steps, not an automatic inversion. Canvas `#0c110e`, surface `#141b17`, primary becomes lime with dark text.

## Typography

- **Bai Jamjuree** (display): page titles, instrument-band readings, stat values, gauge numbers. Weight 600, tabular figures.
- **IBM Plex Sans Thai** (text): everything else — readable at 13–14px in dense tables. Tabular figures in tables and axes.
- Codes (machine, QR, company) use the nameplate tag in Bai Jamjuree, not a monospace face. Monospace only for raw tokens/URLs.
- App body is 14px; dense tables 13px. Marketing display tops out at 48px.
- One `h1` per page (the page title). Do not skip heading levels.
- Thai line-height stays at 1.5 or more for body text because of stacked vowels and tone marks.

## Layout

- App shell: fixed 256px forest sidebar on desktop, collapsible to icons; becomes a sheet on mobile. Top bar holds breadcrumb, factory switcher, notifications and user menu.
- Content max width 1440px, 24px gutters on desktop, 16px on mobile.
- 4px base scale. Use only the spacing tokens; no arbitrary values.
- Dashboards: a row of 3–4 stat tiles, then charts, then the detail table. Filters sit in one row above everything they affect.
- Operator screens are mobile-first: one task per screen, 44px minimum touch targets, the primary action pinned to the bottom.
- Breakpoints to test: 360, 768, 1024, 1440.

## Elevation & Depth

Flat. Hierarchy comes from the canvas/surface contrast and 1px hairlines. Shadows are allowed only for floating layers (popover, dropdown, dialog, toast): one soft shadow `0 8px 24px rgb(6 46 34 / 0.12)`. No stacked shadows, no glassmorphism, no gradient fills on cards.

## Shapes

Radius follows hierarchy: 14px instrument band and hero surfaces, 10px panels and dialogs, 6px controls and nameplates, full only for status chips and avatars. Charts use 4px rounded data-ends anchored to the baseline and 2px lines.

## Components

Built on shadcn/ui (Radix) and themed through CSS variables mapped from these tokens. Every data view handles five states: loading (skeleton, not spinner), empty (explains what to do next), error (with retry), success, and no-permission.

- **Stat tile:** label, metric in `metric-xl`, unit in `ink-mute`, a delta with arrow icon and text ("+4.2% จากเดือนก่อน"). Never color alone.
- **Data table:** sticky header, 13px rows at 40px height, right-aligned tabular numbers, row actions in a trailing menu, pagination and filters in the URL.
- **Charts (Recharts):** one y-axis only, recessive grid, legend for 2+ series, hover tooltip, a "ดูเป็นตาราง" table toggle.
- **Status badge:** icon + Thai label + status color, e.g. ● ปกติ / ▲ เฝ้าระวัง / ■ วิกฤต.
- **Forms:** label above input, helper text below, inline Zod error in `status-critical` with an icon, submit disabled while pending.

## Do's and Don'ts

Do:
- Use real Thai copy with real lengths while designing.
- Format numbers with `th-TH` locale and units (kWh, m³, tCO₂e).
- Keep one primary button per view.
- Respect `prefers-reduced-motion`; motion is 150–200ms ease-out and functional only.

Don't:
- No purple/indigo, no gradient hero meshes, no rounded-2xl everywhere, no shadow-heavy cards.
- No emoji as icons; use lucide icons at 16/20px.
- No mock numbers in production views; show an empty state instead.
- Never put lime text on white, or status colors on chart series.
- No dual-axis charts.
