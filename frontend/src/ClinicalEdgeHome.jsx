import { useEffect, useMemo, useState } from "react";
import { trackEvent } from "./analytics";
import { useSeo } from "./seo/useSeo.js";
import { STATIC_ROUTE_SEO } from "./seo/routeSeo.js";

const MODULE_OPEN_EVENTS = {
  copilot: "copilot_module_opened",
  rhythmlab: "rhythm_lab_module_opened",
  icudrips: "icu_drips_module_opened",
  referencehub: "reference_hub_opened",
  abglab: "abg_lab_opened",
  brainsheets: "brain_sheets_module_opened",
};

const MODULES = [
  {
    key: "copilot",
    tag: "Clinical Reasoning",
    title: "Copilot",
    description: "Work through a clinical situation before you call, escalate, or explain it.",
    path: "/copilot",
    metric: "Reasoning",
    signal: "Primary",
  },
  {
    key: "rhythmlab",
    tag: "ECG Interpretation",
    title: "Rhythm Lab",
    description: "Practice rhythm recognition with a structured strip-reading workflow.",
    path: "/rhythm-lab",
    metric: "Practice",
    signal: "Active",
  },
  {
    key: "icudrips",
    tag: "Infusion Reference",
    title: "ICU Drips",
    description: "Review monitoring essentials and bedside context for critical care infusions.",
    path: "/icu-drips",
    metric: "Reference",
    signal: "Active",
  },
  {
    key: "referencehub",
    tag: "Bedside Reference",
    title: "Reference Hub",
    description: "Find fast context for labs, devices, hemodynamics, oxygenation, and safety checks.",
    path: "/reference-hub",
    metric: "Lookup",
    signal: "Active",
  },
  {
    key: "abglab",
    tag: "Acid-Base",
    title: "ABG & Oxygenation Lab",
    description: "Interpret acid-base patterns and oxygenation clues with deterministic logic.",
    path: "/abg-lab",
    metric: "Interpret",
    signal: "Active",
  },
  {
    key: "brainsheets",
    tag: "Shift Organization",
    title: "Brain Sheets",
    description: "Open printable organization sheets for med-surg, ICU, telemetry, ED, and night shift.",
    path: "/brain-sheets",
    metric: "Organize",
    signal: "New PDFs",
  },
];

const QUICK_ACTIONS = [
  {
    label: "Think through a change",
    detail: "Open Copilot with the reasoning workspace ready.",
    path: "/copilot",
    event: "home_quick_action_copilot",
  },
  {
    label: "Build a shift sheet",
    detail: "Start with printable Brain Sheets.",
    path: "/brain-sheets",
    event: "home_quick_action_brain_sheets",
  },
  {
    label: "Check a rhythm",
    detail: "Practice or compare ECG patterns.",
    path: "/rhythm-lab",
    event: "home_quick_action_rhythm_lab",
  },
];

function CELogo() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 225 200"
      xmlns="http://www.w3.org/2000/svg"
      fill="var(--ce-teal)"
      aria-label="Clinical Edge"
      className="ce-home-logo"
    >
      <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z" />
      <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z" />
      <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z" />
      <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z" />
    </svg>
  );
}

function readJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function ModuleCard({ module, index, onNavigate }) {
  const open = () => {
    trackEvent(MODULE_OPEN_EVENTS[module.key] ?? "module_opened", { route: "/" });
    onNavigate(module.path);
  };

  return (
    <button
      type="button"
      className="ce-command-card ce-card-enter"
      style={{ animationDelay: `${index * 35}ms` }}
      onClick={open}
    >
      <span className="ce-command-card__topline">
        <span>{module.tag}</span>
        <span>{module.signal}</span>
      </span>
      <span className="ce-command-card__title">{module.title}</span>
      <span className="ce-command-card__desc">{module.description}</span>
      <span className="ce-command-card__footer">
        <span>{module.metric}</span>
        <span aria-hidden="true">Open</span>
      </span>
    </button>
  );
}

function QuickAction({ action, onNavigate }) {
  return (
    <button
      type="button"
      className="ce-shift-action ce-pressable"
      onClick={() => {
        trackEvent(action.event);
        onNavigate(action.path);
      }}
    >
      <span>
        <strong>{action.label}</strong>
        <small>{action.detail}</small>
      </span>
      <span aria-hidden="true" className="ce-shift-action__arrow" />
    </button>
  );
}

function RecentCase({ text, savedCount, onNavigate }) {
  return (
    <button
      type="button"
      className="ce-home-continue"
      onClick={() => {
        trackEvent("home_recent_case_opened");
        onNavigate("/copilot");
      }}
    >
      <span>
        <strong>Continue from last prompt</strong>
        <small>{text}</small>
      </span>
      {savedCount > 0 && <em>{savedCount} saved</em>}
    </button>
  );
}

export default function ClinicalEdgeHome({ onNavigate }) {
  useSeo(STATIC_ROUTE_SEO["/"]);
  const [activity, setActivity] = useState({ recent: [], saved: [] });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setActivity({
        recent: readJson("clinical_edge_history", []),
        saved: readJson("clinical_edge_saved_cases", []),
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const primaryModules = MODULES.slice(0, 3);
  const secondaryModules = MODULES.slice(3);
  const latestPrompt = activity.recent[0];
  const savedCount = useMemo(() => activity.saved.length, [activity.saved.length]);

  return (
    <div className="ce-home-shell">
      <header className="ce-home-topbar">
        <div className="ce-home-header-inner ce-home-topbar__inner">
          <a
            href="/"
            className="ce-home-brand"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("/");
            }}
          >
            <CELogo />
            <span>Clinical Edge</span>
          </a>
        </div>
      </header>

      <main className="ce-home-main ce-page-enter">
        <section className="ce-home-hero">
          <div className="ce-home-hero__copy">
            <div className="ce-home-kicker">Shift command center</div>
            <h1>Clinical Edge</h1>
            <p>
              Fast clinical reasoning, reference, practice, and shift organization for nurses.
            </p>
            <div className="ce-home-hero__actions">
              <button type="button" className="ce-primary-action ce-pressable" onClick={() => onNavigate("/copilot")}>
                Start with Copilot
              </button>
              <button type="button" className="ce-secondary-action ce-pressable" onClick={() => onNavigate("/brain-sheets")}>
                Open Brain Sheets
              </button>
            </div>
          </div>

          <aside className="ce-shift-panel" aria-label="Quick actions">
            <div className="ce-shift-panel__header">
              <span>Open a workflow</span>
              <strong>Ready</strong>
            </div>
            {latestPrompt && (
              <RecentCase text={latestPrompt} savedCount={savedCount} onNavigate={onNavigate} />
            )}
            <div className="ce-shift-actions">
              {QUICK_ACTIONS.map((action) => (
                <QuickAction key={action.label} action={action} onNavigate={onNavigate} />
              ))}
            </div>
          </aside>
        </section>

        <section className="ce-home-workspace" aria-label="Clinical Edge workspace">
          <div className="ce-home-workspace__main">
            <div className="ce-section-heading">
              <span>Core tools</span>
              <h2>Choose the kind of work you are doing.</h2>
            </div>
            <div className="ce-command-grid ce-command-grid--primary">
              {primaryModules.map((module, index) => (
                <ModuleCard key={module.key} module={module} index={index} onNavigate={onNavigate} />
              ))}
            </div>
            <div className="ce-command-grid ce-command-grid--secondary">
              {secondaryModules.map((module, index) => (
                <ModuleCard key={module.key} module={module} index={index + primaryModules.length} onNavigate={onNavigate} />
              ))}
            </div>
          </div>

          <aside className="ce-context-rail" aria-label="Workspace context">
            <div className="ce-context-card ce-context-card--dark">
              <span className="ce-context-card__eyebrow">Clinical guardrail</span>
              <p>No PHI. No diagnosis. Use for education, organization, and clinical reasoning support.</p>
            </div>

            {latestPrompt ? (
              <div className="ce-context-card">
                <span className="ce-context-card__eyebrow">Recent activity</span>
                <p>{activity.recent.length} recent Copilot prompt{activity.recent.length === 1 ? "" : "s"} available from this device.</p>
              </div>
            ) : (
              <div className="ce-context-card">
                <span className="ce-context-card__eyebrow">Continue faster</span>
                <p>Your recent Copilot prompts will appear here after you use the reasoning workspace.</p>
              </div>
            )}

            <div className="ce-context-card">
              <span className="ce-context-card__eyebrow">Best next workflow</span>
              <p>Start with Copilot when a situation feels unclear, then jump into Reference Hub or ABG Lab for focused checks.</p>
            </div>
          </aside>
        </section>

        <footer className="ce-home-footer">
          <p>Educational and clinical reasoning support only. Follow local protocol, provider guidance, and institutional policy.</p>
          <div>
            <a href="/privacy" onClick={(e) => { e.preventDefault(); onNavigate("/privacy"); }}>Privacy</a>
            <a href="/support" onClick={(e) => { e.preventDefault(); onNavigate("/support"); }}>Support</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
