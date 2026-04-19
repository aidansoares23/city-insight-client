import axios from "axios";
import { setApiStatus } from "@/state/apiStatus";

const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
  withCredentials: true,
});

/** Returns a promise that resolves after `ms` milliseconds. */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let wakeInFlight = null;

/** GETs `{baseURL}/health` directly via `fetch` (bypasses the axios interceptor). Throws if not ok. */
async function rawHealthCheck(baseURL) {
  const url = `${baseURL.replace(/\/$/, "")}/health`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`health status ${res.status}`);
  return true;
}

/**
 * Polls the health endpoint with exponential back-off until the server responds
 * or `maxWaitMs` elapses. Updates global API status throughout.
 * Deduplicates concurrent calls — only one wake attempt runs at a time.
 * @returns {Promise<boolean>} `true` if the server came up, `false` if it timed out.
 */
async function wakeServer({ maxWaitMs = 60000 } = {}) {
  if (wakeInFlight) return wakeInFlight;

  const baseURL = api.defaults.baseURL;
  const start = Date.now();

  wakeInFlight = (async () => {
    setApiStatus({
      status: "waking",
      message: "Reconnecting to server…",
    });

    let delay = 1000;

    while (Date.now() - start < maxWaitMs) {
      try {
        await rawHealthCheck(baseURL);
        setApiStatus({ status: "ok", message: "" });
        return true;
      } catch {
        await sleep(delay);
        delay = Math.min(Math.round(delay * 1.7), 8000);
        setApiStatus({ status: "waking", message: "Still reconnecting…" });
      }
    }

    setApiStatus({
      status: "down",
      message: "Couldn't reach the server. Please refresh and try again.",
    });

    return false;
  })();

  try {
    return await wakeInFlight;
  } finally {
    wakeInFlight = null;
  }
}

/** Returns true if an axios error looks like a cold-start / service-unavailable condition. */
function looksLikeColdStart(err) {
  const code = err.code;
  const status = err.response?.status;
  return code === "ECONNABORTED" || status === 502 || status === 503 || !status;
}

// CSRF-lite header required by backend for all requests
api.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

let rateLimitTimer = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 429) {
      const retryAfter = parseInt(error.response.headers["retry-after"] || "60", 10);
      setApiStatus({
        status: "rate-limited",
        message: `Too many requests. Please wait ${retryAfter} seconds before trying again.`,
      });
      clearTimeout(rateLimitTimer);
      rateLimitTimer = setTimeout(() => {
        setApiStatus({ status: "ok", message: "" });
        rateLimitTimer = null;
      }, retryAfter * 1000);
      return Promise.reject(error);
    }

    if (!looksLikeColdStart(error)) {
      return Promise.reject(error);
    }

    if (!original || original._retry) {
      setApiStatus({
        status: "down",
        message: "Couldn't reach the server. Please refresh and try again.",
      });
      return Promise.reject(error);
    }

    original._retry = true;

    const ok = await wakeServer({ maxWaitMs: 60000 });
    if (!ok) return Promise.reject(error);

    return api(original);
  },
);

/** Manually triggers a server wake-up attempt (e.g. from a "Retry" button). */
export async function retryWakeNow() {
  return wakeServer({ maxWaitMs: 60000 });
}

export default api;
