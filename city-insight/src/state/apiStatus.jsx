let state = {
  status: "ok", // "ok" | "waking" | "down" | "rate-limited"
  message: "",
};

const listeners = new Set();

export function getApiStatus() {
  return state;
}

export function setApiStatus(patch) {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn(state));
}

export function subscribeApiStatus(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
