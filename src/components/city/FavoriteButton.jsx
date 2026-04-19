import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";

/**
 * Toggle button for favoriting/unfavoriting a city.
 * @param {{ isFavorited: boolean, loading: boolean, onToggle: () => void, className?: string }} props
 */
export default function FavoriteButton({
  isFavorited,
  loading,
  onToggle,
  className,
  variant = "secondary",
  size = "default",
}) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onToggle}
      disabled={loading}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      className={cn(
        "group gap-2 transition-all duration-200",
        isFavorited
          ? "border-rose-300 text-rose-600 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-700"
          : "",
        className,
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-all duration-200",
          isFavorited
            ? "fill-rose-500 text-rose-500 group-hover:scale-110"
            : "fill-none group-hover:text-rose-400 group-hover:scale-110",
        )}
      />
      {isFavorited ? "Favorited" : "Favorite"}
    </Button>
  );
}
