# City Insight — Client

A React SPA for exploring and comparing California cities using objective metrics and community reviews.

**Live app:** https://city-insight-client.vercel.app/

---

## Table of Contents

- [What it does](#what-it-does)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [How to run locally](#how-to-run-locally)
- [Environment variables](#environment-variables)
- [Authentication flow](#authentication-flow)
- [Cold-start handling](#cold-start-handling)
- [Testing](#testing)
- [Linting](#linting)

---

## What it does

- **Browse cities** — view California cities with livability scores; search by name and sort by livability, safety, rent, review count, or name; toggle between grid and map views
- **City detail pages** — objective metrics (safety score, median rent, population), an interactive Leaflet map, paginated user reviews with averages, a photo gallery, a moving cost calculator, and a perception-vs-reality chart comparing community sentiment to public data
- **Write reviews** — authenticated users rate cities 1–10 across safety, affordability, walkability, and cleanliness; an overall score is derived automatically
- **Review reactions** — authenticated users can react to reviews as `helpful`, `agree`, or `disagree`; reactions update optimistically with rollback on error
- **Favorites** — authenticated users can save cities to a personal favorites list, accessible from the account page
- **Compare cities** — pick 2–4 cities side by side; see a radar chart and metric table with per-category winner highlighting; shareable via URL query params (`?a=slug&b=slug`)
- **City Match** — weighted preference quiz; adjust sliders for safety, affordability, walkability, cleanliness, and environment (0–10); server returns ranked top matches with a match percentage
- **Ask AI** — natural-language queries against the city database (e.g. "Which city is the safest?"); multi-turn conversation with session persistence; responses include AI markdown rendering, referenced-city chips, and a compare shortcut link; requires authentication and `VITE_AI_ENABLED=true`
- **Account page** — view, edit, and delete your own reviews across all cities; manage your saved favorites; option to delete your account entirely
- **Google OAuth** — sign in via Google; auth is backed by an httpOnly session cookie with no tokens in localStorage
- **Methodology page** — transparent, step-by-step explanation of how every score is calculated

---

## Tech stack

| Layer         | Technology                                                        |
| ------------- | ----------------------------------------------------------------- |
| Framework     | React 19 + Vite 7                                                 |
| Routing       | React Router v7                                                   |
| Styling       | Tailwind CSS v4 + @tailwindcss/typography                         |
| UI primitives | Radix UI + shadcn/ui components                                   |
| Charts        | Recharts                                                          |
| Maps          | Leaflet + React Leaflet                                           |
| HTTP client   | Axios                                                             |
| Auth          | Google OAuth (`@react-oauth/google`) + server-side session cookie |
| Markdown      | react-markdown + remark-gfm (AI response rendering)               |
| Icons         | Lucide React                                                      |
| Class utils   | clsx + tailwind-merge                                             |
| Testing       | Vitest                                                            |

---

## Project structure

```
src/
├── App.jsx                   # Route definitions, auth guards
├── main.jsx                  # Entry point, providers
├── auth/
│   └── authContext.jsx       # AuthContext + useAuth hook (Google login, session bootstrap)
├── services/
│   └── api.js                # Axios instance, CSRF header, cold-start retry logic
├── state/
│   └── apiStatus.jsx         # Global API status atom (ok / waking / down / rate-limited)
├── hooks/
│   ├── useApiStatus.jsx      # Subscribes to API status state
│   └── usePageTitle.jsx      # Sets document.title per page
├── lib/
│   ├── cities.js             # City slug parsing (prettyCityFromSlug)
│   ├── city-photos.js        # City photo gallery helpers
│   ├── datetime.js           # Date formatting (toDate, fmtDate, fmtDateTime)
│   ├── favorites.js          # fetchMyFavorites, addFavorite, removeFavorite
│   ├── format.js             # Number/money/score formatters (fmtMoney, fmtNum, toOutOf10, …)
│   ├── leafletIcon.js        # Leaflet default marker icon fix for Vite
│   ├── ratings.js            # Rating utilities (clampRating10, derivedOverall, scoreColor, scoreLabel)
│   ├── reactions.js          # upsertReaction, deleteReaction
│   ├── reviews.js            # fetchMyReviews, fetchMyReview, upsertMyReview, deleteMyReview, deleteMyAccount
│   └── routing.js            # safeReturnTo — open-redirect prevention
├── pages/
│   ├── Home.jsx              # Landing page
│   ├── Cities.jsx            # City list with search and grid/map toggle
│   ├── CityDetail.jsx        # Full city page (metrics, map, reviews, attractions, favorites)
│   ├── ReviewEditor.jsx      # Create / edit a review (protected)
│   ├── Account.jsx           # User profile, review management, favorites, account deletion (protected)
│   ├── Compare.jsx           # Side-by-side city comparison (2–4 cities, radar + table)
│   ├── Quiz.jsx              # City Match — weighted preference matcher
│   ├── AiQuery.jsx           # AI natural-language chat interface (protected)
│   ├── Login.jsx             # Google sign-in page
│   ├── Methodology.jsx       # How scores are calculated
│   └── NotFound.jsx          # 404
├── utils/
│   └── utils.js              # cn() helper (clsx + tailwind-merge)
├── components/
│   ├── layout/
│   │   ├── ApiOverlay.jsx    # Server wake-up / error overlay
│   │   ├── ErrorBoundary.jsx # React error boundary
│   │   ├── Layout.jsx        # Main layout wrapper (navbar + outlet)
│   │   ├── Navbar.jsx        # Sticky header with nav links, auth controls
│   │   ├── PageHero.jsx      # Page title/description banner
│   │   ├── PageNav.jsx       # Scroll-spy section navigator
│   │   └── SectionCard.jsx   # Wrapper card for page sections
│   ├── city/
│   │   ├── CityCard.jsx          # City grid card (score, safety, rent, reviews)
│   │   ├── CityMap.jsx           # Leaflet single-city map
│   │   ├── CityPhotoGallery.jsx  # City photo gallery
│   │   ├── CityRadarChart.jsx    # Recharts radar chart (multiple cities)
│   │   ├── CitiesMap.jsx         # Leaflet multi-city map with markers
│   │   ├── CostCalculator.jsx    # Moving cost estimate calculator
│   │   ├── FavoriteButton.jsx    # Heart/favorite toggle button
│   │   └── PerceptionVsRealityChart.jsx # Community sentiment vs. public data chart
│   ├── reviews/
│   │   ├── ReactionBar.jsx   # Reaction buttons (helpful / agree / disagree) with counts
│   │   └── ReviewCard.jsx    # Review display with scores, comment, reaction bar
│   └── ui/                   # Button, Card, Badge, Dialog, Input, Loading, Separator, BackLink, …
└── styles/
    └── theme.css             # CSS custom properties / theme tokens
```

---

## How to run locally

### Prerequisites

- **Node.js** >= 18
- **npm** (or your preferred package manager)
- The **City Insight backend** running at `http://localhost:3000`

### 1. Install dependencies

```bash
cd city-insight-client
npm install
```

### 2. Configure environment variables

Create `.env` in the `city-insight-client/` directory:

```env
# Point at local backend
VITE_API_URL=http://localhost:3000

# Your Google OAuth client ID (required for sign-in to work)
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here

# Optional — show the Ask AI page and nav link
VITE_AI_ENABLED=true
```

> **Note:** When `VITE_API_URL` starts with `http://` (local), the Vite dev server proxies `/api/*` and `/health` to `localhost:3000` so cookies work on the same origin.

### 3. Start the dev server

```bash
npm run dev
```

The app will be available at **http://localhost:5173** (default Vite port).

### 4. Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

---

## Environment variables

| Variable                | Required | Description                                                                                                                                                                                     |
| ----------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL`          | Yes      | Backend base URL. Use `http://localhost:3000` for local dev.                                                                                                                                    |
| `VITE_GOOGLE_CLIENT_ID` | Yes      | Google OAuth 2.0 client ID. Used by `@react-oauth/google` to render the sign-in button.                                                                                                         |
| `VITE_AI_ENABLED`       | No       | Set to `true` to show the **Ask AI** nav link and `/ask` route. The backend must also have AI enabled; the app falls back gracefully if the `/api/ai/status` endpoint returns `enabled: false`. |

---

## Routing

| Route                  | Page         | Auth     | Description                                                |
| ---------------------- | ------------ | -------- | ---------------------------------------------------------- |
| `/`                    | Home         | —        | Landing page with CTA                                      |
| `/cities`              | Cities       | —        | Browse, search, filter, sort; grid or map view             |
| `/cities/:slug`        | CityDetail   | —        | Metrics, reviews, attractions, photo gallery, map          |
| `/cities/:slug/review` | ReviewEditor | Required | Create or edit a review for this city                      |
| `/compare`             | Compare      | —        | Side-by-side comparison of 2–4 cities                      |
| `/quiz`                | Quiz         | —        | City Match — weighted preference matcher                   |
| `/ask`                 | AiQuery      | Required | AI natural-language chat (requires `VITE_AI_ENABLED=true`) |
| `/login`               | Login        | —        | Google OAuth sign-in                                       |
| `/account`             | Account      | Required | Profile, reviews, favorites, account deletion              |
| `/methodology`         | Methodology  | —        | Data sources and scoring formulas                          |
| `*`                    | NotFound     | —        | 404 page                                                   |

Protected routes redirect unauthenticated users to `/login` with a `returnTo` query param so they land back where they started after signing in.

---

## Authentication flow

1. User clicks **Continue with Google** — Google returns an ID token to the browser.
2. Frontend POSTs the token to `POST /api/auth/login`.
3. Backend verifies the token and sets an **httpOnly session cookie** (`ci_session`, 7-day expiry).
4. Frontend calls `GET /api/me` to load the user record.
5. All subsequent requests include the cookie automatically (`withCredentials: true`).
6. Logging out calls `POST /api/auth/logout`, clearing the server-side session.

State-changing requests (POST/PUT/PATCH/DELETE) also send an `X-Requested-With: XMLHttpRequest` header as a lightweight CSRF guard.

Protected routes (`/account`, `/cities/:slug/review`, `/ask`) redirect unauthenticated users to `/login` with a `returnTo` param, so users land back where they started after signing in.

---

## Cold-start handling

The backend runs on a free-tier host that sleeps when idle. The Axios response interceptor in `src/services/api.js` detects cold-start failures (502, 503, or connection timeout) and sets the global API status to one of `"ok"` | `"waking"` | `"down"` | `"rate-limited"`. On a cold start it:

1. Sets the global API status to `"waking"` — the `ApiOverlay` component shows a "Waking up City Insight backend…" message to the user.
2. Starts polling `GET /health` with exponential backoff (max 60 s).
3. Automatically retries the original request once the server responds.

Rate-limit responses (429) are also handled: a dismissible alert is shown and auto-clears after the `Retry-After` window.

---

## Testing

```bash
npm run test        # run Vitest in watch mode
npm run test:run    # run once and exit
```

Unit tests live alongside the files they cover in `src/lib/`. They cover utility functions such as rating clamping and averaging (`ratings.test.js`), number and money formatters (`format.test.js`), date helpers (`datetime.test.js`), safe redirect validation (`routing.test.js`), and city slug parsing (`cities.test.js`).

---

## Linting

```bash
npm run lint
```

Uses ESLint 9 with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`.
