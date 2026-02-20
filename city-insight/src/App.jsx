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
import NotFound from "./pages/NotFound";

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
      {/* <ApiOverlay show={status === "waking"} message={message} /> */}
      <ApiOverlay
        show={status === "waking"}
        // optional overrides
        title="Waking up City Insight backend…"
        message="The free tier sleeps when idle. First request can take ~30 seconds."
        hint="If it stalls, refresh and try again."
      />

      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cities" element={<Cities />} />
          <Route path="/cities/:slug" element={<CityDetail />} />
          <Route path="/methodology" element={<Methodology />} />

          {/* Dedicated login route */}
          <Route path="/login" element={<Login />} />

          {/* Account page shows reviews, protected */}
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
