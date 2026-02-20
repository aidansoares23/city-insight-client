import { Outlet } from "react-router-dom";
import Navbar from "../layout/Navbar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
