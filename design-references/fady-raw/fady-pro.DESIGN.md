# fady-pro DESIGN.md

> Auto-generated design system — reverse-engineered via static analysis by skillui.
> Frameworks: None detected
> Colors: 11 · Fonts: 2 · Components: 1
> Icon library: not detected · State: not detected
> Primary theme: light · Dark mode toggle: no · Motion: expressive

## Visual Reference

**Match this design exactly** — study colors, fonts, spacing, and component shapes before writing any UI code.

![fady-pro Homepage](../screenshots/homepage.png)

---

## 1. Visual Theme & Atmosphere

This is a **light-themed** interface with a cool, approachable feel. The light background emphasizes content clarity. Typography uses **uberMove** throughout — a clean, modern choice that maintains consistency. Spacing follows a **4px base grid** (compact density), with scale: 2, 4, 6, 8, 10, 12, 14, 16px. The accent color **#bc31fc** anchors interactive elements (buttons, links, focus rings). Motion is expressive — spring physics, layout animations, and staggered reveals are part of the visual language.

---

## 2. Color Palette & Roles

| Token | Hex | Role | Use |
|---|---|---|---|
| tw-ring-offset-color | `#ffffff` | background | Page background, darkest surface |
| muted | `#ececf2` | surface | Card and panel backgrounds |
| foreground | `#09090b` | text-primary | Headings and body text |
| muted-foreground | `#71717a` | text-muted | Captions, placeholders, secondary info |
| text-muted | `#9ca3af` | text-muted | Captions, placeholders, secondary info |
| ring | `#bc31fc` | accent | CTAs, links, focus rings, active states |
| accent-foreground | `#581093` | accent | CTAs, links, focus rings, active states |
| accent | `#ead1ff` | accent | CTAs, links, focus rings, active states |
| warning | `#f5b301` | warning | Warning states, caution indicators |
| unknown | `#b9b9c0` | unknown | Palette color |
| border | `#e4e4e7` | unknown | Palette color |

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
```


---

## 3. Typography Rules

**Font Stack:**
- **uberMove** — Heading 1, Heading 2, Heading 3, Body, Caption
- **SFMono-Regular** — Code

**Font Sources:**

```css
@font-face {
  font-family: "uberMove";
  src: url("https://coiffeurs.fady-app.com/_next/static/media/26459542bcd447d9-s.p.otf") format("opentype");
  font-weight: 700;
}
```

| Role | Font | Size | Weight |
|---|---|---|---|
| Heading 1 | uberMove | 34px | 700 |
| Heading 2 | uberMove | 2rem | 700 |
| Heading 3 | uberMove | 26px | 700 |
| Body | uberMove | 12px | 400 |
| Caption | uberMove | 14px | 400 |
| Code | SFMono-Regular | 14px | 400 |

**Typographic Rules:**
- Use **uberMove** for all text — do not mix font families
- Maintain consistent hierarchy: no more than 3-4 font sizes per screen
- Headings use bold (600-700), body uses regular (400)
- Line height: 1.5 for body text, 1.2 for headings
- Use color and opacity for secondary hierarchy, not additional font sizes


---

## 4. Component Stylings

### Media (1)

**Map/Canvas** — `html`



---

## 5. Layout Principles

- **Base spacing unit:** 4px
- **Spacing scale:** 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 26, 28
- **Border radius:** .25rem, 1rem, 1.5rem, 3px, 12px, 13px, 14px, 16px, 18px, 22px, 24px, 999px
- **Max content width:** 72rem

**Spacing as Meaning:**
| Spacing | Use |
|---|---|
| 4-8px | Tight: related items within a group |
| 12-16px | Medium: between groups |
| 24-32px | Wide: between sections |
| 48px+ | Vast: major section breaks |


---

## 6. Depth & Elevation

### Raised — cards, buttons, interactive elements

- `0 2px 8px -2px rgba(15,15,20,.25)`
- `0 1px 3px rgba(0,0,0,.15)`

### Overlay — full-screen overlays, top-level dialogs

- `0 20px 50px -20px rgba(91,24,153,.45)`
- `0 12px 30px -16px rgba(91,24,153,.5)`

### Z-Index Scale

`10, 500, 1000`



---

## 7. Animation & Motion

This project uses **expressive motion**. Animations are an integral part of the experience.

### CSS Animations

- `@keyframes pulse`
- `@keyframes enter`
- `@keyframes exit`
- `@keyframes float`
- `@keyframes marquee`
- `@keyframes rise`
- `@keyframes pulse-bar`
- `@keyframes panelIn`

### Motion Guidelines

- Duration: 150-300ms for micro-interactions, 300-500ms for page transitions
- Easing: `ease-out` for enters, `ease-in` for exits
- Always respect `prefers-reduced-motion`


---

## 8. Do's and Don'ts

### Do's

- Use `#bc31fc` for interactive elements (buttons, links, focus rings)
- Use `#ffffff` as the primary page background
- Use **uberMove** for all UI text
- Follow the **4px** spacing grid for all margins, padding, and gaps
- Use the defined shadow tokens for elevation — see Section 6
- Use border-radius from the scale: .25rem, 1rem, 1.5rem, 3px, 12px
- Reuse existing components from Section 4 before creating new ones

### Don'ts

- Don't introduce colors outside this palette — extend the design tokens first
- Don't mix font families — use uberMove consistently
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
| lg | 1024px | css |
| xl | 1280px | css |
| 2xl | 1536px | css |

**Approach:** Use `@media (min-width: ...)` queries matching the breakpoints above.


---

## 10. Agent Prompt Guide

Use these as starting points when building new UI:

### Build a Card

```
Background: #ececf2
Border: 1px solid var(--border)
Radius: 14px
Padding: 16px
Font: uberMove
Use shadow tokens from Section 6.
```

### Build a Button

```
Primary: bg #bc31fc, text white
Ghost: bg transparent, border var(--border)
Padding: 8px 16px
Radius: 14px
Hover: opacity 0.9 or lighter shade
Focus: ring with #bc31fc
```

### Build a Page Layout

```
Background: #ffffff
Max-width: 72rem, centered
Grid: 4px base
Responsive: mobile-first, breakpoints from Section 9
```

### Build a Stats Card

```
Surface: #ececf2
Label: #71717a (muted, 12px, uppercase)
Value: #09090b (primary, 24-32px, bold)
Status: use success/warning/danger from Section 2
```

### Build a Form

```
Input bg: #ffffff
Input border: 1px solid var(--border)
Focus: border-color #bc31fc
Label: #71717a 12px
Spacing: 16px between fields
Radius: 14px
```

### General Component

```
1. Read DESIGN.md Sections 2-6 for tokens
2. Colors: only from palette
3. Font: uberMove, type scale from Section 3
4. Spacing: 4px grid
5. Components: match patterns from Section 4
6. Elevation: shadow tokens
```
