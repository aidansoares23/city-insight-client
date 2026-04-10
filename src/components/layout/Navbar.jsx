import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/authContext";
import { Button } from "@/components/ui/Button";
import { initialsFromUser } from "@/lib/format";
import {
  Menu,
  X,
  Sparkles,
  Sliders,
  Building2,
  ArrowLeftRight,
  BookOpen,
  UserCircle,
  LogIn,
  LogOut,
} from "lucide-react";

const AI_ENABLED = import.meta.env.VITE_AI_ENABLED !== "false";

const NAV_ITEMS = [
  { to: "/cities", icon: Building2, label: "Cities" },
  { to: "/compare", icon: ArrowLeftRight, label: "Compare" },
  { to: "/quiz", icon: Sliders, label: "City Match" },
  { to: "/ask", icon: Sparkles, label: "Ask AI", aiOnly: true },
  { to: "/methodology", icon: BookOpen, label: "Methodology" },
];

/** Desktop pill-style `NavLink` with active highlight using the primary colour token. */
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

/** Full-width mobile nav item with a right-arrow indicator and active highlight. */
function MobileNavLink({ to, onClick, children }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] ring-1 ring-[hsl(var(--ring))]"
            : "text-slate-900 hover:bg-[hsl(var(--secondary))]",
        ].join(" ")
      }
    >
      <span>{children}</span>
      <span className="text-xs opacity-70">→</span>
    </NavLink>
  );
}

/** Circular avatar button with initials + dropdown (My Account / Sign out). */
function AvatarDropdown({ user, logout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const initials = initialsFromUser(user);

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className={[
          "flex h-8 w-8 items-center justify-center rounded-full",
          "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-[13px] font-semibold",
          "transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/50",
          "hover:shadow-[0_0_0_2px_hsl(var(--primary)/0.35)]",
          open ? "shadow-[0_0_0_2px_hsl(var(--primary)/0.35)]" : "",
        ].join(" ")}
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 overflow-hidden rounded-lg bg-white min-w-[160px] border border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            onClick={() => {
              setOpen(false);
              navigate("/account");
            }}
          >
            <UserCircle className="h-4 w-4 text-slate-400" />
            My Account
          </button>

          <div className="h-px bg-slate-200" />

          <button
            type="button"
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            <LogOut className="h-4 w-4 text-slate-400" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/** Sticky top navbar with responsive desktop nav links, auth controls, and an animated mobile dropdown. */
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
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-slate-200/30 backdrop-blur">
      <div className="mx-auto flex h-14 sm:h-16 w-full max-w-6xl items-center gap-2 px-3 sm:px-6 lg:px-10">
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
            {NAV_ITEMS.filter((item) => !item.aiOnly || AI_ENABLED).map(
              ({ to, icon: Icon, label }) => (
                <PillNavLink key={to} to={to}>
                  <Icon className="h-3.5 w-3.5 mr-1 inline-block" />
                  {label}
                </PillNavLink>
              ),
            )}
          </nav>

          {loading ? (
            <span className="px-2 text-sm text-slate-500">…</span>
          ) : user ? (
            <AvatarDropdown user={user} logout={logout} />
          ) : (
            <Button asChild className="rounded-full">
              <NavLink to="/login">
                <LogIn className="h-3.5 w-3.5 mr-1 inline-block" />
                Sign in
              </NavLink>
            </Button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="ml-auto sm:hidden">
          <Button
            variant="outline"
            className="rounded-full size-10 p-0"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
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
            {NAV_ITEMS.filter((item) => !item.aiOnly || AI_ENABLED).map(
              ({ to, icon: Icon, label }) => (
                <MobileNavLink key={to} to={to} onClick={() => setOpen(false)}>
                  <Icon className="h-3.5 w-3.5 mr-1.5 inline-block" />
                  {label}
                </MobileNavLink>
              ),
            )}

            <div className="my-2 h-px bg-slate-100" />

            {loading ? (
              <span className="block px-3 py-2 text-sm text-slate-500">…</span>
            ) : user ? (
              <>
                <MobileNavLink to="/account" onClick={() => setOpen(false)}>
                  <UserCircle className="h-3.5 w-3.5 mr-1.5 inline-block" />
                  My Account
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
                  <LogOut className="h-3.5 w-3.5 mr-1.5 inline-block" />
                  Sign out
                </Button>
              </>
            ) : (
              <Button asChild className="mt-2 w-full rounded-xl">
                <NavLink to="/login" onClick={() => setOpen(false)}>
                  <LogIn className="h-3.5 w-3.5 mr-1.5 inline-block" />
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
