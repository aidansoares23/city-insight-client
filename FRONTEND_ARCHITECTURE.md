# CityInsight Frontend Architecture

A comprehensive guide to the CityInsight frontend codebase, documenting the tech stack, component architecture, routing, state management, API integration, authentication, and deployment strategy.

## Tech Stack

### Framework & Build Tool

- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4 with @vitejs/plugin-react 5.1.1
- **Development Server**: Vite dev server with API proxy to http://localhost:3000

### Core UI & Styling

- **CSS Framework**: Tailwind CSS 4.1.18 (@tailwindcss/vite 4.1.18)
- **UI Component Library**: Radix UI 1.4.3 (headless components)
- **Component Utilities**: class-variance-authority 0.7.1, clsx 2.1.1, tailwind-merge 3.4.0
- **Icon Library**: lucide-react 0.563.0

### Routing & State

- **Routing**: react-router-dom 7.13.0 with `<BrowserRouter>` and nested routing via `<Routes>`
- **State Management**: React Context API (no Redux/Zustand) with `AuthContext` for authentication

### Data Fetching & Maps

- **HTTP Client**: axios 1.13.4 with request/response interceptors for error handling and cold-start recovery
- **Maps**: leaflet 1.9.4 with react-leaflet 5.0.0 for interactive map components
- **Charting**: recharts 3.7.0 for radar charts and data visualization

### Content & Markdown

- **Markdown Rendering**: react-markdown 10.1.0 with remark-gfm 4.0.1 for GitHub-flavored markdown
- **Rich Text**: @tailwindcss/typography 0.5.19

### Authentication

- **Google OAuth**: @react-oauth/google 0.13.4 with `GoogleOAuthProvider` and `GoogleLogin` component

### Testing & Linting

- **Testing**: vitest 4.0.18 (unit tests)
- **Linting**: ESLint 9.39.1 with eslint-plugin-react-hooks 7.0.1 and eslint-plugin-react-refresh 0.4.24

## Directory Structure

All source code is located in `src/` with the following top-level folders:

```
src/
├── auth/              # Authentication context and hooks
├── components/        # Reusable UI components (organized by domain)
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and helpers
├── pages/             # Full-page route components
├── services/          # API client and backend communication
├── state/             # Global state management (non-context)
├── styles/            # CSS and theme definitions
├── utils/             # General utility functions
├── App.jsx            # Root router with route definitions
└── main.jsx           # Application entry point
```

### Directory Details

**`auth/`**

- `authContext.jsx`: Contains `<AuthProvider>` and `useAuth()` hook for managing session state and Google OAuth login flow.

**`components/`** (organized into subfolders)

- `city/`: CityCard, CitiesMap, CityPhotoGallery, CityRadarChart, CityMap, InsightsRadarChart, PerceptionVsRealityChart, CostCalculator, FavoriteButton
- `layout/`: Layout, Navbar, ErrorBoundary, ApiOverlay, SectionCard, PageHero, PageNav
- `reviews/`: ReviewCard, ReactionBar
- `ui/`: Primitive components (button, card, input, dialog, badge, back-link, loading, rating-slider, separator)

**`hooks/`**

- `useApiStatus()`: Subscribes to global API status changes
- `usePageTitle()`: Sets document.title on mount/unmount

**`lib/`** (helper modules)

- `favorites.js`: `fetchMyFavorites()`, `addFavorite()`, `removeFavorite()`
- `reviews.js`: `fetchMyReviews()`, `fetchMyReview()`, `upsertMyReview()`, `deleteMyReview()`, `deleteMyAccount()`, `buildReviewsQuery()`
- `ratings.js`: Rating validation, averaging, color tokens (RATING_KEYS: safety, affordability, walkability, cleanliness)
- `reactions.js`: `toggleReaction()`, `clearReactions()`
- `format.js`: `fmtMoney()`, `fmtNum()`, `clamp01()`, `toOutOf10()`, `initialsFromUser()`
- `cities.js`, `datetime.js`, `city-photos.js`, `leafletIcon.js`, `routing.js`, `me.js`
- Test files: `*.test.js` using vitest

**`pages/`** (full-page route components)

- `Home.jsx`: Landing page with floating city pins and feature cards
- `Cities.jsx`: City listing with search, sorting, grid/map toggle
- `CityDetail.jsx`: Single city view with stats, reviews, photos, insights
- `Login.jsx`: Google OAuth sign-in page
- `Account.jsx`: User profile, favorites, saved reviews, account settings
- `ReviewEditor.jsx`: Form to create/edit city reviews
- `AiQuery.jsx`: AI-powered chat interface (feature-flagged)
- `Compare.jsx`: Compare two cities side-by-side
- `Quiz.jsx`: Interactive quiz to recommend cities
- `Methodology.jsx`: Documentation of rating methodology
- `NotFound.jsx`: 404 error page

**`services/`**

- `api.js`: axios instance with interceptors for cold-start detection, rate-limit handling, and CSRF headers

**`state/`**

- `apiStatus.jsx`: Pub-sub state for API health status ("ok", "waking", "down", "rate-limited")

**`styles/`**

- `theme.css`: Tailwind theme tokens and custom CSS (--primary, --secondary, --ring, --score-good, --score-ok, --score-poor)

## Routing

All routes are defined in `App.jsx` within a `<Routes>` tree. The app uses **nested routes** with `<Layout>` as the root outlet wrapper.

### Route Definitions

| Path                   | Component    | Protected | Notes                     |
| ---------------------- | ------------ | --------- | ------------------------- |
| `/`                    | Home         | No        | Landing page              |
| `/cities`              | Cities       | No        | List all cities           |
| `/cities/:slug`        | CityDetail   | No        | Single city page          |
| `/cities/:slug/review` | ReviewEditor | **Yes**   | Edit city review          |
| `/methodology`         | Methodology  | No        | Rating methodology        |
| `/compare`             | Compare      | No        | Compare two cities        |
| `/ask`                 | AiQuery      | No        | AI chat (feature-flagged) |
| `/quiz`                | Quiz         | No        | City recommendation quiz  |
| `/login`               | Login        | No        | Google OAuth sign-in      |
| `/account`             | Account      | **Yes**   | User profile              |
| `*`                    | NotFound     | No        | 404 error                 |

### Protected Routes

Two routes require authentication via `<RequireAuth>` wrapper:

- `/account`: User profile and account settings
- `/cities/:slug/review`: Review creation/editing

`RequireAuth` checks `useAuth()` and redirects unauthenticated users to `/login`, preserving the intended destination in router state (`location.state.returnTo`).

### Feature Flags

The `/ask` route (AI query chat) is conditionally rendered:

```javascript
const AI_ENABLED = import.meta.env.VITE_AI_ENABLED !== "false";
{
  AI_ENABLED && <Route path="/ask" element={<AiQuery />} />;
}
```

## Component Architecture

### Page Components (Full-Screen Routes)

All page components live in `src/pages/` and render as route elements. Key patterns:

- Fetch data via API on mount with cleanup (alive flag pattern)
- Use `usePageTitle()` to set the document title
- Manage local component state (cities, search input, loading states)
- Render domain-specific sub-components

Key pages:

- **Home.jsx**: Hero landing with floating city pins, feature cards, and CTAs
- **Cities.jsx**: Grid/map view of cities with search and sort (by livability, affordability, etc.)
- **CityDetail.jsx**: Full city profile with radar charts, cost calculator, reviews, photo gallery
- **Account.jsx**: User dashboard with favorites, my reviews, profile settings, delete account
- **AiQuery.jsx**: Conversational AI interface with session management and markdown rendering
- **Compare.jsx**: Side-by-side city comparison

### Layout Components (`src/components/layout/`)

- **`Layout.jsx`**: Root layout wrapping all routes; renders `<Navbar>` (sticky), centered `<main>`, and `<Outlet>` for nested routes
- **`Navbar.jsx`**: Sticky header with responsive nav (desktop pills, mobile hamburger menu), logo, links, auth buttons
- **`ErrorBoundary.jsx`**: Class component wrapping routes to catch rendering errors with fallback UI
- **`ApiOverlay.jsx`**: Full-screen overlay showing cold-start spinner and status messages
- **`SectionCard.jsx`**: Card wrapper with icon, title, subtitle, and optional action button
- **`PageHero.jsx`**: Page header with title and breadcrumbs
- **`PageNav.jsx`**: Sub-page navigation tabs

### City Components (`src/components/city/`)

- **`CityCard.jsx`**: Compact card showing city name, state, thumbnail, livability score, favorite button
- **`CitiesMap.jsx`**: Interactive Leaflet map with city markers, click-to-navigate
- **`CityMap.jsx`**: Single city map view
- **`CityPhotoGallery.jsx`**: Carousel/grid of city photos with placeholders
- **`CityRadarChart.jsx`**: Recharts radar chart (safety, affordability, walkability, cleanliness)
- **`InsightsRadarChart.jsx`**: Multi-city radar comparison
- **`PerceptionVsRealityChart.jsx`**: Compares user perception vs statistical reality
- **`CostCalculator.jsx`**: Interactive calculator for cost of living breakdown
- **`FavoriteButton.jsx`**: Heart icon toggle to add/remove from favorites

### Review Components (`src/components/reviews/`)

- **`ReviewCard.jsx`**: Displays review with author, date, ratings, text, reactions, edit/delete actions
- **`ReactionBar.jsx`**: Row of emoji reaction buttons with counts

### UI Primitives (`src/components/ui/`)

Radix-UI-backed headless components:

- `button.jsx`: Multiple variants (default, outline, ghost)
- `card.jsx`: Container with border and shadow
- `input.jsx`: Form input field
- `dialog.jsx`: Modal overlay
- `badge.jsx`: Small label/tag
- `loading.jsx`: Spinner/skeleton loader
- `rating-slider.jsx`: Slider for 1-10 rating input
- `back-link.jsx`: Breadcrumb back navigation
- `separator.jsx`: Divider line

### Component Patterns

1. **State Lifting**: Local state (useState) in page components; shared state via Context
2. **Data Fetching**: Mounted in `useEffect` with alive flag to prevent state updates after unmount
3. **Responsive Design**: Tailwind responsive classes (sm:, lg:) for mobile-first layout
4. **Accessibility**: Radix UI primitives provide semantic HTML and ARIA

## State Management

The app uses **React Context API** for global state; no Redux or Zustand.

### Authentication State

**Provider**: `<AuthProvider>` (wraps entire app in `main.jsx`)  
**Hook**: `useAuth()`

Exposes:

```javascript
{
  user: null | { email, displayName, ... },
  loading: boolean,
  loginWithGoogleIdToken(idToken): Promise,
  logout(): Promise,
  refreshSessionUser(): Promise
}
```

**Session Storage**: httpOnly cookie (server-managed); JS-side state only via `/api/me` endpoint.

### API Status State

**Module**: `src/state/apiStatus.jsx` (pub-sub pattern, not Context)

Global state object:

```javascript
{
  status: "ok" | "waking" | "down" | "rate-limited",
  message: string
}
```

Functions:

- `getApiStatus()`: Fetch current state
- `setApiStatus(patch)`: Update and notify subscribers
- `subscribeApiStatus(fn)`: Subscribe to changes; returns unsubscribe function

**Hook**: `useApiStatus()` (subscribes to state in `useEffect`)

### Local Component State

Page components manage their own state for: search input, sort selection, view mode (grid/map), loading/error states, form values, pagination cursors, and session IDs.

## API Integration

The frontend communicates with the backend via **axios** through `src/services/api.js`.

### Axios Instance Configuration

```javascript
const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
  withCredentials: true, // sends cookies
});
```

**Vite Proxy** (`vite.config.js`): Routes `/api/*` to `http://localhost:3000/api` during development.

**Production**: `vercel.json` rewrites `/api/*` to `https://city-insight-server.onrender.com/api/*`.

### Request Interceptors

- Adds CSRF-lite header: `X-Requested-With: XMLHttpRequest`

### Response Interceptors

1. **429 (Rate Limit)**: Sets global status to "rate-limited" with retry-after message
2. **502/503 or ECONNABORTED** (cold start): Triggers `wakeServer()` to poll `/health` with exponential backoff
3. **Deduplication**: Only one wake attempt runs concurrently via promise caching

### Endpoints Called

| Method | Path                                        | Description                             |
| ------ | ------------------------------------------- | --------------------------------------- |
| POST   | `/auth/login`                               | Exchange Google ID token for session    |
| POST   | `/auth/logout`                              | Clear session cookie                    |
| GET    | `/me`                                       | Fetch session user                      |
| GET    | `/me/favorites`                             | List favorited cities                   |
| PUT    | `/me/favorites/:slug`                       | Add city to favorites                   |
| DELETE | `/me/favorites/:slug`                       | Remove from favorites                   |
| GET    | `/me/reviews`                               | Fetch user's reviews                    |
| PATCH  | `/me`                                       | Update user profile                     |
| DELETE | `/me`                                       | Delete account and all data             |
| GET    | `/cities`                                   | List all cities                         |
| GET    | `/cities/:slug/reviews`                     | Fetch reviews for a city (paginated)    |
| GET    | `/cities/:slug/reviews/me`                  | Fetch current user's review             |
| POST   | `/cities/:slug/reviews`                     | Create/upsert review                    |
| DELETE | `/cities/:slug/reviews/me`                  | Delete user's review                    |
| PUT    | `/cities/:slug/reviews/:id/reactions/:type` | Add/toggle reaction                     |
| DELETE | `/cities/:slug/reviews/:id/reactions`       | Clear all reactions                     |
| POST   | `/ai/query`                                 | AI chat query (90s timeout)             |
| POST   | `/cities/recommend`                         | City recommendations from quiz weights  |
| GET    | `/health`                                   | Server health check for wake-up polling |

## Authentication

Authentication uses **Google OAuth 2.0** with httpOnly session cookies managed server-side.

### Client-Side Flow

1. `<GoogleOAuthProvider clientId={VITE_GOOGLE_CLIENT_ID}>` wraps the app in `main.jsx`
2. User clicks `<GoogleLogin>` on `/login` page
3. Google returns an ID token via `onSuccess` callback
4. Token is sent to `POST /auth/login`
5. Backend validates, creates httpOnly cookie, returns user object
6. `useAuth()` calls `refreshSessionUser()` → `GET /api/me`
7. Router redirects to `/account` or `location.state.returnTo`

### Session Lifecycle

- **Storage**: httpOnly cookie (not accessible to JavaScript)
- **Bootstrap**: `GET /api/me` called on app init to hydrate auth state
- **Expiration**: 401 from `/api/me` → session expired → user is null
- **Logout**: `POST /auth/logout` → cookie cleared → `user` set to null

### `<RequireAuth>` Component

Checks `useAuth().user`:

- If authenticated: render children
- If unauthenticated: redirect to `/login` with `{ state: { returnTo: location } }`
- If loading: render nothing (wait for bootstrap)

## Environment Configuration

### Environment Variables

| Variable                | Purpose                                                        |
| ----------------------- | -------------------------------------------------------------- |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID                                     |
| `VITE_AI_ENABLED`       | Feature flag to enable/disable AI chat (`"true"` \| `"false"`) |

### Vite Configuration (`vite.config.js`)

- **Plugins**: `react()` for JSX, `tailwindcss()` for CSS
- **Path Alias**: `@` resolves to `./src`
- **Dev Proxy**: `/api` and `/health` forwarded to `http://localhost:3000`

## Deployment

### Build

```bash
npm run build   # vite build → dist/
npm run preview # preview production bundle locally
```

### Vercel Configuration (`vercel.json`)

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://city-insight-server.onrender.com/api/:path*"
    },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- Rule 1: Proxies all API calls to the Render backend (avoids CORS, keeps same-origin cookies)
- Rule 2: SPA fallback — serves `index.html` for all non-API paths to enable client-side routing

### Package Scripts

| Script     | Command        | Purpose                 |
| ---------- | -------------- | ----------------------- |
| `dev`      | `vite`         | Dev server with HMR     |
| `build`    | `vite build`   | Production bundle       |
| `preview`  | `vite preview` | Preview built output    |
| `lint`     | `eslint .`     | Run ESLint              |
| `test`     | `vitest`       | Run tests in watch mode |
| `test:run` | `vitest run`   | Run tests once (CI)     |

## Key Dependencies Summary

| Package             | Version | Purpose                             |
| ------------------- | ------- | ----------------------------------- |
| react               | 19.2.0  | UI framework                        |
| react-router-dom    | 7.13.0  | Client-side routing                 |
| axios               | 1.13.4  | HTTP client with interceptors       |
| @react-oauth/google | 0.13.4  | Google OAuth integration            |
| tailwindcss         | 4.1.18  | Utility-first CSS framework         |
| @radix-ui/react-\*  | 1.4.3   | Accessible headless UI primitives   |
| recharts            | 3.7.0   | Radar charts and data visualization |
| react-leaflet       | 5.0.0   | Interactive maps                    |
| react-markdown      | 10.1.0  | Markdown rendering for AI responses |
| lucide-react        | 0.563.0 | Icon library                        |
| vite                | 7.2.4   | Build tool and dev server           |
| vitest              | 4.0.18  | Unit testing framework              |
| eslint              | 9.39.1  | Code linting                        |
