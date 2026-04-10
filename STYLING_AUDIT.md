# Frontend Styling Consistency Audit

> Generated 2026-04-05. Covers all files in `src/components/` and `src/pages/`.

---

## Executive Summary

The codebase has a solid design system foundation but significant inconsistencies in how it is applied. Tailwind CSS is the universal styling mechanism and a CSS custom property token system exists in `src/styles/theme.css`, but many components bypass those tokens in favor of hardcoded values — particularly in chart components, map components, and error states.

---

## What IS Standardized

### 1. Styling Mechanism
- All components use Tailwind CSS utility classes
- `cn()` utility (class-name merger) used consistently for conditional classes
- CVA (Class Variance Authority) used in `Button.jsx` and `Badge.jsx` for variant management

### 2. Design Token System (`src/styles/theme.css`)
Tokens defined and available for use:

| Category | Tokens |
|---|---|
| Brand colors | `--primary`, `--secondary`, `--accent` |
| Semantic colors | `--destructive`, `--border`, `--input`, `--ring` |
| Surface/text | `--background`, `--foreground`, `--card`, `--card-foreground`, `--muted`, `--muted-foreground` |
| Score tiers | `--score-good`, `--score-ok`, `--score-bad`, `--score-neutral` |
| Chart colors | `--chart-1`, `--chart-2`, `--chart-3`, `--chart-4` |

Reference pattern: `hsl(var(--primary))` or `bg-[hsl(var(--primary))]` in Tailwind

### 3. Shared Component Architecture
Components that are consistently reused across pages:
- `Button` — variant + size props; used on every page
- `SectionCard` — primary page section wrapper
- `Card` — smaller container wrapper
- `Loading`, `ErrorMessage`, `Badge` — utility UI components
- `scoreColor()` helper — centralizes score tier badge/bar color logic

### 4. Typography Scale
Consistent patterns used throughout components and pages:

| Role | Classes |
|---|---|
| Page title | `text-3xl font-bold text-slate-900` |
| Section title | `text-xl font-semibold tracking-tight text-slate-900` |
| Body copy | `text-sm leading-relaxed text-slate-600` |
| Form label | `text-xs font-medium text-slate-500` |
| Caption / hint | `text-xs text-slate-400` |

### 5. Responsive Breakpoints
All components are mobile-first. Breakpoint usage is consistent: `sm:` (640px+), `md:` (768px+), `lg:` (1024px+).

### 6. Animation Patterns
| Pattern | Classes | Used In |
|---|---|---|
| Page entrance | `animate-in fade-in slide-in-from-bottom-2 duration-300` | Cities, Compare, Login, ReviewEditor, AiQuery |
| Card hover lift | `hover:-translate-y-0.5 hover:shadow-md` | CityCard, ReviewCard |
| Element transitions | `transition-colors`, `transition-all duration-200` | Navbar, Button, CityCard |

### 7. Focus & Accessibility
Base UI components (`Input`, `Button`, `Badge`) use consistent focus rings:
- `focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-[3px]`
- Disabled: `disabled:pointer-events-none disabled:opacity-50`

---

## What Is NOT Standardized (Inconsistencies)

### 1. Error / Destructive Color — **MAJOR**
The `--destructive` token exists but is never used for error UI containers. Five separate places define error styling independently, with slight shade variations:

| Location | Classes Used |
|---|---|
| `ErrorMessage.jsx` | `border-rose-200 bg-rose-50 text-rose-800` |
| `ErrorBoundary.jsx` | `border-rose-200 bg-rose-50 text-rose-800` |
| `Dialog.jsx` (ConfirmDialog) | `border-rose-400 focus:ring-rose-200` |
| `Quiz.jsx` inline error | `border-rose-200 bg-rose-50 text-rose-700` ← different shade |
| `Login.jsx` inline error | `border-rose-200 bg-rose-50 text-rose-800` |

`Login.jsx` and `Quiz.jsx` also duplicate the `ErrorMessage` component instead of reusing it.

---

### 2. Border Color — **MODERATE**
Two approaches coexist with no consistent rule:

| Approach | Examples |
|---|---|
| Token: `border-border` | `Card.jsx` |
| Hardcoded: `border-slate-200` | `CityCard`, `Navbar`, most components |
| Hardcoded: `border-slate-200/70` | `CityCard` hero, `CityMap` |
| Hardcoded: `border-slate-300` | `Account.jsx` inline edit input |
| Hardcoded: `border-slate-400` | `PageNav` (notably darker than all others) |

---

### 3. Chart Colors — **MAJOR**
Both chart components define their own hardcoded HSL color arrays rather than reading from the `--chart-*` design tokens:

- `InsightsRadarChart.jsx`: `const COLOR_SUBJECTIVE = 'hsl(199 97% 55%)'`, `const COLOR_OBJECTIVE = 'hsl(198 23% 55%)'`
- `CityRadarChart.jsx`: `const DEFAULT_COLORS = ['hsl(199 97% 55%)', 'hsl(0 84% 60%)', ...]`

The theme defines `--chart-1` through `--chart-4` which map to these same values — they are simply never referenced.

---

### 4. Form Input Styling — **MODERATE**
A shared `Input` component exists with standardized token-based styling, but it is bypassed in several places with custom inline styling:

| Location | Approach |
|---|---|
| `Input.jsx` | Tokens (`border-input`, `focus-visible:border-ring`) |
| `CostCalculator.jsx` (salary + select) | `border border-slate-200 focus:ring-[hsl(var(--ring))]` |
| `AiQuery.jsx` (message input) | `border border-slate-200 focus:ring-[hsl(var(--ring))]` |
| `Account.jsx` (inline name edit) | `border border-slate-300 px-2 py-1` |
| `ReviewEditor.jsx` (textarea) | `border border-slate-200 focus:ring-[hsl(var(--primary))]/20` |

Note: `textarea` cannot use `Input.jsx` directly, but focus ring colors differ from the standard.

---

### 5. Card / Container Border Radius — **MODERATE**
No documented rule for which radius to apply to which context. Current usage:

| Radius | Used For |
|---|---|
| `rounded-3xl` | `Card.jsx`, `Home` hero, `NotFound` main card, `ApiOverlay` outer container |
| `rounded-2xl` | `CityMap`, `Loading` overlay modal, `ApiOverlay` inner modal, `CostCalculator` result box |
| `rounded-xl` | `CostCalculator` table, `CitiesMap`, some SectionCard content areas |
| `rounded-lg` | Buttons, small UI elements, most dropdowns |

`rounded-2xl` and `rounded-3xl` are both used for "large cards" with no clear distinction.

---

### 6. Map Component Styling — **MAJOR**
Both map components use no design tokens, relying entirely on hardcoded slate/sky colors:

- `CityMap.jsx`: `border-slate-200/70`, `text-slate-900`, `text-slate-500` — all hardcoded
- `CitiesMap.jsx`: `text-slate-900`, `text-slate-500`, `text-sky-600` — all hardcoded, uses `sky-600` for link color (only instance of `sky-*` outside Home page)

---

### 7. Shadow Application — **MINOR**
No shadow design tokens exist. Shadows are applied inconsistently:

| Type | Location |
|---|---|
| `shadow-sm` / `shadow-md` / `shadow-lg` | Standard Tailwind throughout |
| `shadow-xl` | `ReviewCard` hover state only |
| `shadow-[0_4px_12px_rgba(0,0,0,0.1)]` | Navbar dropdown (custom) |
| `shadow-[0_0_0_2px_hsl(var(--primary)/0.35)]` | Navbar avatar hover (custom) |

---

### 8. Background Opacity Handling — **MINOR**
No consistent rule for when to add `bg-opacity`, `/70`, `/80` modifiers, or `backdrop-blur`:

| Pattern | Locations |
|---|---|
| `bg-white` (solid) | Most components |
| `bg-white/70 backdrop-blur` | `ApiOverlay`, `NotFound` |
| `bg-white/80` | `Home` hero card |
| `bg-slate-100/70` | `Layout.jsx` root |

---

### 9. FavoriteButton — **MINOR**
Uses hardcoded rose palette for the "favorited" state (`border-rose-300`, `text-rose-600`, `fill-rose-500`). This is the only interactive element using rose as a non-error accent color, making it semantically ambiguous.

---

## Component Summary Table

| Component | Token Usage | Notable Hardcodes | Severity |
|---|---|---|---|
| `Button.jsx` | Good | `slate-*` in secondary/ghost | Minor |
| `Input.jsx` | Excellent | None | — |
| `Badge.jsx` | Excellent | None | — |
| `Card.jsx` | Good | None | — |
| `Separator.jsx` | Good | None | — |
| `Dialog.jsx` | Good | ConfirmDialog input rose colors | Minor |
| `Loading.jsx` | None | `slate-700` text | Minor |
| `RatingSlider.jsx` | Partial | `slate-*` unselected state | Minor |
| `ErrorMessage.jsx` | None | Full rose palette | Major |
| `BackLink.jsx` | Good | None | — |
| `Navbar.jsx` | Good | `slate-*` text/borders | Minor |
| `Layout.jsx` | None | `slate-100/70` bg, `slate-900` text | Minor |
| `SectionCard.jsx` | Good | `slate-*` text | Minor |
| `PageNav.jsx` | Good | `slate-400` border (darker than peers) | Minor |
| `PageHero.jsx` | None | `slate-900`, `slate-600`, `slate-500` | Minor |
| `ErrorBoundary.jsx` | None | Full rose palette | Major |
| `ApiOverlay.jsx` | None | `slate-*`, `sky-*` throughout | Moderate |
| `CityCard.jsx` | Partial | `slate-*` throughout | Moderate |
| `CityMap.jsx` | None | All hardcoded | Major |
| `CitiesMap.jsx` | None | All hardcoded | Major |
| `CostCalculator.jsx` | Partial | Many `slate-*` | Moderate |
| `InsightsRadarChart.jsx` | None | Hardcoded HSL constants | Major |
| `CityRadarChart.jsx` | None | Hardcoded HSL array | Major |
| `PerceptionVsRealityChart.jsx` | Partial | `slate-*` throughout | Moderate |
| `CityPhotoGallery.jsx` | Partial | None significant | Minor |
| `FavoriteButton.jsx` | None | Rose palette | Moderate |
| `ReactionBar.jsx` | Partial | `slate-*` | Minor |
| `ReviewCard.jsx` | Partial | `slate-*` throughout | Minor |

---

## Page Summary Table

| Page | Component Reuse | Inconsistencies |
|---|---|---|
| `Home.jsx` | Medium | Uses `sky-*` directly; floating pin animation inline |
| `Cities.jsx` | High | View toggle active state uses hardcoded `bg-slate-900 text-white` |
| `CityDetail.jsx` | High | Minor; AQI badge helper uses token correctly |
| `Compare.jsx` | High | Good token usage via `--chart-*`; best page overall |
| `Login.jsx` | Medium | Duplicates `ErrorMessage` inline instead of reusing component |
| `Account.jsx` | High | Save button uses `emerald-*` directly; inline edit input bypasses `Input` |
| `Quiz.jsx` | High | Rank badges use direct `amber-*`/`orange-*`; duplicates inline error |
| `Methodology.jsx` | Medium | Page-local sub-components (`MiniCard`, `FormulaBlock`) are one-offs |
| `ReviewEditor.jsx` | High | Textarea bypasses `Input` component; focus ring differs from standard |
| `AiQuery.jsx` | Medium | Chat bubbles, markdown renderer, and input field all one-off |
| `NotFound.jsx` | Low | Embedded SVG animations expected for decorative page |

---

## Recommendations

Priority-ordered based on blast radius:

1. **Consolidate error styling** — have `ErrorMessage.jsx` use `--destructive` token; remove the 4 duplicated inline error blocks in `Login.jsx`, `Quiz.jsx`, etc.
2. **Connect charts to `--chart-*` tokens** — replace hardcoded HSL constants in `InsightsRadarChart` and `CityRadarChart` with `getComputedStyle` reads or CSS variable references
3. **Standardize map component colors** — apply token or consistent hardcoded palette to `CityMap` and `CitiesMap`
4. **Enforce `Input` component for text fields** — replace inline styled inputs in `CostCalculator`, `AiQuery`, `ReviewEditor`, and `Account`
5. **Document border-radius scale** — establish and follow a rule (e.g., page panels = `rounded-3xl`, content cards = `rounded-2xl`, small elements = `rounded-lg`)
6. **Normalize `border-slate-200` → `border-border`** across components that don't use the token
