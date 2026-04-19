import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ErrorBoundary from "@/components/layout/ErrorBoundary";

/** Root layout wrapper — renders the sticky navbar, a centred main content area, and an error boundary around the router outlet. */
export default function Layout() {
  const scrollRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white text-slate-900">
      <Navbar />
      <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col">
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-4 pb-4 sm:px-6 lg:px-10 flex flex-col">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </div>
  );
}
