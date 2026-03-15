import * as React from "react";
import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";

/** Radix Dialog root — manages open/close state. */
function Dialog({ ...props }) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

/** Element that opens the dialog when activated. */
function DialogTrigger({ ...props }) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

/** Renders dialog content into a portal outside the current DOM subtree. */
function DialogPortal({ ...props }) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

/** Element that closes the dialog when activated. */
function DialogClose({ ...props }) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

/** Semi-transparent backdrop rendered behind the dialog content. */
function DialogOverlay({ className, ...props }) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

/** Centred dialog panel with enter/exit animations and an optional close button (`showCloseButton`, default `true`). */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 outline-none sm:max-w-lg",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

/** Dialog header section; stacks title and description vertically. */
function DialogHeader({ className, ...props }) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

/** Dialog footer with right-aligned action buttons; pass `showCloseButton` to add a built-in close button. */
function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

/** Semibold dialog title, linked to the dialog for accessibility. */
function DialogTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

/** Muted supporting text below the dialog title. */
function DialogDescription({ className, ...props }) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

/**
 * Composed confirmation dialog with Cancel / Confirm buttons.
 * Pass `requireConfirmText` to force the user to type a specific string
 * (e.g. the resource name) before the Confirm button enables.
 */
function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  requireConfirmText,
}) {
  const [inputValue, setInputValue] = React.useState("");

  // Reset input when dialog opens/closes
  React.useEffect(() => {
    if (!open) setInputValue("");
  }, [open]);

  const confirmed = !requireConfirmText || inputValue === requireConfirmText;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        {requireConfirmText && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-slate-600">
              Type <span className="font-semibold text-slate-900">{requireConfirmText}</span> to confirm
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
              autoComplete="off"
            />
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">{cancelLabel}</Button>
          </DialogClose>
          <Button
            variant="danger"
            disabled={!confirmed}
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export {
  ConfirmDialog,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
