import { useNavigate } from "react-router-dom";
import { ThumbsUp, CheckCircle, ThumbsDown } from "lucide-react";
import { cn } from "@/utils/utils";

const REACTIONS = [
  { type: "helpful", label: "Helpful", Icon: ThumbsUp },
  { type: "agree", label: "Agree", Icon: CheckCircle },
  { type: "disagree", label: "Disagree", Icon: ThumbsDown },
];

/**
 * Three-button reaction bar (Helpful / Agree / Disagree) for a review.
 * - Unauthenticated users are redirected to /login on click.
 * - Users cannot react to their own review (buttons are visually disabled).
 * - Clicking the active reaction removes it (toggle off).
 */
export default function ReactionBar({
  reviewId,
  reactions = { helpful: 0, agree: 0, disagree: 0 },
  myReaction = null,
  currentUserId = null,
  isOwnReview = false,
  onReactionChange,
  disabled = false,
}) {
  const navigate = useNavigate();

  const handleClick = (type) => {
    if (isOwnReview) return;

    if (!currentUserId) {
      navigate("/login");
      return;
    }

    if (disabled) return;

    // Toggle off if clicking the already-active reaction
    const next = myReaction === type ? null : type;
    onReactionChange?.(reviewId, next);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        isOwnReview && "pointer-events-none opacity-40",
      )}
      title={isOwnReview ? "You can't react to your own review" : undefined}
    >
      {REACTIONS.map(({ type, label, Icon }) => {
        const isActive = myReaction === type;
        const count = reactions[type] ?? 0;

        return (
          <button
            key={type}
            onClick={() => handleClick(type)}
            disabled={disabled && !isOwnReview}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors sm:gap-1.5 sm:px-2.5 sm:py-1",
              isActive
                ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-slate-900"
                : "border-slate-400 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-400",
              disabled && "cursor-not-allowed opacity-60",
            )}
            aria-pressed={isActive}
            aria-label={`${label}${count > 0 ? ` (${count})` : ""}`}
          >
            <Icon className="h-3 w-3 shrink-0" />
            <span>{label}</span>
            {count > 0 && (
              <span className={cn("tabular-nums", isActive ? "text-slate-900" : "text-slate-400")}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
