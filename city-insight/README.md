# City Insight — Frontend

A React SPA for exploring and comparing California cities using objective metrics and community reviews.

**Live app:** https://city-insight-client.vercel.app/

---

## What it does

- **Browse cities** — view California cities with livability scores and search/filter by name
- **City detail pages** — objective metrics (safety score, median rent, population), an interactive Leaflet map, user review averages, and a perception-vs-reality chart comparing community sentiment to public data
- **Write reviews** — authenticated users rate cities 1–10 across safety, affordability, walkability, and cleanliness; an overall score is derived automatically
- **Account page** — view, edit, and delete your own reviews across all cities; option to delete your account entirely
- **Google OAuth** — sign in via Google; auth is backed by an httpOnly session cookie with no tokens in localStorage
- **Methodology page** — transparent, step-by-step explanation of how every score is calculated

---

## Tech stack

| Layer         | Technology                                                        |
| ------------- | ----------------------------------------------------------------- |
| Framework     | React 19 + Vite 7                                                 |
| Routing       | React Router v7                                                   |
| Styling       | Tailwind CSS v4                                                   |
| UI primitives | Radix UI + shadcn/ui components                                   |
| Charts        | Recharts                                                          |
| Maps          | Leaflet + React Leaflet                                           |
| HTTP client   | Axios                                                             |
| Auth          | Google OAuth (`@react-oauth/google`) + server-side session cookie |
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
│   └── apiStatus.jsx         # Global API status atom (ok / waking / down)
├── hooks/
│   ├── useApiStatus.jsx      # Subscribes to API status state
│   └── usePageTitle.jsx      # Sets document.title per page
├── lib/
│   ├── cities.js             # City slug parsing (prettyCityFromSlug)
│   ├── reviews.js            # Review CRUD helpers
│   ├── ratings.js            # Rating utilities (clamp, average)
│   ├── format.js             # Number/money/score formatters
│   ├── datetime.js           # Date formatting
│   ├── routing.js            # Safe returnTo URL validation
│   └── leafletIcon.js        # Leaflet default marker icon fix for Vite
├── pages/
│   ├── Home.jsx              # Landing page
│   ├── Cities.jsx            # City list with search and grid/map toggle
│   ├── CityDetail.jsx        # Full city page (metrics, map, reviews, insights)
│   ├── ReviewEditor.jsx      # Create / edit a review (protected)
│   ├── Account.jsx           # User profile, review management, account deletion (protected)
│   ├── Login.jsx             # Google sign-in page
│   ├── Methodology.jsx       # How scores are calculated
│   └── NotFound.jsx          # 404
├── utils/
│   └── utils.js              # cn() helper (clsx + tailwind-merge)
├── components/
│   ├── layout/               # Layout, Navbar, PageHero, SectionCard, ApiOverlay, ErrorBoundary
│   ├── city/                 # CityCard, CityMap, CitiesMap, PerceptionVsRealityChart
│   ├── reviews/              # ReviewCard
│   └── ui/                   # Button, Card, Badge, Dialog, Input, Loading, etc.
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
cd city-insight
npm install
```

### 2. Configure environment variables

Create `.env` in the `city-insight/` directory:

```env
# Point at local backend
VITE_API_URL=http://localhost:3000

# Your Google OAuth client ID (required for sign-in to work)
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
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

| Variable                | Required | Description                                                                             |
| ----------------------- | -------- | --------------------------------------------------------------------------------------- |
| `VITE_API_URL`          | Yes      | Backend base URL. Use `http://localhost:3000` for local dev.                            |
| `VITE_GOOGLE_CLIENT_ID` | Yes      | Google OAuth 2.0 client ID. Used by `@react-oauth/google` to render the sign-in button. |

---

## Authentication flow

1. User clicks **Continue with Google** — Google returns an ID token to the browser.
2. Frontend POSTs the token to `POST /api/auth/login`.
3. Backend verifies the token and sets an **httpOnly session cookie** (`ci_session`, 7-day expiry).
4. Frontend calls `GET /api/me` to load the user record.
5. All subsequent requests include the cookie automatically (`withCredentials: true`).
6. Logging out calls `POST /api/auth/logout`, clearing the server-side session.

State-changing requests (POST/PUT/PATCH/DELETE) also send an `X-Requested-With: XMLHttpRequest` header as a lightweight CSRF guard.

Protected routes (`/account`, `/cities/:slug/review`) redirect unauthenticated users to `/login` with a `returnTo` param, so users land back where they started after signing in.

---

## Cold-start handling

The backend runs on a free-tier host that sleeps when idle. The Axios response interceptor in `src/services/api.js` detects cold-start failures (502, 503, or connection timeout) and:

1. Sets the global API status to `"waking"` — the `ApiOverlay` component shows a "waking up" message to the user.
2. Starts polling `GET /health` with exponential backoff (max 60 s).
3. Automatically retries the original request once the server responds.

Rate-limit responses (429) are also handled: a dismissible alert is shown and auto-clears after the `Retry-After` window.

---

## Testing

```bash
npm run test        # run Vitest in watch mode
npm run test:run    # run once and exit
```

Unit tests live alongside the files they cover (e.g., `src/lib/ratings.test.js`). They cover utility functions in `src/lib/` such as rating clamping, averaging, and formatting helpers.

---

## Linting

```bash
npm run lint
```

Uses ESLint 9 with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`.
