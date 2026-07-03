---
name: Administrative HR Management System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45474c'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f73'
  primary: '#091426'
  on-primary: '#ffffff'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#bcc7de'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#1e1200'
  on-tertiary: '#ffffff'
  tertiary-container: '#35260c'
  on-tertiary-container: '#a38c6a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#fadfb8'
  tertiary-fixed-dim: '#ddc39d'
  on-tertiary-fixed: '#271902'
  on-tertiary-fixed-variant: '#564427'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  brand-navy: '#0F172A'
  brand-indigo: '#6366F1'
  success-emerald: '#10B981'
  warning-amber: '#F59E0B'
  danger-rose: '#E11D48'
  surface-gray: '#F8FAFC'
  border-subtle: '#E2E8F0'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1440px
  sidebar-width: 260px
  sidebar-collapsed: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  stack-sm: 8px
  stack-md: 16px
---

## Brand & Style

The design system is engineered for high-performance administrative environments where data density and clarity are paramount. The brand personality is **authoritative, efficient, and dependable**, designed to instill confidence in HR professionals managing sensitive organizational data.

The visual style follows a **Corporate / Modern** aesthetic. It prioritizes functional minimalism, utilizing generous white space to prevent cognitive overload while maintaining a "Dashboard" feel that is organized and data-driven. Key characteristics include:
- **Functional Precision:** Clear visual hierarchies and structured grids.
- **Trustworthy Professionalism:** A sober but fresh palette that avoids visual fatigue during long working hours.
- **Interactive Responsiveness:** Subtle motion to provide feedback without distracting from the data.

## Colors

The palette is anchored by **Deep Indigo/Navy** to communicate stability and authority. **Emerald Green** is utilized strategically for active states and positive growth metrics, ensuring that key "Success" indicators stand out.

- **Primary:** Navy (#1E293B) for sidebars, primary buttons, and headings.
- **Secondary:** Emerald (#10B981) for validation, active status indicators, and positive KPI trends.
- **Neutral:** A range of Slate and Blue-Grays to define the interface structure, borders, and secondary text.
- **Backgrounds:** We utilize a very soft gray (#F8FAFC) for the main canvas to reduce glare and differentiate cards from the background.

## Typography

This design system uses **Inter** exclusively to leverage its exceptional legibility in data-dense environments. 

- **Numerical Data:** For tables and KPI cards, we enable tabular numbers (`tnum`) to ensure columns of figures align vertically, aiding quick comparison.
- **Hierarchy:** We use font weight rather than size to create distinction in dense layouts. Labels are often presented in uppercase with slight tracking for clear section identification.
- **Scalability:** Headlines scale down by 15% on mobile devices to ensure long titles (common in HR terminology) do not break the layout.

## Layout & Spacing

The system employs a **Fixed-Fluid Hybrid Grid**. The Sidebar navigation remains fixed (with a collapsed state), while the main content area utilizes a fluid 12-column grid.

- **Grid System:** 12 columns on desktop, 6 columns on tablet, and 1 column on mobile.
- **Spacing Logic:** An 8px base unit (linear scale) governs all padding and margins. 
- **KPI Layout:** On desktop, KPI cards are arranged in a 4-column row. On mobile, they stack vertically or use a horizontal scroll snap to preserve screen real estate.
- **Data Tables:** These are the centerpiece. They occupy the full width of the content container with horizontal scrolling enabled for smaller viewports.

## Elevation & Depth

To maintain a clean "Dashboard" aesthetic, this design system uses **Tonal Layers** supplemented by **Low-Contrast Outlines**.

- **Surfaces:** The primary background is `surface-gray`. Cards and containers use absolute white (#FFFFFF).
- **Shadows:** We avoid heavy shadows. Instead, we use a single, very soft "Ambient Shadow" (0px 1px 3px rgba(0,0,0,0.05)) to separate cards from the background.
- **Borders:** A 1px border (#E2E8F0) is the primary method for defining card boundaries and table rows, ensuring the interface remains crisp and high-contrast without feeling heavy.
- **Z-Index:** The Sidebar and Topbar occupy the highest elevation layer, utilizing a slightly stronger shadow to indicate they sit above the content during scroll.

## Shapes

The design system uses a **Soft** shape language. 

- **Standard Elements:** Buttons, input fields, and small cards use a 4px (0.25rem) radius for a professional, precise feel.
- **Large Containers:** Main dashboard cards and the sidebar use an 8px (0.5rem) radius to provide a subtle visual softening of the complex data layouts.
- **Interactive Elements:** Checkboxes use a 2px radius, while status chips utilize a fully rounded "pill" shape to distinguish them from actionable buttons.

## Components

### KPI Cards
The building blocks of the dashboard. They must include a title (Label-MD), a primary value (Headline-LG), and a secondary "Trend Indicator" showing percentage change. Trends use Emerald Green for positive and Rose for negative.

### Sidebar Navigation
A dark-themed (#1E293B) vertical bar. Active states are indicated by a 4px left-border accent in Emerald Green and a subtle background tint. Icons must be stroke-based (2px weight) for clarity.

### Data Tables
Tables use a "Zebra-striping" alternate row background in `surface-gray`. Header cells are `label-md` with a subtle bottom border. High-priority cells (like Employee Status) use colored Chips.

### Buttons
- **Primary:** Solid Navy with White text.
- **Secondary:** White background with Navy border and text.
- **Success:** Solid Emerald for "Approve" or "Hire" actions.

### Input Fields
Bordered style with a 1px Slate-200 outline. On focus, the border transitions to Indigo-500 with a 3px soft focus ring. Labels are always positioned above the field.

### Status Chips
Small, pill-shaped indicators.
- **Active:** Emerald background (10% opacity) with Emerald text.
- **Pending:** Amber background (10% opacity) with Amber text.
- **Inactive:** Slate background (10% opacity) with Slate text.