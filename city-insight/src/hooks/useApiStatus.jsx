import { useEffect, useState } from "react";
import { getApiStatus, subscribeApiStatus } from "@/state/apiStatus";

/** Returns the current API status object and re-renders whenever it changes. */
export function useApiStatus() {
  const [apiStatus, setApiStatus] = useState(getApiStatus());

  useEffect(() => subscribeApiStatus(setApiStatus), []);

  return apiStatus;
}
