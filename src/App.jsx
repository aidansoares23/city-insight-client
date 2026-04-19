import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Layout from "./components/layout/Layout";
import { useApiStatus } from "./hooks/useApiStatus";
import ApiOverlay from "./components/layout/ApiOverlay";
import { useAuth } from "./auth/authContext";
import { Loading } from "@/components/ui/loading.jsx";

const Home         = lazy(() => import("./pages/Home"));
const Cities       = lazy(() => import("./pages/Cities"));
const CityDetail   = lazy(() => import("./pages/CityDetail"));
const Login        = lazy(() => import("./pages/Login"));
const Account      = lazy(() => import("./pages/Account"));
const ReviewEditor = lazy(() => import("./pages/ReviewEditor"));
const Methodology  = lazy(() => import("./pages/Methodology"));
const Compare      = lazy(() => import("./pages/Compare"));
const AiQuery      = lazy(() => import("./pages/AiQuery"));
const Quiz         = lazy(() => import("./pages/Quiz"));
const NotFound     = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms        = lazy(() => import("./pages/Terms"));

const AI_ENABLED = import.meta.env.VITE_AI_ENABLED !== "false";

/** Route guard that redirects unauthenticated users to `/login`, preserving the intended path in router state. */
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;

  return user ? (
    children
  ) : (
    <Navigate
      to="/login"
      replace
      state={{ returnTo: location.pathname + location.search }}
    />
  );
}

export default function App() {
  const { status, message } = useApiStatus();

  return (
    <div>
      <ApiOverlay
        show={status === "waking"}
        title="Getting things ready…"
        message="We're having trouble reaching the server. Hang tight while we reconnect — this usually takes just a moment."
        hint="Still stuck? Try refreshing the page."
      />

      {status === "rate-limited" && (
        <div
          role="alert"
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800 shadow-md"
        >
          {message || "Too many requests. Please slow down."}
        </div>
      )}

      <Suspense fallback={<Loading variant="page" />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/cities" element={<Cities />} />
            <Route path="/cities/:slug" element={<CityDetail />} />
            <Route path="/methodology" element={<Methodology />} />
            <Route path="/compare" element={<Compare />} />
            {AI_ENABLED && <Route path="/ask" element={<AiQuery />} />}
            <Route path="/quiz" element={<Quiz />} />

            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />

            <Route path="/login" element={<Login />} />

            <Route
              path="/account"
              element={
                <RequireAuth>
                  <Account />
                </RequireAuth>
              }
            />
            <Route
              path="/cities/:slug/review"
              element={
                <RequireAuth>
                  <ReviewEditor />
                </RequireAuth>
              }
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Analytics />
    </div>
  );
}
