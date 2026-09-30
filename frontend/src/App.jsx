import { useState, useRef, useEffect, useCallback } from "react";
import { trackEvent } from "./analytics";
import ModuleHeader from "./components/ModuleHeader.jsx";
import PatientSnapshot, { SubmittedSnapshotSummary } from "./components/PatientSnapshot.jsx";
import PriorityMap from "./components/PriorityMap.jsx";
import { parsePriorities } from "./components/priorityMapModel";

// ─── API Config ───────────────────────────────────────────────────────────────

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? "https://clinical-edge-backend.onrender.com"
    : "http://localhost:3001");

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTIONS = [
  { name: "Priorities",            aliases: ["Priorities", "What stands out", "What this could be"], accent: "var(--ce-teal-deep)" },
  { name: "Assess first",          aliases: ["Assess first", "What to assess next", "What I'd assess next"], accent: "var(--ce-teal-deep)" },
  { name: "Possible patterns",     aliases: ["Possible patterns", "Possible concerns", "What concerns me most"], accent: "var(--ce-gold-deep)" },
  { name: "Missing information",   aliases: ["Missing information"],   accent: "var(--ce-text-muted)" },
  { name: "Monitor and trend",     aliases: ["Monitor and trend", "What to consider next", "What I'd do right now", "Where this may be heading"], accent: "var(--ce-teal-deep)" },
  { name: "Escalation triggers",   aliases: ["Escalation triggers"],   accent: "var(--ce-urgency-mod)" },
  { name: "SBAR-ready summary",    aliases: ["SBAR-ready summary"],    accent: "var(--ce-blue)" },
  { name: "Teach me why",          aliases: ["Teach me why", "Closing"], accent: "var(--ce-gold-deep)" },
];

const ALIAS_MAP = {};
SECTIONS.forEach((s) => { s.aliases.forEach((a) => { ALIAS_MAP[a] = s.name; }); });

const URGENCY_STYLES = {
  // color     = text/dot on warm light surface (UrgencyBadge, callouts)
  // darkText  = text/dot on dark card surface (SavedCaseRow)
  HIGH:     { color: "var(--ce-urgency-high)", bg: "var(--ce-urgency-high-bg)", border: "var(--ce-urgency-high-line)", darkText: "var(--ce-urgency-high-dark)" },
  MODERATE: { color: "var(--ce-urgency-mod)",  bg: "var(--ce-urgency-mod-bg)",  border: "var(--ce-urgency-mod-line)",  darkText: "var(--ce-urgency-mod-dark)" },
  LOW:      { color: "var(--ce-urgency-low)",  bg: "var(--ce-urgency-low-bg)",  border: "var(--ce-urgency-low-line)",  darkText: "var(--ce-urgency-low-dark)" },
};

const LS_SAVED   = "clinical_edge_saved_cases";
const LS_MODE    = "clinical_edge_mode";

// Loading state — single static caption (no rotating narration, §4.7)
const PROCESSING_MESSAGES = {
  organizing: "Organizing your snapshot",
  checking: "Checking the clinical reasoning",
  finalizing: "Finalizing your Priority Map",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {
    // Storage can be unavailable in private browsing or locked-down webviews.
  }
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
  const prioritySection = ordered.find((section) => section.title === "Priorities");
  return { urgent, priorities: parsePriorities(prioritySection?.content || ""), sections: ordered.filter((section) => section.title !== "Priorities") };
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

function apiErrorMessage(status, data = {}) {
  if (typeof data.message === "string" && data.message.trim()) return data.message;
  if (typeof data.error === "string" && data.error.trim()) return data.error;
  if (status === 400 || status === 422) return "The submitted Snapshot could not be processed. Review the entered information and try again.";
  if (status === 429) return "Too many requests were sent. Please wait a moment and try again.";
  if (status === 503) return "The clinical reasoning service is temporarily unavailable or not configured.";
  if (status === 504) return "The clinical reasoning service timed out. Please try again.";
  return "The Clinical Edge server could not complete this request. Please try again.";
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

function LoadingIndicator({ stage = "organizing" }) {
  const [longWait, setLongWait] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setLongWait(true), 10000);
    return () => clearTimeout(timer);
  }, []);
  // Sole sanctioned loop (motion-system.md §6/§7): one quiet opacity breathe
  // on the whole indicator. No per-bar pulsing, no progress theater.
  return (
    <div className="copilot-loading-card ce-breathe">
      <div className="copilot-loading-meter">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} />
        ))}
      </div>
      <span className="copilot-loading-eyebrow">Building your Priority Map</span>
      <strong>{PROCESSING_MESSAGES[stage] || PROCESSING_MESSAGES.organizing}</strong>
      <small>Checking the reasoning against the observations you provided.</small>
      {longWait && <small className="copilot-loading-reassurance">Still working. Your submitted Snapshot remains available above.</small>}
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
        <div style={{ padding: "0 14px 12px", borderTop: "1px solid var(--ce-line-dark)" }}>
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
        <div style={{ padding: "0 14px 14px", borderTop: "1px solid var(--ce-line-dark)" }}>
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
            border: "1px solid var(--ce-line-dark)",
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

**Priorities**
### 1 · Evolving postoperative change
Relevance: Important
Observed:
- Heart rate increased from 78 to 96 over several hours
- Blood pressure is reported as stable, temperature is 37.9, and fatigue is new since this morning
Interpretation: The combined trend may reflect an evolving postoperative stressor that deserves focused reassessment.
Assess now:
- Current appearance, mentation, perfusion, pain, and work of breathing compared with earlier
- Full vital-sign and oxygenation trend rather than a single current reading

### 2 · Volume or bleeding context
Relevance: Needs clarification
Observed:
- The patient is postoperative and reports new fatigue
Interpretation: Volume imbalance or blood loss could contribute, but current intake, output, wound, and hemoglobin information is missing.
Assess now:
- Intake, urine output, wound findings, and relevant laboratory trend

**Assess first**
- Current appearance, mentation, perfusion, pain, and work of breathing compared with earlier
- Full vital-sign and oxygenation trend rather than a single current reading
- Intake, urine output, wound findings, and mobility since surgery

**Possible patterns**
- The gradual change may fit pain, evolving volume imbalance, or a respiratory contributor
- Early postoperative infection or another developing stressor remains possible, not established

**Missing information**
- Current respiratory rate, oxygen saturation, pain trajectory, intake, urine output, and wound assessment
- Relevant hemoglobin trend, medications, and postoperative baseline

**Monitor and trend**
- Continued heart-rate rise, falling pressure, increasing temperature, worsening fatigue, or reduced urine output would increase concern
- Improvement with routine postoperative care would make a rapidly progressive pattern less likely

**Escalation triggers**
- New hypoxia, altered mentation, poor perfusion, chest symptoms, active bleeding, or a worsening hemodynamic trend commonly prompt earlier team awareness
- A persistent unexplained trend may warrant provider communication under local protocol

**SBAR-ready summary**
Post-op day 2 after hip replacement, with heart rate gradually increasing from 78 to 96 over several hours. Blood pressure is reported as stable and temperature is 37.9, but the patient reports new fatigue. The cause is uncertain; current respiratory, perfusion, pain, volume, wound, and laboratory context would help clarify the picture.

**Teach me why**
Heart rate can rise when the body is compensating for pain, reduced circulating volume, impaired oxygen delivery, or inflammation. The trend matters because a developing stress response may appear before a single vital sign becomes clearly abnormal.`;

// ─── Main App ──────────────────────────────────────────────────────────────────

export default function App({ onGoHome, navigate, isOnline = true }) {
  const [prefillNotes] = useState(() => {
    if (_ssParam === "response") return "";
    try {
      const value = localStorage.getItem("copilot_prefill") || "";
      localStorage.removeItem("copilot_prefill");
      return value;
    } catch {
      return "";
    }
  });
  const [question, setQuestion]         = useState(() => _ssParam === 'response' ? _SS_QUESTION : "");
  const [result, setResult]             = useState(() => {
    if (_ssParam !== 'response') return null;
    const parsed = parseResponse(_SS_RESPONSE);
    return { ...parsed, urgencyLevel: extractUrgencyLevel(_SS_RESPONSE) };
  });
  const [followUpResult, setFollowUpResult] = useState(null);
  const [rawText, setRawText]           = useState(() => _ssParam === 'response' ? _SS_RESPONSE : "");
  const [, setStreamBuffer] = useState("");
  const [streaming, setStreaming]       = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [mode]                          = useState("deep");
  const [savedCases, setSavedCases]     = useState(() => lsGet(LS_SAVED, []));
  const [justSaved, setJustSaved]       = useState(false);
  const [followUp, setFollowUp]         = useState("");
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [sbar, setSbar]                 = useState(null);
  const [sbarLoading, setSbarLoading]   = useState(false);
  const [sbarCopied, setSbarCopied]     = useState(false);
  const [sourcesOpen, setSourcesOpen]   = useState(false);
  const [followUpActive, setFollowUpActive] = useState(false);
  const [processingStage, setProcessingStage] = useState("organizing");
  const [submittedSnapshot, setSubmittedSnapshot] = useState(null);
  const [editableSnapshot, setEditableSnapshot] = useState(null);
  const [captureKey, setCaptureKey] = useState(0);

  const outputRef             = useRef(null);
  const workspaceTopRef       = useRef(null);
  const lastSubmittedRef      = useRef("");
  const wasRecentlyHiddenRef  = useRef(false);
  const hiddenAtRef           = useRef(null);
  const abortControllerRef    = useRef(null);
  const accumulatedRef        = useRef("");
  const isActiveRef           = useRef(false);
  const runQueryRef           = useRef(null);
  const teachMeRequestRef     = useRef(null);

  // Track module open — fires once on mount
  useEffect(() => {
    trackEvent('copilot_opened', { route: '/copilot' });
  }, []);

  // Screenshot mode: scroll response into view immediately on mount
  useEffect(() => {
    if (_ssParam === 'response' && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }, []);

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
    if (isActiveRef.current) return;
    if (!isOnline) {
      trackEvent('copilot_offline_blocked');
      return;
    }

    // Cancel any previous in-flight request before starting a new one
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    let didTimeout = false;
    const timeoutId = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, 65000);
    abortControllerRef.current = controller;
    accumulatedRef.current = "";
    isActiveRef.current = true;

    if (!isFollowUp) setQuestion(q);
    setFollowUp("");
    setFollowUpActive(isFollowUp);
    lastSubmittedRef.current = q;
    trackEvent('copilot_prompt_submitted', { mode, source: isFollowUp ? 'follow_up' : 'structured_snapshot' });
    setLoading(true);
    setProcessingStage("organizing");
    setStreaming(false);
    setError(null);
    if (!isFollowUp) {
      setResult(null);
      setFollowUpResult(null);
      setRawText("");
    } else {
      setFollowUpResult(null);
    }
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
        setError(apiErrorMessage(res.status, data));
        setLoading(false);
        setFollowUpActive(false);
        isActiveRef.current = false;
        return;
      }

      setStreaming(true);
      setLoading(false);

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

          if (parsed.progress) {
            setProcessingStage(parsed.progress);
            continue;
          }

          if (parsed.error) {
            trackEvent('copilot_response_error', { reason: 'api_error' });
            setError(parsed.message || (typeof parsed.error === "string" ? parsed.error : null) || "Something went wrong. Please try again.");
            setStreaming(false);
            setFollowUpActive(false);
            isActiveRef.current = false;
            return;
          }

          if (parsed.done) {
            trackEvent('copilot_response_completed', { mode });
            trackEvent('shift_brain_priority_map_completed', { mode });
            setStreaming(false);
            setStreamBuffer("");
            const parsedResult = parseResponse(accumulatedRef.current);
            const nextResult = { ...parsedResult, urgencyLevel: extractUrgencyLevel(accumulatedRef.current) };
            if (isFollowUp) {
              setFollowUpResult(nextResult);
            } else {
              setRawText(accumulatedRef.current);
              setResult(nextResult);
            }
            setFollowUpActive(false);
            isActiveRef.current = false;
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
        if (didTimeout) {
          trackEvent('copilot_response_error', { reason: 'timeout' });
          setError("The request timed out before the clinical reasoning service responded. Please try again.");
          setLoading(false);
          setStreaming(false);
        }
        isActiveRef.current = false;
        setFollowUpActive(false);
        return;
      }
      trackEvent('copilot_response_error', { reason: 'network_error' });
      // Suppress the error when backgrounding caused the failure — the visibility
      // handler will attempt a retry or silently restore idle state.
      if (!wasRecentlyHiddenRef.current) {
        setError("Cannot reach the Clinical Edge server. Check that the local backend is running, then try again.");
      }
      setLoading(false);
      setStreaming(false);
      setFollowUpActive(false);
      isActiveRef.current = false;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  // Keep runQueryRef current on every render so the visibilitychange handler
  // (which has a [] dep array) can always call the latest version.
  runQueryRef.current = runQuery;

  const handleSnapshotBuild = (serializedSnapshot, snapshot) => {
    setSubmittedSnapshot({ serializedSnapshot, snapshot });
    setEditableSnapshot(null);
    runQuery(serializedSnapshot);
  };

  const resetResultState = useCallback(() => {
    setQuestion("");
    setResult(null);
    setFollowUpResult(null);
    setRawText("");
    setStreamBuffer("");
    setError(null);
    setFollowUp("");
    setFollowUpOpen(false);
    setSbar(null);
    setSbarLoading(false);
    setJustSaved(false);
    setSourcesOpen(false);
    accumulatedRef.current = "";
    lastSubmittedRef.current = "";
  }, []);

  const handleEditSnapshot = useCallback(() => {
    if (!submittedSnapshot?.snapshot || isActiveRef.current) return;
    setEditableSnapshot(submittedSnapshot.snapshot);
    setSubmittedSnapshot(null);
    resetResultState();
    setCaptureKey((value) => value + 1);
    trackEvent("shift_brain_snapshot_edit_started");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [resetResultState, submittedSnapshot]);

  const handleNewSnapshot = useCallback(() => {
    if (isActiveRef.current) return;
    setEditableSnapshot(null);
    setSubmittedSnapshot(null);
    resetResultState();
    setCaptureKey((value) => value + 1);
    trackEvent("shift_brain_new_snapshot_started");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [resetResultState]);

  const handleFollowUp = () => {
    if (!followUp.trim()) return;
    trackEvent('copilot_continue_thinking', { mode });
    const combined = `Original situation: ${lastSubmittedRef.current}\n\nUpdate: ${followUp.trim()}`;
    setFollowUpOpen(false);
    runQuery(combined, { isFollowUp: true });
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
    navigator.clipboard?.writeText(text).catch(() => undefined);
    trackEvent('copilot_response_copied', { copy_scope: 'full_response', source });
  }, []);

  const handleSbar = useCallback(async () => {
    if (!rawText || !question) return;
    trackEvent('priority_map_sbar_opened');
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

  const handleTeachMe = useCallback(async () => {
    if (!rawText || !question) throw new Error("Priority Map context is unavailable.");
    if (teachMeRequestRef.current) return teachMeRequestRef.current;
    const request = (async () => {
      const res = await fetch(`${API_BASE}/api/copilot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          mode,
          learningRequest: true,
          priorityMapResponse: rawText,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.lesson) {
        trackEvent("teach_me_error", { reason: "request_failed", status: res.status });
        throw new Error("Teach Me is unavailable.");
      }
      return data.lesson;
    })();
    teachMeRequestRef.current = request;
    try {
      return await request;
    } finally {
      if (teachMeRequestRef.current === request) teachMeRequestRef.current = null;
    }
  }, [rawText, question, mode]);

  const handleCopySbar = useCallback((sbarData) => {
    const text = [
      `SITUATION:\n${sbarData.situation}`,
      `BACKGROUND:\n${sbarData.background}`,
      `ASSESSMENT:\n${sbarData.assessment}`,
      `RECOMMENDATION:\n${sbarData.recommendation}`,
    ].join("\n\n");
    navigator.clipboard?.writeText(text).catch(() => undefined);
    trackEvent('sbar_copied', { source: 'copilot', copy_scope: 'full_sbar' });
    setSbarCopied(true);
    setTimeout(() => setSbarCopied(false), 2000);
  }, []);

  const handleReopenCase = useCallback((q) => {
    trackEvent('saved_case_reopened', { source: 'saved_cases' });
    runQueryRef.current?.(q);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const isActive = loading || streaming;
  const initialProcessing = isActive && !followUpActive;
  const workspaceState = initialProcessing ? "process" : result ? "priority-map" : "capture";

  useEffect(() => {
    if (workspaceState === "capture" || !submittedSnapshot) return;
    const frame = requestAnimationFrame(() => {
      workspaceTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [workspaceState, submittedSnapshot]);

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

        .copilot-command-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 300px;
          gap: 18px;
          align-items: start;
        }
        .copilot-command-main,
        .copilot-command-rail {
          min-width: 0;
        }
        .copilot-command-rail {
          position: sticky;
          top: calc(72px + env(safe-area-inset-top));
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .copilot-rail-card {
          border: 1px solid var(--ce-warm-line);
          border-radius: var(--ce-r-md);
          background: rgba(255,253,248,0.72);
          padding: 14px;
          color: var(--ce-text-muted);
        }
        .copilot-rail-card--dark {
          border-color: rgba(10,191,188,0.18);
          background: var(--ce-navy-700);
          color: var(--ce-text-light-body);
        }
        .copilot-rail-label {
          display: block;
          margin-bottom: 8px;
          color: var(--ce-teal-deep);
          font-family: var(--ce-font-mono);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0;
          text-transform: uppercase;
        }
        .copilot-rail-card--dark .copilot-rail-label {
          color: var(--ce-teal);
        }
        .copilot-rail-card p {
          margin: 0;
          font-size: 12.5px;
          line-height: 1.58;
        }
        .copilot-rail-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 10px;
        }
        .copilot-rail-link {
          min-height: 42px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          border: 1px solid rgba(10,143,141,0.18);
          border-radius: var(--ce-r-md);
          background: rgba(10,191,188,0.04);
          color: var(--ce-text-dark);
          padding: 0 11px;
          font-size: 12.5px;
          font-weight: 700;
          text-decoration: none;
          transition:
            border-color var(--ce-dur-fast) var(--ce-ease-out),
            background-color var(--ce-dur-fast) var(--ce-ease-out),
            transform var(--ce-dur-fast) var(--ce-ease-out);
        }
        .copilot-rail-link:hover,
        .copilot-rail-link:focus-visible {
          border-color: rgba(10,143,141,0.34);
          background: rgba(10,191,188,0.08);
          transform: translateY(-1px);
        }
        .copilot-context-strip {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 14px;
        }
        .copilot-command-rail .copilot-context-strip {
          grid-template-columns: 1fr;
        }
        .copilot-context-tile {
          border: 1px solid var(--ce-warm-line);
          border-radius: var(--ce-r-md);
          background: rgba(255,253,248,0.58);
          padding: 11px 12px;
        }
        .copilot-context-tile strong,
        .copilot-context-tile span {
          display: block;
        }
        .copilot-context-tile strong {
          color: var(--ce-text-dark);
          font-size: 13px;
          line-height: 1.25;
        }
        .copilot-context-tile span {
          margin-top: 4px;
          color: var(--ce-text-muted);
          font-size: 11.5px;
          line-height: 1.35;
        }
        .copilot-input-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
          color: var(--ce-text-light-sec);
          font-family: var(--ce-font-mono);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .copilot-input-header strong {
          color: var(--ce-teal);
          font-weight: 700;
        }
        .copilot-input-header span:last-child {
          color: var(--ce-text-dim);
        }
        .copilot-phi-guard {
          margin: 0 0 11px;
          padding: 9px 10px;
          border: 1px solid rgba(212,168,75,0.24);
          border-left: 3px solid var(--ce-gold);
          border-radius: var(--ce-r-sm);
          background: rgba(212,168,75,0.07);
          color: var(--ce-text-light-sec);
          font-size: 11px;
          line-height: 1.45;
        }
        .copilot-phi-guard strong,
        .copilot-phi-guard span {
          display: block;
        }
        .copilot-phi-guard strong {
          margin-bottom: 3px;
          color: var(--ce-text-light);
          font-size: 11.5px;
        }
        .copilot-example-row {
          width: 100%;
          min-height: 46px;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid rgba(17,24,39,0.08);
          border-radius: var(--ce-r-md);
          background: rgba(255,253,248,0.44);
          color: var(--ce-text-muted);
          padding: 9px 12px;
          font-family: inherit;
          font-size: 12.5px;
          line-height: 1.38;
          text-align: left;
          cursor: pointer;
          transition:
            border-color var(--ce-dur-fast) var(--ce-ease-out),
            background-color var(--ce-dur-fast) var(--ce-ease-out),
            transform var(--ce-dur-fast) var(--ce-ease-out);
        }
        .copilot-example-row:hover,
        .copilot-example-row:focus-visible {
          border-color: rgba(10,143,141,0.26);
          background: rgba(255,253,248,0.72);
          transform: translateY(-1px);
        }
        .copilot-example-row span:first-child {
          width: 18px;
          height: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 999px;
          background: rgba(10,143,141,0.08);
          color: var(--ce-teal-deep);
          font-size: 9px;
        }
        .copilot-result-shell {
          margin-top: 8px;
          scroll-margin-top: calc(92px + env(safe-area-inset-top));
        }
        .copilot-result-nav {
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 4px;
          margin-bottom: 8px;
        }
        .copilot-result-nav button {
          min-height: 42px;
          border: 1px solid transparent;
          border-radius: 7px;
          background: transparent;
          color: var(--ce-teal-deep);
          padding: 0 12px;
          font-size: 12px;
          font-weight: 750;
        }
        .copilot-result-nav button:hover,
        .copilot-result-nav button:focus-visible {
          border-color: rgba(10,143,141,0.2);
          background: rgba(10,191,188,0.06);
        }
        .copilot-result-topper {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 14px;
          align-items: start;
          border: 1px solid var(--ce-warm-line);
          border-radius: var(--ce-r-md);
          background: var(--ce-warm-card);
          box-shadow: var(--ce-shadow-card);
          padding: 16px 18px;
          margin-bottom: 12px;
        }
        .copilot-result-topper__label {
          display: block;
          color: var(--ce-teal-deep);
          font-family: var(--ce-font-mono);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .copilot-result-topper p {
          margin: 0;
          color: var(--ce-text-muted);
          font-size: 13px;
          line-height: 1.55;
        }
        .copilot-result-topper__meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 150px;
        }
        .copilot-result-pill {
          min-height: 30px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(10,143,141,0.18);
          border-radius: var(--ce-r-pill);
          background: rgba(10,191,188,0.05);
          color: var(--ce-teal-deep);
          padding: 0 12px;
          font-family: var(--ce-font-mono);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .copilot-urgency-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          width: fit-content;
          background: var(--urgency-bg);
          border: 1px solid var(--urgency-border);
          border-radius: var(--ce-r-pill);
          padding: 8px 13px;
          margin-bottom: 12px;
        }
        .copilot-urgency-badge span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--urgency-color);
          flex-shrink: 0;
        }
        .copilot-urgency-badge strong {
          color: var(--urgency-color);
          font-family: var(--ce-font-mono);
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0;
          text-transform: uppercase;
        }
        .copilot-urgent-callout {
          background: rgba(190,70,70,0.08);
          border: 1px solid rgba(190,70,70,0.22);
          border-left: 3px solid var(--ce-urgency-high-line);
          border-radius: var(--ce-r-md);
          padding: 14px 18px;
          color: var(--ce-urgency-high);
          font-weight: 600;
          font-size: 14px;
          line-height: 1.65;
          margin-bottom: 12px;
        }
        .copilot-result-section {
          position: relative;
          overflow: hidden;
          background: var(--ce-warm-card);
          border: 1px solid var(--ce-warm-line);
          border-radius: var(--ce-r-md);
          box-shadow: var(--ce-shadow-card);
          padding: 18px 20px;
          margin-bottom: 10px;
        }
        .copilot-result-section::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 3px;
          background: var(--section-accent);
        }
        .copilot-result-section__header {
          display: flex;
          align-items: center;
          gap: 9px;
          color: var(--section-accent);
          font-family: var(--ce-font-mono);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .copilot-result-section__marker {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--section-accent);
          opacity: 0.82;
          flex-shrink: 0;
        }
        .copilot-result-section__body {
          color: var(--ce-navy-700);
          font-size: 14px;
          line-height: 1.72;
        }
        .copilot-result-section__body p {
          margin: 0 0 7px;
          color: var(--ce-navy-700);
        }
        .copilot-result-bullet {
          display: grid;
          grid-template-columns: 7px minmax(0, 1fr);
          gap: 11px;
          align-items: start;
          margin-bottom: 9px;
        }
        .copilot-result-bullet > span:first-child {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--section-accent);
          margin-top: 10px;
          opacity: 0.9;
        }
        .copilot-closing-card {
          border: 1px solid rgba(10,143,141,0.18);
          border-left: 3px solid var(--ce-teal);
          border-radius: var(--ce-r-md);
          padding: 15px 19px;
          margin-top: 10px;
          margin-bottom: 6px;
          background: rgba(255,253,248,0.74);
        }
        .copilot-closing-card p {
          margin: 0;
          color: var(--ce-text-muted);
          font-size: 14px;
          font-style: italic;
          line-height: 1.78;
        }
        .copilot-action-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 16px;
          padding: 14px 0 0;
          border-top: 1px solid var(--ce-warm-line);
          flex-wrap: wrap;
        }
        .sbar-trigger-btn {
          min-height: 46px;
          padding: 0 18px;
          border: 1px solid var(--ce-teal);
          border-radius: 7px;
          background: var(--ce-teal);
          color: var(--ce-navy-900);
          font-size: 13px;
          font-weight: 800;
        }
        .sbar-trigger-btn:disabled {
          cursor: wait;
          opacity: 0.68;
        }
        .copilot-action-utilities {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-wrap: wrap;
        }
        .copilot-action-utilities button {
          min-height: 44px;
          padding: 0 10px;
          border: 1px solid transparent;
          border-radius: 7px;
          background: transparent;
          color: var(--ce-text-muted);
          font-size: 12px;
          font-weight: 700;
        }
        .copilot-followup {
          margin-top: 18px;
          border-top: 1px solid var(--ce-warm-line);
          border-bottom: 1px solid var(--ce-warm-line);
        }
        .copilot-followup__trigger {
          width: 100%;
          min-height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          border: 0;
          background: transparent;
          color: var(--ce-text-dark);
          padding: 10px 0;
          text-align: left;
        }
        .copilot-followup__trigger small,
        .copilot-followup__trigger strong,
        .copilot-followup__trigger em { display: block; }
        .copilot-followup__trigger small {
          color: var(--ce-teal-deep);
          font: 700 9px/1.2 var(--ce-font-mono);
          text-transform: uppercase;
        }
        .copilot-followup__trigger strong { margin-top: 4px; font-size: 14px; }
        .copilot-followup__trigger em { margin-top: 3px; color: var(--ce-text-muted); font-size: 11px; font-style: normal; font-weight: 500; }
        .copilot-followup__trigger > span:last-child { color: var(--ce-teal-deep); font-size: 19px; }
        .copilot-followup__body { padding: 0 0 16px; }
        .copilot-followup__body > label { display: block; margin: 12px 0 6px; color: var(--ce-text-dark); font-size: 11px; font-weight: 750; }
        .copilot-followup__suggestions { display: flex; flex-wrap: wrap; gap: 6px; }
        .copilot-followup__suggestions button { min-height: 38px; border: 1px solid var(--ce-warm-line); border-radius: 6px; background: transparent; color: var(--ce-text-muted); padding: 6px 10px; font-size: 11px; }
        .copilot-followup .followup-textarea { width: 100%; min-height: 76px; resize: vertical; border: 1px solid var(--ce-warm-line); border-radius: 6px; background: var(--ce-warm-card); color: var(--ce-text-dark); padding: 10px 11px; font: 400 13px/1.5 inherit; }
        .copilot-followup__submit { display: flex; justify-content: flex-end; margin-top: 8px; }
        .copilot-followup__submit button { min-height: 42px; border: 1px solid rgba(10,143,141,.25); border-radius: 6px; background: rgba(10,191,188,.08); color: var(--ce-teal-deep); padding: 0 14px; font-size: 12px; font-weight: 750; }
        .copilot-followup__submit button:disabled { opacity: .45; cursor: not-allowed; }
        .sbar-panel { margin-top: 18px; border-top: 3px solid var(--ce-teal-deep); background: var(--ce-warm-card); box-shadow: var(--ce-shadow-card); padding: 18px; }
        .sbar-panel__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
        .sbar-panel__header span { color: var(--ce-teal-deep); font: 700 9px/1.2 var(--ce-font-mono); text-transform: uppercase; }
        .sbar-panel__header h2 { margin: 4px 0 0; color: var(--ce-text-dark); font-size: 20px; }
        .sbar-copy-btn { min-height: 40px; border: 1px solid rgba(10,143,141,.22); border-radius: 6px; background: transparent; color: var(--ce-teal-deep); padding: 0 12px; font-size: 11px; font-weight: 750; }
        .sbar-panel__sections { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 0 20px; }
        .sbar-panel__sections section { display: grid; grid-template-columns: 30px 1fr; gap: 10px; padding: 14px 0; border-top: 1px solid var(--ce-warm-line); }
        .sbar-panel__sections section > span { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 50%; background: var(--ce-navy-900); color: var(--ce-teal); font: 700 11px/1 var(--ce-font-mono); }
        .sbar-panel__sections h3 { margin: 0; color: var(--ce-text-dark); font-size: 13px; }
        .sbar-panel__sections p { margin: 4px 0 0; color: var(--ce-text-muted); font-size: 12.5px; line-height: 1.55; }
        .sbar-panel__note { margin-top: 10px; color: var(--ce-text-muted); font-size: 10.5px; line-height: 1.5; }
        .copilot-loading-card,
        .copilot-stream-card {
          border: 1px solid var(--ce-warm-line);
          border-radius: var(--ce-r-md);
          background: var(--ce-warm-card);
          box-shadow: var(--ce-shadow-card);
        }
        .copilot-loading-card {
          min-height: 220px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 28px;
          margin: 0 0 16px;
        }
        .copilot-loading-meter {
          display: flex;
          gap: 4px;
          align-items: center;
          margin-bottom: 14px;
        }
        .copilot-loading-meter span {
          width: 4px;
          height: 18px;
          border-radius: 4px;
          background: var(--ce-teal);
          opacity: 0.72;
        }
        .copilot-loading-card strong {
          display: block;
          color: var(--ce-text-dark);
          font-size: 21px;
          margin-bottom: 7px;
        }
        .copilot-loading-card small {
          display: block;
          color: var(--ce-text-muted);
          font-size: 12px;
          line-height: 1.45;
        }
        .copilot-loading-eyebrow {
          margin-bottom: 8px;
          color: var(--ce-teal-deep);
          font: 700 10px/1.2 var(--ce-font-mono);
          text-transform: uppercase;
        }
        .copilot-loading-reassurance {
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid var(--ce-warm-line);
        }
        .copilot-workspace-stage {
          width: 100%;
          max-width: 960px;
          margin: 0 auto;
          scroll-margin-top: 72px;
        }
        .copilot-capture[hidden] { display: none !important; }
        .copilot-stream-card {
          padding: 18px 20px;
          margin-bottom: 10px;
          color: var(--ce-text-muted);
          font-size: 14px;
          line-height: 1.78;
          white-space: pre-wrap;
          max-height: 340px;
          overflow-y: auto;
        }

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
          border-color: var(--ce-teal-deep) !important;
          background: var(--ce-teal-deep) !important;
          color: #fff !important;
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
          .copilot-command-layout { grid-template-columns: 1fr; }
          .copilot-command-rail { position: static; }
          .copilot-context-strip { grid-template-columns: 1fr; }
          .copilot-result-topper { grid-template-columns: 1fr; }
          .copilot-result-topper__meta { min-width: 0; flex-direction: row; flex-wrap: wrap; }
          .copilot-result-nav { position: sticky; top: calc(56px + env(safe-area-inset-top)); z-index: 5; margin: -2px -2px 8px; padding: 4px 2px; background: rgba(248,245,238,.96); }
          .copilot-action-bar { align-items: stretch; flex-direction: column; padding-top: 12px; }
          .sbar-trigger-btn { width: 100%; }
          .copilot-action-utilities { justify-content: center; }
          .copilot-followup__suggestions { flex-direction: column; align-items: stretch; }
          .copilot-followup__suggestions button { min-height: 44px; text-align: left; }
          .sbar-panel { padding: 16px 14px; }
          .sbar-panel__header { align-items: stretch; flex-direction: column; }
          .sbar-copy-btn { align-self: flex-start; }
          .sbar-panel__sections { grid-template-columns: 1fr; }
          .copilot-loading-card { min-height: 190px; padding: 22px 18px; }
          .copilot-loading-card strong { font-size: 19px; }
          .hero { margin-bottom: 12px !important; }
          /* Reduce try-asking chip density — show max 3 */
          .chips-try button:nth-child(n+4) { display: none !important; }
          /* Recent row: limit to 3 cards on mobile */
          .recent-list > *:nth-child(n+4) { display: none !important; }
          /* Prevent iOS auto-zoom on textarea focus (requires font-size >= 16px) */
          textarea { font-size: 16px !important; }
        }
      `}</style>

      <ModuleHeader moduleName="Copilot" onGoHome={onGoHome} maxWidth="800px" />

      {/* ── Warm clinical workspace ──────────────────────────────────────── */}
      <div className="ce-page-enter" style={{ background: "var(--ce-warm-bg)", minHeight: "100vh" }}>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <div className="main-container" data-workspace-state={workspaceState} style={{ maxWidth: 1120, margin: "0 auto", width: "100%", padding: "40px 20px 0", display: "flex", flexDirection: "column", alignItems: "stretch" }}>

        <div className="copilot-command-layout copilot-capture" hidden={workspaceState !== "capture"}>
          <div className="copilot-command-main">

        <PatientSnapshot
          key={captureKey}
          initialNotes={prefillNotes}
          initialSnapshot={editableSnapshot}
          disabled={isActive}
          isOnline={isOnline}
          onBuild={handleSnapshotBuild}
        />

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

          </div>

          <aside className="copilot-command-rail" aria-label="Copilot guidance">
            <div className="copilot-rail-card copilot-rail-card--dark">
              <span className="copilot-rail-label">First pass</span>
              <p>Enter what you know now, then add earlier values or focused findings only when they help. Missing information can stay missing.</p>
            </div>

            <div className="copilot-context-strip" aria-label="Copilot workflow checkpoints">
              <div className="copilot-context-tile">
                <strong>Assess</strong>
                <span>What do you see now?</span>
              </div>
              <div className="copilot-context-tile">
                <strong>Trend</strong>
                <span>What changed over time?</span>
              </div>
              <div className="copilot-context-tile">
                <strong>Escalate</strong>
                <span>What needs attention?</span>
              </div>
            </div>

            <div className="copilot-rail-card">
              <span className="copilot-rail-label">Jump somewhere focused</span>
              <p>Use Copilot for reasoning, then switch to the focused tool when you need a narrower clinical check.</p>
              <div className="copilot-rail-list">
                {[
                  ['Reference Hub', '/reference-hub'],
                  ['ABG Lab', '/abg-lab'],
                  ['Brain Sheets', '/brain-sheets'],
                ].map(([label, path]) => (
                  <a
                    key={path}
                    className="copilot-rail-link"
                    href={path}
                    onClick={(e) => {
                      if (!navigate) return;
                      e.preventDefault();
                      navigate(path);
                    }}
                  >
                    {label} <span aria-hidden="true">{"->"}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="copilot-rail-card">
              <span className="copilot-rail-label">Private by default</span>
              <p>Your snapshot is not retained unless you deliberately save the completed case.</p>
            </div>
          </aside>
        </div>

        {workspaceState !== "capture" && submittedSnapshot && (
          <div ref={workspaceTopRef} className="copilot-workspace-stage ce-section-enter">
            <SubmittedSnapshotSummary
              snapshot={submittedSnapshot.snapshot}
              serializedSnapshot={submittedSnapshot.serializedSnapshot}
              state={workspaceState === "process" ? "process" : "result"}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="ce-section-enter" role="alert" style={{
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

        {/* Initial processing */}
        {initialProcessing && (
          <div ref={outputRef} className="copilot-workspace-stage ce-section-enter" aria-live="polite">
            <LoadingIndicator stage={processingStage} />
          </div>
        )}

        {/* Final structured result */}
        {result && (!streaming || followUpActive) && (
          <div ref={outputRef} className="copilot-result-shell copilot-workspace-stage ce-section-enter">
            <nav className="copilot-result-nav" aria-label="Snapshot actions">
              {submittedSnapshot?.snapshot && <button type="button" onClick={handleEditSnapshot}>Edit Snapshot</button>}
              <button type="button" onClick={handleNewSnapshot}>New Snapshot</button>
            </nav>
            <PriorityMap result={result} onRequestTeachMe={handleTeachMe} />

            {/* Action bar */}
            <div className="copilot-action-bar">
              <button
                className="sbar-trigger-btn"
                onClick={handleSbar}
                disabled={sbarLoading}
              >
                {sbarLoading ? (
                  <span className="ce-breathe">Building SBAR…</span>
                ) : (
                  "Prepare SBAR"
                )}
              </button>
              <div className="copilot-action-utilities" aria-label="Priority Map utilities">
                <button className="save-case-btn" onClick={handleSaveCase} disabled={justSaved}>
                  <span key={justSaved ? "saved" : "save"} className="ce-swap-fast">{justSaved ? "\u2713 Case saved locally" : "Save case locally"}</span>
                </button>
                <button className="copy-btn" onClick={() => handleCopyResponse(rawText)}>Copy</button>
                <button className="sources-btn" onClick={() => setSourcesOpen((open) => !open)}>Sources</button>
              </div>
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

            {/* ── Focused clarification ─────────────────────────────────── */}
            <section className="copilot-followup">
              <button type="button" className="copilot-followup__trigger" aria-expanded={followUpOpen} onClick={() => setFollowUpOpen((open) => !open)}>
                <span><small>Focused clarification</small><strong>Ask about this Priority Map</strong><em>Add a new finding or ask for explanation without starting over.</em></span>
                <span aria-hidden="true">{followUpOpen ? "−" : "+"}</span>
              </button>
              {followUpOpen && <div className="copilot-followup__body">
                <div className="copilot-followup__suggestions" aria-label="Suggested follow-ups">
                  {["What should I reassess first?", "What finding would raise concern?", "Explain the physiology."].map((suggestion) => <button type="button" key={suggestion} onClick={() => setFollowUp(suggestion)}>{suggestion}</button>)}
                </div>
                <label htmlFor="copilot-followup-input">Your focused question or update</label>
                <textarea
                  id="copilot-followup-input"
                  className="followup-textarea"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleFollowUp(); }}
                  placeholder="New finding, reassessment, or focused question"
                  rows={2}
                />
                <div className="copilot-followup__submit"><button className="send-update-btn" onClick={handleFollowUp} disabled={!followUp.trim() || isActive}>{isActive ? "Working…" : "Ask about this map"}</button></div>
              </div>}
            </section>

            {followUpResult && <section className="copilot-followup-result" aria-label="Focused clarification response">
              <PriorityMap result={followUpResult} onRequestTeachMe={handleTeachMe} variant="clarification" />
            </section>}

          {/* ── SBAR Card ────────────────────────────────────────────── */}
          {(sbar || sbarLoading) && (
            <section className="sbar-panel" aria-labelledby="sbar-heading">
              {/* Header */}
              <div className="sbar-panel__header">
                <div><span>Communication draft</span><h2 id="sbar-heading">SBAR handoff</h2></div>
                {sbar && !sbar.error && (
                  <button
                    className="sbar-copy-btn"
                    onClick={() => handleCopySbar(sbar)}
                  >
                    <span key={sbarCopied ? "copied" : "copy"} className="ce-swap-fast">{sbarCopied ? "✓ SBAR copied" : "Copy SBAR"}</span>
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
                <div className="sbar-panel__sections">
                  {[
                    { label: "Situation", value: sbar.situation, letter: "S" },
                    { label: "Background", value: sbar.background, letter: "B" },
                    { label: "Assessment", value: sbar.assessment, letter: "A" },
                    { label: "Recommendation", value: sbar.recommendation, letter: "R" },
                  ].map(({ label, value, letter }) => (
                    <section key={label}><span aria-hidden="true">{letter}</span><div><h3>{label}</h3><p>{value ? renderInline(value) : "—"}</p></div></section>
                  ))}
                </div>
              )}

              <div className="sbar-panel__note">
                AI-generated draft — verify all details before use. Do not include patient identifiers.
              </div>
            </section>
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
