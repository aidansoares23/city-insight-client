// components/ui/card.jsx
import * as React from "react";
import { cn } from "@/utils/utils";

/** Root card container with rounded border and shadow. */
function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col rounded-3xl border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

/** Card header with a responsive grid layout; automatically adjusts columns when a `CardAction` is present. */
function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 py-5 has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className,
      )}
      {...props}
    />
  );
}

/** Semibold card title element. */
function CardTitle({ className, ...props }) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

/** Muted-colour card subtitle / description element. */
function CardDescription({ className, ...props }) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

/** Right-aligned action slot inside `CardHeader`; spans both header rows via CSS grid. */
function CardAction({ className, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

/** Card body content area with horizontal and vertical padding. */
function CardContent({ className, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 py-6", className)}
      {...props}
    />
  );
}

/** Card footer with flex layout for action buttons or metadata. */
function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 py-5", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
