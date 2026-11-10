---
name: RoutePilot Design System
description: Enterprise Logistics Control Tower design system for dispatch operations and route optimization
colors:
  primary: "#22d3ee"
  primary-dark: "#06b6d4"
  primary-glow: "rgba(34, 211, 238, 0.15)"
  canvas: "#080d18"
  panel: "#0b1220"
  surface: "#101827"
  surface-hover: "#152033"
  border-subtle: "rgba(255, 255, 255, 0.07)"
  border-medium: "rgba(255, 255, 255, 0.12)"
  text-primary: "#f8fafc"
  text-secondary: "#94a3b8"
  text-muted: "#64748b"
  status-success: "#34d399"
  status-warning: "#fbbf24"
  status-danger: "#f87171"
  accent-distance: "#a78bfa"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.01em"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.02em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#020617"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  card-panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "20px"
  input-field:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
---

# Design System: RoutePilot

## Overview

**Creative North Star: "The Tactical Air Traffic Control Tower"**

RoutePilot's visual design system embodies the discipline, restraint, and precision of a mission-critical logistics command center. Designed specifically for dispatch controllers and fleet managers executing high-density route planning, the interface treats every pixel as operational real estate. Unnecessary decorative gradients, consumer glassmorphism, and frivolous animations are strictly rejected in favor of high-legibility typographic hierarchy, crisp tabular data, and purposeful color contrast.

Depth is achieved through deliberate tonal stepping—transitioning from deep space canvas (`#080d18`) to recessed inset wells (`#0b1220`) and structured surface panels (`#101827`) bounded by hairline borders (`rgba(255, 255, 255, 0.07)`). Electric cyan (`#22d3ee`) acts as an intentional focal laser, drawing immediate attention to active states, critical routing actions, and sequence milestones.

**Key Characteristics:**
- **High-Density Operational Scannability:** Tight vertical rhythm, compact data rows, and zero empty padding bloat.
- **Tonal Layering Over Shadows:** Structural hierarchy established through dark slate surfaces and fine hairline borders rather than muddy elevation shadows.
- **Monospace Entity Rigor:** Distinct monospace typography for all entity keys, machine codes, and geographical coordinates.
- **Strict Visual Cohesion:** Seamless aesthetic continuity across Overview, Route Planning, Fleet, and Deliveries modules.

## Colors

The RoutePilot palette anchors on deep charcoal and midnight navy foundations, accented with a restrained electric cyan laser and tactical status indicators.

### Primary
- **Electric Cyan** (`#22d3ee`): Used for primary call-to-action buttons, active navigation item indicators, route stop numbering, and active system focal points.
- **Cyan Deep** (`#06b6d4`): Hover and pressed state for primary actions.
- **Cyan Aura** (`rgba(34, 211, 238, 0.15)`): Subtle background tint for selected navigation pills, active chips, and focused inputs.

### Secondary
- **Route Violet** (`#a78bfa`): Dedicated semantic accent for route distance calculations and spatial metrics.

### Neutral
- **Deep Space Canvas** (`#080d18`): The root application background providing maximum contrast for dense data displays.
- **Recessed Well** (`#0b1220`): Used for sidebars, table headers, form input wells, and nested containers.
- **Surface Elevation** (`#101827`): Card backgrounds, data table containers, and modal surfaces.
- **Surface Highlight** (`#152033`): Hover states on interactive table rows, cards, and list items.
- **Hairline Border** (`rgba(255, 255, 255, 0.07)`): The normative container separator across all cards and modules.
- **Interactive Stroke** (`rgba(255, 255, 255, 0.12)`): Input outlines, button borders, and active separators.
- **Text Primary** (`#f8fafc`): Primary metric values, page headings, and active data labels.
- **Text Secondary** (`#94a3b8`): Form labels, table header text, and descriptive body copy.
- **Text Muted** (`#64748b`): Timestamps, breadcrumb subtitles, units of measurement, and inactive icons.

### Status Indicators
- **Operational Green** (`#34d399`): Active vehicles, assigned stops, completed runs, and healthy backend connectivity.
- **Operational Amber** (`#fbbf24`): Zero-delivery scenario alerts, warnings, and duration estimates.
- **Operational Rose** (`#f87171`): Unserved capacity exceptions, validation errors, and offline API signals.

### Named Rules
**The Restrained Cyan Rule.** Electric cyan must never exceed 5% of any viewport. Its power comes from scarcity—guiding the operator's eye directly to actionable buttons, active routes, and execution states.
**The No-Gradient Rule.** Primary action buttons and data cards must use solid, matte colors. Linear or radial color gradients are prohibited on operational controls.

## Typography

**Display Font:** `Inter` (with `ui-sans-serif, system-ui, -apple-system, sans-serif`)
**Body Font:** `Inter` (with `ui-sans-serif, system-ui, -apple-system, sans-serif`)
**Label/Mono Font:** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`

**Character:** Technical, clean, and utilitarian. Inter provides exceptional legibility at small sizes (11px-13px) while monospace fonts guarantee fixed-width alignment for delivery identifiers, coordinates, and quantities.

### Hierarchy
- **Display** (Bold 700, 1.5rem / 24px, line-height: 1.25, tracking: -0.025em): Platform titles and primary KPI numbers.
- **Headline** (Semi-Bold 600, 1.25rem / 20px, line-height: 1.3, tracking: -0.02em): Section headers, modal titles, and card headers.
- **Title** (Semi-Bold 600, 0.875rem / 14px, line-height: 1.4): Table section headers, card titles, and group legends.
- **Body** (Regular 400, 0.8125rem / 13px, line-height: 1.5): Descriptive copy, explanatory notices, and status descriptions.
- **Label** (Medium 500, 0.75rem / 12px, tracking: 0.01em): Form labels, table header columns, and metadata tags.
- **Monospace Identifier** (Semi-Bold 600, 0.75rem / 12px, tracking: 0.02em): Delivery IDs (`DEL-001`), Run IDs (`RUN-94...`), Vehicle IDs, and coordinates.

### Named Rules
**The Monospace Identifier Rule.** All operational entities (delivery IDs, run IDs, vehicle registrations, site IDs, and GPS coordinates) must be rendered in monospace typography. Proportional fonts are forbidden for system entity keys.

## Layout

RoutePilot employs a fixed-density desktop grid paired with a flexible collapsible navigation drawer on smaller viewports.

- **Desktop Shell:** Fixed 256px (`w-64`) left sidebar navigation; main operational workspace offsets by 256px (`lg:ml-64`) with sticky header bar.
- **Mobile/Tablet Shell:** Header bar features an accessible hamburger toggle opening an off-canvas drawer (`w-72`) with backdrop blur.
- **Grid Models:**
  - KPI Row: 4-column grid (`sm:grid-cols-2 xl:grid-cols-4`) with consistent 16px (`gap-4`) spacing.
  - Planning Workspace: Asymmetric 2-column split (`xl:grid-cols-[0.85fr_1.15fr]`) placing parameter controls on the left and sequential output on the right.
  - Data Tables: Full-width container with horizontal scroll protection (`overflow-x-auto`) and compact row heights (`py-2.5` to `py-3.5`).
- **Content Padding:** Consistent 20px to 32px (`p-5 sm:p-8`) across all main views.

## Elevation & Depth

Surfaces in RoutePilot are flat-by-default and layered tonally. Depth is communicated through luminance steps rather than diffuse drop shadows.

### Layering Hierarchy
1. **Level 0 (Canvas):** `#080d18` — The bottom-most backdrop.
2. **Level 1 (Recessed Well):** `#0b1220` — Inset containers, inputs, table headers, and sidebar wells.
3. **Level 2 (Surface Card):** `#101827` with 1px border `rgba(255, 255, 255, 0.07)` — Primary operational cards and panels.
4. **Level 3 (Interactive Element):** Buttons, active tabs, and flyouts with discrete border accents `rgba(34, 211, 238, 0.25)`.

### Named Rules
**The Tonal Boundary Rule.** Depth is created by contrasting adjacent surfaces (`#0b1220` vs `#101827`) paired with a 1px border. Drop shadows are restricted to subtle glow highlights under focused buttons or active pills.

## Shapes

- **Base Radius:** 8px (`rounded-md` / `rounded-xl`) for cards, input fields, and action buttons.
- **Pills & Badges:** Full pill radius (`rounded-full`) for status indicators, active tabs, and tag badges.
- **Container Borders:** Subtle 1px solid hairline (`border border-white/[0.07]`) on all cards, panels, and tables.
- **Focus Rings:** 1px or 2px solid cyan border with subtle ring offset (`focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30`).

## Components

### Primary Button
- **Shape:** Rounded rectangle (8px radius)
- **Background:** Electric Cyan (`#22d3ee`), text in dark navy (`#020617`), font-weight 700.
- **Hover:** Cyan Deep (`#06b6d4`), subtle transition (150ms).
- **Disabled:** 50% opacity, `cursor-not-allowed`, zero pointer events.
- **Loading State:** Inlined rotating spinner (`RefreshCw`), text switches to active verb.

### KPI Metric Card
- **Shape:** Rounded container (16px radius), 1px border `rgba(255, 255, 255, 0.07)`.
- **Background:** Surface dark (`#101827`), padding 20px.
- **Structure:** Top row with label + colored icon container; middle row with bold 24px metric; bottom row with muted helper detail.

### Data Tables
- **Header:** Background `#0b1220`, bottom border `rgba(255, 255, 255, 0.07)`, text uppercase 11px semi-bold slate-400.
- **Rows:** Background `#101827`, border divider `rgba(255, 255, 255, 0.04)`, hover highlight `#152033`.
- **Row Padding:** Vertical padding 12px (`py-3`), horizontal padding 16px (`px-4`).
- **Entity Columns:** Monospace font for IDs, text-slate-200.

### Input & Select Fields
- **Background:** Inset well (`#0b1220`), border `rgba(255, 255, 255, 0.1)`.
- **Typography:** 13px white text (`text-slate-100`), placeholder text-slate-600.
- **Focus State:** Border shifts to Electric Cyan (`#22d3ee`) with subtle cyan ring.

### Status Badges
- **Style:** Compact pill (`rounded-full`), padding 2px 8px, font size 10px-11px, font-weight 600.
- **Success:** Background `rgba(52, 211, 153, 0.1)`, text `#34d399`.
- **Warning:** Background `rgba(251, 191, 36, 0.1)`, text `#fbbf24`.
- **Error:** Background `rgba(248, 113, 113, 0.1)`, text `#f87171`.
- **Neutral / Draft:** Background `rgba(100, 116, 139, 0.2)`, text `#94a3b8`.

## Do's and Don'ts

### Do:
- **Do** use monospace typography for every identifier (`runId`, `deliveryId`, `vehicleId`, `siteId`).
- **Do** label route distance and duration as estimates derived from straight-line Haversine math.
- **Do** maintain a strict 1px border hierarchy (`border-white/[0.07]`) to delineate dark surfaces.
- **Do** preserve high data density in tables and lists so dispatchers can review routes without excessive vertical scrolling.
- **Do** provide clear, contextual empty and loading states across all four operational modules.

### Don't:
- **Don't** use generic AI-generated aesthetic tropes (blurry glassmorphism, heavy radial gradients, floating 3D spheres).
- **Don't** use decorative animations that slow down user interaction or page responsiveness.
- **Don't** use Electric Cyan as a background fill for large cards or structural sidebars.
- **Don't** truncate operational IDs without providing full visual tooltips or copy access.
- **Don't** invent fake REST endpoints or mock data when the backend architecture boundary is clear.

