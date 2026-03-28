import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";

/**
 * Toggle button for favoriting/unfavoriting a city.
 * @param {{ isFavorited: boolean, loading: boolean, onToggle: () => void, className?: string }} props
 */
export default function FavoriteButton({ isFavorited, loading, onToggle, className }) {
  return (
    <Button
      variant="secondary"
      size="default"
      onClick={onToggle}
      disabled={loading}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      className={cn(
        "gap-2 transition-colors",
        isFavorited && "border-rose-300 text-rose-600 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-700",
        className,
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-all",
          isFavorited ? "fill-rose-500 text-rose-500" : "fill-none",
        )}
      />
      {isFavorited ? "Favorited" : "Favorite"}
    </Button>
  );
}
