# CityInsight — System Architecture

## Project Overview

CityInsight is a full-stack city livability platform that helps users discover, compare, and review cities across California. It aggregates objective metrics (safety scores, air quality, median rent, population) with crowd-sourced community reviews, surfaces AI-powered insights via a conversational assistant, and presents everything through an interactive map and data visualization interface.

---

## System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                          Browser (Client)                        │
│                                                                  │
│   React 19 + Vite · Tailwind · Leaflet · Recharts                │
│   react-router-dom · axios · @react-oauth/google                 │
└──────────────────────────┬───────────────────────────────────────┘
                           │  HTTPS (same-origin via Vercel proxy)
                           │  httpOnly cookie (ci_session JWT)
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Vercel (Frontend Host)                        │
│                                                                  │
│   Static SPA bundle (vite build → dist/)                         │
│   vercel.json rewrites:                                          │
│     /api/*  →  Render backend                                    │
│     /*      →  index.html (SPA fallback)                         │
└──────────────────────────┬───────────────────────────────────────┘
                           │  HTTPS proxy
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                Render (Backend — Node.js 22)                     │
│                                                                  │
│   Express 5 · cookie-parser · Helmet · cors · express-rate-limit │
│   Routes: /auth  /cities  /me  /ai  /health                      │
│   Middleware: requireAuth · optionalAuth · rateLimiter           │
└────────┬────────────────────┬────────────────────────────────────┘
         │                    │
         │ Firestore SDK      │ Anthropic SDK + Google OAuth2
         ▼                    ▼
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│   Firestore     │  │  Anthropic API   │  │   Google OAuth 2.0   │
│                 │  │                  │  │                      │
│  13 collections │  │  claude-haiku-   │  │  ID token            │
│  cities         │  │  4-5-20251001    │  │  verification        │
│  reviews        │  │  5 tools         │  │  (verifyIdToken)     │
│  users          │  │  agentic loop    │  │                      │
│  ai_sessions    │  │  prompt caching  │  └──────────────────────┘
│  ai_logs        │  │                  │
│  + 8 more       │  └──────────────────┘
└─────────────────┘
         ▲
         │ External data pipeline (scripts/tasks/)
         │
┌─────────────────────────────────────────┐
│  External APIs (metrics ingestion)      │
│  FBI Crime API · OpenAQ · Census ACS    │
│  Overpass (POI)                         │
└─────────────────────────────────────────┘
```

---

## Tech Stack Summary

| Layer              | Technology                              | Purpose                               |
| ------------------ | --------------------------------------- | ------------------------------------- |
| Frontend Framework | React 19.2.0                            | UI component model                    |
| Build Tool         | Vite 7.2.4                              | Dev server, bundling, HMR             |
| CSS                | Tailwind CSS 4.1.18                     | Utility-first styling                 |
| UI Primitives      | Radix UI 1.4.3                          | Accessible headless components        |
| Routing            | react-router-dom 7.13.0                 | Client-side routing, protected routes |
| HTTP Client        | axios 1.13.4                            | API calls with interceptors           |
| Maps               | react-leaflet 5.0.0 + leaflet 1.9.4     | Interactive city maps                 |
| Charts             | recharts 3.7.0                          | Radar charts, data visualization      |
| Auth (client)      | @react-oauth/google 0.13.4              | Google OAuth ID token acquisition     |
| Markdown           | react-markdown 10.1.0                   | AI response rendering                 |
| Frontend Host      | Vercel                                  | CDN, SPA routing, API proxy           |
| Backend Runtime    | Node.js 22                              | Server runtime                        |
| Backend Framework  | Express 5.2.1                           | REST API, middleware chain            |
| Database           | Firestore (Firebase Admin 12.7.0)       | Document store, real-time capable     |
| Auth (server)      | google-auth-library + jsonwebtoken      | Token verification + JWT sessions     |
| AI                 | Anthropic SDK 0.80.0 (Claude Haiku 4.5) | Agentic conversational assistant      |
| Rate Limiting      | express-rate-limit 8.3.1                | Per-IP request throttling             |
| Security           | Helmet 8.1.0                            | HTTP security headers                 |
| Backend Host       | Render                                  | Node.js web service                   |
| Frontend Testing   | Vitest 4.0.18                           | Unit tests                            |
| Backend Testing    | Node.js built-in test runner            | Integration + unit tests              |

---

## Frontend Summary

The frontend is a React 19 SPA built with Vite and deployed to Vercel. Vercel acts as a transparent proxy for all `/api/*` traffic to the Render backend, keeping cookies same-origin and eliminating CORS complexity.

**Key architectural decisions:**

- **No global state library** — React Context handles auth state; a lightweight pub-sub module handles API health status. Local component state handles everything else.
- **Axios interceptors** for cross-cutting concerns: CSRF header injection, cold-start detection (polls `/health` with exponential backoff when Render's free tier is waking up), and rate-limit UI feedback.
- **Feature-flagged AI chat** — The `/ask` route and AI endpoints are toggled via `VITE_AI_ENABLED` env var.
- **Protected routes** via `<RequireAuth>` with `returnTo` state preservation for post-login redirect.

**Major pages**: Home, Cities (grid/map toggle), CityDetail (radar charts, cost calculator, reviews, photo gallery), Compare, Quiz (preference-based recommendation), Account, ReviewEditor, AiQuery.

**Component organization**: `pages/` for route-level components, `components/city/` for city-domain components, `components/layout/` for structural shell, `components/ui/` for Radix-backed primitives, `lib/` for API-calling helpers, `services/api.js` for the axios instance.

See [cityinsight-client/FRONTEND_ARCHITECTURE.md](cityinsight-client/FRONTEND_ARCHITECTURE.md) for full details.

---

## Backend Summary

The backend is a Node.js 22 / Express 5 REST API deployed on Render. All data is stored in Firestore across 13 collections. Authentication uses Google OAuth for identity verification and JWT for session management via httpOnly cookies.

**Key architectural decisions:**

- **Atomic livability recompute** — Every review write and delete recalculates the city's livability score within the same Firestore transaction, guaranteeing consistency.
- **Deterministic review IDs** — `HMAC(salt, userId:cityId)` enforces one review per user per city at the database level with no unique index needed.
- **Cursor-based pagination** — Reviews paginate on `(createdAt, reviewId)` tuples, avoiding offset performance degradation at scale.
- **Layered middleware** — `requireAuth` / `optionalAuth` / `rateLimiter` applied per-route; centralized error handler maps `AppError` codes to HTTP status.
- **Three rate limit tiers** — 300 req/15min (general), 20/15min (auth), 20/15min (AI) to protect Anthropic quota.

**Controllers**: `authController`, `cityController`, `reviewController`, `reactionController`, `meController`, `aiController`.

**External data pipeline**: Admin CLI scripts (`scripts/tasks/`) ingest FBI crime data, Census ACS, and OpenAQ air quality into Firestore `city_metrics`, with full audit snapshots per sync run.

See [cityinsight-server/BACKEND_ARCHITECTURE.md](cityinsight-server/BACKEND_ARCHITECTURE.md) for full details.

---

## AI Layer Summary

CityInsight's AI feature is an **agentic tool-use loop** powered by Claude Haiku 4.5 (`claude-haiku-4-5-20251001`). It answers natural-language questions about city livability by autonomously selecting and calling backend data tools — no hardcoded query paths.

### Tools (defined in `src/lib/aiTools.js`)

| Tool               | Purpose                                                                              |
| ------------------ | ------------------------------------------------------------------------------------ |
| `getCity`          | Retrieve full profile for a specific city                                            |
| `aggregateReviews` | Get community sentiment and review excerpts                                          |
| `compareCities`    | Side-by-side data for 2–4 cities                                                     |
| `rankCities`       | Rank by livability, safety, affordability, walkability, cleanliness, or review count |
| `filterCities`     | Multi-criteria filter (rent cap, min safety, state, AQI, etc.)                       |

### Intelligence Optimizations

**Intent detection**: Before invoking the model, `detectRankingMetric()` and `detectStateFilter()` classify the query using regex + keyword matching. Ranking queries (e.g., "safest cities in California") take a **fast path**: `rankCities()` runs directly, results are injected as a synthetic tool exchange, and Claude formats the output only. This avoids a full agentic loop for the most common query type.

**Prompt caching**: The system prompt (which includes the full city list) is sent with `cache_control: { type: "ephemeral" }`. Anthropic caches this prefix, reducing token costs by ~90% for repeat queries.

**Tool deduplication**: An in-request `toolResultCache` (keyed by `toolName:JSON(input)`) prevents the model from calling the same tool twice in one request, reducing Anthropic API spend.

**Multi-turn sessions**: Conversation history persists to `ai_sessions` in Firestore, resumable via `sessionId`. Sessions cap at 40 messages (20 turns), trimmed FIFO.

**Audit trail**: Every request logs to `ai_logs` with the full `toolCallTrace` for observability and debugging.

**Agentic loop**: Up to 8 model turns. On each turn — if `stop_reason == "tool_use"` — tools execute (with deduplication), results are appended, and the loop continues. On `stop_reason == "end_turn"`, the assistant's text is extracted and returned.

---

## Data Flow

A complete end-to-end walk-through of a user submitting a city review:

1. **Browser** — User submits `ReviewEditor` form. `lib/reviews.js:upsertMyReview()` calls `POST /api/cities/:slug/reviews` via axios. The request includes the httpOnly `ci_session` cookie automatically.

2. **Vercel** — Receives the request; matches `/api/*` rewrite rule; proxies to `https://city-insight-server.onrender.com/api/cities/:slug/reviews`. Cookies are forwarded.

3. **Express middleware chain** — `requireAuth` verifies the JWT in `ci_session`, sets `req.user`. `rateLimiter` checks per-IP count. CSRF header validated.

4. **`reviewController.createOrUpdateReviewForCity()`** — Calls `reviewService.upsertReview()`.

5. **`reviewService.upsertReview()`** — Opens a Firestore transaction:
   - Writes/overwrites the `reviews/{HMAC(salt, userId:cityId)}` document
   - Reads `city_stats/{slug}`, recalculates livability score from updated sums and count
   - Writes updated `city_stats/{slug}`
   - Transaction commits atomically

6. **Response** — `201 Created` with the review document returned to the frontend.

7. **Frontend** — `ReviewCard` renders the new review; `CityDetail` re-fetches stats to show updated livability score.

---

**AI query flow** (`POST /api/ai/query`):

1. Browser sends `{ query, sessionId }` to `/api/ai/query`
2. `aiController.runAiQuery()` runs intent detection
3. If ranking detected → fast path (direct `rankCities()` call + format-only Claude turn)
4. Otherwise → load session history from `ai_sessions` → enter agentic loop
5. Loop: Claude call → tool_use detected → tools execute (with cache) → results appended → next turn
6. On `end_turn` → extract text → persist session and audit log (fire-and-forget) → respond

---

## Testing Overview

| Layer                 | Framework           | Count   | Coverage                                                        |
| --------------------- | ------------------- | ------- | --------------------------------------------------------------- |
| Backend — integration | Node.js test runner | ~20     | Health, auth routes, 404 handling                               |
| Backend — services    | Node.js test runner | ~80     | City service, review transactions, user ops, livability formula |
| Backend — middleware  | Node.js test runner | ~20     | JWT validation, CSRF enforcement, auth bypass                   |
| Backend — utilities   | Node.js test runner | ~32     | Livability computation, metrics aggregation, number utilities   |
| Frontend — lib        | Vitest              | ~20     | Date formatting, city helpers, rating logic                     |
| **Total (backend)**   |                     | **152** |                                                                 |

**Backend CI**: `.github/workflows/ci.yml` runs `npm ci && npm test` on every push and PR to `main`. Tests run against the Firestore emulator (`FIRESTORE_EMULATOR_HOST=localhost:8080`).

**Frontend tests**: Run with `npm run test:run` (vitest). Tests cover pure utility functions in `src/lib/`.

---

## Deployment Architecture

```
┌─────────────────────────┐      ┌───────────────────────────────┐
│         Vercel           │      │            Render              │
│                         │      │                               │
│  cityinsight-client/    │ ───► │  cityinsight-server/          │
│  npm run build          │      │  npm start (node src/index.js)│
│  → dist/ (static SPA)   │      │  Node.js 22                   │
│                         │      │  Build: npm ci && npm test    │
│  vercel.json:           │      │  Health: GET /health          │
│  /api/* → Render        │      │                               │
│  /*    → index.html     │      │  Env vars: Render dashboard   │
└─────────────────────────┘      └───────────────────────────────┘
                                          │              │
                                 ┌────────┘              └────────┐
                                 ▼                               ▼
                    ┌─────────────────────┐        ┌────────────────────┐
                    │  Google Cloud        │        │  Anthropic API     │
                    │  Firestore           │        │  (claude-haiku-    │
                    │  (13 collections)   │        │   4-5-20251001)    │
                    └─────────────────────┘        └────────────────────┘
```

| Component    | Host                   | Notes                                                        |
| ------------ | ---------------------- | ------------------------------------------------------------ |
| Frontend SPA | Vercel                 | Auto-deploys from `main`; CDN-distributed globally           |
| Backend API  | Render (Node.js)       | Free tier; cold starts handled by frontend polling           |
| Database     | Google Cloud Firestore | Managed, serverless; accessed via Firebase Admin SDK         |
| AI           | Anthropic API          | Stateless calls; sessions stored in Firestore                |
| Auth         | Google OAuth 2.0       | Token verified server-side; sessions via httpOnly JWT cookie |

### Cross-Origin Cookie Strategy

The frontend (Vercel) and backend (Render) are on different domains. Vercel's `/api/*` rewrite proxy makes all API calls appear same-origin to the browser, allowing `SameSite=Lax` in development and requiring `SameSite=None; Secure` in production for the cross-domain cookie to flow correctly.

---

_Generated April 2026. See [cityinsight-client/FRONTEND_ARCHITECTURE.md](cityinsight-client/FRONTEND_ARCHITECTURE.md) and [cityinsight-server/BACKEND_ARCHITECTURE.md](cityinsight-server/BACKEND_ARCHITECTURE.md) for detailed per-layer documentation._
