# Frontend Refactor Plan

## Summary

The codebase is well-structured overall: the API layer is properly centralized through axios with interceptors, auth is cleanly handled via context, and the lib/ utilities are granular and well-tested. The most acute problem area is `CityDetail.jsx`, which orchestrates six independent `useEffect` fetch chains, 15+ state variables, and three inline sub-components — it is doing far too much for one file and will resist future changes. A secondary pattern problem is that the "isMounted alive flag" cancellation pattern and the inline error-block JSX (`rounded-md border border-rose-200 bg-rose-50...`) are copy-pasted verbatim across at least seven different components. Dead code is minimal but present. The component tree is generally clean, though `CitiesMap`'s `CityPopup` uses raw inline styles where the rest of the app uses Tailwind classes, creating a jarring inconsistency.

---

## Issues by Category

### 1. Duplication / DRY Violations

**D-1** — `CityDetail.jsx` lines 274–301, 303–337, 339–371, 412–434, 436–461, 463–484  
Six `useEffect` blocks each manually implement the same `let isMounted = true` / `.then` / `.catch` / `.finally` / `return () => { isMounted = false }` cancellation pattern. The pattern is duplicated six times with trivial variation.  
**Fix:** Extract a `useFetch(apiFn, deps)` hook returning `{ data, loading, error }` with the isMounted guard built in, or convert calls to use an `AbortController`-based pattern and factor out a `useApiCall` hook.

**D-2** — Error block JSX repeated in `Cities.jsx` line 195, `CityDetail.jsx` lines 621–625 and 1018–1022, `Account.jsx` lines 506–510 and 601–605, `ReviewEditor.jsx` lines 234–237  
The string `"rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"` appears verbatim in at least six places.  
**Fix:** Add an `<ErrorMessage>` component (or a simple wrapper in `components/ui/`) that accepts a `message` prop and renders this block, then replace all six callsites.

**D-3** — `CityRadarChart.jsx` lines 13–18 and `InsightsRadarChart.jsx` lines 14–19 both define `const DIMENSIONS` arrays with identical keys (`safety`, `affordability`, `walkability`, `cleanliness`). `ReviewCard.jsx` line 97–101 in `MiniBars` also hardcodes the same four labels.  
**Fix:** Export `RATING_KEYS` from `lib/ratings.js` (already done) and derive both `DIMENSIONS` arrays from it, eliminating the literal arrays in the chart files. `MiniBars` should also map over `RATING_KEYS`.

**D-4** — `CityDetail.jsx` line 159 (`fmtOutOf10`) and `PerceptionVsRealityChart.jsx` lines 13–18 (`formatOneDecimal`) are both local formatting helpers that wrap `.toFixed(1)` on a nullable value. `ReviewCard.jsx` line 159 similarly has `tinyPct` which duplicates `clamp01` logic from `lib/format.js`.  
**Fix:** Move `fmtOutOf10` into `lib/format.js` (or reuse the existing `fmtNum` call with `{ digits: 1 }`) and delete the local copies.

**D-5** — The "No reviews yet" / "No favorites yet" empty-state pattern in `Account.jsx` (lines 512–527 and 608–620) renders a full `Card > CardContent` wrapper with nearly identical markup for each section.  
**Fix:** Extract an `<EmptyState title message />` component used by both sections.

**D-6** — The "section card with tinted header" pattern in `Account.jsx` lines 319–427, 431–485, 488–582, and 585–656 uses raw `Card > div.bg-secondary > CardContent` HTML that duplicates what `SectionCard` already provides.  
**Fix:** Migrate the four `Account` card blocks to use `SectionCard` instead of hand-rolling the header/content structure.

**D-7** — `Navbar.jsx` lines 181–202 (desktop nav) and lines 255–280 (mobile nav) duplicate the same five `NavLink` entries with the same icons, just using `PillNavLink` vs `MobileNavLink`.  
**Fix:** Extract a shared `NAV_ITEMS` constant array and map over it in both desktop and mobile renders.

---

### 2. Dead Code

**DC-1** — `PerceptionVsRealityChart.jsx` — the file header comment (lines 4–5) explicitly states "The UI currently renders only the first row in `rows`." The `rows` prop accepts an array but only the first valid row is ever rendered. The component is also not imported anywhere in the current codebase (no grep hit in any page or component).  
**Fix:** Delete the file if it is truly unused. If it is planned for future use, remove the component export and leave the helpers; or simplify the API to a single `row` prop.

**DC-2** — `Compare.jsx` line 450: `{/* <BackLink onClick={handleBack}>Back</BackLink> */}` is a commented-out element. There is no `handleBack` function defined anywhere in the component.  
**Fix:** Delete the commented line.

**DC-3** — `SectionCard.jsx` lines 43 and 58: two JSX comments `{/* <div className="flex items-start justify-between gap-4"> */}` and `{/* {action ? <div className="shrink-0">{action}</div> : null} */}` are leftover from refactoring.  
**Fix:** Delete both commented lines.

**DC-4** — `button.jsx` line 35: `// "focus-visible:ring-rose-200",` is a commented-out class on the `danger` variant.  
**Fix:** Delete the comment.

**DC-5** — `back-link.jsx` line 36: `// "bg-red-200",` is an old debug class left in a comment.  
**Fix:** Delete the comment.

**DC-6** — `Quiz.jsx` lines 20–21: a double blank line between `CRITERIA` and the component definition; lines 184–185 contain a trailing blank line after the closing brace.  
**Fix:** Remove the extra blank lines.

---

### 3. Naming

**N-1** — `CityDetail.jsx` line 531: `const deleteMyReview = useCallback(...)` — this function only opens the confirmation dialog, it does not delete anything. The actual deletion is `executeDelete`.  
**Fix:** Rename to `openDeleteConfirm` (or `confirmDeleteReview`) to match the `executeDelete` naming pattern already used for the actual API call.

**N-2** — `CityDetail.jsx` line 517: the `myReviewState` enum string values (`"auth_loading"`, `"signed_out"`, `"review_loading"`, `"has_review"`, `"no_review"`) are magic strings scattered across five switch branches. They are readable but not type-safe.  
**Fix:** Extract as a `const MY_REVIEW_STATE = { AUTH_LOADING: "auth_loading", ... }` object at file top.

**N-3** — `authContext.jsx` line 16: internal state is `sessionUser`/`isBootstrapping`, but the public context shape exposes `user`/`loading`. This is fine, but the `useMemo` dependency and state variable names diverge from what consumers see; `isBootstrapping` is a more descriptive internal name but not surfaced.  
**Fix:** Minor — no change needed unless you want to align internal/external names for readability.

**N-4** — `Cities.jsx` lines 53–70: the closures `desc` and `asc` (sort helpers) are named with only two-letter names that require reading the body to understand they sort nulls last.  
**Fix:** Rename to `sortDesc` and `sortAsc`.

**N-5** — `AiQuery.jsx` line 22: a function named `buildSuggestions` uses a parameter named `cities` but actually it is used for building city-pair comparison prompts plus static strings — "suggestions" is accurate, but the function name doesn't hint at the static fallbacks.  
**Fix:** Rename to `buildPromptSuggestions` or split into a static array plus a `buildCityPairSuggestions(cities)` helper.

---

### 4. Component Hygiene

**CH-1** — `CityDetail.jsx` is 1,069 lines and manages six separate data-fetch lifecycles, three sub-components (`MetricCard`, `RatingRow`, `AttractionCard`), optimistic reaction state, pagination, and favorites — all in a single component.  
**Fix (P2):** Extract sub-components to their own files (`MetricCard`, `RatingRow`, `AttractionCard`, `AttractionsSection`, `ReviewsSection`). The data-fetch concerns should live in custom hooks (`useCityData(slug)`, `useCityReviews(slug)`, `useMyReview(slug)`).

**CH-2** — `Account.jsx` line 280–284: the comment "Support either user shape: legacy: `user.metadata.createdAt` / `lastSignInTime`; current: `user.createdAt` / `updatedAt`" documents a backend inconsistency that is being absorbed in the UI. The divergent field access (`user.metadata?.createdAt ?? user.createdAt`) is a smell.  
**Fix:** Normalize the user shape in `authContext.jsx` once (when `setSessionUser` is called) so all consumers can access `user.createdAt` reliably.

**CH-3** — `CitiesMap.jsx` `CityPopup` component (lines 6–62) uses exclusively inline `style={{}}` objects (e.g. `style={{ minWidth: 180 }}`, `style={{ fontSize: 14, fontWeight: 700, ... }}`). The rest of the app uses Tailwind classes. This is because Leaflet's popup DOM is rendered outside the React tree and Tailwind scoping can be tricky, but the discrepancy is significant.  
**Fix:** Confirm whether Tailwind classes work in Leaflet popups (they do in this project since global styles apply). If they do, migrate `CityPopup` to Tailwind classes for consistency.

**CH-4** — `Navbar.jsx` lines 96–103: the `AvatarDropdown` button uses `onMouseEnter`/`onMouseLeave` to directly mutate `e.currentTarget.style.boxShadow`. This is an imperative DOM side-effect inside a React component.  
**Fix:** Use a CSS hover class with a Tailwind arbitrary value (or a `group-hover` pattern) instead of JS DOM mutation.

**CH-5** — `CityPhotoGallery.jsx` line 115: the dot indicator buttons use an inline `style={{ width, background }}` for their active/inactive state. The active width is `20` (pixels) vs inactive `6` — these are magic numbers.  
**Fix:** Define named constants (`DOT_ACTIVE_WIDTH = 20`, `DOT_INACTIVE_WIDTH = 6`) or use Tailwind width utilities (`w-5` / `w-1.5`).

**CH-6** — `CostCalculator.jsx` lines 5–12: `NATIONAL_AVG` constants are hardcoded in the source. These numbers are described as "2024 approximations" in the JSDoc comment on line 163.  
**Fix:** Move the constant to a named export in a `lib/cost-estimates.js` file and annotate with last-updated date, making it obvious and easy to refresh.

**CH-7** — `ReviewCard.jsx` line 178: typo in class string — `"bg-white-100/70"` is not a valid Tailwind class (should be `"bg-white/70"` or removed entirely, since a prior `bg-white` provides the background).  
**Fix:** Change `"bg-white-100/70"` to `"bg-white"` (the intended style is a white card with a slight transparency; `bg-white-100` doesn't exist in Tailwind).

**CH-8** — `InsightsRadarChart.jsx` lines 70–114: `InsightsTooltip` is a component function defined *inside* the `InsightsRadarChart` render function body. This means a new function reference is created on every render, causing Recharts to re-mount the tooltip.  
**Fix:** Hoist `InsightsTooltip` to module scope (outside `InsightsRadarChart`), passing `hasAnyObjective` and `DIMENSIONS` as props or via a closure.

---

### 5. State Management

**SM-1** — `CityDetail.jsx` lines 237–252: the `isFavorited` boolean and `isFavoriteLoading` boolean are derived from a full favorites API fetch (`fetchMyFavorites`) that downloads every favorited city just to check if the current one is in the list. If a user has many favorites this is wasteful.  
**Fix (P3):** Add a dedicated `GET /me/favorites/:slug` endpoint to the API. If that's not feasible backend-side, at minimum cache the favorites list in React context so multiple pages don't re-fetch it independently.

**SM-2** — `Compare.jsx` lines 225–229: `cityData`, `loadingStates`, and `errorStates` are three parallel arrays indexed by slot position. When slots are added/removed (e.g. `removeSlot`), all three arrays must be mutated in sync; `removeSlot` does a splice on `cityData` but not `loadingStates` or `errorStates`.  
**Fix:** Consolidate into a single `slots` array of objects: `[{ slug, data, loading, error }, ...]`.

**SM-3** — `AiQuery.jsx` line 316: `sessionId` is initialized from `sessionStorage` and also written back on every new session. If the user opens multiple tabs, the session IDs collide silently.  
**Fix:** This is minor UX; note it as a known limitation, or use `localStorage` with a per-tab key derived from a `crypto.randomUUID()` stored in `sessionStorage`.

**SM-4** — `Account.jsx` lines 145–162: `citiesReviewed` and `reviewStats` are computed with `useMemo` on every review change. This is correct, but `reviewStats.avgs` iterates over `RATING_KEYS` with a nested filter for each key — it is O(keys × reviews). At 50 reviews and 4 keys this is negligible; not a problem.  
**Fix:** No action needed; already correct.

---

### 6. Error Handling

**EH-1** — `Compare.jsx` line 236: the `allCities` fetch has a `.catch(() => {})` that silently swallows errors. If the fetch fails, the user sees an empty selector with no explanation.  
**Fix:** Add `setAllCitiesError(true)` and render a brief "Could not load city list" message in the selector area.

**EH-2** — `AiQuery.jsx` line 343: the city list fetch for suggestions has `.catch(() => {})` — a silent swallow. If it fails, suggestions are empty but no UI feedback is given.  
**Fix:** Since suggestions are non-critical, this is acceptable. Add a comment: `// suggestions are non-critical; fail silently` to make the intent explicit.

**EH-3** — `CityDetail.jsx` lines 470–479: the favorites check fetch has `.catch(() => { /* non-critical — silently ignore */ })` — intentionally silent and documented with a comment, which is acceptable. No fix needed.

**EH-4** — `CityDetail.jsx` lines 423–426: the AI summary fetch silently sets `summary` to null on error. No error state is stored, so the component falls through to "AI snapshot not yet available" even on a genuine 500 error.  
**Fix:** Store the error in a `summaryError` state and render a distinct "Snapshot failed to load" message separate from "not yet available."

**EH-5** — `ReviewEditor.jsx` lines 149–152: a manual `setTimeout`-based timeout (`Promise.race`) is used to cap the `upsertMyReview` call at 30 seconds. Axios already has a global `timeout: 15000` set in `services/api.js`, making this 30-second race unreachable under normal conditions.  
**Fix:** Remove the `Promise.race` timeout — the axios instance will always time out first at 15 s. If a longer timeout is genuinely needed for review saves, increase the axios timeout for that specific call instead.

**EH-6** — `Login.jsx` line 100: the Google OAuth `onError` callback logs `"Google Login Error"` as a string (not the actual error object) and sets a generic UI error. The log is non-actionable.  
**Fix:** Change to `console.error("Google Login Error", err)` to capture the actual error payload for debugging.

---

### 7. API Layer

**API-1** — `Cities.jsx` line 24 fetches `/cities` with `limit: 100`, while `Compare.jsx` line 234 fetches `/cities?limit=200` and `AiQuery.jsx` line 343 fetches `/cities?limit=500`. Three separate, inconsistent limits for the same endpoint.  
**Fix:** Consolidate behind a constant (e.g. `ALL_CITIES_LIMIT = 200`) or a shared `fetchAllCities()` helper in `lib/cities.js` that can be reused by all three callers.

**API-2** — `CityDetail.jsx` line 314: the first-page reviews fetch uses string interpolation (`/cities/${slug}/reviews?pageSize=${REVIEW_PAGE_SIZE}`) while the "load more" fetch on line 387 uses `buildReviewsQuery`. These should use the same builder for consistency.  
**Fix:** Call `buildReviewsQuery({ pageSize: REVIEW_PAGE_SIZE })` for the initial fetch too.

**API-3** — `CityDetail.jsx` line 352: the "my review" fetch calls `api.get('/cities/${slug}/reviews/me')` directly, bypassing the `fetchMyReview(slug)` function in `lib/reviews.js` that does exactly this.  
**Fix:** Replace the inline `api.get(...)` call with `fetchMyReview(slug)` from `lib/reviews.js`.

**API-4** — `Account.jsx` line 635: the favorites list link uses `<a href=...>` (a full page reload) rather than `<Link to=...>` from react-router-dom.  
**Fix:** Replace `<a href={`/cities/${slug}`}>` with `<Link to={`/cities/${slug}`}>`.

---

### 8. Readability

**R-1** — `CityDetail.jsx` is 1,069 lines. The render section alone (lines 617–1069) is 452 lines of JSX with deeply nested conditionals (e.g. the `{!isPublicLoading && !reviewsError && ...}` chains on lines 1024–1055).  
**Fix (P2):** Extract `<CitySnapshotSection>`, `<CityMetricsSection>`, `<AttractionsSection>`, `<ReviewsSection>`, and `<MyReviewSection>` into their own components. This reduces the render to a composition of named sections.

**R-2** — `Home.jsx` lines 36–65: the `<style>` block with six `@keyframes` and six `.home-enter-*` animation class definitions is inline JSX. It is also re-created on every render (though React is smart about style tag diffing).  
**Fix:** Move these keyframe declarations into `styles/theme.css` (the project already has a dedicated CSS file) to keep animation definitions out of component logic.

**R-3** — `Cities.jsx` lines 53–91: the `useMemo` for `filtered` contains the `toNum`, `desc`, and `asc` helper closures defined inline. The function is 39 lines.  
**Fix:** Hoist `toNum`, `sortDesc`, and `sortAsc` as module-level functions above the component.

**R-4** — `CityDetail.jsx` line 818 uses an IIFE `(() => { ... })()` inside JSX to calculate `aqiCategory`. This is uncommon and requires readers to parse the IIFE pattern.  
**Fix:** Move the AQI destructuring to a local variable before the return statement: `const { label: aqiLabel, color: aqiColor } = aqiCategory(metrics?.aqiValue);`.

**R-5** — `AiQuery.jsx` lines 354–370: session message conversion loop uses a `for...of` loop (imperative) inside a `.then()` callback (functional). Mixing styles within the same block is mildly confusing.  
**Fix:** Replace with a single `.flatMap()` or `.reduce()` to keep the callback consistently functional.

**R-6** — `NotFound.jsx` lines 12–26: four separate constant arrays (`WIN_ROWS_TALL`, `WIN_COLS_TALL`, `WIN_ROWS_NARROW`, etc.) and their associated `flatMap` renderers generate SVG window rectangles. This is 60+ lines of magic coordinate numbers with no documentation of how the SVG grid works.  
**Fix:** Add a brief comment block explaining the SVG coordinate system and that the constants represent row/column positions of window tiles in specific buildings.

---

### 9. Consistency

**CS-1** — `reviews.js` and `favorites.js` in `lib/` use `.then()` chaining, while `authContext.jsx`, `CityDetail.jsx`, and every page component use `async/await`. The lib functions return bare promises which callers then `await` — this is acceptable but inconsistent internally.  
**Fix:** Optionally make `lib/` API functions `async` and use `await` internally for a uniform style. Low priority.

**CS-2** — Navbar inline styles: `AvatarDropdown` (lines 113–116) uses raw `style={{ minWidth: 160, border: "1px solid #E5E7EB", ... }}` — hardcoded hex colors that don't use the CSS variable token system used everywhere else.  
**Fix:** Replace with Tailwind classes: `min-w-[160px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.1)]` or use `border-slate-200` for the border color.

**CS-3** — `Navbar.jsx` line 131 uses a raw `<div className="h-px bg-[#E5E7EB]" />` divider with a hardcoded hex color, while the same divider in the same file on line 282 uses `<div className="my-2 h-px bg-slate-100" />` with a Tailwind semantic color.  
**Fix:** Use `bg-slate-200` consistently for dividers.

**CS-4** — File naming: all layout and city component files use `PascalCase.jsx`; all UI primitive files use `kebab-case.jsx` (`back-link.jsx`, `rating-slider.jsx`). This is a divergent convention.  
**Fix:** Pick one convention and rename accordingly. PascalCase is the React community standard for component files; rename `back-link.jsx` → `BackLink.jsx`, `rating-slider.jsx` → `RatingSlider.jsx`, `loading.jsx` → `Loading.jsx`, etc.

**CS-5** — `CityDetail.jsx` imports from `lucide-react` in two separate blocks (lines 20 and 22–31) with some overlap possible (both blocks import from `lucide-react`). This is cosmetic.  
**Fix:** Merge both import blocks into one `import { ... } from "lucide-react"` statement.

---

## Prioritized Action List

### P1 — Fix now (safe, low regression risk)

| # | File | Description | Effort |
|---|------|-------------|--------|
| 1 | `src/components/reviews/ReviewCard.jsx:178` | Fix typo `bg-white-100/70` → `bg-white` (invalid Tailwind class, CH-7) | Small |
| 2 | `src/pages/Compare.jsx:450` | Delete commented-out `<BackLink>` with nonexistent `handleBack` (DC-2) | Small |
| 3 | `src/components/layout/SectionCard.jsx:43,58` | Delete two commented-out JSX lines left from refactoring (DC-3) | Small |
| 4 | `src/components/ui/button.jsx:35` | Delete commented-out `focus-visible:ring-rose-200` class (DC-4) | Small |
| 5 | `src/components/ui/back-link.jsx:36` | Delete commented-out `bg-red-200` debug class (DC-5) | Small |
| 6 | `src/pages/CityDetail.jsx:531` | Rename `deleteMyReview` callback → `openDeleteConfirm` (N-1) | Small |
| 7 | `src/pages/CityDetail.jsx:314` | Replace inline query string with `buildReviewsQuery(...)` (API-2) | Small |
| 8 | `src/pages/CityDetail.jsx:352-366` | Replace inline `api.get('/cities/${slug}/reviews/me')` with `fetchMyReview(slug)` (API-3) | Small |
| 9 | `src/pages/Account.jsx:635` | Change `<a href=...>` favorites link to `<Link to=...>` (API-4) | Small |
| 10 | `src/pages/Login.jsx:100` | Pass the actual `err` object to `console.error` (EH-6) | Small |
| 11 | `src/components/city/InsightsRadarChart.jsx:70` | Hoist `InsightsTooltip` to module scope to avoid re-mount on each render (CH-8) | Small |
| 12 | `src/pages/CityDetail.jsx:818` | Replace IIFE in JSX with a pre-render variable for AQI label/color (R-4) | Small |
| 13 | `src/components/layout/Navbar.jsx:113-116,131` | Replace hardcoded hex colors with Tailwind semantic tokens (CS-2, CS-3) | Small |
| 14 | `src/components/layout/Navbar.jsx:96-103` | Replace `onMouseEnter`/`onMouseLeave` DOM mutation with CSS hover class (CH-4) | Small |
| 15 | `src/pages/CityDetail.jsx:20,22-31` | Merge two separate `lucide-react` import blocks into one (CS-5) | Small |
| 16 | `src/pages/Quiz.jsx:20-21,184-185` | Remove extra blank lines (DC-6) | Small |
| 17 | `src/pages/ReviewEditor.jsx:149-152` | Remove dead `Promise.race` timeout — axios 15 s timeout makes it unreachable (EH-5) | Small |
| 18 | `src/pages/Cities.jsx:53-70` | Hoist `toNum`, rename `desc`/`asc` → `sortDesc`/`sortAsc` as module-level functions (N-4, R-3) | Small |
| 19 | `src/lib/format.js` | Add exported `fmtOutOf10` and delete local copies in `CityDetail.jsx:91-94` and `PerceptionVsRealityChart.jsx:14-18` (D-4) | Small |
| 20 | `src/components/layout/Navbar.jsx:181-202,255-280` | Extract shared `NAV_ITEMS` constant; render desktop + mobile nav from one source (D-7) | Small |
| 21 | `src/pages/Home.jsx:36-65` | Move `@keyframes` and `.home-enter-*` classes into `styles/theme.css` (R-2) | Small |

### P2 — Fix in a branch (medium impact, some regression risk)

| # | File | Description | Effort |
|---|------|-------------|--------|
| 22 | `src/components/ui/` (new file `ErrorMessage.jsx`) | Extract shared error-block JSX into `<ErrorMessage>` component; replace 6 inline copies (D-2) | Small |
| 23 | `src/components/city/CitiesMap.jsx` | Migrate `CityPopup` inline styles to Tailwind classes for consistency with the rest of the app (CH-3) | Small |
| 24 | `src/components/city/CostCalculator.jsx` | Move `NATIONAL_AVG` to `lib/cost-estimates.js` with last-updated annotation (CH-6) | Small |
| 25 | `src/components/city/CityPhotoGallery.jsx:119-120` | Replace magic dot indicator widths (20/6) with named constants or Tailwind utilities (CH-5) | Small |
| 26 | `src/pages/CityDetail.jsx` (new hooks) | Extract `useCityData(slug)`, `useCityReviews(slug, pageSize)`, `useMyReview(slug, user)` hooks to eliminate six duplicated fetch patterns (D-1) | Medium |
| 27 | `src/pages/CityDetail.jsx` (sub-component extraction) | Extract `AttractionsSection`, `ReviewsSection`, `MyReviewSection` into their own files under `components/city/` to reduce the page to a composition shell (R-1, CH-1) | Medium |
| 28 | `src/pages/Compare.jsx:225-229` | Consolidate `cityData[]`, `loadingStates[]`, `errorStates[]` into a single `slots[]` array of objects; fix the `removeSlot` bug where only `cityData` is spliced (SM-2) | Medium |
| 29 | `src/pages/Account.jsx` | Replace four hand-rolled `Card > div.bg-secondary > CardContent` blocks with `SectionCard` (D-6) | Medium |
| 30 | `src/pages/Account.jsx:280-284` | Normalize the user shape (`createdAt`, `updatedAt`) in `authContext.jsx` to eliminate the legacy field fallback in Account (CH-2) | Medium |
| 31 | `src/pages/Compare.jsx:236` | Add `allCitiesError` state and render a message when the city list fetch fails (EH-1) | Small |
| 32 | `src/pages/CityDetail.jsx:412-426` | Add `summaryError` state; render "snapshot failed to load" distinct from "not yet available" (EH-4) | Small |
| 33 | `src/lib/cities.js` (new export `fetchAllCities`) | Unify the three inconsistent `/cities` limit values (100/200/500) behind a shared helper (API-1) | Small |
| 34 | `src/components/ui/*.jsx` | Rename `back-link.jsx` → `BackLink.jsx`, `rating-slider.jsx` → `RatingSlider.jsx`, `loading.jsx` → `Loading.jsx`, etc. to match PascalCase convention (CS-4) | Small |
| 35 | `src/components/city/CityRadarChart.jsx`, `InsightsRadarChart.jsx`, `ReviewCard.jsx` | Derive `DIMENSIONS` arrays and `MiniBars` items from `RATING_KEYS` to eliminate the triple-duplicated key list (D-3) | Small |

### P3 — Defer (low ROI or high risk)

| # | File | Description | Effort |
|---|------|-------------|--------|
| 36 | `src/pages/Account.jsx:279` | Normalize legacy vs. current user metadata shape at the backend rather than in the UI (CH-2 root cause) | Large |
| 37 | `src/pages/CityDetail.jsx:463-484` | Replace full `fetchMyFavorites()` call with a single-city check endpoint to avoid downloading the full favorites list (SM-1) | Large |
| 38 | `src/pages/PerceptionVsRealityChart.jsx` | Determine if the component is intended for future use; if not, delete it (DC-1) | Small |
| 39 | `src/lib/reviews.js`, `src/lib/favorites.js` | Convert `.then()` chaining to `async/await` for style consistency with all callers (CS-1) | Small |
| 40 | `src/pages/AiQuery.jsx:354-370` | Replace `for...of` in `.then()` callback with `.flatMap()` for stylistic consistency (R-5) | Small |
| 41 | `src/pages/CityDetail.jsx:517` | Replace magic-string `myReviewState` enum values with a `const MY_REVIEW_STATE` object (N-2) | Small |
