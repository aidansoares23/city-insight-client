import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Cities from "./pages/Cities";
import CityDetail from "./pages/CityDetail";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Account from "./pages/Account";
import { useApiStatus } from "./hooks/useApiStatus";
import ApiOverlay from "./components/layout/ApiOverlay";
import { useAuth } from "./auth/authContext";
import ReviewEditor from "./pages/ReviewEditor";
import Methodology from "./pages/Methodology";
import Compare from "./pages/Compare";
import AiQuery from "./pages/AiQuery";
import Quiz from "./pages/Quiz";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";

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
        title="Waking up City Insight backend…"
        message="The free tier sleeps when idle. First request can take ~30 seconds."
        hint="If it stalls, refresh and try again."
      />

      {status === "rate-limited" && (
        <div
          role="alert"
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800 shadow-md"
        >
          {message || "Too many requests. Please slow down."}
        </div>
      )}

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
    </div>
  );
}
