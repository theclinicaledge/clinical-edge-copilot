import { useState, useRef, useEffect, useCallback } from "react";

// ─── API Config ───────────────────────────────────────────────────────────────

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? "https://clinical-edge-backend.onrender.com"
    : "http://localhost:3001");

// ─── Constants ────────────────────────────────────────────────────────────────

const EXAMPLES = [
  "BP dropped to 88/50, HR 122, was stable 20 min ago",
  "Patient on HFNC suddenly desatting to 84%",
  "Potassium 2.9, patient on a Lasix drip",
  "Chest tube stopped bubbling and tidaling",
  "Patient suddenly confused, new onset agitation",
  "Heparin drip PTT came back at 140",
];

const STARTER_TEMPLATES = [
  { label: "Rapid deterioration", prompt: "Patient was stable earlier and is now declining: BP down, HR up, concern for acute deterioration" },
  { label: "Abnormal lab",        prompt: "Abnormal lab result: [lab value], patient context: [diagnosis / meds / symptoms]" },
  { label: "Medication / drip",   prompt: "Question about medication or drip: [med/drip], current issue: [lab / vitals / symptoms]" },
  { label: "Respiratory",         prompt: "Respiratory concern: oxygen requirement changed, work of breathing, saturation, device settings" },
  { label: "Neuro change",        prompt: "New neuro change: confusion, lethargy, agitation, speech change, or new focal concern" },
  { label: "Chest tube / device", prompt: "Device concern: chest tube, line, drain, Foley, feeding tube, or monitor issue" },
  { label: "Behavior / agitation",prompt: "Behavior or agitation concern: sudden confusion, restlessness, pulling lines, or change from baseline" },
  { label: "Post-op concern",     prompt: "Post-op concern: pain, sedation, respiratory change, bleeding, vitals, or delayed recovery" },
];

const SECTIONS = [
  { name: "What this could be",   aliases: ["What this could be"],   accent: "#4da3ff", bg: "rgba(77,163,255,0.06)"  },
  { name: "What concerns me most", aliases: ["What concerns me most"], accent: "#e05572", bg: "rgba(224,85,114,0.06)"  },
  { name: "What I'd assess next",  aliases: ["What I'd assess next"],  accent: "#1FBF75", bg: "rgba(31,191,117,0.06)"  },
  { name: "What I'd do right now", aliases: ["What I'd do right now"], accent: "#F2B94B", bg: "rgba(242,185,75,0.06)"  },
  { name: "Closing",               aliases: ["Closing"],               accent: "#00C2D1", bg: "rgba(0,194,209,0.04)"   },
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

  // Closing line — rendered as a plain italic sentence, no label, no bullets
  if (title === "Closing") {
    return (
      <div style={{
        borderLeft: "3px solid " + cfg.accent,
        padding: "12px 18px",
        marginTop: 6,
        marginBottom: 4,
      }}>
        <p style={{
          margin: 0,
          fontSize: 14,
          fontStyle: "italic",
          color: "#7F99A5",
          lineHeight: 1.75,
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
      border: "1px solid " + cfg.accent + "28",
      borderLeft: "3px solid " + cfg.accent,
      borderRadius: 11,
      padding: "16px 18px",
      marginBottom: 10,
    }}>
      <div style={{
        fontSize: 9,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "1.3px",
        color: cfg.accent,
        marginBottom: 10,
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      }}>
        {title}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.75, color: "#A8C1CC" }}>
        {lines.map((line, i) => {
          const isBullet = /^[-\u2022*]\s/.test(line);
          if (isBullet) return (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "flex-start" }}>
              <span style={{ color: cfg.accent, fontWeight: 700, marginTop: 1, flexShrink: 0 }}>&rsaquo;</span>
              <span>{line.replace(/^[-\u2022*]\s+/, "")}</span>
            </div>
          );
          return <p key={i} style={{ margin: "0 0 6px" }}>{line}</p>;
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
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: s.bg,
      border: "1px solid " + s.border,
      borderRadius: 8,
      padding: "8px 14px",
      marginBottom: 14,
    }}>
      <span style={{
        fontSize: 10,
        fontWeight: 700,
        color: s.color,
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        letterSpacing: "1px",
        textTransform: "uppercase",
      }}>
        Urgency: {level}
      </span>
    </div>
  );
}

function LoadingIndicator({ phase }) {
  return (
    <div style={{ padding: "28px 0 12px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 14 }}>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            width: 3,
            borderRadius: 2,
            background: "#00C2D1",
            opacity: 0.6,
            animation: "barPulse 1.2s ease-in-out " + (i * 0.15) + "s infinite",
          }} />
        ))}
      </div>
      <div style={{
        fontSize: 13,
        color: "#7F99A5",
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        letterSpacing: "0.2px",
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
      background: "rgba(0,194,209,0.03)",
      border: "1px solid rgba(0,194,209,0.10)",
      borderRadius: 10,
      padding: "16px 18px",
      marginBottom: 10,
      fontSize: 13,
      color: "#7F99A5",
      lineHeight: 1.8,
      whiteSpace: "pre-wrap",
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      maxHeight: 320,
      overflowY: "auto",
    }}>
      {text}
      <span style={{
        display: "inline-block",
        width: 7,
        height: 13,
        background: "#00C2D1",
        marginLeft: 3,
        verticalAlign: "middle",
        animation: "cursorBlink 1s step-end infinite",
        borderRadius: 1,
        opacity: 0.8,
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
  const [mode, setMode]                 = useState("deep");
  const [history, setHistory]           = useState(() => lsGet(LS_HISTORY, []));
  const [savedCases, setSavedCases]     = useState(() => lsGet(LS_SAVED, []));
  const [justSaved, setJustSaved]       = useState(false);

  const textareaRef   = useRef(null);
  const outputRef     = useRef(null);
  const phaseTimerRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [question]);

  // Load QuickStart prefill on mount
  useEffect(() => {
    try {
      const prefill = localStorage.getItem("copilot_prefill");
      if (prefill) {
        setQuestion(prefill);
        localStorage.removeItem("copilot_prefill");
      }
    } catch {}
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

  const handleSubmit = async () => {
    if (!question.trim() || loading || streaming) return;
    setLoading(true);
    setStreaming(false);
    setError(null);
    setResult(null);
    setRawText("");
    setStreamBuffer("");
    setJustSaved(false);

    let accumulated = "";

    try {
      const res = await fetch(`${API_BASE}/api/copilot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, mode }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Unable to generate clinical guidance. Please try again.");
        setLoading(false);
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
            setError(parsed.error);
            setStreaming(false);
            return;
          }

          if (parsed.done) {
            setStreaming(false);
            setStreamBuffer("");
            setRawText(accumulated);
            const parsedResult = parseResponse(accumulated);
            setResult({ ...parsedResult, urgencyLevel: extractUrgencyLevel(accumulated) });
            const updatedHistory = [question, ...history.filter((h) => h !== question)].slice(0, 8);
            setHistory(updatedHistory);
            lsSet(LS_HISTORY, updatedHistory);
            return;
          }

          if (parsed.text) {
            accumulated += parsed.text;
            setStreamBuffer(accumulated);
          }
        }
      }
    } catch {
      setError("Unable to generate clinical guidance. Please try again.");
      setLoading(false);
      setStreaming(false);
    }
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

  const handleReopenCase = useCallback((q) => {
    setQuestion(q);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const isActive = loading || streaming;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B1F2A",
      color: "#A8C1CC",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: "0 0 80px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; background: #0B1F2A; }
        textarea { outline: none; }
        textarea::placeholder { color: #2E4A5C; }
        button { transition: all 0.15s ease; font-family: inherit; cursor: pointer; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,194,209,0.2); border-radius: 2px; }

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
          0%, 100% { height: 8px; opacity: 0.4; }
          50% { height: 22px; opacity: 1; }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0; }
        }
      `}</style>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "0 20px",
        background: "rgba(11,31,42,0.97)",
        backdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: 680,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          height: 56,
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

          {/* Beta badge */}
          <span style={{
            marginLeft: "auto",
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

        </div>
      </div>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 16px 0" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(22px, 5vw, 30px)",
            color: "#F8FBFC",
            margin: "0 0 10px",
            lineHeight: 1.2,
            letterSpacing: "-0.5px",
          }}>
            Think it through at the bedside.
          </h1>
          <p style={{ fontSize: 14, color: "#7F99A5", margin: 0, lineHeight: 1.6 }}>
            Structured clinical reasoning &mdash; nurse to nurse.
          </p>
        </div>

        {/* Privacy notice */}
        <div style={{
          background: "rgba(242,185,75,0.05)",
          border: "1px solid rgba(242,185,75,0.15)",
          borderLeft: "3px solid rgba(242,185,75,0.4)",
          borderRadius: 8,
          padding: "10px 14px",
          fontSize: 12,
          color: "#A8966A",
          marginBottom: 20,
          display: "flex",
          gap: 9,
          alignItems: "flex-start",
        }}>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color: "#F2B94B",
            flexShrink: 0,
            marginTop: 1,
            letterSpacing: 0,
          }}>&#9888;</span>
          <span>Do not enter patient names, dates of birth, MRNs, or any identifying information. Describe the clinical situation only.</span>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 7, marginBottom: 14 }}>
          {[["deep", "Clinical Reasoning"], ["quick", "Quick Guidance"]].map(([val, label]) => (
            <button
              key={val}
              className={"mode-btn" + (mode === val ? " mode-active" : "")}
              onClick={() => setMode(val)}
              style={{
                padding: "7px 16px",
                borderRadius: 8,
                border: mode === val ? "1px solid rgba(0,194,209,0.45)" : "1px solid rgba(255,255,255,0.09)",
                background: mode === val ? "rgba(0,194,209,0.12)" : "transparent",
                color: mode === val ? "#00C2D1" : "#7F99A5",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                transition: "all 0.15s",
                letterSpacing: "-0.1px",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Input card */}
        <div style={{
          background: "#112936",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 13,
          padding: "20px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
          marginBottom: 16,
        }}>
          <div style={{
            fontSize: 9,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1.3px",
            color: "#7F99A5",
            marginBottom: 10,
            fontFamily: "'IBM Plex Mono', monospace",
          }}>Clinical Situation</div>
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Describe what's happening with the patient..."
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
              {isActive ? <><span className="spinner" />Analyzing...</> : "Generate Clinical Guidance \u2192"}
            </button>
          </div>
        </div>

        {/* Input trust line */}
        <div style={{
          fontSize: 11,
          color: "#3A5566",
          fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: "0.2px",
          marginBottom: 20,
          marginTop: -8,
        }}>
          Built to support your clinical thinking — not replace it
        </div>

        {/* Recent Cases */}
        {history.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "1.3px",
              textTransform: "uppercase",
              color: "#7F99A5",
              marginBottom: 10,
              fontFamily: "'IBM Plex Mono', monospace",
            }}>Recent Cases</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {history.map((item, i) => (
                <button
                  key={i}
                  className="chip"
                  onClick={() => setQuestion(item)}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.09)",
                    color: "#7F99A5",
                    padding: "6px 12px",
                    borderRadius: 100,
                    fontSize: 12,
                    cursor: "pointer",
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
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "1.3px",
                textTransform: "uppercase",
                color: "#7F99A5",
                fontFamily: "'IBM Plex Mono', monospace",
              }}>
                Saved Cases <span style={{ color: "#3A5566", fontWeight: 400 }}>({savedCases.length})</span>
              </div>
            </div>
            {savedCases.map((sc) => (
              <SavedCaseRow key={sc.id} sc={sc} onReopen={handleReopenCase} onDelete={handleDeleteCase} onCopy={handleCopyResponse} onSaveNote={handleSaveNote} />
            ))}
          </div>
        )}

        {/* Example pills */}
        <div style={{ marginBottom: 36 }}>
          <div style={{
            fontSize: 9,
            color: "#7F99A5",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1.3px",
            marginBottom: 10,
            fontFamily: "'IBM Plex Mono', monospace",
          }}>Try an Example</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                className="chip"
                onClick={() => setQuestion(ex)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: "#7F99A5",
                  padding: "6px 12px",
                  borderRadius: 100,
                  fontSize: 12,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
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
              alignItems: "flex-start",
              gap: 8,
              background: "rgba(242,185,75,0.05)",
              border: "1px solid rgba(242,185,75,0.15)",
              borderRadius: 8,
              padding: "9px 13px",
              marginBottom: 14,
              fontSize: 11,
              color: "#7F99A5",
              fontFamily: "'IBM Plex Mono', monospace",
              lineHeight: 1.55,
            }}>
              <span style={{ color: "#F2B94B", flexShrink: 0 }}>⚠️</span>
              <span>Structured clinical reasoning support — always confirm with your assessment and provider guidance</span>
            </div>

            <UrgencyBadge level={result.urgencyLevel} />

            {result.urgent && (
              <div style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderLeft: "3px solid rgba(239,68,68,0.7)",
                borderRadius: 10,
                padding: "14px 18px",
                color: "#fca5a5",
                fontWeight: 600,
                fontSize: 14,
                lineHeight: 1.6,
                marginBottom: 14,
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
                  background: justSaved ? "rgba(31,191,117,0.10)" : "transparent",
                  border: "1px solid " + (justSaved ? "rgba(31,191,117,0.42)" : "rgba(31,191,117,0.28)"),
                  color: justSaved ? "#1FBF75" : "#5aaa8a",
                  borderRadius: 8,
                  padding: "9px 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: justSaved ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  transition: "all 0.15s",
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
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: "#4A6978",
                  borderRadius: 8,
                  padding: "9px 18px",
                  fontSize: 13,
                  fontWeight: 400,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                Copy Response
              </button>
            </div>

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

      </div>
    </div>
  );
}
