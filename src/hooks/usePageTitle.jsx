import { useEffect } from "react";

/** Sets `document.title` to `"{title} | City Insight"` while mounted; resets to `"City Insight"` on unmount. */
export function usePageTitle(title) {
  useEffect(() => {
    if (!title) return;

    document.title = `${title} | City Insight`;

    return () => {
      document.title = "City Insight";
    };
  }, [title]);
}
