import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-8 border-t border-slate-200 bg-slate-200/30">
      <div className="mx-auto flex max-w-6xl w-full flex-col items-center gap-2 px-4 py-6 sm:flex-row sm:justify-between sm:px-6 lg:px-10">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} City Insight. For educational purposes
          only.
        </p>
        <nav className="flex items-center gap-4 text-sm text-slate-500">
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
