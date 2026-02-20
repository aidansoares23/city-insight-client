import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import api from "../services/api";

/**
 * AuthContext holds:
 * - sessionUser: the “who am I?” user object returned by GET /api/me (or null)
 * - isBootstrapping: whether we’re still checking if a valid session cookie exists
 * - login/logout helpers
 * - refreshSessionUser: re-fetches /api/me to sync frontend state with server session
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Canonical "logged in user" state (null = signed out).
  const [sessionUser, setSessionUser] = useState(null);

  // True while we do the initial "do I have a valid server session?" check.
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  // Guards against setting state after unmount (or after a newer request finishes).
  const didUnmountRef = useRef(false);

  /**
   * Fetch the current user from the server (cookie-backed session).
   *
   * Why this is the source of truth:
   * - Your server stores auth in an httpOnly cookie (JS can’t read it).
   * - So the frontend can’t “decode the session”; it must ask the server: /api/me
   *
   * Behavior:
   * - 200 => setSessionUser(user)
   * - 401 => session missing/expired => setSessionUser(null)
   * - other errors => treat as signed out (conservative / fail-closed)
   */
  async function refreshSessionUser() {
    try {
      const response = await api.get("/api/me");
      const userFromServer = response.data?.user ?? null;

      if (!didUnmountRef.current) setSessionUser(userFromServer);
      return userFromServer;
    } catch (err) {
      const httpStatus = err?.response?.status;

      // 401 means: no valid session cookie (not logged in or expired)
      if (httpStatus === 401) {
        if (!didUnmountRef.current) setSessionUser(null);
        return null;
      }

      // If server is down/cold-starting, we “fail closed”:
      // don’t assume user is logged in if we can’t verify it.
      if (!didUnmountRef.current) setSessionUser(null);

      // Let callers decide whether they want to surface this error.
      throw err;
    }
  }

  /**
   * On app start (mount), bootstrap auth state once:
   * - check if the browser already has a valid session cookie
   * - populate sessionUser accordingly
   */
  useEffect(() => {
    didUnmountRef.current = false;

    (async () => {
      try {
        // If this fails with 401, refreshSessionUser will set null.
        await refreshSessionUser();
      } catch {
        // If it throws for non-401, we already “fail closed” inside refreshSessionUser.
        // Intentionally swallow here so bootstrapping can finish.
      } finally {
        if (!didUnmountRef.current) setIsBootstrapping(false);
      }
    })();

    return () => {
      didUnmountRef.current = true;
    };
  }, []);

  /**
   * Login flow:
   * 1) Frontend gets a Google ID token from Google OAuth.
   * 2) POST it to your backend.
   * 3) Backend verifies it and sets an httpOnly session cookie.
   * 4) Frontend calls /api/me to load the canonical user record from your DB.
   */
  async function loginWithGoogleIdToken(googleIdToken) {
    // Exchange Google token for server session cookie (httpOnly).
    const loginResponse = await api.post("/api/auth/login", {
      idToken: googleIdToken,
    });

    // Now that the cookie exists, re-fetch the user from /api/me (DB-backed).
    await refreshSessionUser();

    return loginResponse.data;
  }

  /**
   * Logout flow:
   * - Backend clears the session cookie
   * - Frontend clears local sessionUser
   */
  async function logout() {
    try {
      await api.post("/api/auth/logout");
    } finally {
      if (!didUnmountRef.current) setSessionUser(null);
    }
  }

  const authValue = useMemo(
    () => ({
      user: sessionUser,
      loading: isBootstrapping,
      loginWithGoogleIdToken,
      logout,
      refreshMe: refreshSessionUser, // keep your old name as an alias if you want
      refreshSessionUser, // clearer name for new usage
    }),
    [sessionUser, isBootstrapping],
  );

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth must be used inside <AuthProvider>");
  return auth;
}
