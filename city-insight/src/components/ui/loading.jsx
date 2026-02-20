import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/utils";

export function Loading({
  label = "Loading…",
  size = "md", // "sm" | "md" | "lg"
  variant = "inline", // "inline" | "page" | "overlay"
  showLabel = true,
  className,
}) {
  const sizes = {
    sm: { icon: "h-4 w-4", text: "text-xs" },
    md: { icon: "h-5 w-5", text: "text-sm" },
    lg: { icon: "h-6 w-6", text: "text-base" },
  }[size];

  const body = (
    <div
      className={cn(
        "inline-flex items-center gap-2 text-slate-700",
        sizes.text,
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className={cn("animate-spin", sizes.icon)} />
      {showLabel ? <span className="font-medium">{label}</span> : null}
    </div>
  );

  if (variant === "inline") return body;

  if (variant === "page") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        {body}
      </div>
    );
  }

  // overlay
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 backdrop-blur-[1px]">
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-lg">
        {body}
      </div>
    </div>
  );
}
