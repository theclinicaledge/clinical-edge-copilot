import { useState, useRef, useEffect, useCallback } from "react";
import { track } from "@vercel/analytics";

// ─── API Config ───────────────────────────────────────────────────────────────

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? "https://clinical-edge-backend.onrender.com"
    : "http://localhost:3001");

// ─── Constants ────────────────────────────────────────────────────────────────

// Context chips — set placeholder only, do not fill input
const CONTEXT_CHIPS = [
  { label: "Something feels off",       placeholder: "What changed, and what is worrying you most?" },
  { label: "Before you call",           placeholder: "What are you about to call about?" },
  { label: "Medication question",       placeholder: "What med or safety question are you trying to sort out?" },
  { label: "Explain to the patient",   placeholder: "What do you need help explaining in simple terms?" },
  { label: "Precautions / wound / device", placeholder: "What are you trying to clarify?" },
];

// Example prompts — these DO fill the input when tapped
const EXAMPLES = [
  "QTc is 520, patient just got Zofran. Should I be worried?",
  "How do I explain why we're keeping them NPO for an ileus?",
  "BP dropped to 88/50, HR 122, was stable an hour ago — help me think through this before I call.",
  "Just got report — new confusion, sodium 118, poor PO intake. What matters most first?",
];

const SECTIONS = [
  { name: "What this could be",   aliases: ["What this could be"],                                        accent: "#4da3ff", bg: "rgba(77,163,255,0.06)"  },
  { name: "Possible concerns",     aliases: ["Possible concerns",     "What concerns me most"],           accent: "#e05572", bg: "rgba(224,85,114,0.06)"  },
  { name: "What to assess next",   aliases: ["What to assess next",   "What I'd assess next"],            accent: "#1FBF75", bg: "rgba(31,191,117,0.06)"  },
  { name: "What to consider next", aliases: ["What to consider next", "What I'd do right now"],           accent: "#F2B94B", bg: "rgba(242,185,75,0.06)"  },
  { name: "Closing",               aliases: ["Closing"],                                                  accent: "#00C2D1", bg: "rgba(0,194,209,0.04)"   },
];

const SECTION_CONFIG = {};
SECTIONS.forEach((s) => { SECTION_CONFIG[s.name] = s; });

const ALIAS_MAP = {};
SECTIONS.forEach((s) => { s.aliases.forEach((a) => { ALIAS_MAP[a] = s.name; }); });

const URGENCY_STYLES = {
  HIGH:     { color: "#fca5a5", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.4)"  },
  MODERATE: { color: "#fcd34d", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.4)" },
  LOW:      { color: "#86efac", bg: "rgba(34,197,94,0.10)",  border: "rgba(34,197,94,0.35)" },
};

const LS_HISTORY = "clinical_edge_history";
const LS_SAVED   = "clinical_edge_saved_cases";
const LS_MODE    = "clinical_edge_mode";

// Loading phase messages
const LOADING_PHASES = [
  "Interpreting bedside concern...",
  "Prioritizing assessments...",
  "Building clinical guidance...",
  "Finalizing recommendations...",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function cleanContent(raw) {
  return raw
    .split("\n")
    .filter((line) => {
      const t = line.trim();
      if (/^-{2,}$/.test(t)) return false;
      if (/^\*\*[^*]+\*\*$/.test(t)) {
        const inner = t.replace(/\*\*/g, "").trim();
        if (ALIAS_MAP[inner] !== undefined) return false;
      }
      return true;
    })
    .map((line) => line.replace(/^\*\*([^*]+)\*\*$/, "$1"))
    .join("\n")
    .trim();
}

function parseResponse(rawText) {
  let urgent = null;
  const urgentMatch = rawText.match(/\u26a0\ufe0f[^\n]+(\n[^\n*]+)*/);
  if (urgentMatch) urgent = urgentMatch[0].trim();

  const allAliases = Object.keys(ALIAS_MAP);
  const escapedAliases = allAliases.map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const headerPattern = new RegExp("\\*\\*(" + escapedAliases.join("|") + ")\\*\\*", "g");

  const found = [];
  let match;
  while ((match = headerPattern.exec(rawText)) !== null) {
    const alias = match[1];
    const canonical = ALIAS_MAP[alias];
    if (!canonical) continue;
    if (found.some((f) => f.canonical === canonical)) continue;
    found.push({ canonical, start: match.index, contentStart: match.index + match[0].length });
  }

  const sections = found.map((entry, i) => {
    const nextStart = i + 1 < found.length ? found[i + 1].start : rawText.length;
    return { title: entry.canonical, content: cleanContent(rawText.slice(entry.contentStart, nextStart)) };
  });

  const ordered = SECTIONS.map((s) => sections.find((sec) => sec.title === s.name)).filter(Boolean);
  return { urgent, sections: ordered };
}

function extractUrgencyLevel(rawText) {
  const m = rawText.match(/Urgency Level:\s*(HIGH|MODERATE|LOW)/i);
  return m ? m[1].toUpperCase() : null;
}

function formatTimestamp(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
    " \u00b7 " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── Style helpers ────────────────────────────────────────────────────────────

function iconBtnStyle(color) {
  return {
    background: "transparent",
    border: "1px solid " + color + "40",
    color,
    borderRadius: 6,
    padding: "4px 7px",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    lineHeight: 1,
    transition: "all 0.15s",
  };
}

function smallBtnStyle(bg, color, border) {
  return {
    background: bg,
    color,
    border: border || "none",
    borderRadius: 7,
    padding: "6px 14px",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ title, content }) {
  const cfg = SECTION_CONFIG[title] || { accent: "#4da3ff", bg: "rgba(77,163,255,0.06)" };

  // Closing — italic pull-quote treatment, no label
  if (title === "Closing") {
    return (
      <div style={{
        borderLeft: "2px solid " + cfg.accent + "60",
        padding: "14px 20px",
        marginTop: 10,
        marginBottom: 6,
        background: "rgba(0,194,209,0.018)",
        borderRadius: "0 10px 10px 0",
      }}>
        <p style={{
          margin: 0,
          fontSize: 14,
          fontStyle: "italic",
          color: "#8BAABB",
          lineHeight: 1.82,
          letterSpacing: "0.008em",
        }}>
          {content.trim()}
        </p>
      </div>
    );
  }

  const lines = content.split("\n").filter((l) => l.trim());
  return (
    <div style={{
      background: cfg.bg,
      border: "1px solid " + cfg.accent + "1C",
      borderLeft: "3px solid " + cfg.accent,
      borderRadius: 12,
      padding: "18px 20px",
      marginBottom: 10,
      boxShadow: "0 2px 14px rgba(0,0,0,0.13), inset 0 1px 0 rgba(255,255,255,0.025)",
    }}>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "1.5px",
        color: cfg.accent,
        marginBottom: 12,
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        opacity: 0.88,
      }}>
        {title}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.8, color: "#B4C9D4" }}>
        {lines.map((line, i) => {
          const isBullet = /^[-\u2022*]\s/.test(line);
          if (isBullet) return (
            <div key={i} style={{ display: "flex", gap: 11, marginBottom: 8, alignItems: "flex-start" }}>
              <span style={{ color: cfg.accent, fontWeight: 700, marginTop: 2, flexShrink: 0, fontSize: 14, lineHeight: 1.8 }}>&rsaquo;</span>
              <span style={{ color: "#BCCDD6" }}>{line.replace(/^[-\u2022*]\s+/, "")}</span>
            </div>
          );
          return <p key={i} style={{ margin: "0 0 7px", color: "#BCCDD6" }}>{line}</p>;
        })}
      </div>
    </div>
  );
}

function UrgencyBadge({ level }) {
  if (!level) return null;
  const s = URGENCY_STYLES[level];
  if (!s) return null;
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: s.bg,
      border: "1px solid " + s.border,
      borderRadius: 10,
      padding: "10px 16px",
      marginBottom: 16,
    }}>
      <span style={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: s.color,
        flexShrink: 0,
        boxShadow: "0 0 7px " + s.color + "99",
      }} />
      <span style={{
        fontSize: 11,
        fontWeight: 700,
        color: s.color,
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        letterSpacing: "1.2px",
        textTransform: "uppercase",
      }}>
        Urgency: {level}
      </span>
    </div>
  );
}

function LoadingIndicator({ phase }) {
  return (
    <div style={{ padding: "32px 0 16px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16 }}>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            width: 3,
            borderRadius: 3,
            background: "#00C2D1",
            opacity: 0.75,
            animation: "barPulse 1.1s ease-in-out " + (i * 0.11) + "s infinite",
          }} />
        ))}
      </div>
      <div style={{
        fontSize: 12,
        color: "#5A7A8A",
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        letterSpacing: "0.3px",
      }}>
        {phase}
      </div>
    </div>
  );
}

function StreamPreview({ text }) {
  if (!text) return null;
  return (
    <div style={{
      background: "rgba(15,36,50,0.75)",
      border: "1px solid rgba(0,194,209,0.09)",
      borderRadius: 12,
      padding: "18px 20px",
      marginBottom: 10,
      fontSize: 14,
      color: "#6A8A9A",
      lineHeight: 1.82,
      whiteSpace: "pre-wrap",
      maxHeight: 340,
      overflowY: "auto",
    }}>
      {text}
      <span style={{
        display: "inline-block",
        width: 6,
        height: 14,
        background: "#00C2D1",
        marginLeft: 3,
        verticalAlign: "middle",
        animation: "cursorBlink 1s step-end infinite",
        borderRadius: 1,
        opacity: 0.7,
      }} />
    </div>
  );
}

function SavedCaseRow({ sc, onReopen, onDelete, onCopy, onSaveNote }) {
  const [expanded, setExpanded] = useState(false);
  const [editNote, setEditNote] = useState(false);
  const [noteText, setNoteText] = useState(sc.note || "");
  const [copied, setCopied]     = useState(false);
  const urgStyle = sc.urgencyLevel ? URGENCY_STYLES[sc.urgencyLevel] : null;

  const handleCopy = () => {
    onCopy(sc.rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNoteSave = () => {
    onSaveNote(sc.id, noteText.trim());
    setEditNote(false);
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
      <div style={{ padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4, flexWrap: "wrap" }}>
            {urgStyle && (
              <span style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: urgStyle.color,
                flexShrink: 0,
                display: "inline-block",
              }} />
            )}
            <span style={{
              fontSize: 9,
              fontWeight: 700,
              fontFamily: "'IBM Plex Mono', monospace",
              color: urgStyle ? urgStyle.color : "#7F99A5",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}>
              {sc.urgencyLevel || "\u2014"}
            </span>
            <span style={{ fontSize: 9, color: "#3A5566", fontFamily: "'IBM Plex Mono', monospace" }}>&middot;</span>
            <span style={{ fontSize: 9, color: "#4A6978", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {sc.mode === "quick" ? "Quick" : "Clinical"}
            </span>
            <span style={{ fontSize: 9, color: "#3A5566", fontFamily: "'IBM Plex Mono', monospace" }}>&middot;</span>
            <span style={{ fontSize: 9, color: "#4A6978" }}>{formatTimestamp(sc.timestamp)}</span>
          </div>
          <div style={{ fontSize: 13, color: "#A8C1CC", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: expanded ? "normal" : "nowrap" }}>
            {sc.question}
          </div>
          {sc.note && !editNote && (
            <div style={{ marginTop: 5, fontSize: 12, color: "#7F99A5", lineHeight: 1.4 }}>
              Note: {sc.note}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 5, flexShrink: 0, alignItems: "center" }}>
          <button onClick={() => setExpanded(!expanded)} title={expanded ? "Collapse" : "Expand"} style={iconBtnStyle("#4A6978")}>{expanded ? "\u25b2" : "\u25bc"}</button>
          <button onClick={() => onReopen(sc.question)} title="Reopen in input" style={iconBtnStyle("#00C2D1")}>&crarr;</button>
          <button onClick={handleCopy} title="Copy response" style={iconBtnStyle(copied ? "#1FBF75" : "#00C2D1")}>{copied ? "\u2713" : "\u2398"}</button>
          <button onClick={() => { setEditNote(true); setExpanded(true); }} title="Add/edit note" style={iconBtnStyle("#F2B94B")}>Copy</button>
          <button onClick={() => onDelete(sc.id)} title="Delete case" style={iconBtnStyle("#E96B6B")}>&times;</button>
        </div>
      </div>

      {expanded && editNote && (
        <div style={{ padding: "0 14px 12px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{
            fontSize: 9,
            color: "#7F99A5",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1.3px",
            marginBottom: 8,
            marginTop: 12,
            fontFamily: "'IBM Plex Mono', monospace",
          }}>Personal Note</div>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a short note about this case..."
            rows={2}
            style={{
              width: "100%",
              background: "rgba(0,194,209,0.04)",
              border: "1px solid rgba(0,194,209,0.15)",
              borderRadius: 7,
              padding: "8px 10px",
              color: "#A8C1CC",
              fontSize: 13,
              fontFamily: "inherit",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={handleNoteSave} style={{ ...smallBtnStyle("#00C2D1", "#0B1F2A"), fontWeight: 700 }}>Save Note</button>
            <button onClick={() => { setEditNote(false); setNoteText(sc.note || ""); }} style={smallBtnStyle("transparent", "#7F99A5", "1px solid rgba(255,255,255,0.1)")}>Cancel</button>
          </div>
        </div>
      )}

      {expanded && !editNote && (
        <div style={{ padding: "0 14px 14px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{
            fontSize: 9,
            color: "#7F99A5",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1.3px",
            marginTop: 12,
            marginBottom: 8,
            fontFamily: "'IBM Plex Mono', monospace",
          }}>Saved Response</div>
          <div style={{
            fontSize: 12,
            color: "#7F99A5",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            maxHeight: 260,
            overflowY: "auto",
            padding: "10px 12px",
            background: "rgba(0,0,0,0.2)",
            borderRadius: 7,
            border: "1px solid rgba(255,255,255,0.07)",
          }}>
            {sc.rawText}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [question, setQuestion]         = useState("");
  const [result, setResult]             = useState(null);
  const [rawText, setRawText]           = useState("");
  const [streamBuffer, setStreamBuffer] = useState("");
  const [streaming, setStreaming]       = useState(false);
  const [loading, setLoading]           = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [error, setError]               = useState(null);
  const [mode]                          = useState("deep");
  const [history, setHistory]           = useState(() => lsGet(LS_HISTORY, []));
  const [savedCases, setSavedCases]     = useState(() => lsGet(LS_SAVED, []));
  const [justSaved, setJustSaved]       = useState(false);
  const [followUp, setFollowUp]         = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [sbar, setSbar]                 = useState(null);
  const [sbarLoading, setSbarLoading]   = useState(false);
  const [sbarCopied, setSbarCopied]     = useState(false);
  const [sourcesOpen, setSourcesOpen]   = useState(false);

  const textareaRef           = useRef(null);
  const outputRef             = useRef(null);
  const phaseTimerRef         = useRef(null);
  const lastSubmittedRef      = useRef("");
  const wasRecentlyHiddenRef  = useRef(false);
  const hiddenAtRef           = useRef(null);
  const abortControllerRef    = useRef(null);
  const accumulatedRef        = useRef("");
  const isActiveRef           = useRef(false);
  const runQueryRef           = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [question]);

  // Load QuickStart prefill on mount; fall back to sessionStorage draft
  useEffect(() => {
    try {
      const prefill = localStorage.getItem("copilot_prefill");
      if (prefill) {
        setQuestion(prefill);
        localStorage.removeItem("copilot_prefill");
      } else {
        const draft = sessionStorage.getItem("cec_draft");
        if (draft) setQuestion(draft);
      }
    } catch {}
  }, []);

  // Persist typed question as a draft so it survives background/restore cycles
  useEffect(() => {
    try { sessionStorage.setItem("cec_draft", question); } catch {}
  }, [question]);

  // Visibility resilience — track backgrounding and recover in-flight requests.
  // Uses only refs so the effect never needs to be torn down/re-added.
  useEffect(() => {
    const onVisChange = () => {
      if (document.hidden) {
        wasRecentlyHiddenRef.current = true;
        hiddenAtRef.current = Date.now();
      } else {
        const hiddenMs = hiddenAtRef.current ? Date.now() - hiddenAtRef.current : 0;
        // Clear the recently-hidden flag after 5 s so normal network errors still show
        setTimeout(() => { wasRecentlyHiddenRef.current = false; }, 5000);

        if (!isActiveRef.current) return; // no request in flight — nothing to do

        if (hiddenMs < 15000) {
          // Brief interruption: give the stream 2.5 s to self-recover; if it's still
          // stuck (isActiveRef still true), abort and re-fire the same question.
          const q = lastSubmittedRef.current;
          setTimeout(() => {
            if (isActiveRef.current && q && runQueryRef.current) {
              // Clear the suppression flag before retrying so any genuine error
              // in the new request is shown normally.
              wasRecentlyHiddenRef.current = false;
              runQueryRef.current(q);
            }
          }, 2500);
        } else {
          // Long interruption: abort cleanly; question stays filled, no error shown.
          // wasRecentlyHiddenRef stays true for 5 s so the AbortError catch is silent.
          if (abortControllerRef.current) abortControllerRef.current.abort();
        }
      }
    };
    document.addEventListener("visibilitychange", onVisChange);
    return () => document.removeEventListener("visibilitychange", onVisChange);
  }, []);

  // Rotate loading phase messages while loading
  useEffect(() => {
    if (loading || streaming) {
      phaseTimerRef.current = setInterval(() => {
        setLoadingPhase((p) => (p + 1) % LOADING_PHASES.length);
      }, 1800);
    } else {
      clearInterval(phaseTimerRef.current);
      setLoadingPhase(0);
    }
    return () => clearInterval(phaseTimerRef.current);
  }, [loading, streaming]);

  // Core query runner — accepts an explicit query string so chips and
  // follow-ups can call it directly without going through question state.
  // AbortController lets the visibility handler cancel and restart cleanly.
  const runQuery = async (q, { isFollowUp = false } = {}) => {
    if (!q.trim()) return;

    // Cancel any previous in-flight request before starting a new one
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    accumulatedRef.current = "";
    isActiveRef.current = true;

    setQuestion(q);
    setFollowUp("");
    lastSubmittedRef.current = q;
    track("query_submitted", { mode });
    setLoading(true);
    setStreaming(false);
    setError(null);
    setResult(null);
    setRawText("");
    setStreamBuffer("");
    setJustSaved(false);
    setSbar(null);
    setSbarLoading(false);
    setSourcesOpen(false);

    try {
      const res = await fetch(`${API_BASE}/api/copilot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, mode, ...(isFollowUp ? { isFollowUp: true } : {}) }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        track("response_error", { reason: "http_error", status: res.status });
        setError(data.message || (typeof data.error === "string" ? data.error : null) || "Something went wrong. Please try again.");
        setLoading(false);
        isActiveRef.current = false;
        return;
      }

      setStreaming(true);
      setLoading(false);
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let sseBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split("\n");
        sseBuffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          let parsed;
          try { parsed = JSON.parse(jsonStr); } catch { continue; }

          if (parsed.error) {
            track("response_error", { reason: "api_error" });
            setError(parsed.message || (typeof parsed.error === "string" ? parsed.error : null) || "Something went wrong. Please try again.");
            setStreaming(false);
            isActiveRef.current = false;
            return;
          }

          if (parsed.done) {
            track("response_completed", { mode });
            setStreaming(false);
            setStreamBuffer("");
            setRawText(accumulatedRef.current);
            const parsedResult = parseResponse(accumulatedRef.current);
            setResult({ ...parsedResult, urgencyLevel: extractUrgencyLevel(accumulatedRef.current) });
            isActiveRef.current = false;
            // Save to recent cases — deduplicate, cap at 10, most-recent first
            setHistory((prev) => {
              const updated = [q, ...prev.filter((h) => h !== q)].slice(0, 10);
              lsSet(LS_HISTORY, updated);
              return updated;
            });
            return;
          }

          if (parsed.text) {
            accumulatedRef.current += parsed.text;
            setStreamBuffer(accumulatedRef.current);
          }
        }
      }
    } catch (err) {
      // AbortError = intentional cancel (new request started or long-hide recovery)
      if (err.name === "AbortError") {
        isActiveRef.current = false;
        return;
      }
      track("response_error", { reason: "network_error" });
      // Suppress the error when backgrounding caused the failure — the visibility
      // handler will attempt a retry or silently restore idle state.
      if (!wasRecentlyHiddenRef.current) {
        setError("Connection issue — please try again.");
      }
      setLoading(false);
      setStreaming(false);
      isActiveRef.current = false;
    }
  };

  // Keep runQueryRef current on every render so the visibilitychange handler
  // (which has a [] dep array) can always call the latest version.
  runQueryRef.current = runQuery;

  const handleSubmit = () => runQuery(question);

  const handleFollowUp = () => {
    if (!followUp.trim()) return;
    track("continue_thinking_used", { mode });
    const combined = `Original situation: ${lastSubmittedRef.current}\n\nUpdate: ${followUp.trim()}`;
    runQuery(combined, { isFollowUp: true });
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  const handleSaveCase = useCallback(() => {
    if (!result || !rawText) return;
    const isDup = savedCases.some((sc) => sc.question === question && sc.rawText === rawText);
    if (isDup) { setJustSaved(true); return; }
    const newCase = { id: generateId(), question, mode, rawText, urgencyLevel: result.urgencyLevel || null, timestamp: Date.now(), note: "" };
    const updated = [newCase, ...savedCases];
    setSavedCases(updated);
    lsSet(LS_SAVED, updated);
    setJustSaved(true);
  }, [result, rawText, question, mode, savedCases]);

  const handleDeleteCase = useCallback((id) => {
    const updated = savedCases.filter((sc) => sc.id !== id);
    setSavedCases(updated);
    lsSet(LS_SAVED, updated);
  }, [savedCases]);

  const handleSaveNote = useCallback((id, note) => {
    const updated = savedCases.map((sc) => sc.id === id ? { ...sc, note } : sc);
    setSavedCases(updated);
    lsSet(LS_SAVED, updated);
  }, [savedCases]);

  const handleCopyResponse = useCallback((text) => {
    try { navigator.clipboard.writeText(text); } catch {}
  }, []);

  const handleSbar = useCallback(async () => {
    if (!rawText || !question) return;
    setSbarLoading(true);
    setSbar(null);
    try {
      const res = await fetch(`${API_BASE}/api/sbar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, copilotResponse: rawText }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setSbar({ error: data.error || "Failed to generate SBAR." });
      } else {
        setSbar(data.sbar);
      }
    } catch {
      setSbar({ error: "Network error. Please try again." });
    } finally {
      setSbarLoading(false);
    }
  }, [rawText, question]);

  const handleCopySbar = useCallback((sbarData) => {
    const text = [
      `SITUATION:\n${sbarData.situation}`,
      `BACKGROUND:\n${sbarData.background}`,
      `ASSESSMENT:\n${sbarData.assessment}`,
      `RECOMMENDATION:\n${sbarData.recommendation}`,
    ].join("\n\n");
    try { navigator.clipboard.writeText(text); } catch {}
    setSbarCopied(true);
    setTimeout(() => setSbarCopied(false), 2000);
  }, []);

  const handleReopenCase = useCallback((q) => {
    setQuestion(q);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const isActive = loading || streaming;

  return (
    <div style={{
      minHeight: "100vh",
      background: [
        "radial-gradient(ellipse 90% 50% at 50% -8%, rgba(0,194,209,0.20) 0%, rgba(0,194,209,0.07) 42%, transparent 68%)",
        "radial-gradient(ellipse 50% 28% at 50% 2%, rgba(79,209,197,0.09) 0%, transparent 58%)",
        "radial-gradient(ellipse 60% 60% at 80% 80%, rgba(0,50,70,0.35) 0%, transparent 65%)",
        "linear-gradient(180deg, rgba(13,32,44,0.55) 0%, rgba(11,31,42,0) 26%, rgba(0,0,0,0.22) 100%)",
        "#0B1F2A",
      ].join(", "),
      color: "#A8C1CC",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: "0 0 calc(80px + env(safe-area-inset-bottom))",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; background: #0B1F2A; -webkit-font-smoothing: antialiased; overscroll-behavior: none; -webkit-text-size-adjust: 100%; }
        textarea { outline: none; touch-action: pan-y; }
        textarea::placeholder { color: #3A5B6E; }
        button { transition: all 0.15s ease; font-family: inherit; cursor: pointer; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,194,209,0.2); border-radius: 2px; }
        .preview-scroll::-webkit-scrollbar { display: none; }

        .chip:hover {
          background: rgba(0,194,209,0.06) !important;
          border-color: rgba(0,194,209,0.2) !important;
          color: #A8C1CC !important;
        }
        .mode-btn:hover:not(.mode-active) {
          border-color: rgba(0,194,209,0.25) !important;
          color: #A8C1CC !important;
        }
        .submit-btn:hover:not(:disabled) {
          background: #19D3E0 !important;
          transform: translateY(-1px);
          box-shadow: 0 5px 18px rgba(0,194,209,0.22) !important;
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .save-case-btn:hover:not(:disabled) {
          background: rgba(31,191,117,0.14) !important;
          border-color: rgba(31,191,117,0.45) !important;
          color: #1FBF75 !important;
        }
        .copy-btn:hover {
          border-color: rgba(255,255,255,0.15) !important;
          color: #A8C1CC !important;
        }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fade-up { animation: fadeUp 0.35s ease forwards; }
        .spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(0,194,209,0.2);
          border-top-color: #00C2D1;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
          flex-shrink: 0;
        }
        @keyframes barPulse {
          0%, 100% { height: 9px; opacity: 0.35; }
          50% { height: 26px; opacity: 1; }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0; }
        }

        /* ─── Mobile refinements (≤ 768px only) ──────────────── */
        @media (max-width: 768px) {
          /* 1: Hide preview strip — input is the first visible element */
          .preview-scroll { display: none !important; }
          /* Restore full top radius on input card when preview strip is hidden */
          .input-card {
            border-top-left-radius: 14px !important;
            border-top-right-radius: 14px !important;
          }
          /* 2: Soften warning box — guidance tone, not alert tone */
          .privacy-notice {
            background: rgba(176,128,38,0.06) !important;
            border: 1px solid rgba(233,186,75,0.14) !important;
            border-radius: 10px !important;
            padding: 12px 14px !important;
            font-size: 13px !important;
            line-height: 1.4 !important;
            color: rgba(233,186,75,0.82) !important;
          }
          /* 3 + 4: Tighten hero spacing + pull input closer */
          .main-container { max-width: 800px !important; margin: 0 auto !important; padding: 24px 18px 0 !important; }
          .hero { margin-bottom: 18px !important; }
          .hero h1 { margin-bottom: 10px !important; }
          /* Bridge line — tighter rhythm, full width on mobile */
          .hero p:first-of-type {
            font-size: 15px !important;
            line-height: 1.35 !important;
            letter-spacing: -0.01em !important;
            margin: 0 0 6px !important;
            color: rgba(230,238,242,0.88) !important;
          }
          /* Subline — hidden on mobile (redundant at small size; visible on desktop) */
          .hero p:last-of-type {
            display: none !important;
          }
          /* 5: Reduce chip density — show max 3 per section */
          .chips-recent button:nth-child(n+4) { display: none !important; }
          .chips-try button:nth-child(n+4) { display: none !important; }
          /* Prevent iOS auto-zoom on textarea focus (requires font-size >= 16px) */
          textarea { font-size: 16px !important; }
        }
      `}</style>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        paddingTop: "env(safe-area-inset-top)",
        paddingLeft: "max(14px, env(safe-area-inset-left))",
        paddingRight: "max(14px, env(safe-area-inset-right))",
        paddingBottom: 0,
        background: "linear-gradient(to bottom, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0) 100%), rgba(11,31,42,0.97)",
        backdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          paddingTop: 26,
          paddingBottom: 18,
          gap: 11,
        }}>

          {/* CE symbol — final filled brand mark */}
          <svg
            width="30"
            height="30"
            viewBox="0 0 225 200"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0, display: "block" }}
            aria-label="Clinical Edge"
            fill="#00C2D1"
          >
            <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z" />
            <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z" />
            <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z" />
            <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z" />
          </svg>

          {/* Wordmark — no divider, clean inline layout */}
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#F8FBFC",
              letterSpacing: "-0.3px",
              lineHeight: 1.15,
            }}>
              Clinical Edge
            </span>
            <span style={{
              fontSize: 10,
              fontWeight: 500,
              color: "#7F99A5",
              letterSpacing: "0.7px",
              textTransform: "uppercase",
              fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
              lineHeight: 1,
            }}>
              Copilot
            </span>
          </div>

          {/* Beta badge + Learn more */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
              fontSize: 9,
              fontWeight: 500,
              color: "#4FD1C5",
              border: "1px solid rgba(79,209,197,0.22)",
              padding: "3px 9px",
              borderRadius: 100,
              letterSpacing: "1.2px",
              textTransform: "uppercase",
            }}>
              Beta
            </span>
            <a
              href="/#/landing"
              style={{
                fontSize: 12,
                color: "#7F99A5",
                textDecoration: "none",
                fontWeight: 400,
                opacity: 0.8,
              }}
            >
              Learn more
            </a>
          </div>

        </div>
      </div>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <div className="main-container" style={{ maxWidth: 800, margin: "0 auto", width: "100%", padding: "40px 20px 0", display: "flex", flexDirection: "column", alignItems: "stretch" }}>

        {/* Hero */}
        <div className="hero" style={{ textAlign: "center", marginBottom: 26 }}>
          <h1 style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(24px, 5.5vw, 36px)",
            color: "#F2F8FA",
            margin: "0 0 16px",
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
            textShadow: "0 2px 24px rgba(0,194,209,0.13)",
          }}>
            Clinical reasoning support. Built for nurses.
          </h1>
          <p style={{ fontSize: "clamp(15px, 3.5vw, 17px)", color: "rgba(230,238,242,0.88)", margin: "0 0 10px", lineHeight: 1.4, fontWeight: 500 }}>
            When something feels off. Before you call. Quick clinical questions.
          </p>
          <p style={{ fontSize: "clamp(14px, 3vw, 15px)", color: "rgba(200,214,222,0.72)", margin: 0, lineHeight: 1.45, fontWeight: 400 }}>
            For real-world questions and practice scenarios. Not a diagnosis.
          </p>
        </div>

        {/* Output preview block */}
        <div
          className="preview-scroll"
          style={{
            background: "rgba(11,26,36,0.82)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            borderLeft: "1px solid rgba(255,255,255,0.08)",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            borderBottom: "none",
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            padding: "10px 16px",
            marginBottom: 0,
            display: "flex",
            flexWrap: "nowrap",
            alignItems: "center",
            gap: "0 10px",
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <span style={{ fontSize: 11, color: "#4F6D7A", fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "nowrap", flexShrink: 0, marginRight: 2 }}>
            You'll get:
          </span>
          {["What this could be", "Possible concerns", "What to assess next", "What to consider next"].map((item) => (
            <span key={item} style={{
              fontSize: 11,
              color: "rgba(181,239,244,0.65)",
              background: "rgba(0,194,209,0.05)",
              border: "1px solid rgba(0,194,209,0.13)",
              borderRadius: 4,
              padding: "2px 7px",
              whiteSpace: "nowrap",
              flexShrink: 0,
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}>
              {item}
            </span>
          ))}
        </div>

        {/* Input card */}
        <div className="input-card" style={{
          background: "linear-gradient(160deg, rgba(20,48,66,0.99) 0%, rgba(15,35,50,0.99) 100%)",
          border: inputFocused
            ? "1px solid rgba(0,194,209,0.28)"
            : "1px solid rgba(255,255,255,0.13)",
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 14,
          borderBottomRightRadius: 14,
          padding: "22px",
          boxShadow: inputFocused
            ? "0 14px 40px rgba(0,0,0,0.26), 0 3px 10px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 3px rgba(0,194,209,0.06), inset 0 0 20px rgba(0,194,209,0.03)"
            : "0 14px 40px rgba(0,0,0,0.26), 0 3px 10px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 20px rgba(0,194,209,0.02)",
          marginBottom: 14,
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        }}>
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="What are you thinking through right now?"
            rows={3}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              color: "#F8FBFC",
              fontSize: 15,
              lineHeight: 1.65,
              resize: "none",
              fontFamily: "inherit",
              minHeight: 72,
              display: "block",
            }}
          />
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}>
            <span style={{
              fontSize: 11,
              color: "#3A5566",
              fontFamily: "'IBM Plex Mono', monospace",
            }}>
              &#8984; + Enter
            </span>
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={!question.trim() || isActive}
              style={{
                background: (!question.trim() || isActive) ? "rgba(0,194,209,0.08)" : "#00C2D1",
                color: (!question.trim() || isActive) ? "#3A5566" : "#0B1F2A",
                border: "none",
                borderRadius: 8,
                padding: "10px 22px",
                fontSize: 13,
                fontWeight: 700,
                cursor: (!question.trim() || isActive) ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                letterSpacing: "-0.1px",
                boxShadow: (!question.trim() || isActive) ? "none" : "0 3px 12px rgba(0,194,209,0.2)",
                transition: "all 0.18s",
              }}
            >
              {isActive ? <><span className="spinner" />Analyzing...</> : "Ask Copilot"}
            </button>
          </div>
        </div>

        {/* Helper line */}
        <div style={{
          fontSize: 13,
          color: "rgba(200,214,222,0.70)",
          lineHeight: 1.5,
          marginBottom: 18,
          marginTop: 0,
        }}>
          Good for thinking it through — especially right before you call.{" "}
          <span style={{ color: "rgba(168,193,204,0.42)" }}>Also useful after report, when you're sorting out what needs attention first.</span>
        </div>

        {/* Guidance chips — lightweight, no mode-locking */}
        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontSize: 11,
            color: "rgba(168,188,198,0.28)",
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 7,
          }}>
            Common ways nurses use Copilot
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {CONTEXT_CHIPS.map(({ label }) => (
              <span key={label} style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.055)",
                color: "rgba(168,193,204,0.32)",
                borderRadius: 999,
                padding: "3px 10px",
                fontSize: 11.5,
                fontWeight: 400,
                letterSpacing: "0.005em",
                whiteSpace: "nowrap",
                userSelect: "none",
              }}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Privacy notice */}
        <div className="privacy-notice" style={{
          background: "rgba(176,128,38,0.06)",
          border: "1px solid rgba(233,186,75,0.16)",
          borderLeft: "3px solid rgba(233,186,75,0.30)",
          borderRadius: 10,
          padding: "12px 15px",
          fontSize: 12,
          color: "rgba(220,190,118,0.85)",
          marginBottom: 20,
          display: "flex",
          gap: 9,
          alignItems: "flex-start",
        }}>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color: "#C49A3C",
            flexShrink: 0,
            marginTop: 1,
          }}>&#9888;</span>
          <span>Do not enter names, MRNs, dates of birth, SSNs, phone numbers, or any patient identifiers. Describe the clinical situation only.</span>
        </div>

        {/* Educational disclaimer */}
        <div style={{
          fontSize: 11,
          color: "rgba(168,193,204,0.38)",
          marginBottom: 20,
          marginTop: -12,
          paddingLeft: 3,
          lineHeight: 1.55,
        }}>
          For educational support only. Not a substitute for clinical judgment, provider guidance, or institutional protocol.
        </div>

        {/* Recent Cases */}
        {history.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              color: "rgba(168,188,198,0.62)",
              marginBottom: 10,
              fontFamily: "'IBM Plex Mono', monospace",
            }}>Recent Cases</div>
            <div className="chips-recent" style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {history.map((item, i) => (
                <button
                  key={i}
                  className="chip"
                  onClick={() => { track("recent_case_clicked"); runQuery(item); }}
                  style={{
                    background: "rgba(0,194,209,0.06)",
                    border: "1px solid rgba(0,194,209,0.22)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                    color: "rgba(181,239,244,0.90)",
                    padding: "0 12px",
                    height: 28,
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    maxWidth: 260,
                    textAlign: "left",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Saved Cases */}
        {savedCases.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}>
              <div style={{
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                color: "rgba(168,188,198,0.62)",
                fontFamily: "'IBM Plex Mono', monospace",
              }}>
                Saved Cases <span style={{ color: "rgba(168,188,198,0.35)", fontWeight: 400 }}>({savedCases.length})</span>
              </div>
            </div>
            {savedCases.map((sc) => (
              <SavedCaseRow key={sc.id} sc={sc} onReopen={handleReopenCase} onDelete={handleDeleteCase} onCopy={handleCopyResponse} onSaveNote={handleSaveNote} />
            ))}
          </div>
        )}

        {/* Example prompts — tap to fill input */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "rgba(168,188,198,0.45)",
            marginBottom: 8,
          }}>Examples</div>
          <div className="chips-try" style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                className="chip"
                onClick={() => { setQuestion(ex); setTimeout(() => textareaRef.current?.focus(), 0); }}
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(168,193,204,0.70)",
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 400,
                  letterSpacing: "-0.01em",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  textAlign: "left",
                  lineHeight: 1.45,
                  transition: "all 0.15s",
                  width: "100%",
                }}
              >
                <span style={{ color: "rgba(0,194,209,0.35)", fontSize: 10, flexShrink: 0 }}>▶</span>
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="fade-up" style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            background: "rgba(233,107,107,0.07)",
            border: "1px solid rgba(233,107,107,0.22)",
            borderLeft: "3px solid #E96B6B",
            borderRadius: 9,
            padding: "12px 15px",
            color: "#E96B6B",
            fontSize: 13,
            marginBottom: 24,
          }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              flexShrink: 0,
              opacity: 0.8,
            }}>ERR</span>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div ref={outputRef}>
            <LoadingIndicator phase={LOADING_PHASES[loadingPhase]} />
          </div>
        )}

        {/* Streaming preview */}
        {streaming && streamBuffer && (
          <div ref={outputRef}>
            <LoadingIndicator phase={LOADING_PHASES[loadingPhase]} />
            <StreamPreview text={streamBuffer} />
          </div>
        )}

        {/* Final structured result */}
        {result && !streaming && (
          <div ref={outputRef} className="fade-up">

            {/* Response trust cue */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "0 2px 14px",
              fontSize: 11,
              color: "#4A6675",
              fontFamily: "'IBM Plex Mono', monospace",
              lineHeight: 1.5,
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              marginBottom: 16,
            }}>
              <span style={{ color: "#3A5A6A", flexShrink: 0, fontSize: 9 }}>◆</span>
              <span>Structured clinical reasoning support — confirm with your assessment and provider guidance</span>
            </div>

            <UrgencyBadge level={result.urgencyLevel} />

            {result.urgent && (
              <div style={{
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderLeft: "3px solid rgba(239,68,68,0.60)",
                borderRadius: 11,
                padding: "14px 18px",
                color: "#f8a8a8",
                fontWeight: 600,
                fontSize: 14,
                lineHeight: 1.65,
                marginBottom: 14,
                boxShadow: "0 2px 12px rgba(239,68,68,0.06)",
              }}>
                {result.urgent}
              </div>
            )}

            {result.sections.map((s) => (
              <SectionCard key={s.title} title={s.title} content={s.content} />
            ))}

            {/* Action bar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 18,
              paddingTop: 18,
              borderTop: "1px solid rgba(255,255,255,0.07)",
              flexWrap: "wrap",
            }}>
              {/* Save — primary action */}
              <button
                className="save-case-btn"
                onClick={handleSaveCase}
                disabled={justSaved}
                style={{
                  background: justSaved ? "rgba(31,191,117,0.10)" : "rgba(31,191,117,0.04)",
                  border: "1px solid " + (justSaved ? "rgba(31,191,117,0.45)" : "rgba(31,191,117,0.22)"),
                  color: justSaved ? "#1FBF75" : "#4E9E78",
                  borderRadius: 9,
                  padding: "9px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: justSaved ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  transition: "all 0.15s",
                  letterSpacing: "-0.1px",
                }}
              >
                {justSaved ? "\u2713 Case Saved" : "+ Save Case"}
              </button>

              {/* Copy — secondary, quieter */}
              <button
                className="copy-btn"
                onClick={() => handleCopyResponse(rawText)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#3D5E6E",
                  borderRadius: 9,
                  padding: "9px 18px",
                  fontSize: 13,
                  fontWeight: 400,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  letterSpacing: "-0.1px",
                }}
              >
                Copy Response
              </button>

              {/* Sources — regulatory affordance */}
              <button
                onClick={() => setSourcesOpen(o => !o)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: sourcesOpen ? "rgba(168,193,204,0.65)" : "#3D5E6E",
                  borderRadius: 9,
                  padding: "9px 16px",
                  fontSize: 12.5,
                  fontWeight: 400,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  letterSpacing: "-0.1px",
                }}
              >
                Sources
              </button>

              {/* SBAR — tertiary, accent */}
              <button
                onClick={handleSbar}
                disabled={sbarLoading}
                style={{
                  marginLeft: "auto",
                  background: sbar && !sbar.error ? "rgba(0,194,209,0.07)" : "transparent",
                  border: "1px solid " + (sbar && !sbar.error ? "rgba(0,194,209,0.25)" : "rgba(0,194,209,0.14)"),
                  color: sbarLoading ? "rgba(0,194,209,0.35)" : "#00A8B5",
                  borderRadius: 9,
                  padding: "9px 16px",
                  fontSize: 12.5,
                  fontWeight: 500,
                  cursor: sbarLoading ? "default" : "pointer",
                  transition: "all 0.15s",
                  letterSpacing: "-0.1px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                {sbarLoading ? (
                  <>
                    <span style={{ display: "inline-block", width: 10, height: 10, border: "1.5px solid rgba(0,194,209,0.3)", borderTopColor: "#00C2D1", borderRadius: "50%", animation: "spin 0.75s linear infinite" }} />
                    Building SBAR…
                  </>
                ) : (
                  "Turn into SBAR"
                )}
              </button>
            </div>

            {/* ── Sources panel ─────────────────────────────────────────── */}
            {sourcesOpen && (
              <div style={{
                marginTop: 10,
                background: "rgba(255,255,255,0.018)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: "14px 16px",
              }}>
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.2px",
                  color: "#5A7A8A",
                  fontFamily: "'IBM Plex Mono', monospace",
                  marginBottom: 10,
                }}>
                  General reference categories
                </div>
                {[
                  "Nursing assessment and escalation frameworks",
                  "Standard inpatient monitoring and communication practices",
                  "General clinical education references and hospital protocol concepts",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                    <span style={{ color: "#3A5566", fontSize: 10, marginTop: 3, flexShrink: 0 }}>›</span>
                    <span style={{ fontSize: 12.5, color: "#7F99A5", lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
                <div style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  fontSize: 11,
                  color: "#3A5566",
                  lineHeight: 1.5,
                }}>
                  Always follow your local policy, approved references, and clinician judgment.
                </div>
              </div>
            )}

            {/* ── Response disclaimer footer ─────────────────────────────── */}
            <div style={{
              marginTop: 14,
              fontSize: 11,
              color: "rgba(168,193,204,0.28)",
              lineHeight: 1.55,
              textAlign: "center",
            }}>
              For educational support only. Use your clinical judgment and follow local protocol.
            </div>

            {/* ── Continue Thinking ─────────────────────────────────────── */}
            <div style={{
              marginTop: 22,
              background: "linear-gradient(160deg, rgba(0,194,209,0.028) 0%, rgba(0,150,165,0.018) 100%)",
              border: "1px solid rgba(0,194,209,0.12)",
              borderRadius: 12,
              padding: "16px 18px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
            }}>
              <div style={{
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1.3px",
                color: "#00C2D1",
                marginBottom: 10,
                fontFamily: "'IBM Plex Mono', monospace",
              }}>
                Anything change?
              </div>
              <textarea
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleFollowUp(); }}
                placeholder="New vitals, labs, or anything different?"
                rows={2}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(0,194,209,0.12)",
                  color: "#F8FBFC",
                  fontSize: 14,
                  lineHeight: 1.6,
                  resize: "none",
                  fontFamily: "inherit",
                  paddingBottom: 8,
                  marginBottom: 10,
                  display: "block",
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={handleFollowUp}
                  disabled={!followUp.trim()}
                  style={{
                    background: followUp.trim() ? "rgba(0,194,209,0.12)" : "transparent",
                    border: "1px solid " + (followUp.trim() ? "rgba(0,194,209,0.35)" : "rgba(255,255,255,0.08)"),
                    color: followUp.trim() ? "#00C2D1" : "#3A5566",
                    borderRadius: 7,
                    padding: "7px 16px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: followUp.trim() ? "pointer" : "not-allowed",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  Send update
                </button>
              </div>
            </div>

          {/* ── SBAR Card ────────────────────────────────────────────── */}
          {(sbar || sbarLoading) && (
            <div style={{
              marginTop: 16,
              background: "linear-gradient(160deg, rgba(0,194,209,0.04) 0%, rgba(0,150,165,0.025) 100%)",
              border: "1px solid rgba(0,194,209,0.16)",
              borderRadius: 12,
              padding: "20px 20px 16px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
            }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.4px",
                  color: "#00C2D1",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}>
                  SBAR Handoff Draft
                </div>
                {sbar && !sbar.error && (
                  <button
                    onClick={() => handleCopySbar(sbar)}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(0,194,209,0.15)",
                      color: sbarCopied ? "#1FBF75" : "rgba(0,194,209,0.5)",
                      borderRadius: 6,
                      padding: "4px 11px",
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {sbarCopied ? "✓ Copied" : "Copy"}
                  </button>
                )}
              </div>

              {sbarLoading && (
                <div style={{ color: "rgba(168,193,204,0.4)", fontSize: 13, padding: "8px 0" }}>
                  Drafting SBAR…
                </div>
              )}

              {sbar && sbar.error && (
                <div style={{ color: "#e05572", fontSize: 13 }}>{sbar.error}</div>
              )}

              {sbar && !sbar.error && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { label: "Situation",      value: sbar.situation,      accent: "#4da3ff" },
                    { label: "Background",     value: sbar.background,     accent: "#A8C1CC" },
                    { label: "Assessment",     value: sbar.assessment,     accent: "#F2B94B" },
                    { label: "Recommendation", value: sbar.recommendation, accent: "#1FBF75" },
                  ].map(({ label, value, accent }) => (
                    <div key={label}>
                      <div style={{
                        fontSize: 9,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        color: accent,
                        fontFamily: "'IBM Plex Mono', monospace",
                        marginBottom: 5,
                        opacity: 0.85,
                      }}>
                        {label}
                      </div>
                      <div style={{
                        fontSize: 13.5,
                        lineHeight: 1.65,
                        color: "#BCCDD6",
                      }}>
                        {value || "—"}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 14, fontSize: 10.5, color: "rgba(168,193,204,0.28)", lineHeight: 1.5 }}>
                AI-generated draft — verify all details before use. Do not include patient identifiers.
              </div>
            </div>
          )}

        </div>
        )}

        {/* Disclaimer */}
        <div style={{
          marginTop: 48,
          padding: "14px 16px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          fontSize: 11,
          color: "#3A5566",
          textAlign: "center",
          lineHeight: 1.75,
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          Your clinical judgment comes first — use this to organize thinking, not replace decision-making.<br />
          Clinical Edge Copilot does not replace institutional protocols, provider orders, or your assessment.<br />
          Always escalate per your facility's policies.
        </div>

        {/* Footer links */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 20,
          marginTop: 20,
          paddingBottom: 4,
        }}>
          {[["Privacy", "/#/privacy"], ["Support", "/#/support"]].map(([label, href]) => (
            <a key={label} href={href} style={{
              fontSize: 11,
              color: "rgba(168,193,204,0.35)",
              textDecoration: "none",
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={e => e.target.style.color = "rgba(168,193,204,0.6)"}
            onMouseLeave={e => e.target.style.color = "rgba(168,193,204,0.35)"}
            >{label}</a>
          ))}
        </div>

      </div>
    </div>
  );
}
