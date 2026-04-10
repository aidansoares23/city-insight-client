import { cn } from "@/utils/utils";

/** Standard error message block with rose styling. Accepts a `message` string and optional `className`. */
export default function ErrorMessage({ message, className }) {
  if (!message) return null;
  return (
    <div
      className={cn(
        "rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800",
        className,
      )}
    >
      {message}
    </div>
  );
}
