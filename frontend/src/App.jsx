import { useState, useRef, useEffect, useCallback } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────

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
  { name: "Most Likely Issue",              aliases: ["Most Likely Issue"],                                    accent: "#f43f5e", bg: "rgba(244,63,94,0.06)"   },
  { name: "Urgency Summary",                aliases: ["Urgency Summary"],                                      accent: "#e879f9", bg: "rgba(232,121,249,0.06)" },
  { name: "Clinical Pattern Recognition",   aliases: ["Clinical Pattern Recognition"],                         accent: "#3b82f6", bg: "rgba(59,130,246,0.06)"  },
  { name: "Immediate Nursing Assessments",  aliases: ["Immediate Nursing Assessments"],                        accent: "#10b981", bg: "rgba(16,185,129,0.06)"  },
  { name: "Possible Clinical Causes",       aliases: ["Possible Clinical Causes", "Possible Causes"],          accent: "#f59e0b", bg: "rgba(245,158,11,0.06)"  },
  { name: "Common Nursing Actions",         aliases: ["Common Nursing Actions"],                               accent: "#6366f1", bg: "rgba(99,102,241,0.06)"  },
  { name: "Notify Provider / Escalate If",  aliases: ["Notify Provider / Escalate If", "Notify Provider If"], accent: "#f97316", bg: "rgba(249,115,22,0.06)"  },
  { name: "Clinical Insight",               aliases: ["Clinical Insight"],                                     accent: "#06b6d4", bg: "rgba(6,182,212,0.06)"   },
  { name: "Safety Note",                    aliases: ["Safety Note"],                                          accent: "#64748b", bg: "rgba(100,116,139,0.06)" },
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

const LS_HISTORY    = "clinical_edge_history";
const LS_SAVED      = "clinical_edge_saved_cases";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  const urgentMatch = rawText.match(/⚠️[^\n]+(\n[^\n*]+)*/);
  if (urgentMatch) urgent = urgentMatch[0].trim();

  const allAliases = Object.keys(ALIAS_MAP);
  const escapedAliases = allAliases.map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const headerPattern = new RegExp(`\\*\\*(${escapedAliases.join("|")})\\*\\*`, "g");

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
    " · " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionCard({ title, content }) {
  const cfg = SECTION_CONFIG[title] || { accent: "#3b82f6", bg: "rgba(59,130,246,0.06)" };
  const lines = content.split("\n").filter((l) => l.trim());
  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.accent}28`, borderLeft: `3px solid ${cfg.accent}`, borderRadius: "10px", padding: "16px 18px", marginBottom: "10px" }}>
      <div style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.2px", color: cfg.accent, marginBottom: "10px", fontFamily: "'DM Mono', monospace" }}>
        {title}
      </div>
      <div style={{ fontSize: "14px", lineHeight: "1.75", color: "#c8d8ec" }}>
        {lines.map((line, i) => {
          const isBullet = /^[-•*]\s/.test(line);
          if (isBullet) return (
            <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "6px", alignItems: "flex-start" }}>
              <span style={{ color: cfg.accent, fontWeight: "700", marginTop: "1px", flexShrink: 0 }}>›</span>
              <span>{line.replace(/^[-•*]\s+/, "")}</span>
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
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, padding: "8px 14px", marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: s.color, fontFamily: "'DM Mono', monospace", letterSpacing: "1px" }}>
        URGENCY: {level}
      </span>
    </div>
  );
}

// SavedCaseRow — one row in the Saved Cases panel
function SavedCaseRow({ sc, onReopen, onDelete, onCopy, onSaveNote }) {
  const [expanded, setExpanded]   = useState(false);
  const [editNote, setEditNote]   = useState(false);
  const [noteText, setNoteText]   = useState(sc.note || "");
  const [copied, setCopied]       = useState(false);
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
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(59,130,246,0.14)", borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
      {/* Row header */}
      <div style={{ padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
        {/* Left: urgency dot + question */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4, flexWrap: "wrap" }}>
            {urgStyle && (
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: urgStyle.color, flexShrink: 0, display: "inline-block" }} />
            )}
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: urgStyle ? urgStyle.color : "#5a8ab0", textTransform: "uppercase", letterSpacing: "0.8px" }}>
              {sc.urgencyLevel || "—"}
            </span>
            <span style={{ fontSize: 10, color: "#2a4a6a", fontFamily: "'DM Mono', monospace" }}>·</span>
            <span style={{ fontSize: 10, color: "#3a6090", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.6px" }}>
              {sc.mode === "quick" ? "Quick" : "Clinical"}
            </span>
            <span style={{ fontSize: 10, color: "#2a4a6a", fontFamily: "'DM Mono', monospace" }}>·</span>
            <span style={{ fontSize: 10, color: "#2a4a6a" }}>{formatTimestamp(sc.timestamp)}</span>
          </div>
          <div style={{ fontSize: 13, color: "#9ab8d8", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: expanded ? "normal" : "nowrap" }}>
            {sc.question}
          </div>
          {sc.note && !editNote && (
            <div style={{ marginTop: 6, fontSize: 12, color: "#4a7aaa", fontStyle: "italic", lineHeight: 1.4 }}>
              📝 {sc.note}
            </div>
          )}
        </div>
        {/* Right: action buttons */}
        <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
          <button onClick={() => setExpanded(!expanded)} title={expanded ? "Collapse" : "Expand"} style={iconBtnStyle("#3a6090")}>
            {expanded ? "▲" : "▼"}
          </button>
          <button onClick={() => onReopen(sc.question)} title="Reopen in input" style={iconBtnStyle("#3b82f6")}>↩</button>
          <button onClick={handleCopy} title="Copy response" style={iconBtnStyle(copied ? "#10b981" : "#3b82f6")}>
            {copied ? "✓" : "⎘"}
          </button>
          <button onClick={() => { setEditNote(true); setExpanded(true); }} title="Add/edit note" style={iconBtnStyle("#f59e0b")}>✎</button>
          <button onClick={() => onDelete(sc.id)} title="Delete case" style={iconBtnStyle("#f43f5e")}>✕</button>
        </div>
      </div>

      {/* Expanded: note editor */}
      {expanded && editNote && (
        <div style={{ padding: "0 14px 12px", borderTop: "1px solid rgba(59,130,246,0.08)" }}>
          <div style={{ fontSize: 10, color: "#3a6090", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6, marginTop: 10, fontFamily: "'DM Mono', monospace" }}>
            Personal Note
          </div>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a short note about this case..."
            rows={2}
            style={{ width: "100%", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 7, padding: "8px 10px", color: "#c8d8ec", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={handleNoteSave} style={{ ...smallBtnStyle("#1d4ed8", "#ffffff"), fontWeight: 600 }}>Save Note</button>
            <button onClick={() => { setEditNote(false); setNoteText(sc.note || ""); }} style={smallBtnStyle("transparent", "#5a8ab0", "1px solid rgba(59,130,246,0.3)")}>Cancel</button>
          </div>
        </div>
      )}

      {/* Expanded: response preview */}
      {expanded && !editNote && (
        <div style={{ padding: "0 14px 14px", borderTop: "1px solid rgba(59,130,246,0.08)" }}>
          <div style={{ fontSize: 10, color: "#3a6090", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginTop: 12, marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>
            Saved Response
          </div>
          <div style={{ fontSize: 12, color: "#6a8aaa", lineHeight: 1.7, whiteSpace: "pre-wrap", maxHeight: 260, overflowY: "auto", padding: "10px 12px", background: "rgba(0,0,0,0.2)", borderRadius: 7, border: "1px solid rgba(59,130,246,0.08)" }}>
            {sc.rawText}
          </div>
        </div>
      )}
    </div>
  );
}

// tiny style helpers so JSX stays readable
function iconBtnStyle(color) {
  return {
    background: "transparent", border: `1px solid ${color}40`,
    color, borderRadius: 6, padding: "4px 7px",
    fontSize: 13, cursor: "pointer", fontFamily: "inherit", lineHeight: 1,
    transition: "all 0.15s",
  };
}
function smallBtnStyle(bg, color, border = "none") {
  return {
    background: bg, color, border, borderRadius: 7,
    padding: "6px 14px", fontSize: 12, fontWeight: 500,
    cursor: "pointer", fontFamily: "inherit",
  };
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [question, setQuestion]     = useState("");
  const [result, setResult]         = useState(null);
  const [rawText, setRawText]       = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [mode, setMode]             = useState("deep");
  const [history, setHistory]       = useState(() => lsGet(LS_HISTORY, []));
  const [savedCases, setSavedCases] = useState(() => lsGet(LS_SAVED, []));
  const [justSaved, setJustSaved]   = useState(false);

  const textareaRef = useRef(null);
  const outputRef   = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [question]);

  const handleSubmit = async () => {
    if (!question.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setRawText("");
    setJustSaved(false);

    try {
      const res = await fetch("http://localhost:3001/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, mode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }

      // Update recent history (deduplicated)
      const updatedHistory = [question, ...history.filter((h) => h !== question)].slice(0, 8);
      setHistory(updatedHistory);
      lsSet(LS_HISTORY, updatedHistory);

      const parsed = parseResponse(data.response);
      setRawText(data.response);
      setResult({ ...parsed, urgencyLevel: extractUrgencyLevel(data.response) });
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch {
      setError("Cannot reach the server. Make sure the backend is running on port 3001.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  // ── Saved Cases actions ──
  const handleSaveCase = useCallback(() => {
    if (!result || !rawText) return;
    // Avoid duplicate: same question + same rawText
    const isDup = savedCases.some((sc) => sc.question === question && sc.rawText === rawText);
    if (isDup) { setJustSaved(true); return; }

    const newCase = {
      id: generateId(),
      question,
      mode,
      rawText,
      urgencyLevel: result.urgencyLevel || null,
      timestamp: Date.now(),
      note: "",
    };
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

  const urgencyStyle = result?.urgencyLevel ? URGENCY_STYLES[result.urgencyLevel] : null;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #060d1a 0%, #080f1e 50%, #060c18 100%)", color: "#c8d8ec", fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif", padding: "0 0 80px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        textarea { outline: none; }
        textarea::placeholder { color: #2d4a6a; }
        button { transition: all 0.15s ease; }
        .pill:hover { background: #1a3a6a !important; border-color: #2a5aaa !important; cursor: pointer; }
        .starter-btn:hover { background: rgba(59,130,246,0.14) !important; border-color: rgba(59,130,246,0.35) !important; }
        .history-btn:hover { background: rgba(59,130,246,0.12) !important; }
        .save-case-btn:hover:not(:disabled) { background: rgba(16,185,129,0.18) !important; border-color: rgba(16,185,129,0.5) !important; }
        .submit-btn:hover:not(:disabled) { background: linear-gradient(135deg, #2563eb, #1d4ed8) !important; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(37,99,235,0.35) !important; }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .icon-btn:hover { opacity: 0.85; background: rgba(59,130,246,0.08) !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .spinner { width: 18px; height: 18px; border: 2px solid #1e3a6a; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ borderBottom: "1px solid rgba(59,130,246,0.12)", padding: "18px 20px", background: "rgba(6,13,26,0.9)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg, #1d4ed8, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, boxShadow: "0 0 16px rgba(59,130,246,0.3)" }}>⚕</div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: "#e8f2ff", letterSpacing: "-0.3px", lineHeight: 1.1 }}>Clinical Edge Copilot</div>
            <div style={{ fontSize: 11, color: "#3a6090", fontWeight: 500, letterSpacing: "0.4px" }}>AI clinical reasoning support for bedside nurses</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: "#22c55e", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", padding: "3px 8px", borderRadius: 20, letterSpacing: "0.8px" }}>BETA</div>
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 16px 0" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(22px, 5vw, 30px)", color: "#e8f2ff", margin: "0 0 10px", lineHeight: 1.2, letterSpacing: "-0.5px" }}>
            Think it through at the bedside.
          </h1>
          <p style={{ fontSize: 14, color: "#4a7aaa", margin: 0, lineHeight: 1.6 }}>Structured clinical reasoning — nurse to nurse.</p>
        </div>

        {/* Privacy notice */}
        <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92724a", marginBottom: 18, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span style={{ flexShrink: 0 }}>🔒</span>
          <span>Do not enter patient names, dates of birth, MRNs, or any identifying information. Describe the clinical situation only.</span>
        </div>

        {/* Common Clinical Scenarios */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: "#2a4a6a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10, fontFamily: "'DM Mono', monospace" }}>
            Common Clinical Scenarios
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {STARTER_TEMPLATES.map((item) => (
              <button key={item.label} className="starter-btn" onClick={() => setQuestion(item.prompt)} style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.18)", color: "#5a8ab0", padding: "10px 14px", borderRadius: 20, fontSize: 12, fontFamily: "inherit", cursor: "pointer", textAlign: "left" }}>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[["deep", "Clinical Reasoning"], ["quick", "Quick Guidance"]].map(([val, label]) => (
            <button key={val} onClick={() => setMode(val)} style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(59,130,246,0.5)", background: mode === val ? "#1d4ed8" : "transparent", color: mode === val ? "#ffffff" : "#3b82f6", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", transition: "background 0.15s, color 0.15s" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Input card */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(59,130,246,0.18)", borderRadius: 14, padding: "20px", boxShadow: "0 4px 32px rgba(0,0,0,0.3)", marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#3a6090", marginBottom: 10, fontFamily: "'DM Mono', monospace" }}>Clinical Situation</label>
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Describe what's happening with the patient..."
            rows={3}
            style={{ width: "100%", background: "transparent", border: "none", color: "#d4e8ff", fontSize: 15, lineHeight: 1.65, resize: "none", fontFamily: "inherit", minHeight: 72 }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(59,130,246,0.1)" }}>
            <span style={{ fontSize: 11, color: "#1e3a5a" }}>⌘ + Enter to submit</span>
            <button className="submit-btn" onClick={handleSubmit} disabled={!question.trim() || loading} style={{ background: (!question.trim() || loading) ? "rgba(59,130,246,0.15)" : "linear-gradient(135deg, #1d4ed8, #3b82f6)", color: (!question.trim() || loading) ? "#2a5080" : "#ffffff", border: "none", borderRadius: 8, padding: "11px 22px", fontSize: 14, fontWeight: 600, cursor: (!question.trim() || loading) ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8, boxShadow: (!question.trim() || loading) ? "none" : "0 4px 16px rgba(37,99,235,0.25)" }}>
              {loading ? <><span className="spinner" />Analyzing...</> : "Generate Clinical Guidance →"}
            </button>
          </div>
        </div>

        {/* Recent Cases */}
        {history.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#3a6090", marginBottom: 10, fontFamily: "'DM Mono', monospace" }}>Recent Cases</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {history.map((item, i) => (
                <button key={i} className="history-btn" onClick={() => setQuestion(item)} style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.18)", color: "#5a8ab0", padding: "8px 12px", borderRadius: 20, fontSize: 12, fontFamily: "inherit", cursor: "pointer", maxWidth: "260px", textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Saved Cases ── */}
        {savedCases.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#3a6090", fontFamily: "'DM Mono', monospace" }}>
                Saved Cases <span style={{ color: "#2a4a6a", fontWeight: 400 }}>({savedCases.length})</span>
              </div>
            </div>
            {savedCases.map((sc) => (
              <SavedCaseRow
                key={sc.id}
                sc={sc}
                onReopen={handleReopenCase}
                onDelete={handleDeleteCase}
                onCopy={handleCopyResponse}
                onSaveNote={handleSaveNote}
              />
            ))}
          </div>
        )}

        {/* Example pills */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 10, color: "#2a4a6a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10, fontFamily: "'DM Mono', monospace" }}>Try an example</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {EXAMPLES.map((ex) => (
              <button key={ex} className="pill" onClick={() => setQuestion(ex)} style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.18)", color: "#5a8ab0", padding: "7px 13px", borderRadius: 20, fontSize: 12, fontFamily: "inherit", cursor: "pointer", textAlign: "left" }}>{ex}</button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="fade-up" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "14px 16px", color: "#f87171", fontSize: 14, marginBottom: 24 }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Response ── */}
        {result && (
          <div ref={outputRef} className="fade-up">

            <UrgencyBadge level={result.urgencyLevel} />

            {result.urgent && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.5)", borderRadius: 10, padding: "16px 18px", color: "#fca5a5", fontWeight: 600, fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>
                {result.urgent}
              </div>
            )}

            {result.sections.map((s) => (
              <SectionCard key={s.title} title={s.title} content={s.content} />
            ))}

            {/* Save Case action bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(59,130,246,0.08)", flexWrap: "wrap" }}>
              <button
                className="save-case-btn"
                onClick={handleSaveCase}
                disabled={justSaved}
                style={{ background: justSaved ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.08)", border: `1px solid ${justSaved ? "rgba(16,185,129,0.4)" : "rgba(16,185,129,0.25)"}`, color: justSaved ? "#10b981" : "#5aaa8a", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: justSaved ? "default" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7 }}>
                {justSaved ? "✓ Case Saved" : "＋ Save Case"}
              </button>
              <button
                onClick={() => handleCopyResponse(rawText)}
                style={{ background: "transparent", border: "1px solid rgba(59,130,246,0.2)", color: "#4a7aaa", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                Copy Response
              </button>
            </div>

          </div>
        )}

        {/* Disclaimer */}
        <div style={{ marginTop: 48, padding: "14px 16px", borderTop: "1px solid rgba(59,130,246,0.08)", fontSize: 11, color: "#1e3a5a", textAlign: "center", lineHeight: 1.7 }}>
          Clinical Edge Copilot provides clinical reasoning support and nursing education only.<br />
          It does not replace institutional protocols, provider orders, or your clinical judgment.<br />
          Always escalate per your facility's policies.
        </div>

      </div>
    </div>
  );
}
