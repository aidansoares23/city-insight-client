import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../auth/authContext";
import { Button } from "../../components/ui/button";
import { Menu, X } from "lucide-react";

function PillNavLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium",
          "transition-colors duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isActive
            ? "bg-[hsl(var(--primary))] text-slate-900 ring-1 ring-[hsl(var(--primary))]"
            : "text-slate-900 hover:bg-[hsl(var(--secondary))] hover:text-slate-900",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

function MobileNavLink({ to, onClick, children }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-sky-300 text-slate-900 ring-1 ring-sky-200"
            : "text-slate-800 hover:bg-red-200",
        ].join(" ")
      }
    >
      <span>{children}</span>
      <span className="text-xs opacity-70">→</span>
    </NavLink>
  );
}

function MobilePillNavLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "shrink-0 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
          "transition-colors",
          isActive
            ? "bg-sky-300 text-slate-900 ring-1 ring-blue-200"
            : "text-slate-800 hover:bg-sky-200 hover:text-slate-900",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white backdrop-blur">
      <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center gap-2 px-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="group flex items-center gap-2 rounded-xl px-2 py-1 no-underline
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40
                        focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="City Insight home"
          >
            <span className="brand-font text-xl font-semibold tracking-tight text-black sm:text-3xl sm:inline">
              City Insight
            </span>
          </Link>
        </div>

        <div className="ml-auto hidden items-center gap-2 sm:flex">
          <nav className="hidden items-center gap-2 sm:flex">
            <PillNavLink to="/cities">Cities</PillNavLink>
            <PillNavLink to="/methodology">Methodology</PillNavLink>
          </nav>

          {loading ? (
            <span className="px-2 text-sm text-slate-500">…</span>
          ) : user ? (
            <>
              <PillNavLink to="/account">Account</PillNavLink>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={logout}
                type="button"
              >
                Sign out
              </Button>
            </>
          ) : (
            <Button asChild className="rounded-full">
              <NavLink to="/login">Sign in</NavLink>
            </Button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="ml-auto sm:hidden">
          <Button
            variant="outline"
            className="rounded-full px-3"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {/* Mobile dropdown (animated) */}
      <div
        id="mobile-nav"
        className={[
          "sm:hidden overflow-hidden border-t border-slate-400 bg-white",
          "transition-[max-height,opacity,transform] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]",
          open
            ? "max-h-96 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2",
        ].join(" ")}
        aria-hidden={!open}
      >
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div
            className={[
              "rounded-2xl border border-slate-200 bg-white p-2 shadow-sm",
              "transition-transform duration-400 ease-out",
              open ? "scale-100" : "scale-[0.98]",
            ].join(" ")}
          >
            <MobileNavLink to="/cities" onClick={() => setOpen(false)}>
              Cities
            </MobileNavLink>

            <MobileNavLink to="/methodology" onClick={() => setOpen(false)}>
              Methodology
            </MobileNavLink>

            <div className="my-2 h-px bg-slate-100" />

            {loading ? (
              <span className="block px-3 py-2 text-sm text-slate-500">…</span>
            ) : user ? (
              <>
                <MobileNavLink to="/account" onClick={() => setOpen(false)}>
                  Account
                </MobileNavLink>

                <Button
                  variant="outline"
                  className="mt-2 w-full justify-center rounded-xl"
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  type="button"
                >
                  Sign out
                </Button>
              </>
            ) : (
              <Button asChild className="mt-2 w-full rounded-xl">
                <NavLink to="/login" onClick={() => setOpen(false)}>
                  Sign in
                </NavLink>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
