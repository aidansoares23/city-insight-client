import { useEffect } from "react";

export function usePageTitle(title) {
  useEffect(() => {
    if (!title) return;

    document.title = `${title} | City Insight`;

    return () => {
      document.title = "City Insight";
    };
  }, [title]);
}
