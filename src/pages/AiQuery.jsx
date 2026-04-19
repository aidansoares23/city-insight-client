import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "@/services/api";
import { sanitizeAiQuery } from "@/lib/sanitize";
import { fetchAllCities } from "@/lib/cities";
import { useAuth } from "@/auth/authContext";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/Button";
import ErrorMessage from "@/components/ui/ErrorMessage";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Send,
  GitCompareArrows,
  ExternalLink,
  RotateCcw,
  LogIn,
} from "lucide-react";

const SESSION_STORAGE_KEY = "ci_ai_session_id";

/** Build suggestion strings from city list + static templates. */
function buildSuggestions(cities) {
  const static_ = [
    "Which city has the best walkability?",
    "Which city has the best livability score?",
    "Which city is the most affordable?",
    "Which city is the safest?",
    "What are the most reviewed cities?",
  ];

  const cityPairs = [];
  if (cities.length >= 2) {
    const sample = cities.slice(0, 12);
    for (let i = 0; i < Math.min(8, sample.length - 1); i += 2) {
      const a = sample[i];
      const b = sample[i + 1];
      cityPairs.push(`Compare ${a.name}, ${a.state} and ${b.name}, ${b.state}`);
    }
    for (const city of sample.slice(0, 5)) {
      static_.push(`Tell me about ${city.name}, ${city.state}`);
      static_.push(`Is ${city.name} safe to live in?`);
      static_.push(`What do residents say about ${city.name}?`);
      static_.push(`How affordable is ${city.name}, ${city.state}?`);
    }
  }

  return [...cityPairs, ...static_];
}

/** Filter suggestions to those containing all words in the query (case-insensitive). */
function filterSuggestions(suggestions, query) {
  const q = query.trim().toLowerCase();
  if (!q) return suggestions.slice(0, 6);
  const words = q.split(/\s+/);
  return suggestions
    .filter((s) => words.every((w) => s.toLowerCase().includes(w)))
    .slice(0, 6);
}

/** Extracts unique city references and an optional compare link from the tool call trace. */
function extractCitiesFromTrace(trace) {
  const seen = new Set();
  const cities = [];
  let compareLink = null;

  for (const step of trace) {
    const r = step.result;
    if (!r) continue;

    if (step.tool === "getCity" && r.found && Array.isArray(r.cities)) {
      for (const c of r.cities) {
        if (c.slug && !seen.has(c.slug)) {
          seen.add(c.slug);
          cities.push({ slug: c.slug, name: c.name, state: c.state });
        }
      }
    } else if (step.tool === "aggregateReviews" && r.found && r.city?.slug) {
      if (!seen.has(r.city.slug)) {
        seen.add(r.city.slug);
        cities.push({ slug: r.city.slug, name: r.city.name, state: r.city.state });
      }
    } else if (step.tool === "compareCities") {
      for (const c of [r.city1, r.city2]) {
        if (c?.slug && !seen.has(c.slug)) {
          seen.add(c.slug);
          cities.push({ slug: c.slug, name: c.name, state: c.state });
        }
      }
      if (r.city1?.slug && r.city2?.slug && !compareLink) {
        compareLink = `/compare?a=${r.city1.slug}&b=${r.city2.slug}`;
      }
    } else if (step.tool === "rankCities" && Array.isArray(r.cities)) {
      for (const c of r.cities) {
        if (c.slug && !seen.has(c.slug)) {
          seen.add(c.slug);
          cities.push({ slug: c.slug, name: c.name, state: c.state });
        }
      }
    }
  }

  return { cities, compareLink };
}

/** City chips rendered below the AI response linking to each referenced city page. */
function ReferencedCities({ trace }) {
  const { cities, compareLink } = extractCitiesFromTrace(trace);
  if (cities.length === 0) return null;

  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <p className="mb-2.5 text-xs font-medium uppercase tracking-wide text-slate-400">
        Referenced cities
      </p>
      <div className="flex flex-wrap gap-2">
        {cities.map((c) => (
          <Link
            key={c.slug}
            to={`/cities/${c.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-400 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm transition hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
          >
            {c.name}
            {c.state ? `, ${c.state}` : ""}
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </Link>
        ))}
        {compareLink && (
          <Link
            to={compareLink}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-400 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm transition hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))]"
          >
            <GitCompareArrows className="h-3 w-3" />
            Compare these cities
          </Link>
        )}
      </div>
    </div>
  );
}

/** Collapsible panel showing the tool-call trace from the AI run. Dev-only in production builds. */
function TracePanel({ trace }) {
  const [open, setOpen] = useState(false);
  if (import.meta.env.PROD) return null;
  if (!trace || trace.length === 0) return null;

  return (
    <div className="mt-4 rounded-lg border border-slate-400 bg-slate-50">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <span>Tool calls ({trace.length})</span>
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {open && (
        <div className="divide-y divide-slate-200 border-t border-slate-400">
          {trace.map((step, idx) => (
            <div key={idx} className="px-4 py-3 text-xs">
              <p className="font-semibold text-slate-900">
                {idx + 1}.{" "}
                <span className="font-mono text-[hsl(var(--primary-foreground))]">{step.tool}</span>
              </p>
              <p className="mt-1 text-slate-500">Input:</p>
              <pre className="mt-0.5 overflow-x-auto rounded border border-slate-400 bg-white p-2 text-slate-700">
                {JSON.stringify(step.input, null, 2)}
              </pre>
              <p className="mt-2 text-slate-500">Result:</p>
              <pre className="mt-0.5 max-h-48 overflow-x-auto overflow-y-auto rounded border border-slate-400 bg-white p-2 text-slate-700">
                {JSON.stringify(step.result, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const LOADING_MESSAGES = [
  "Searching city data…",
  "Crunching the numbers…",
  "Comparing cities…",
  "Pulling resident reviews…",
  "Analyzing results…",
  "Almost there…",
];

/** Animated dots + status text shown inline at the bottom of the chat thread while loading. */
function InlineLoadingIndicator() {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setMsgIdx((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1)),
      3500,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100">
        <Sparkles className="h-3.5 w-3.5 text-slate-500" />
      </div>
      <div className="flex items-center gap-2 rounded-lg rounded-tl-sm bg-white border border-slate-100 px-4 py-3 shadow-sm text-sm text-slate-500">
        <span className="inline-flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))] animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </span>
        <span key={msgIdx} className="animate-in fade-in duration-500">
          {LOADING_MESSAGES[msgIdx]}
        </span>
      </div>
    </div>
  );
}

/** Renders a single assistant message bubble with markdown, city chips, and trace panel. */
function AssistantBubble({ message }) {
  return (
    <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-1 duration-300">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100">
        <Sparkles className="h-3.5 w-3.5 text-slate-500" />
      </div>
      <div className="min-w-0 flex-1 rounded-lg rounded-tl-sm bg-white border border-slate-100 px-4 py-3 shadow-sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => (
              <p className="mb-3 text-sm leading-relaxed text-slate-900 last:mb-0">{children}</p>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-slate-900">{children}</strong>
            ),
            ul: ({ children }) => (
              <ul className="mb-3 ml-4 list-disc space-y-1 text-sm text-slate-900">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-3 ml-4 list-decimal space-y-1 text-sm text-slate-900">{children}</ol>
            ),
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            h3: ({ children }) => (
              <h3 className="mb-2 mt-4 text-base font-semibold text-slate-900">{children}</h3>
            ),
            h4: ({ children }) => (
              <h4 className="mb-1 mt-3 text-sm font-semibold text-slate-900 uppercase tracking-wide">
                {children}
              </h4>
            ),
            code: ({ children }) => (
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs text-slate-700">
                {children}
              </code>
            ),
            table: ({ children }) => (
              <div className="my-3 overflow-x-auto rounded-xl border border-slate-400">
                <table className="w-full text-sm">{children}</table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="border-b border-slate-400 bg-slate-50">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                {children}
              </th>
            ),
            tbody: ({ children }) => <tbody>{children}</tbody>,
            tr: ({ children }) => (
              <tr className="border-b border-slate-100 last:border-0">{children}</tr>
            ),
            td: ({ children }) => <td className="px-4 py-2.5 text-slate-900">{children}</td>,
          }}
        >
          {message.content}
        </ReactMarkdown>
        {message.toolCallTrace && message.toolCallTrace.length > 0 && (
          <>
            <ReferencedCities trace={message.toolCallTrace} />
            <TracePanel trace={message.toolCallTrace} />
          </>
        )}
      </div>
    </div>
  );
}

/** Renders a single user message bubble. */
function UserBubble({ message }) {
  return (
    <div className="flex justify-end animate-in fade-in slide-in-from-bottom-1 duration-200">
      <div className="max-w-[80%] rounded-lg rounded-tr-sm bg-[hsl(var(--primary-foreground))] px-4 py-2.5 text-sm text-white shadow-sm">
        {message.content}
      </div>
    </div>
  );
}

export default function AiQuery() {
  usePageTitle("Ask AI");

  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(() => sessionStorage.getItem(SESSION_STORAGE_KEY) || null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendEnabled, setBackendEnabled] = useState(true);

  const [cities, setCities] = useState([]);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    api
      .get("/ai/status")
      .then((res) => setBackendEnabled(res.data?.enabled !== false))
      .catch(() => setBackendEnabled(false));
  }, []);

  useEffect(() => {
    fetchAllCities()
      .then((list) => setCities(list))
      .catch(() => {});
  }, []);

  // Restore prior session messages on mount if a sessionId exists
  useEffect(() => {
    if (!sessionId) return;
    api
      .get(`/ai/session/${sessionId}`)
      .then((res) => {
        const stored = res.data?.messages || [];
        const displayMessages = [];
        for (const msg of stored) {
          if (msg.role === "user" && typeof msg.content === "string") {
            displayMessages.push({ role: "user", content: msg.content });
          } else if (msg.role === "assistant" && typeof msg.content === "string") {
            displayMessages.push({ role: "assistant", content: msg.content, toolCallTrace: [] });
          }
        }
        if (displayMessages.length > 0) setMessages(displayMessages);
      })
      .catch(() => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        setSessionId(null);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const allSuggestions = useMemo(() => buildSuggestions(cities), [cities]);
  const suggestions = useMemo(
    () => filterSuggestions(allSuggestions, query),
    [allSuggestions, query],
  );

  function pickSuggestion(s) {
    setQuery(s);
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSubmit(e);
  }

  async function handleSubmit(e) {
    e?.preventDefault();
    const q = sanitizeAiQuery(query);
    if (!q || loading) return;

    setQuery("");
    setError("");

    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setLoading(true);

    try {
      const res = await api.post("/ai/query", { query: q, sessionId }, { timeout: 90000 });
      const { response, toolCallTrace, sessionId: newSessionId } = res.data;

      if (newSessionId && newSessionId !== sessionId) {
        setSessionId(newSessionId);
        sessionStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response, toolCallTrace: toolCallTrace ?? [] },
      ]);
    } catch (err) {
      const isTimeout = err.code === "ECONNABORTED" || err.message?.includes("timeout");
      const msg = isTimeout
        ? "The query timed out — try rephrasing or asking something more specific."
        : (err?.response?.status ?? 0) >= 500
          ? "Something went wrong on our end. Please try again."
          : err?.response?.data?.error?.message ||
            err?.response?.data?.message ||
            "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleNewConversation() {
    setMessages([]);
    setSessionId(null);
    setError("");
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    inputRef.current?.focus();
  }

  // ── Auth gate ──────────────────────────────────────────────────────────────
  if (!authLoading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] gap-6 py-16 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100">
          <Sparkles className="h-7 w-7 text-slate-500" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold text-slate-900">Ask AI</h1>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            AI features are available to signed-in users. Create a free account or sign in to get started.
          </p>
        </div>
        <Button asChild>
          <Link to="/login" state={{ returnTo: "/ask" }}>
            <LogIn className="h-4 w-4 mr-1.5" />
            Sign in to continue
          </Link>
        </Button>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!hasMessages) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-10 py-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* Icon + headline */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-[hsl(var(--secondary))]">
            <Sparkles className="h-7 w-7 text-[hsl(var(--primary-foreground))]" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Ask anything</h1>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Safety, affordability, livability — ask about any California city in our database.
          </p>
        </div>

        {!backendEnabled && (
          <div className="w-full max-w-2xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            AI features are currently disabled.
          </div>
        )}

        {/* Input */}
        <div className="w-full max-w-2xl space-y-3">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Which city has the best livability score?"
              maxLength={1000}
              autoComplete="off"
              disabled={!backendEnabled}
              className="w-full rounded-xl border border-slate-400 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-[hsl(var(--primary))] transition disabled:opacity-50"
            />
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!query.trim() || !backendEnabled}
              className="shrink-0 px-5"
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Ask
            </Button>
          </div>

          {/* Suggestion chips */}
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => pickSuggestion(s)}
                  className="rounded-full border border-slate-400 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/.06)]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  // ── Chat state ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Thread */}
      <div className="space-y-4">
        {messages.map((msg, idx) =>
          msg.role === "user" ? (
            <UserBubble key={idx} message={msg} />
          ) : (
            <AssistantBubble key={idx} message={msg} />
          ),
        )}
        {loading && <InlineLoadingIndicator />}
        {!loading && <ErrorMessage message={error} />}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-slate-100 pt-4 pb-2">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a follow-up question…"
            maxLength={1000}
            autoComplete="off"
            disabled={loading}
            className="w-full rounded-xl border border-slate-400 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-[hsl(var(--primary))] transition disabled:opacity-50"
          />
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!query.trim() || loading}
            size="sm"
            className="shrink-0"
          >
            <Send className="h-3.5 w-3.5 mr-1" />
            Send
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Press{" "}
            <kbd className="rounded border border-slate-400 bg-slate-50 px-1 py-0.5 font-mono text-[10px] text-slate-500">
              Enter
            </kbd>{" "}
            to send
          </p>
          <button
            onClick={handleNewConversation}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            New conversation
          </button>
        </div>
      </div>
    </div>
  );
}
