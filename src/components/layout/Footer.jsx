import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[hsl(var(--muted))]">
      <div className="mx-auto flex max-w-6xl w-full flex-col items-center gap-3 px-4 py-6 sm:flex-row sm:justify-between sm:px-6 lg:px-10">
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-slate-500 sm:text-left">
          <span className="font-semibold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
            City Insight
          </span>
          <span className="text-slate-300">·</span>
          © {new Date().getFullYear()}. For educational purposes only.
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
          <Link
            to="/privacy"
            className="transition-colors hover:text-slate-900"
          >
            Privacy Policy
          </Link>
          <Link to="/terms" className="transition-colors hover:text-slate-900">
            Terms of Use
          </Link>
        </nav>
      </div>
    </footer>
  );
}
