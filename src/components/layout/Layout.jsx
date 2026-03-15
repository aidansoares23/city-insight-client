import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import ErrorBoundary from "@/components/layout/ErrorBoundary";

/** Root layout wrapper — renders the sticky navbar, a centred main content area, and an error boundary around the router outlet. */
export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
