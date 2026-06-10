import { useState, useRef, useEffect, useCallback } from "react";
import { trackEvent, promptLengthBucket } from "./analytics";

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
  { name: "What this could be",       aliases: ["What this could be"],                                        accent: "#4da3ff", bg: "rgba(77,163,255,0.06)"  },
  { name: "Possible concerns",        aliases: ["Possible concerns",      "What concerns me most"],           accent: "#e05572", bg: "rgba(224,85,114,0.06)"  },
  { name: "What to assess next",      aliases: ["What to assess next",    "What I'd assess next"],            accent: "#1FBF75", bg: "rgba(31,191,117,0.06)"  },
  { name: "What to consider next",    aliases: ["What to consider next",  "What I'd do right now"],           accent: "#F2B94B", bg: "rgba(242,185,75,0.06)"  },
  { name: "Where this may be heading",aliases: ["Where this may be heading"],                                 accent: "#F2B94B", bg: "rgba(242,185,75,0.06)"  },
  { name: "Closing",                  aliases: ["Closing"],                                                   accent: "#0ABFBC", bg: "rgba(10,191,188,0.04)"  },
];

const SECTION_CONFIG = {};
SECTIONS.forEach((s) => { SECTION_CONFIG[s.name] = s; });

const ALIAS_MAP = {};
SECTIONS.forEach((s) => { s.aliases.forEach((a) => { ALIAS_MAP[a] = s.name; }); });

const URGENCY_STYLES = {
  // color     = text/dot on warm light surface (UrgencyBadge, callouts)
  // darkText  = text/dot on dark card surface (SavedCaseRow)
  HIGH:     { color: "#8E2F2F", bg: "rgba(190,70,70,0.10)",    border: "#B45454",               darkText: "#f4a4a4" },
  MODERATE: { color: "#9A6F1F", bg: "rgba(212,168,75,0.10)",   border: "#C79A3B",               darkText: "#e8c060" },
  LOW:      { color: "#0F766E", bg: "rgba(10,191,188,0.08)",   border: "rgba(10,191,188,0.30)", darkText: "#5eead4" },
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
    borderRadius: 6,
    padding: "6px 14px",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  };
}

// ─── Inline markdown renderer ─────────────────────────────────────────────────
// Handles **bold** and *italic* — no extra deps, single-pass regex.

function renderInline(text) {
  if (!text || !text.includes("*")) return text;
  const result = [];
  // Match **bold** before *italic* so double-star wins over single-star
  const pattern = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g;
  let last = 0, key = 0, match;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) result.push(text.slice(last, match.index));
    const m = match[0];
    if (m.startsWith("**"))
      result.push(<strong key={key++} style={{ fontWeight: 700 }}>{m.slice(2, -2)}</strong>);
    else
      result.push(<em key={key++}>{m.slice(1, -1)}</em>);
    last = match.index + m.length;
  }
  if (last < text.length) result.push(text.slice(last));
  if (result.length === 0) return text;
  if (result.length === 1 && typeof result[0] === "string") return result[0];
  return result;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ title, content }) {
  const cfg = SECTION_CONFIG[title] || { accent: "#4da3ff", bg: "rgba(77,163,255,0.06)" };

  // Closing — italic pull-quote treatment, no label
  if (title === "Closing") {
    return (
      <div style={{
        borderLeft: "2px solid #0ABFBC",
        padding: "14px 20px",
        marginTop: 10,
        marginBottom: 6,
        background: "var(--ce-warm-card)",
        borderRadius: "0 8px 8px 0",
      }}>
        <p style={{
          margin: 0,
          fontSize: 14,
          fontStyle: "italic",
          color: "#526174",
          lineHeight: 1.82,
          letterSpacing: "0.008em",
        }}>
          {renderInline(content.trim())}
        </p>
      </div>
    );
  }

  const lines = content.split("\n").filter((l) => l.trim());
  return (
    <div style={{
      background: "var(--ce-warm-card)",
      border: "1px solid var(--ce-warm-line)",
      borderLeft: "3px solid " + cfg.accent,
      borderRadius: 8,
      padding: "18px 20px",
      marginBottom: 10,
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
      <div style={{ fontSize: 14, lineHeight: 1.72, color: "#1E2A3A" }}>
        {lines.map((line, i) => {
          const isBullet = /^[-\u2022*]\s/.test(line);
          if (isBullet) return (
            <div key={i} style={{ display: "flex", gap: 11, marginBottom: 8, alignItems: "flex-start" }}>
              <span style={{ color: cfg.accent, fontWeight: 700, marginTop: 2, flexShrink: 0, fontSize: 14, lineHeight: 1.72 }}>&rsaquo;</span>
              <span style={{ color: "#1E2A3A" }}>{renderInline(line.replace(/^[-\u2022*]\s+/, ""))}</span>
            </div>
          );
          return <p key={i} style={{ margin: "0 0 7px", color: "#1E2A3A" }}>{renderInline(line)}</p>;
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
      borderRadius: 6,
      padding: "10px 16px",
      marginBottom: 16,
    }}>
      <span style={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: s.color,
        flexShrink: 0,
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
            background: "#0ABFBC",
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
      border: "1px solid rgba(10,191,188,0.08)",
      borderRadius: 8,
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
        background: "#0ABFBC",
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
    <div style={{ background: "#1E2A3A", border: "1px solid #2D3B4E", borderRadius: 8, marginBottom: 8, overflow: "hidden" }}>
      <div style={{ padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4, flexWrap: "wrap" }}>
            {urgStyle && (
              <span style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: urgStyle.darkText || urgStyle.color,
                flexShrink: 0,
                display: "inline-block",
              }} />
            )}
            <span style={{
              fontSize: 9,
              fontWeight: 700,
              fontFamily: "'IBM Plex Mono', monospace",
              color: urgStyle ? (urgStyle.darkText || urgStyle.color) : "#7F99A5",
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
          <button onClick={() => onReopen(sc.question)} title="Reopen in input" style={iconBtnStyle("#0ABFBC")}>&crarr;</button>
          <button onClick={handleCopy} title="Copy response" style={iconBtnStyle(copied ? "#1FBF75" : "#0ABFBC")}>{copied ? "\u2713" : "\u2398"}</button>
          <button onClick={() => { setEditNote(true); setExpanded(true); }} title="Add/edit note" aria-label="Add or edit note" style={iconBtnStyle("#F2B94B")}>{"✎"}</button>
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
              background: "rgba(0,0,0,0.04)",
              border: "1px solid rgba(0,0,0,0.12)",
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
            <button onClick={handleNoteSave} style={{ ...smallBtnStyle("#0ABFBC", "#0B1F2A"), fontWeight: 700 }}>Save Note</button>
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

// ─── Screenshot mode (capture only, never affects normal users) ───────────────
//
// When the URL contains ?screenshot=response, the component mounts with a
// pre-baked clinical scenario and response already in state. This lets the
// Puppeteer capture script grab a real rendered response without hitting the API.
// All screenshot params are stripped from production URLs at deploy time.
//
const _ssParam = (() => {
  try { return new URLSearchParams(window.location.search).get('screenshot'); } catch { return null; }
})();

const _SS_QUESTION =
  "Post-op day 2 hip replacement — HR has been slowly climbing from 78 to 96 over the last few hours, BP stable, temp 37.9. Patient says they feel more tired than this morning. Want to organize my thinking before I call.";

const _SS_RESPONSE = `Urgency Level: MODERATE

**What this could be**
- Undertreated pain — a gradual HR rise in the post-op period most often reflects pain that isn't fully covered
- Early fluid imbalance — third-spacing and mild dehydration can present this way before vital signs shift more noticeably
- Respiratory pattern — atelectasis and guarded breathing are common at this stage and can drive both fatigue and heart rate changes
- Early infection response — post-op day 2 is the typical window for wound or systemic changes to begin to develop

**What to assess next**
- Pain score now versus earlier in the shift — is the patient's pain coverage keeping up?
- Breath sounds and respiratory effort — are they taking full breaths or guarding against discomfort?
- Intake and urine output over the last several hours — mild volume changes often show up quietly
- Wound site — any warmth, drainage, or change compared to the morning assessment
- How does the patient look compared to a few hours ago — affect, engagement, color

**What to consider next**
- Gather the vital sign trend from the last 4–6 hours before calling — one reading rarely tells the full story
- Know the last documented pain score and what was ordered and given
- Have the post-op orders and any baseline values from admission available

**Closing**
A slow HR climb with new fatigue usually has a clear reason. Thinking it through before the call — not after — is the right instinct.`;

// ─── Main App ──────────────────────────────────────────────────────────────────

export default function App({ onGoHome, isOnline = true }) {
  const [question, setQuestion]         = useState(() => _ssParam === 'response' ? _SS_QUESTION : "");
  const [result, setResult]             = useState(() => {
    if (_ssParam !== 'response') return null;
    const parsed = parseResponse(_SS_RESPONSE);
    return { ...parsed, urgencyLevel: extractUrgencyLevel(_SS_RESPONSE) };
  });
  const [rawText, setRawText]           = useState(() => _ssParam === 'response' ? _SS_RESPONSE : "");
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

  // Track module open — fires once on mount
  useEffect(() => {
    trackEvent('copilot_opened', { route: '/copilot' });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [question]);

  // Screenshot mode: scroll response into view immediately on mount
  useEffect(() => {
    if (_ssParam === 'response' && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load QuickStart prefill on mount; fall back to sessionStorage draft
  useEffect(() => {
    if (_ssParam === 'response') return; // screenshot mode — skip prefill logic
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
    if (!isOnline) {
      trackEvent('copilot_offline_blocked');
      return;
    }

    // Cancel any previous in-flight request before starting a new one
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    accumulatedRef.current = "";
    isActiveRef.current = true;

    setQuestion(q);
    setFollowUp("");
    lastSubmittedRef.current = q;
    trackEvent('copilot_prompt_submitted', { mode, prompt_length_bucket: promptLengthBucket(q) });
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
        trackEvent('copilot_response_error', { reason: 'http_error', status: res.status });
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
            trackEvent('copilot_response_error', { reason: 'api_error' });
            setError(parsed.message || (typeof parsed.error === "string" ? parsed.error : null) || "Something went wrong. Please try again.");
            setStreaming(false);
            isActiveRef.current = false;
            return;
          }

          if (parsed.done) {
            trackEvent('copilot_response_completed', { mode });
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
      trackEvent('copilot_response_error', { reason: 'network_error' });
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
    trackEvent('copilot_continue_thinking', { mode });
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
      background: "#111827",
      color: "#A8C1CC",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: "0 0 calc(80px + env(safe-area-inset-bottom))",
    }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; background: #111827; -webkit-font-smoothing: antialiased; overscroll-behavior: none; -webkit-text-size-adjust: 100%; }
        textarea { outline: none; touch-action: pan-y; }
        textarea::placeholder { color: #94A3B8; }
        button { transition: all 0.15s ease; font-family: inherit; cursor: pointer; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2D3B4E; border-radius: 2px; }
        .preview-scroll::-webkit-scrollbar { display: none; }

        .chip:hover {
          background: rgba(10,191,188,0.07) !important;
          border-color: rgba(10,191,188,0.22) !important;
        }
        .chip:active {
          transform: scale(0.97);
          opacity: 0.85;
          transition-duration: 60ms !important;
        }
        .mode-btn:hover:not(.mode-active) {
          border-color: rgba(10,191,188,0.22) !important;
          color: #94A3B8 !important;
        }
        .submit-btn:hover:not(:disabled) {
          background: #0ABFBC !important;
          transform: translateY(-1px);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .save-case-btn:hover:not(:disabled) {
          background: rgba(31,191,117,0.14) !important;
          border-color: rgba(31,191,117,0.45) !important;
          color: #1FBF75 !important;
        }
        .copy-btn:hover {
          border-color: rgba(0,0,0,0.15) !important;
          color: #526174 !important;
        }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fade-up { animation: fadeUp 0.35s ease forwards; }
        .spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(10,191,188,0.20);
          border-top-color: #0ABFBC;
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
          .main-container { max-width: 800px !important; margin: 0 auto !important; padding: 18px 16px 0 !important; overflow-x: hidden !important; }
          .hero { margin-bottom: 12px !important; }
          /* Reduce try-asking chip density — show max 3 */
          .chips-try button:nth-child(n+4) { display: none !important; }
          /* Recent row: limit to 3 cards on mobile */
          .recent-list > *:nth-child(n+4) { display: none !important; }
          /* Prevent iOS auto-zoom on textarea focus (requires font-size >= 16px) */
          textarea { font-size: 16px !important; }
        }
      `}</style>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
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
          maxWidth: 800,
          margin: "0 auto",
          width: "100%",
          display: "flex",
          alignItems: "center",
          paddingTop: 22,
          paddingBottom: 16,
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
            fill="#0ABFBC"
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

          {/* All tools — back navigation */}
          {onGoHome && (
            <button className="ce-back-link" onClick={onGoHome}>
              ← All tools
            </button>
          )}

        </div>
      </div>

      {/* ── Warm clinical workspace ──────────────────────────────────────── */}
      <div className="ce-page-enter" style={{ background: "#E7E1D6", minHeight: "100vh" }}>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <div className="main-container" style={{ maxWidth: 800, margin: "0 auto", width: "100%", padding: "40px 20px 0", display: "flex", flexDirection: "column", alignItems: "stretch" }}>

        {/* Hero */}
        <div className="hero" style={{ marginBottom: 18 }}>
          <h2 style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(20px, 4.5vw, 26px)",
            color: "#111827",
            margin: "0 0 6px",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
          }}>
            What are you thinking through?
          </h2>
          <p style={{ fontSize: 13, color: "#7A8D9A", margin: 0, lineHeight: 1.5, fontWeight: 400 }}>
            Ask a clinical reasoning question. No patient identifiers.
          </p>
        </div>

        {/* Offline notice — shown only when network is unavailable */}
        {!isOnline && (
          <div style={{
            background: "rgba(77,163,255,0.06)",
            border: "1px solid rgba(77,163,255,0.22)",
            borderLeft: "3px solid #4da3ff",
            borderRadius: 8,
            padding: "14px 16px",
            marginBottom: 14,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: "#4da3ff",
              flexShrink: 0,
              marginTop: 1,
            }}>OFFLINE</span>
            <span style={{ fontSize: 13, color: "#526174", lineHeight: 1.55 }}>
              Copilot requires internet. <strong style={{ color: "#4da3ff", fontWeight: 600 }}>Rhythm Lab</strong> and <strong style={{ color: "#4da3ff", fontWeight: 600 }}>ICU Drips</strong> are available offline once loaded.
            </span>
          </div>
        )}

        {/* Input card */}
        <div className="input-card" style={{
          background: "#1E2A3A",
          border: inputFocused
            ? "1px solid #0ABFBC"
            : "1px solid rgba(240,237,230,0.10)",
          borderRadius: 8,
          padding: "14px 16px 12px",
          boxShadow: inputFocused
            ? "0 0 0 3px rgba(10,191,188,0.12), 0 6px 18px rgba(0,0,0,0.18)"
            : "0 6px 18px rgba(0,0,0,0.18)",
          marginBottom: 10,
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
            rows={2}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              color: "#F0EDE6",
              fontSize: 15,
              lineHeight: 1.6,
              resize: "none",
              fontFamily: "inherit",
              minHeight: 56,
              display: "block",
            }}
          />
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginTop: 8,
            paddingTop: 8,
            borderTop: "1px solid rgba(240,237,230,0.09)",
          }}>
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={!question.trim() || isActive || !isOnline}
              style={{
                background: (!question.trim() || isActive || !isOnline) ? "rgba(10,191,188,0.08)" : "#0ABFBC",
                color: (!question.trim() || isActive || !isOnline) ? "#94A3B8" : "#0B1F2A",
                border: "none",
                borderRadius: 8,
                padding: "10px 22px",
                fontSize: 13,
                fontWeight: 700,
                cursor: (!question.trim() || isActive || !isOnline) ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                letterSpacing: "-0.1px",
                boxShadow: "none",
                transition: "all 0.18s",
              }}
            >
              {isActive ? <><span className="spinner" />Analyzing...</> : "Ask Copilot"}
            </button>
          </div>
        </div>

        {/* PHI note — muted inline */}
        <div style={{
          fontSize: 11,
          color: "#8A9BA8",
          marginTop: 6,
          marginBottom: 14,
          paddingLeft: 2,
          lineHeight: 1.5,
        }}>
          No names, MRNs, dates of birth, phone numbers, or identifiers.
        </div>

        {/* Guidance chips — lightweight */}
        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontSize: 10,
            color: "#8A9BA8",
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 7,
          }}>
            Try asking
          </div>
          <div className="chips-try" style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {CONTEXT_CHIPS.map(({ label, placeholder }) => (
              <button
                key={label}
                className="chip"
                onClick={() => { if (textareaRef.current) { textareaRef.current.placeholder = placeholder; textareaRef.current.focus(); } }}
                style={{
                  background: "transparent",
                  border: "1px solid #C4BDB5",
                  color: "#6A7D8A",
                  borderRadius: 5,
                  padding: "3px 9px",
                  fontSize: 11,
                  fontWeight: 400,
                  letterSpacing: "0.005em",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Cases */}
        {history.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              color: "#8A9BA8",
              marginBottom: 6,
              fontFamily: "'IBM Plex Mono', monospace",
            }}>Recent</div>
            <div className="recent-list" style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {history.slice(0, 5).map((item, i) => (
                <button
                  key={i}
                  className="chip"
                  onClick={() => { trackEvent('copilot_recent_case_used'); runQuery(item); }}
                  style={{
                    background: "rgba(0,0,0,0.04)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    color: "#3D5166",
                    padding: "7px 11px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 400,
                    letterSpacing: "-0.01em",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    textAlign: "left",
                    lineHeight: 1.4,
                    transition: "all 0.15s",
                    width: "100%",
                    overflow: "hidden",
                  }}
                >
                  <span style={{ color: "#9AA8B2", fontSize: 8, flexShrink: 0, marginTop: 3 }}>↩</span>
                  <span style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>{item}</span>
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
                color: "#526174",
                fontFamily: "'IBM Plex Mono', monospace",
              }}>
                Saved Cases <span style={{ color: "rgba(82,97,116,0.55)", fontWeight: 400 }}>({savedCases.length})</span>
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
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "#8A9BA8",
            marginBottom: 8,
          }}>Examples</div>
          <div className="chips-try" style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                className="chip"
                onClick={() => { setQuestion(ex); setTimeout(() => textareaRef.current?.focus(), 0); }}
                style={{
                  background: "rgba(0,0,0,0.05)",
                  border: "1px solid rgba(0,0,0,0.09)",
                  color: "#526174",
                  padding: "7px 11px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 400,
                  letterSpacing: "-0.01em",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  textAlign: "left",
                  lineHeight: 1.4,
                  transition: "all 0.15s",
                  width: "100%",
                }}
              >
                <span style={{ color: "#9AA8B2", fontSize: 8, flexShrink: 0 }}>▶</span>
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
            borderRadius: 6,
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
              borderBottom: "1px solid rgba(0,0,0,0.07)",
              marginBottom: 16,
            }}>
              <span style={{ color: "#3A5A6A", flexShrink: 0, fontSize: 9 }}>◆</span>
              <span>Structured clinical reasoning support — confirm with your assessment and provider guidance</span>
            </div>

            <UrgencyBadge level={result.urgencyLevel} />

            {result.urgent && (
              <div style={{
                background: "rgba(190,70,70,0.08)",
                border: "1px solid rgba(180,84,84,0.20)",
                borderLeft: "3px solid #B45454",
                borderRadius: 6,
                padding: "14px 18px",
                color: "#8E2F2F",
                fontWeight: 600,
                fontSize: 14,
                lineHeight: 1.65,
                marginBottom: 14,
              }}>
                {renderInline(result.urgent)}
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
              borderTop: "1px solid rgba(0,0,0,0.08)",
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
                  borderRadius: 6,
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
                  border: "1px solid rgba(0,0,0,0.12)",
                  color: "#3D5E6E",
                  borderRadius: 6,
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
                  border: "1px solid rgba(0,0,0,0.10)",
                  color: sourcesOpen ? "#526174" : "#3D5E6E",
                  borderRadius: 6,
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
                  background: sbar && !sbar.error ? "rgba(10,191,188,0.07)" : "transparent",
                  border: "1px solid " + (sbar && !sbar.error ? "rgba(10,191,188,0.25)" : "rgba(10,191,188,0.14)"),
                  color: sbarLoading ? "rgba(10,191,188,0.35)" : "#0ABFBC",
                  borderRadius: 6,
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
                    <span style={{ display: "inline-block", width: 10, height: 10, border: "1.5px solid rgba(10,191,188,0.28)", borderTopColor: "#0ABFBC", borderRadius: "50%", animation: "spin 0.75s linear infinite" }} />
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
                background: "#1E2A3A",
                border: "1px solid #2D3B4E",
                borderRadius: 8,
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
                  Clinical reference sources
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                  {[
                    {
                      label: "AACN — Clinical Practice Resources",
                      url: "https://www.aacn.org/clinical-resources",
                    },
                    {
                      label: "The Joint Commission — National Patient Safety Goals",
                      url: "https://www.jointcommission.org/standards/national-patient-safety-goals/",
                    },
                    {
                      label: "AHRQ — TeamSTEPPS Clinical Communication Resources",
                      url: "https://www.ahrq.gov/teamstepps/index.html",
                    },
                    {
                      label: "ISMP — Medication Safety Resources",
                      url: "https://www.ismp.org/resources",
                    },
                  ].map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: "10px 12px",
                        borderRadius: 6,
                        background: "#243040",
                        border: "1px solid #2D3B4E",
                        color: "#0ABFBC",
                        textDecoration: "none",
                        fontSize: 14,
                        lineHeight: 1.35,
                      }}
                    >
                      <span>{source.label}</span>
                      <span style={{ opacity: 0.9, flexShrink: 0 }}>↗</span>
                    </a>
                  ))}
                </div>
                <div style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: "1px solid #2D3B4E",
                  fontSize: 11,
                  color: "#526174",
                  lineHeight: 1.5,
                }}>
                  Always follow your local policy, approved references, and clinician judgment.
                </div>
              </div>
            )}

            {/* ── Continue Thinking ─────────────────────────────────────── */}
            <div style={{
              marginTop: 22,
              background: "#1E2A3A",
              border: "1px solid #2D3B4E",
              borderRadius: 8,
              padding: "16px 18px",
            }}>
              <div style={{
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1.3px",
                color: "#7F99A5",
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
                  borderBottom: "1px solid rgba(10,191,188,0.15)",
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
                    background: followUp.trim() ? "rgba(10,191,188,0.10)" : "transparent",
                    border: "1px solid " + (followUp.trim() ? "rgba(10,191,188,0.30)" : "rgba(255,255,255,0.10)"),
                    color: followUp.trim() ? "#0ABFBC" : "#3A5566",
                    borderRadius: 6,
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
              background: "#1E2A3A",
              border: "1px solid #2D3B4E",
              borderRadius: 8,
              padding: "20px 20px 16px",
            }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.4px",
                  color: "#7F99A5",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}>
                  SBAR Handoff Draft
                </div>
                {sbar && !sbar.error && (
                  <button
                    onClick={() => handleCopySbar(sbar)}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(10,191,188,0.18)",
                      color: sbarCopied ? "#1FBF75" : "rgba(10,191,188,0.55)",
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
                        {value ? renderInline(value) : "—"}
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
          marginTop: 32,
          padding: "12px 0 0",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          fontSize: 10,
          color: "#8A9BA8",
          textAlign: "center",
          lineHeight: 1.6,
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          Educational and clinical reasoning support only. Not a diagnostic tool.<br />
          Always follow your facility's protocols, provider orders, and your own assessment.
        </div>

        {/* Footer links */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 20,
          marginTop: 12,
          paddingBottom: 4,
        }}>
          {[["Privacy", "/privacy"], ["Support", "/support"]].map(([label, href]) => (
            <a key={label} href={href} style={{
              fontSize: 10,
              color: "#8A9BA8",
              textDecoration: "none",
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#0A9E9B"}
            onMouseLeave={e => e.currentTarget.style.color = "#8A9BA8"}
            >{label}</a>
          ))}
        </div>

      </div>
      </div>{/* end warm workspace */}
    </div>
  );
}
