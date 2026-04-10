import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { getCityPhotos } from "@/lib/city-photos";
import { Button } from "@/components/ui/Button";
import SectionCard from "@/components/layout/SectionCard";

const AUTO_SCROLL_MS = 4000;

export default function CityPhotoGallery({ slug }) {
  const photos = getCityPhotos(slug);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    if (paused || photos.length <= 1) return;
    const id = setInterval(next, AUTO_SCROLL_MS);
    return () => clearInterval(id);
  }, [paused, next, photos.length]);

  if (!photos.length) {
    return (
      <SectionCard
        icon={Images}
        title="Photos"
        className="h-full"
        contentClassName="flex-1"
      >
        <div className="flex flex-col items-center justify-center h-full min-h-[260px] gap-3 text-muted-foreground">
          <Images className="h-10 w-10 opacity-30" />
          <p className="text-sm font-medium">No photos yet</p>
          <p className="text-xs text-center max-w-[180px] opacity-70">
            Community photos for this city haven&apos;t been added yet.
          </p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      icon={Images}
      title="Photos"
      subtitle={`${photos.length} photo${photos.length !== 1 ? "s" : ""}`}
      className="h-full"
      contentClassName="p-0 flex-1"
    >
      <div
        className="relative overflow-hidden h-full min-h-[260px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Slides */}
        {photos.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === index ? 1 : 0 }}
          >
            {/* Blurred backdrop */}
            <img
              src={src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover scale-110 blur-2xl"
            />
            <div className="absolute inset-0 bg-black/30" />
            {/* Full photo */}
            <img
              src={src}
              alt=""
              className="absolute inset-0 h-full w-full object-contain"
            />
          </div>
        ))}

        {/* Prev / Next */}
        {photos.length > 1 ? (
          <>
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Button
                size="icon-sm"
                variant="secondary"
                className="bg-white/80 hover:bg-white shadow-sm"
                onClick={prev}
                aria-label="Previous photo"
              >
                <ChevronLeft />
              </Button>
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Button
                size="icon-sm"
                variant="secondary"
                className="bg-white/80 hover:bg-white shadow-sm"
                onClick={next}
                aria-label="Next photo"
              >
                <ChevronRight />
              </Button>
            </div>
          </>
        ) : null}

        {/* Dot indicators */}
        {photos.length > 1 ? (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 items-center">
            {photos.map((_, i) => (
              <button
                key={i}
                className={[
                  "h-1.5 rounded-full transition-all duration-300",
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/50",
                ].join(" ")}
                onClick={() => setIndex(i)}
                aria-label={`Go to photo ${i + 1}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </SectionCard>
  );
}
