// src/services/api.js
import axios from "axios";
import { setApiStatus } from "../state/apiStatus";

const api = axios.create({
  // baseURL: import.meta.env.VITE_API_URL,
  baseURL: "/api",
  timeout: 15000,
  withCredentials: true, // cookie auth
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

let wakeInFlight = null;

async function rawHealthCheck(baseURL) {
  const url = `${baseURL.replace(/\/$/, "")}/health`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`health status ${res.status}`);
  return true;
}

async function wakeServer({ maxWaitMs = 60000 } = {}) {
  if (wakeInFlight) return wakeInFlight;

  const baseURL = api.defaults.baseURL;
  const start = Date.now();

  wakeInFlight = (async () => {
    setApiStatus({
      status: "waking",
      message:
        "Server is waking up (free tier). First load may take ~10–30 seconds…",
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
        setApiStatus({ status: "waking", message: "Still waking up…" });
      }
    }

    setApiStatus({
      status: "down",
      message: "Backend is currently unavailable. Please try again later.",
    });

    return false;
  })();

  try {
    return await wakeInFlight;
  } finally {
    wakeInFlight = null;
  }
}

function looksLikeColdStart(error) {
  const code = error.code;
  const status = error.response?.status;
  return code === "ECONNABORTED" || status === 502 || status === 503 || !status;
}

// CSRF-lite header for state-changing requests (and safe on GET)
api.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  config.headers["X-Requested-With"] = "XMLHttpRequest";
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (!looksLikeColdStart(error)) {
      setApiStatus({
        status: "down",
        message: "Backend is currently unavailable. Please try again later.",
      });
      return Promise.reject(error);
    }

    if (!original || original._retry) {
      setApiStatus({
        status: "down",
        message: "Backend is currently unavailable. Please try again later.",
      });
      return Promise.reject(error);
    }

    original._retry = true;

    const ok = await wakeServer({ maxWaitMs: 60000 });
    if (!ok) return Promise.reject(error);

    return api(original);
  },
);

export async function retryWakeNow() {
  return wakeServer({ maxWaitMs: 60000 });
}

export default api;
