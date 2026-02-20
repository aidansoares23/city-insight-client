import { useEffect, useState } from "react";
import { getApiStatus, subscribeApiStatus } from "../state/apiStatus";

export function useApiStatus() {
  const [apiStatus, setApiStatus] = useState(getApiStatus());

  useEffect(() => subscribeApiStatus(setApiStatus), []);

  return apiStatus;
}
