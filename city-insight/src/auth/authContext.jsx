import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sessionUser, setSessionUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  // Guards against setting state after unmount (or after a newer request finishes).
  const didUnmountRef = useRef(false);

  // Session is stored in an httpOnly cookie JS can’t read, so /api/me is the
  // only way to know who’s logged in. Fail closed: any error except 401 still
  // clears the user rather than leaving stale auth state.
  async function refreshSessionUser() {
    try {
      const response = await api.get("/me");
      const userFromServer = response.data?.user ?? null;

      if (!didUnmountRef.current) setSessionUser(userFromServer);
      return userFromServer;
    } catch (err) {
      if (!didUnmountRef.current) setSessionUser(null);

      if (err?.response?.status === 401) return null;
      throw err;
    }
  }

  useEffect(() => {
    didUnmountRef.current = false;

    (async () => {
      try {
        await refreshSessionUser();
      } catch {
        // Non-401 errors are already fail-closed inside refreshSessionUser.
        // Swallow here so bootstrapping always finishes.
      } finally {
        if (!didUnmountRef.current) setIsBootstrapping(false);
      }
    })();

    return () => {
      didUnmountRef.current = true;
    };
  }, []);

  async function loginWithGoogleIdToken(googleIdToken) {
    const res = await api.post("/auth/login", { idToken: googleIdToken });
    await refreshSessionUser();
    return res.data;
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
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
      refreshSessionUser,
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
