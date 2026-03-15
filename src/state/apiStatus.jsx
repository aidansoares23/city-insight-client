let state = {
  status: "ok", // "ok" | "waking" | "down" | "rate-limited"
  message: "",
};

const listeners = new Set();

/** Returns the current global API status object (`{ status, message }`). */
export function getApiStatus() {
  return state;
}

/** Merges `patch` into the global API status and notifies all subscribers. */
export function setApiStatus(patch) {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn(state));
}

/** Subscribes `fn` to API status changes; returns an unsubscribe function. */
export function subscribeApiStatus(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
