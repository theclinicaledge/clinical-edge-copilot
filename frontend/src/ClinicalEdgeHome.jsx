import { useEffect, useState } from "react";
import { trackEvent } from "./analytics";
import { useSeo } from "./seo/useSeo.js";
import { STATIC_ROUTE_SEO } from "./seo/routeSeo.js";
import { ClinicalEdgeMark } from "./components/ModuleHeader.jsx";
import { CHECK_ACTIONS, LEARN_ACTIONS } from "./components/workspaceActions.js";
import "./styles/workspace-navigation.css";

function IntentLink({ action, onNavigate }) {
  return <a href={action.path} onClick={(event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (action.event) trackEvent(action.event, { source: "command_home" });
    onNavigate(action.path);
  }}><span><strong>{action.label}</strong><small>{action.detail}</small></span><span aria-hidden="true">&#8599;</span></a>;
}

export default function ClinicalEdgeHome({ onNavigate }) {
  useSeo(STATIC_ROUTE_SEO["/"]);
  const [savedCount, setSavedCount] = useState(0);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setSavedCount(JSON.parse(localStorage.getItem("clinical_edge_saved_cases") || "[]").length); } catch { /* Storage may be unavailable. */ }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return <div className="ce-command-home">
    <header className="ce-command-home__header"><div><ClinicalEdgeMark /><strong>Clinical Edge</strong><span>For nurses</span></div></header>
    <main className="ce-command-home__main ce-page-enter">
      <div className="ce-command-home__intro"><span>Your workspace</span><h1>What do you need right now?</h1></div>
      <a className="ce-home-ask" href="/ask" onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onNavigate('/ask'); }}><strong>Ask Clinical Edge</strong><span aria-hidden="true">&#8594;</span></a>
      <div className="ce-command-home__immediate">
        <section className="ce-command-home__work" aria-labelledby="patient-change-title">
          <span className="ce-command-home__eyebrow">Shift Brain</span>
          <h2 id="patient-change-title">Something changed.</h2>
          <a className="ce-command-home__capture" href="/copilot?capture=rapid" onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault(); trackEvent("home_quick_action_copilot"); onNavigate("/copilot?capture=rapid");
          }}><span>Describe what&apos;s happening</span><span aria-hidden="true">&#8594;</span></a>
          <p>Do not enter patient identifiers. Completed cases can be saved on this device when you choose. See Privacy for data processing and storage.<br />Reasoning support alongside clinical judgment.</p>
        </section>
        <section className="ce-command-home__check" aria-labelledby="check-title">
          <h2 id="check-title">Check something</h2>
          <div className="ce-command-home__checks">{CHECK_ACTIONS.map((action) => <IntentLink key={action.path} action={action} onNavigate={onNavigate} />)}</div>
        </section>
      </div>
      <div className="ce-command-home__secondary">
        <section aria-labelledby="learn-title"><h2 id="learn-title">Keep learning</h2><div className="ce-command-home__links">{LEARN_ACTIONS.map((action) => <IntentLink key={action.path} action={action} onNavigate={onNavigate} />)}</div></section>
        <section aria-labelledby="organize-title"><h2 id="organize-title">Organize your shift</h2><div className="ce-command-home__links"><IntentLink action={{ label: "Brain Sheets", detail: "Blank printable templates", path: "/brain-sheets", event: "brain_sheets_module_opened" }} onNavigate={onNavigate} />{savedCount > 0 && <IntentLink action={{ label: "Saved cases", detail: `${savedCount} saved on this device`, path: "/copilot" }} onNavigate={onNavigate} />}</div></section>
      </div>
      <footer className="ce-command-home__footer"><p>Education and reasoning support. Follow local policy and clinical judgment.</p><div><a href="/privacy" onClick={(e) => { e.preventDefault(); onNavigate("/privacy"); }}>Privacy</a><a href="/support" onClick={(e) => { e.preventDefault(); onNavigate("/support"); }}>Support</a></div></footer>
    </main>
  </div>;
}
