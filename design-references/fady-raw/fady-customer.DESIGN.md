# fady-customer DESIGN.md

> Auto-generated design system — reverse-engineered via static analysis by skillui.
> Frameworks: None detected
> Colors: 20 · Fonts: 3 · Components: 8
> Icon library: not detected · State: not detected
> Primary theme: light · Dark mode toggle: no · Motion: expressive

## Visual Reference

**Match this design exactly** — study colors, fonts, spacing, and component shapes before writing any UI code.

![fady-customer Homepage](../screenshots/homepage.png)

---

## 1. Visual Theme & Atmosphere

This is a **light-themed** interface with a cool, approachable feel. The light background emphasizes content clarity. Typography pairs **uberMove** for display/headings with **Instrument Serif** for body text, creating clear visual hierarchy through type contrast. Spacing follows a **4px base grid** (compact density), with scale: 2, 4, 6, 8, 10, 12, 14, 16px. The accent color **#d4a5ff** anchors interactive elements (buttons, links, focus rings). Motion is expressive — spring physics, layout animations, and staggered reveals are part of the visual language.

---

## 2. Color Palette & Roles

| Token | Hex | Role | Use |
|---|---|---|---|
| tw-ring-offset-color | `#ffffff` | background | Page background, darkest surface |
| muted | `#f4f4f5` | surface | Card and panel backgrounds |
| foreground | `#0f0f14` | text-primary | Headings and body text |
| muted-foreground | `#71717a` | text-muted | Captions, placeholders, secondary info |
| text-muted | `#374151` | text-muted | Captions, placeholders, secondary info |
| border | `#4b5563` | border | Dividers, card borders, outlines |
| accent | `#d4a5ff` | accent | CTAs, links, focus rings, active states |
| accent-foreground | `#5b1899` | accent | CTAs, links, focus rings, active states |
| accent | `#ead1ff` | accent | CTAs, links, focus rings, active states |
| success | `#16a34a` | success | Success states, positive indicators |
| warning | `#facc15` | warning | Warning states, caution indicators |
| info | `#111827` | info | Informational highlights |
| border | `#e4e4e7` | unknown | Palette color |
| ring | `#bc31fc` | unknown | Palette color |
| unknown | `#22c55e` | unknown | Palette color |
| unknown | `#9ca3af` | unknown | Palette color |
| unknown | `#000000` | unknown | Palette color |
| unknown | `#c882ff` | unknown | Palette color |
| unknown | `#1a0a2e` | unknown | Palette color |
| unknown | `#3d0f66` | unknown | Palette color |

### CSS Variable Tokens

```css
--tw-border-spacing-x: 0;
--tw-border-spacing-y: 0;
--tw-border-spacing-x: 0;
--tw-border-spacing-y: 0;
--background: 0 0% 100%;
--foreground: 240 10% 3.9%;
--muted: 240 4.8% 95.9%;
--muted-foreground: 240 3.8% 46.1%;
--popover: 0 0% 100%;
--popover-foreground: 240 10% 3.9%;
--accent: 273 100% 91%;
--accent-foreground: 273 80% 32%;
--border: 240 5.9% 90%;
--tw-border-opacity: 1;
--tw-border-opacity: 1;
--tw-border-opacity: 1;
--tw-border-opacity: 1;
--tw-border-opacity: 1;
--tw-border-opacity: 1;
--tw-border-opacity: 1;
```


---

## 3. Typography Rules

**Font Stack:**
- **Instrument Serif** — Heading 1, Heading 2, Heading 3
- **uberMove** — Body, Caption
- **SFMono-Regular** — Code

**Font Sources:**

```css
@font-face {
  font-family: "uberMove";
  src: url("https://fady-app.com/_next/static/media/26459542bcd447d9-s.p.otf") format("opentype");
  font-weight: 700;
}
@font-face {
  font-family: "Instrument Serif";
  src: url("https://fady-app.com/_next/static/media/5ece437c7024c161-s.woff2") format("woff2");
  font-weight: 400;
}
@font-face {
  font-family: "DM Sans";
  src: url("https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxhTg.ttf") format("truetype");
  font-weight: 400;
}
@font-face {
  font-family: "DM Sans";
  src: url("https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwARZthTg.ttf") format("truetype");
  font-weight: 700;
}
```

| Role | Font | Size | Weight |
|---|---|---|---|
| Heading 1 | Instrument Serif | 6rem | 700 |
| Heading 2 | Instrument Serif | 4.5rem | 700 |
| Heading 3 | Instrument Serif | 3.75rem | 700 |
| Body | uberMove | .875rem | 400 |
| Caption | uberMove | 1.25rem | 400 |
| Code | SFMono-Regular | 14px | 400 |

**Typographic Rules:**
- Limit to 3 font families max per screen
- Use **Instrument Serif** for body/UI text, **uberMove** for display/headings
- Maintain consistent hierarchy: no more than 3-4 font sizes per screen
- Headings use bold (600-700), body uses regular (400)
- Line height: 1.5 for body text, 1.2 for headings
- Use color and opacity for secondary hierarchy, not additional font sizes


---

## 4. Component Stylings

### Layout (1)

**Footer** — `html`

### Navigation (1)

**Navigation** — `html`

### Data Display (1)

**List** — `html`

### Data Input (2)

**Button** — `html`
- Animation: 

**Input** — `html`
- State: :focus, :placeholder

### Media (3)

**Image** — `html`

**Icon** — `html`

**Map/Canvas** — `html`



---

## 5. Layout Principles

- **Base spacing unit:** 4px
- **Spacing scale:** 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28
- **Border radius:** .75rem, 1rem, 1.5rem, 6px, 10px, 12px, 16px, 18px, 20px, 21px, 22px, 24px, 26px, 28px, 32px, 40px, 999px
- **Max content width:** 80rem

**Spacing as Meaning:**
| Spacing | Use |
|---|---|
| 4-8px | Tight: related items within a group |
| 12-16px | Medium: between groups |
| 24-32px | Wide: between sections |
| 48px+ | Vast: major section breaks |


---

## 6. Depth & Elevation

### Flat — subtle depth hints

- `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px`
- `rgb(255, 255, 255) 0px 0px 0px 0px, rgb(26, 10, 46) 0px 0px 0px 2px, rgba(0, 0, 0, 0) 0px 0px 0px 0px`
- `rgb(255, 255, 255) 0px 0px 0px 0px, rgba(188, 49, 252, 0.2) 0px 0px 0px 2px, rgba(0, 0, 0, 0) 0px 0px 0px 0px`

### Raised — cards, buttons, interactive elements

- `0 2px 8px -2px rgba(15,15,20,.25)`

### Floating — dropdowns, popovers, modals

- `0 4px 16px 0 rgba(91,24,153,.15),0 0 8px 0 rgba(188,49,252,.3)`
- `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(188, 49, 252, 0.3) 0px 4px 12px 0px`
- `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(188, 49, 252, 0.4) 0px 4px 14px 0px`

### Overlay — full-screen overlays, top-level dialogs

- `0 8px 32px 0 rgba(91,24,153,.1)`
- `0 8px 32px 0 rgba(91,24,153,.12),0 2px 8px 0 rgba(188,49,252,.2)`
- `0 20px 50px -20px rgba(91,24,153,.45)`

### Z-Index Scale

`0, 1, 10, 20, 30, 40, 50, 500, 9999, 10000, 999999`



---

## 7. Animation & Motion

This project uses **expressive motion**. Animations are an integral part of the experience.

### CSS Animations

- `@keyframes ping`
- `@keyframes pulse`
- `@keyframes spin`
- `@keyframes enter`
- `@keyframes exit`
- `@keyframes float`
- `@keyframes marquee`
- `@keyframes rise`

### Animated Components

- **Button**: 

### Motion Guidelines

- Duration: 150-300ms for micro-interactions, 300-500ms for page transitions
- Easing: `ease-out` for enters, `ease-in` for exits
- Always respect `prefers-reduced-motion`


---

## 8. Do's and Don'ts

### Do's

- Use `#d4a5ff` for interactive elements (buttons, links, focus rings)
- Use `#ffffff` as the primary page background
- Pair **Instrument Serif** (body) with **uberMove** (display) — these are the only allowed fonts
- Follow the **4px** spacing grid for all margins, padding, and gaps
- Use the defined shadow tokens for elevation — see Section 6
- Use border-radius from the scale: .75rem, 1rem, 1.5rem, 6px, 10px
- Reuse existing components from Section 4 before creating new ones

### Don'ts

- Don't introduce colors outside this palette — extend the design tokens first
- Don't introduce additional font families beyond Instrument Serif and uberMove and SFMono-Regular
- Don't use arbitrary spacing values — stick to multiples of 4px
- Don't create custom box-shadow values outside the system tokens
- Don't use arbitrary border-radius values — pick from the defined scale
- Don't duplicate component patterns — check Section 4 first
- Don't use backdrop-blur or blur effects

### Anti-Patterns (detected from codebase)

- No blur or backdrop-blur effects
- No zebra striping on tables/lists


---

## 9. Responsive Behavior

| Name | Value | Source |
|---|---|---|
| sm | 640px | css |
| md | 768px | css |
| lg | 980px | css |
| lg | 1024px | css |
| xl | 1280px | css |
| 2xl | 1536px | css |

**Approach:** Use `@media (min-width: ...)` queries matching the breakpoints above.


---

## 10. Agent Prompt Guide

Use these as starting points when building new UI:

### Build a Card

```
Background: #f4f4f5
Border: 1px solid #4b5563
Radius: 20px
Padding: 16px
Font: Instrument Serif
Use shadow tokens from Section 6.
```

### Build a Button

```
Primary: bg #d4a5ff, text white
Ghost: bg transparent, border #4b5563
Padding: 8px 16px
Radius: 20px
Hover: opacity 0.9 or lighter shade
Focus: ring with #d4a5ff
```

### Build a Page Layout

```
Background: #ffffff
Max-width: 80rem, centered
Grid: 4px base
Responsive: mobile-first, breakpoints from Section 9
```

### Build a Stats Card

```
Surface: #f4f4f5
Label: #71717a (muted, 12px, uppercase)
Value: #0f0f14 (primary, 24-32px, bold)
Status: use success/warning/danger from Section 2
```

### Build a Form

```
Input bg: #ffffff
Input border: 1px solid #4b5563
Focus: border-color #d4a5ff
Label: #71717a 12px
Spacing: 16px between fields
Radius: 20px
```

### General Component

```
1. Read DESIGN.md Sections 2-6 for tokens
2. Colors: only from palette
3. Font: Instrument Serif, type scale from Section 3
4. Spacing: 4px grid
5. Components: match patterns from Section 4
6. Elevation: shadow tokens
```
