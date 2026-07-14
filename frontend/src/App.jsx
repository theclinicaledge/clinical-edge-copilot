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
  { name: "What this could be",       aliases: ["What this could be"],                                        accent: "var(--ce-teal-deep)", bg: "transparent"  },
  { name: "Possible concerns",        aliases: ["Possible concerns",      "What concerns me most"],           accent: "var(--ce-gold-deep)", bg: "rgba(212,168,75,0.06)"  },
  { name: "What to assess next",      aliases: ["What to assess next",    "What I'd assess next"],            accent: "var(--ce-teal-deep)", bg: "transparent"  },
  { name: "What to consider next",    aliases: ["What to consider next",  "What I'd do right now"],           accent: "var(--ce-teal-deep)", bg: "transparent"  },
  { name: "Where this may be heading",aliases: ["Where this may be heading"],                                 accent: "var(--ce-gold-deep)", bg: "rgba(212,168,75,0.06)"  },
  { name: "Closing",                  aliases: ["Closing"],                                                   accent: "var(--ce-teal)", bg: "rgba(10,191,188,0.04)"  },
];

const SECTION_CONFIG = {};
SECTIONS.forEach((s) => { SECTION_CONFIG[s.name] = s; });

const ALIAS_MAP = {};
SECTIONS.forEach((s) => { s.aliases.forEach((a) => { ALIAS_MAP[a] = s.name; }); });

const URGENCY_STYLES = {
  // color     = text/dot on warm light surface (UrgencyBadge, callouts)
  // darkText  = text/dot on dark card surface (SavedCaseRow)
  HIGH:     { color: "var(--ce-urgency-high)", bg: "var(--ce-urgency-high-bg)", border: "var(--ce-urgency-high-line)", darkText: "var(--ce-urgency-high-dark)" },
  MODERATE: { color: "var(--ce-urgency-mod)",  bg: "var(--ce-urgency-mod-bg)",  border: "var(--ce-urgency-mod-line)",  darkText: "var(--ce-urgency-mod-dark)" },
  LOW:      { color: "var(--ce-urgency-low)",  bg: "var(--ce-urgency-low-bg)",  border: "var(--ce-urgency-low-line)",  darkText: "var(--ce-urgency-low-dark)" },
};

const LS_HISTORY = "clinical_edge_history";
const LS_SAVED   = "clinical_edge_saved_cases";
const LS_MODE    = "clinical_edge_mode";

// Loading state — single static caption (no rotating narration, §4.7)
const LOADING_MESSAGE = "Thinking it through…";

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

function iconBtnStyle() {
  return {
    background: "transparent",
    border: "1px solid var(--ce-line-navy)",
    color: "var(--ce-text-dim)",
    borderRadius: 4,
    padding: "4px 7px",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    lineHeight: 1,
    transition:
      "color var(--ce-dur-fast) var(--ce-ease-out), " +
      "border-color var(--ce-dur-fast) var(--ce-ease-out), " +
      "transform var(--ce-dur-fast) var(--ce-ease-out), " +
      "opacity var(--ce-dur-fast) var(--ce-ease-out)",
  };
}

function smallBtnStyle(bg, color, border) {
  return {
    background: bg,
    color,
    border: border || "none",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    transition:
      "background-color var(--ce-dur-fast) var(--ce-ease-out), " +
      "border-color var(--ce-dur-fast) var(--ce-ease-out), " +
      "color var(--ce-dur-fast) var(--ce-ease-out), " +
      "transform var(--ce-dur-fast) var(--ce-ease-out)",
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
  const cfg = SECTION_CONFIG[title] || { accent: "var(--ce-blue)", bg: "rgba(77,163,255,0.06)" };

  // Closing — italic pull-quote treatment, no label
  if (title === "Closing") {
    return (
      <div className="ce-card-enter" style={{
        borderLeft: "2px solid var(--ce-teal)",
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
          color: "var(--ce-text-muted)",
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
    <div className="ce-card-enter" style={{
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
      <div style={{ fontSize: 14, lineHeight: 1.72, color: "var(--ce-navy-700)" }}>
        {lines.map((line, i) => {
          const isBullet = /^[-\u2022*]\s/.test(line);
          if (isBullet) return (
            <div key={i} style={{ display: "flex", gap: 11, marginBottom: 8, alignItems: "flex-start" }}>
              <span style={{ color: cfg.accent, fontWeight: 700, marginTop: 2, flexShrink: 0, fontSize: 14, lineHeight: 1.72 }}>&rsaquo;</span>
              <span style={{ color: "var(--ce-navy-700)" }}>{renderInline(line.replace(/^[-\u2022*]\s+/, ""))}</span>
            </div>
          );
          return <p key={i} style={{ margin: "0 0 7px", color: "var(--ce-navy-700)" }}>{renderInline(line)}</p>;
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
      borderRadius: 4,
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

function LoadingIndicator() {
  // Sole sanctioned loop (motion-system.md §6/§7): one quiet opacity breathe
  // on the whole indicator. No per-bar pulsing, no progress theater.
  return (
    <div className="ce-breathe" style={{ padding: "32px 0 16px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16 }}>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            width: 3,
            height: 16,
            borderRadius: 3,
            background: "var(--ce-teal)",
            opacity: 0.75,
          }} />
        ))}
      </div>
      <div style={{
        fontSize: 12,
        color: "var(--ce-text-muted)",
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        letterSpacing: "0.3px",
      }}>
        {LOADING_MESSAGE}
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
      color: "var(--ce-text-dim)",
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
        background: "var(--ce-teal)",
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
    <div style={{ background: "var(--ce-navy-700)", border: "1px solid var(--ce-line-navy)", borderRadius: 8, marginBottom: 8, overflow: "hidden" }}>
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
              color: urgStyle ? (urgStyle.darkText || urgStyle.color) : "var(--ce-text-dim)",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}>
              {sc.urgencyLevel || "\u2014"}
            </span>
            <span style={{ fontSize: 9, color: "var(--ce-text-dim)", fontFamily: "'IBM Plex Mono', monospace" }}>&middot;</span>
            <span style={{ fontSize: 9, color: "var(--ce-text-dim)", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {sc.mode === "quick" ? "Quick" : "Clinical"}
            </span>
            <span style={{ fontSize: 9, color: "var(--ce-text-dim)", fontFamily: "'IBM Plex Mono', monospace" }}>&middot;</span>
            <span style={{ fontSize: 9, color: "var(--ce-text-dim)" }}>{formatTimestamp(sc.timestamp)}</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--ce-text-light-body)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: expanded ? "normal" : "nowrap" }}>
            {sc.question}
          </div>
          {sc.note && !editNote && (
            <div style={{ marginTop: 5, fontSize: 12, color: "var(--ce-text-dim)", lineHeight: 1.4 }}>
              Note: {sc.note}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 5, flexShrink: 0, alignItems: "center" }}>
          <button onClick={() => setExpanded(!expanded)} title={expanded ? "Collapse" : "Expand"} className="saved-icon-btn ce-accordion-chevron" data-open={expanded ? "true" : "false"} style={iconBtnStyle()}>{"\u25bc"}</button>
          <button onClick={() => onReopen(sc.question)} title="Reopen in input" className="saved-icon-btn" style={iconBtnStyle()}>&crarr;</button>
          <button onClick={handleCopy} title="Copy response" className="saved-icon-btn" style={iconBtnStyle()}><span key={copied ? "copied" : "copy"} className="ce-swap-fast">{copied ? "\u2713" : "\u2398"}</span></button>
          <button onClick={() => { setEditNote(true); setExpanded(true); }} title="Add/edit note" aria-label="Add or edit note" className="saved-icon-btn" style={iconBtnStyle()}>Note</button>
          <button onClick={() => onDelete(sc.id)} title="Delete case" className="saved-icon-btn saved-icon-btn-delete" style={iconBtnStyle()}>&times;</button>
        </div>
      </div>

      <div className="ce-accordion-panel" data-open={expanded ? "true" : "false"}>
      {editNote ? (
        <div style={{ padding: "0 14px 12px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{
            fontSize: 9,
            color: "var(--ce-text-dim)",
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
              borderRadius: 8,
              padding: "8px 10px",
              color: "var(--ce-text-light-body)",
              fontSize: 13,
              fontFamily: "inherit",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color var(--ce-dur-fast) var(--ce-ease-out)",
            }}
            className="note-textarea"
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={handleNoteSave} className="note-save-btn" style={{ ...smallBtnStyle("var(--ce-teal)", "var(--ce-text-dark)"), fontWeight: 700 }}>Save Note</button>
            <button onClick={() => { setEditNote(false); setNoteText(sc.note || ""); }} className="note-cancel-btn" style={smallBtnStyle("transparent", "var(--ce-text-dim)", "1px solid rgba(255,255,255,0.1)")}>Cancel</button>
          </div>
        </div>
      ) : (
        <div style={{ padding: "0 14px 14px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{
            fontSize: 9,
            color: "var(--ce-text-dim)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1.3px",
            marginTop: 12,
            marginBottom: 8,
            fontFamily: "'IBM Plex Mono', monospace",
          }}>Saved Response</div>
          <div style={{
            fontSize: 12,
            color: "var(--ce-text-dim)",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            maxHeight: 260,
            overflowY: "auto",
            padding: "10px 12px",
            background: "rgba(0,0,0,0.2)",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.07)",
          }}>
            {sc.rawText}
          </div>
        </div>
      )}
      </div>
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
    trackEvent('saved_case_created', { source: 'copilot', has_note: false });
    setJustSaved(true);
  }, [result, rawText, question, mode, savedCases]);

  const handleDeleteCase = useCallback((id) => {
    const updated = savedCases.filter((sc) => sc.id !== id);
    setSavedCases(updated);
    lsSet(LS_SAVED, updated);
    trackEvent('saved_case_deleted', { source: 'saved_cases' });
  }, [savedCases]);

  const handleSaveNote = useCallback((id, note) => {
    const updated = savedCases.map((sc) => sc.id === id ? { ...sc, note } : sc);
    setSavedCases(updated);
    lsSet(LS_SAVED, updated);
    trackEvent('saved_case_note_edited', { has_note: Boolean(note) });
  }, [savedCases]);

  const handleCopyResponse = useCallback((text, source = 'copilot') => {
    try { navigator.clipboard.writeText(text); } catch {}
    trackEvent('copilot_response_copied', { copy_scope: 'full_response', source });
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
        trackEvent('sbar_generation_failed', { error_type: 'request_failed' });
      } else {
        setSbar(data.sbar);
        trackEvent('sbar_generated', { source: 'copilot' });
      }
    } catch {
      setSbar({ error: "Network error. Please try again." });
      trackEvent('sbar_generation_failed', { error_type: 'request_failed' });
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
    trackEvent('sbar_copied', { source: 'copilot', copy_scope: 'full_sbar' });
    setSbarCopied(true);
    setTimeout(() => setSbarCopied(false), 2000);
  }, []);

  const handleReopenCase = useCallback((q) => {
    trackEvent('saved_case_reopened', { source: 'saved_cases' });
    setQuestion(q);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const isActive = loading || streaming;

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--ce-navy-900)",
      color: "var(--ce-text-light-body)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: "0 0 calc(80px + env(safe-area-inset-bottom))",
    }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; background: var(--ce-navy-900); -webkit-font-smoothing: antialiased; overscroll-behavior: none; -webkit-text-size-adjust: 100%; }
        textarea { outline: none; touch-action: pan-y; }
        textarea::placeholder { color: var(--ce-text-light-sec); }
        button {
          transition:
            background-color var(--ce-dur-fast) var(--ce-ease-out),
            border-color      var(--ce-dur-fast) var(--ce-ease-out),
            color             var(--ce-dur-fast) var(--ce-ease-out),
            box-shadow        var(--ce-dur-fast) var(--ce-ease-out),
            transform         var(--ce-dur-fast) var(--ce-ease-out),
            opacity           var(--ce-dur-fast) var(--ce-ease-out);
          font-family: inherit;
          cursor: pointer;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--ce-line-navy); border-radius: 2px; }
        .preview-scroll::-webkit-scrollbar { display: none; }

        /* Save/copy confirmation glyph swaps — single fast fade-in (motion-system.md §6) */
        .ce-swap-fast { animation: ce-fade-in var(--ce-dur-fast) var(--ce-ease-out) both; }

        .chip:hover {
          background: rgba(10,191,188,0.07) !important;
          border-color: rgba(10,191,188,0.22) !important;
        }
        .chip:active {
          transform: scale(0.97);
          opacity: 0.85;
          transition-duration: 60ms !important;
        }
        .submit-btn:hover:not(:disabled) {
          background: var(--ce-teal) !important;
          transform: translateY(-1px);
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
          transition-duration: 60ms !important;
        }
        .save-case-btn:hover:not(:disabled) {
          background: rgba(10,191,188,0.16) !important;
          border-color: rgba(10,191,188,0.30) !important;
          color: var(--ce-teal-deep) !important;
        }
        .save-case-btn:active:not(:disabled) {
          transform: scale(0.98);
          transition-duration: 60ms !important;
        }
        .copy-btn:hover {
          border-color: rgba(0,0,0,0.15) !important;
          color: var(--ce-text-muted) !important;
        }
        .copy-btn:active {
          transform: scale(0.98);
          transition-duration: 60ms !important;
        }
        .sources-btn:hover {
          border-color: rgba(10,191,188,0.28) !important;
          background: rgba(10,191,188,0.05) !important;
        }
        .sources-btn:active {
          transform: scale(0.98);
          transition-duration: 60ms !important;
        }
        .sbar-trigger-btn:hover:not(:disabled) {
          border-color: rgba(10,191,188,0.32) !important;
          background: rgba(10,191,188,0.11) !important;
        }
        .sbar-trigger-btn:active:not(:disabled) {
          transform: scale(0.98);
          transition-duration: 60ms !important;
        }
        .sbar-copy-btn:hover {
          border-color: rgba(10,191,188,0.34) !important;
          color: var(--ce-teal) !important;
        }
        .sbar-copy-btn:active {
          transform: scale(0.98);
          transition-duration: 60ms !important;
        }
        .send-update-btn:hover:not(:disabled) {
          border-color: rgba(10,191,188,0.42) !important;
          background: rgba(10,191,188,0.14) !important;
        }
        .send-update-btn:active:not(:disabled) {
          transform: scale(0.98);
          transition-duration: 60ms !important;
        }
        .note-save-btn:hover {
          background: var(--ce-teal-deep) !important;
          transform: translateY(-1px);
        }
        .note-save-btn:active {
          transform: translateY(0) scale(0.98);
          transition-duration: 60ms !important;
        }
        .note-cancel-btn:hover {
          border-color: rgba(10,191,188,0.30) !important;
          color: var(--ce-teal) !important;
        }
        .note-cancel-btn:active {
          transform: scale(0.98);
          transition-duration: 60ms !important;
        }
        .note-textarea:focus { border-color: var(--ce-teal) !important; }
        .followup-textarea { transition: border-bottom-color var(--ce-dur-fast) var(--ce-ease-out); }
        .followup-textarea:focus { border-bottom-color: var(--ce-teal) !important; }
        .saved-icon-btn:hover {
          color: var(--ce-teal) !important;
          border-color: rgba(10,191,188,0.22) !important;
        }
        .saved-icon-btn:active {
          transform: scale(0.97);
          opacity: 0.85;
          transition-duration: 60ms !important;
        }
        .saved-icon-btn-delete:hover {
          color: var(--ce-urgency-high-dark) !important;
          border-color: rgba(244,164,164,0.22) !important;
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
            fill="var(--ce-teal)"
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
              color: "var(--ce-text-light)",
              letterSpacing: "-0.3px",
              lineHeight: 1.15,
            }}>
              Clinical Edge
            </span>
            <span style={{
              fontSize: 10,
              fontWeight: 500,
              color: "var(--ce-text-dim)",
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
      <div className="ce-page-enter" style={{ background: "var(--ce-warm-bg)", minHeight: "100vh" }}>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <div className="main-container" style={{ maxWidth: 800, margin: "0 auto", width: "100%", padding: "40px 20px 0", display: "flex", flexDirection: "column", alignItems: "stretch" }}>

        {/* Hero */}
        <div className="hero" style={{ marginBottom: 18 }}>
          <h2 style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(20px, 4.5vw, 26px)",
            color: "var(--ce-text-dark)",
            margin: "0 0 6px",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
          }}>
            What are you thinking through?
          </h2>
          <p style={{ fontSize: 13, color: "var(--ce-text-dim)", margin: 0, lineHeight: 1.5, fontWeight: 400 }}>
            Ask a clinical reasoning question. No patient identifiers.
          </p>
        </div>

        {/* Offline notice — shown only when network is unavailable */}
        {!isOnline && (
          <div style={{
            background: "rgba(77,163,255,0.06)",
            border: "1px solid rgba(77,163,255,0.22)",
            borderLeft: "3px solid var(--ce-blue)",
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
              color: "var(--ce-blue)",
              flexShrink: 0,
              marginTop: 1,
            }}>OFFLINE</span>
            <span style={{ fontSize: 13, color: "var(--ce-text-muted)", lineHeight: 1.55 }}>
              Copilot requires internet. <strong style={{ color: "var(--ce-blue)", fontWeight: 600 }}>Rhythm Lab</strong> and <strong style={{ color: "var(--ce-blue)", fontWeight: 600 }}>ICU Drips</strong> are available offline once loaded.
            </span>
          </div>
        )}

        {/* Input card */}
        <div className="input-card" style={{
          background: "var(--ce-navy-700)",
          border: inputFocused
            ? "1px solid var(--ce-teal)"
            : "1px solid rgba(240,237,230,0.10)",
          borderRadius: 8,
          padding: "14px 16px 12px",
          boxShadow: inputFocused
            ? "0 0 0 3px rgba(10,191,188,0.12), 0 6px 18px rgba(0,0,0,0.18)"
            : "0 6px 18px rgba(0,0,0,0.18)",
          marginBottom: 10,
          transition: "border-color var(--ce-dur-fast) var(--ce-ease-out), box-shadow var(--ce-dur-fast) var(--ce-ease-out)",
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
              color: "var(--ce-text-light)",
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
                background: (!question.trim() || isActive || !isOnline) ? "rgba(10,191,188,0.08)" : "var(--ce-teal)",
                color: (!question.trim() || isActive || !isOnline) ? "var(--ce-text-light-sec)" : "var(--ce-text-dark)",
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
                transition:
                  "background-color var(--ce-dur-fast) var(--ce-ease-out), " +
                  "color var(--ce-dur-fast) var(--ce-ease-out), " +
                  "transform var(--ce-dur-fast) var(--ce-ease-out)",
              }}
            >
              {isActive ? <span className="ce-breathe">Analyzing...</span> : "Ask Copilot"}
            </button>
          </div>
        </div>

        {/* PHI note — muted inline */}
        <div style={{
          fontSize: 11,
          color: "var(--ce-text-dim)",
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
            color: "var(--ce-text-dim)",
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
                  border: "1px solid var(--ce-warm-line)",
                  color: "var(--ce-text-muted)",
                  borderRadius: 4,
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
              color: "var(--ce-text-dim)",
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
                    color: "var(--ce-text-muted)",
                    padding: "7px 11px",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 400,
                    letterSpacing: "-0.01em",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    textAlign: "left",
                    lineHeight: 1.4,
                    transition:
                      "background-color var(--ce-dur-fast) var(--ce-ease-out), " +
                      "border-color var(--ce-dur-fast) var(--ce-ease-out), " +
                      "transform var(--ce-dur-fast) var(--ce-ease-out), " +
                      "opacity var(--ce-dur-fast) var(--ce-ease-out)",
                    width: "100%",
                    overflow: "hidden",
                  }}
                >
                  <span style={{ color: "var(--ce-text-dim)", fontSize: 8, flexShrink: 0, marginTop: 3 }}>↩</span>
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
                color: "var(--ce-text-muted)",
                fontFamily: "'IBM Plex Mono', monospace",
              }}>
                Saved Cases <span style={{ color: "rgba(82,97,116,0.55)", fontWeight: 400 }}>({savedCases.length})</span>
              </div>
            </div>
            {savedCases.map((sc) => (
              <SavedCaseRow key={sc.id} sc={sc} onReopen={handleReopenCase} onDelete={handleDeleteCase} onCopy={(text) => handleCopyResponse(text, 'saved_cases')} onSaveNote={handleSaveNote} />
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
            color: "var(--ce-text-dim)",
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
                  color: "var(--ce-text-muted)",
                  padding: "7px 11px",
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 400,
                  letterSpacing: "-0.01em",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  textAlign: "left",
                  lineHeight: 1.4,
                  transition:
                    "background-color var(--ce-dur-fast) var(--ce-ease-out), " +
                    "border-color var(--ce-dur-fast) var(--ce-ease-out), " +
                    "transform var(--ce-dur-fast) var(--ce-ease-out), " +
                    "opacity var(--ce-dur-fast) var(--ce-ease-out)",
                  width: "100%",
                }}
              >
                <span style={{ color: "var(--ce-text-dim)", fontSize: 8, flexShrink: 0 }}>▶</span>
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="ce-section-enter" style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            background: "rgba(190,70,70,0.06)",
            border: "1px solid rgba(190,70,70,0.22)",
            borderLeft: "3px solid var(--ce-urgency-high)",
            borderRadius: 8,
            padding: "12px 15px",
            color: "var(--ce-urgency-high)",
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
            <LoadingIndicator />
          </div>
        )}

        {/* Streaming preview */}
        {streaming && streamBuffer && (
          <div ref={outputRef}>
            <LoadingIndicator />
            <StreamPreview text={streamBuffer} />
          </div>
        )}

        {/* Final structured result */}
        {result && !streaming && (
          <div ref={outputRef}>

            {/* Response trust cue */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "0 2px 14px",
              fontSize: 11,
              color: "var(--ce-text-muted)",
              fontFamily: "'IBM Plex Mono', monospace",
              lineHeight: 1.5,
              borderBottom: "1px solid rgba(0,0,0,0.07)",
              marginBottom: 16,
            }}>
              <span style={{ color: "var(--ce-text-muted)", flexShrink: 0, fontSize: 9 }}>◆</span>
              <span>Structured clinical reasoning support — confirm with your assessment and provider guidance</span>
            </div>

            <UrgencyBadge level={result.urgencyLevel} />

            {result.urgent && (
              <div style={{
                background: "rgba(190,70,70,0.08)",
                border: "1px solid rgba(190,70,70,0.22)",
                borderLeft: "3px solid var(--ce-urgency-high-line)",
                borderRadius: 8,
                padding: "14px 18px",
                color: "var(--ce-urgency-high)",
                fontWeight: 600,
                fontSize: 14,
                lineHeight: 1.65,
                marginBottom: 14,
              }}>
                {renderInline(result.urgent)}
              </div>
            )}

            <div className="ce-stagger-children">
              {result.sections.map((s) => (
                <SectionCard key={s.title} title={s.title} content={s.content} />
              ))}
            </div>

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
                  background: justSaved ? "rgba(10,191,188,0.10)" : "rgba(10,191,188,0.04)",
                  border: "1px solid " + (justSaved ? "rgba(10,191,188,0.30)" : "rgba(10,191,188,0.22)"),
                  color: "var(--ce-teal-deep)",
                  borderRadius: 8,
                  padding: "9px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: justSaved ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  transition:
                    "background-color var(--ce-dur-fast) var(--ce-ease-out), " +
                    "border-color var(--ce-dur-fast) var(--ce-ease-out), " +
                    "color var(--ce-dur-fast) var(--ce-ease-out), " +
                    "transform var(--ce-dur-fast) var(--ce-ease-out)",
                  letterSpacing: "-0.1px",
                }}
              >
                <span key={justSaved ? "saved" : "save"} className="ce-swap-fast">{justSaved ? "\u2713 Case Saved" : "+ Save Case"}</span>
              </button>

              {/* Copy — secondary, quieter */}
              <button
                className="copy-btn"
                onClick={() => handleCopyResponse(rawText)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(0,0,0,0.12)",
                  color: "var(--ce-text-muted)",
                  borderRadius: 8,
                  padding: "9px 18px",
                  fontSize: 13,
                  fontWeight: 400,
                  cursor: "pointer",
                  transition:
                    "border-color var(--ce-dur-fast) var(--ce-ease-out), " +
                    "color var(--ce-dur-fast) var(--ce-ease-out), " +
                    "transform var(--ce-dur-fast) var(--ce-ease-out)",
                  letterSpacing: "-0.1px",
                }}
              >
                Copy Response
              </button>

              {/* Sources — regulatory affordance */}
              <button
                className="sources-btn"
                onClick={() => setSourcesOpen(o => !o)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(0,0,0,0.10)",
                  color: "var(--ce-text-muted)",
                  borderRadius: 8,
                  padding: "9px 16px",
                  fontSize: 12.5,
                  fontWeight: 400,
                  cursor: "pointer",
                  transition:
                    "background-color var(--ce-dur-fast) var(--ce-ease-out), " +
                    "border-color var(--ce-dur-fast) var(--ce-ease-out), " +
                    "transform var(--ce-dur-fast) var(--ce-ease-out)",
                  letterSpacing: "-0.1px",
                }}
              >
                Sources
              </button>

              {/* SBAR — tertiary, accent */}
              <button
                className="sbar-trigger-btn"
                onClick={handleSbar}
                disabled={sbarLoading}
                style={{
                  marginLeft: "auto",
                  background: sbar && !sbar.error ? "rgba(10,191,188,0.07)" : "transparent",
                  border: "1px solid " + (sbar && !sbar.error ? "rgba(10,191,188,0.25)" : "rgba(10,191,188,0.14)"),
                  color: sbarLoading ? "rgba(10,191,188,0.35)" : "var(--ce-teal)",
                  borderRadius: 8,
                  padding: "9px 16px",
                  fontSize: 12.5,
                  fontWeight: 500,
                  cursor: sbarLoading ? "default" : "pointer",
                  transition:
                    "background-color var(--ce-dur-fast) var(--ce-ease-out), " +
                    "border-color var(--ce-dur-fast) var(--ce-ease-out), " +
                    "color var(--ce-dur-fast) var(--ce-ease-out), " +
                    "transform var(--ce-dur-fast) var(--ce-ease-out)",
                  letterSpacing: "-0.1px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                {sbarLoading ? (
                  <span className="ce-breathe">Building SBAR…</span>
                ) : (
                  "Turn into SBAR"
                )}
              </button>
            </div>

            {/* ── Sources panel ─────────────────────────────────────────── */}
            {sourcesOpen && (
              <div style={{
                marginTop: 10,
                background: "var(--ce-navy-700)",
                border: "1px solid var(--ce-line-navy)",
                borderRadius: 8,
                padding: "14px 16px",
              }}>
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.2px",
                  color: "var(--ce-text-dim)",
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
                        borderRadius: 8,
                        background: "var(--ce-navy-600)",
                        border: "1px solid var(--ce-line-navy)",
                        color: "var(--ce-teal)",
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
                  borderTop: "1px solid var(--ce-line-navy)",
                  fontSize: 11,
                  color: "var(--ce-text-muted)",
                  lineHeight: 1.5,
                }}>
                  Always follow your local policy, approved references, and clinician judgment.
                </div>
              </div>
            )}

            {/* ── Continue Thinking ─────────────────────────────────────── */}
            <div style={{
              marginTop: 22,
              background: "var(--ce-navy-700)",
              border: "1px solid var(--ce-line-navy)",
              borderRadius: 8,
              padding: "16px 18px",
            }}>
              <div style={{
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1.3px",
                color: "var(--ce-text-dim)",
                marginBottom: 10,
                fontFamily: "'IBM Plex Mono', monospace",
              }}>
                Anything change?
              </div>
              <textarea
                className="followup-textarea"
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
                  color: "var(--ce-text-light)",
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
                  className="send-update-btn"
                  onClick={handleFollowUp}
                  disabled={!followUp.trim()}
                  style={{
                    background: followUp.trim() ? "rgba(10,191,188,0.10)" : "transparent",
                    border: "1px solid " + (followUp.trim() ? "rgba(10,191,188,0.30)" : "rgba(255,255,255,0.10)"),
                    color: followUp.trim() ? "var(--ce-teal)" : "var(--ce-text-dim)",
                    borderRadius: 8,
                    padding: "7px 16px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: followUp.trim() ? "pointer" : "not-allowed",
                    fontFamily: "inherit",
                    transition:
                      "background-color var(--ce-dur-fast) var(--ce-ease-out), " +
                      "border-color var(--ce-dur-fast) var(--ce-ease-out), " +
                      "color var(--ce-dur-fast) var(--ce-ease-out), " +
                      "transform var(--ce-dur-fast) var(--ce-ease-out)",
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
              background: "var(--ce-navy-700)",
              border: "1px solid var(--ce-line-navy)",
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
                  color: "var(--ce-text-dim)",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}>
                  SBAR Handoff Draft
                </div>
                {sbar && !sbar.error && (
                  <button
                    className="sbar-copy-btn"
                    onClick={() => handleCopySbar(sbar)}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(10,191,188,0.18)",
                      color: sbarCopied ? "var(--ce-teal)" : "rgba(10,191,188,0.55)",
                      borderRadius: 8,
                      padding: "4px 11px",
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition:
                        "border-color var(--ce-dur-fast) var(--ce-ease-out), " +
                        "color var(--ce-dur-fast) var(--ce-ease-out), " +
                        "transform var(--ce-dur-fast) var(--ce-ease-out)",
                    }}
                  >
                    <span key={sbarCopied ? "copied" : "copy"} className="ce-swap-fast">{sbarCopied ? "✓ Copied" : "Copy"}</span>
                  </button>
                )}
              </div>

              {sbarLoading && (
                <div style={{ color: "rgba(168,193,204,0.4)", fontSize: 13, padding: "8px 0" }}>
                  Drafting SBAR…
                </div>
              )}

              {sbar && sbar.error && (
                <div style={{ color: "var(--ce-urgency-high-dark)", fontSize: 13 }}>{sbar.error}</div>
              )}

              {sbar && !sbar.error && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { label: "Situation",      value: sbar.situation,      accent: "var(--ce-blue)" },
                    { label: "Background",     value: sbar.background,     accent: "var(--ce-text-light-body)" },
                    { label: "Assessment",     value: sbar.assessment,     accent: "var(--ce-text-dim)" },
                    { label: "Recommendation", value: sbar.recommendation, accent: "var(--ce-text-dim)" },
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
                        color: "var(--ce-text-light-body)",
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
          color: "var(--ce-text-dim)",
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
              color: "var(--ce-text-dim)",
              textDecoration: "none",
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--ce-teal-deep)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--ce-text-dim)"}
            >{label}</a>
          ))}
        </div>

      </div>
      </div>{/* end warm workspace */}
    </div>
  );
}
