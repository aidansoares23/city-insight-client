import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/utils";

/**
 * Reusable section wrapper:
 * - tinted header
 * - optional right-side action
 * - consistent padding / borders / ring
 */
export default function SectionCard({
  icon: Icon,
  title,
  subtitle,
  action, // optional ReactNode (button, link, etc)
  children,

  className,
  headerClassName,
  contentClassName,

  // if you ever want to toggle header entirely
  showHeader = true,
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-slate-200 bg-white p-0 shadow-sm",
        className,
      )}
    >
      {showHeader ? (
        <div
          className={cn(
            "relative",
            "bg-[hsl(var(--secondary))]",
            "px-6 py-6",
            headerClassName,
          )}
        >
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-slate-900/5" />

          {/* <div className="flex items-start justify-between gap-4"> */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {Icon ? <Icon className="h-5 w-5 text-slate-500" /> : null}
                <h2 className="truncate text-xl font-semibold tracking-tight text-slate-900">
                  {title}
                </h2>
              </div>

              {subtitle ? (
                <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
              ) : null}
            </div>

            {/* {action ? <div className="shrink-0">{action}</div> : null} */}
            {action ? (
              <div className="sm:shrink-0">
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {action}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <CardContent className={cn("bg-white px-6 py-5", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
