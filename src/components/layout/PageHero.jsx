import { cn } from "@/utils/utils";
import PageNav from "@/components/layout/PageNav";

/**
 * Reusable page-header section with a large title, optional description,
 * an optional right-aligned aside, and an optional footer row with
 * action buttons and/or a jump-to nav bar.
 *
 * PageNav is rendered as a Fragment sibling (outside the header div) so that
 * its `sticky` positioning is scoped to the full page, not just the header block.
 */
export default function PageHero({
  title,
  description,
  aside,
  asideFooter,
  /** JSX rendered inline with the title (e.g. Favorite + Compare buttons). */
  actions,
  /** Array of { href, label } passed to PageNav; rendered sticky below the header. */
  nav,
  /** Optional { to?, onClick, label } back link rendered inside the PageNav bar. */
  navBackLink,
  /** Optional label shown before the nav items (defaults to "Jump to:"). */
  navLabel,
  className = "",
}) {
  return (
    <>
      <div className={cn("pt-3 pb-3", className)}>
        {/* Title row: name + inline actions left, score/aside right */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2.5">
            <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
            {actions ? (
              <div className="flex shrink-0 items-center gap-2">{actions}</div>
            ) : null}
          </div>

          {aside ? (
            <div className="shrink-0 sm:text-right">
              {aside}
              {asideFooter ? (
                <div className="mt-1.5 text-xs text-slate-500">{asideFooter}</div>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Description — full width, tighter */}
        {description ? (
          <p className="mt-1 max-w-3xl text-base text-slate-500">
            {description}
          </p>
        ) : null}
      </div>

      {nav?.length ? <PageNav items={nav} backLink={navBackLink} label={navLabel} /> : null}
    </>
  );
}
