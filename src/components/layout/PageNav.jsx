import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

/**
 * Reusable in-page jump navigation bar.
 * Sticky below the navbar, with active-section highlighting via IntersectionObserver.
 *
 * @param {{ href: string, label: string }[]} items
 * @param {{ to?: string, onClick?: () => void, label: string }} [backLink]
 */
export default function PageNav({ items = [], backLink, label = "Jump to:" }) {
  const [active, setActive] = useState(() => items[0]?.href?.replace("#", "") ?? "");

  useEffect(() => {
    if (!items.length) return;

    const ids = items.map(({ href }) => href.replace("#", ""));

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost intersecting entry
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  return (
    <nav
      aria-label="Page sections"
      className="sticky top-[4.5rem] z-10 flex items-center gap-0.5 overflow-x-auto rounded-xl border border-slate-400 bg-white px-2 py-2 shadow-sm scrollbar-none"
    >
      {backLink && (
        <>
          {backLink.to ? (
            <Link
              to={backLink.to}
              className="group mr-1 inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <ChevronLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
              {backLink.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={backLink.onClick}
              className="group mr-1 inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <ChevronLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
              {backLink.label}
            </button>
          )}
          <div className="mx-0.5 h-4 w-px shrink-0 bg-slate-200" />
        </>
      )}
      <span className="mr-1 shrink-0 text-xs font-medium text-slate-400 select-none">
        {label}
      </span>
      {items.map(({ href, label }) => {
        const id = href.replace("#", "");
        const isActive = active === id;
        return (
          <a
            key={href}
            href={href}
            className={[
              "shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150",
              isActive
                ? "bg-[hsl(var(--primary))] text-slate-900 shadow-sm scale-[1.02]"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:scale-[1.02]",
            ].join(" ")}
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
}
