import { trackEvent } from "./analytics";
import { useSeo } from "./seo/useSeo.js";
import { STATIC_ROUTE_SEO } from "./seo/routeSeo.js";
import { ClinicalEdgeMark } from "./components/ModuleHeader.jsx";
import AppStoreBadge from "./components/AppStoreBadge.jsx";
import { CHECK_ACTIONS, LEARN_ACTIONS } from "./components/workspaceActions.js";
import "./styles/workspace-navigation.css";
import { SHIFT_ENABLED } from './shiftFeature.js';

function IntentLink({ action, onNavigate, learning = false }) {
  return <a className={learning ? "ce-home-learning-card" : undefined} href={action.path} onClick={(event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (action.event) trackEvent(action.event, { source: "command_home" });
    onNavigate(action.path);
  }}><span>{learning && <span className="ce-home-learning-card__category">{action.path === "/rhythm-lab" ? "ECG learning" : "Acid-base learning"}</span>}<strong>{action.label}</strong><small>{action.detail}</small></span><span className="ce-home-link-arrow" aria-hidden="true">&#8594;</span></a>;
}

export default function ClinicalEdgeHome({ onNavigate }) {
  useSeo(STATIC_ROUTE_SEO["/"]);
  const AskHeading = SHIFT_ENABLED ? 'h2' : 'h1';

  return <div className="ce-command-home">
    <header className="ce-command-home__header"><div><ClinicalEdgeMark /><strong>Clinical Edge</strong><span>For nurses</span></div></header>
    <main className="ce-command-home__main">
      {SHIFT_ENABLED && <section className="ce-home-shift" aria-labelledby="home-shift-title"><span>The Shift</span><h1 id="home-shift-title">Experience nursing.<br />Five minutes at a time.</h1><p>Five fictional shifts. Look closer, connect the clues, and understand the why.</p><a className="ce-home-ask" href="/learn" onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onNavigate('/learn'); }}>Choose your shift <span aria-hidden="true">&#8594;</span></a><small>Fictional nursing education</small></section>}
      <section className={`ce-home-feature${SHIFT_ENABLED ? ' ce-home-feature--companion' : ''}`} aria-labelledby="home-learning-title">
        <div className="ce-home-feature__label"><strong>Ask Clinical Edge</strong></div>
        <AskHeading id="home-learning-title">Understand the why.</AskHeading>
        <p>Explore nursing concepts and clinical reasoning, one conversation at a time.</p>
        <a className="ce-home-ask" href="/ask" onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onNavigate('/ask'); }}>Ask a question <span aria-hidden="true">&#8594;</span></a>
      </section>
      <div className="ce-command-home__immediate">
        <section aria-labelledby="learn-title"><h2 id="learn-title">Learn</h2><div className="ce-home-learning-grid">{LEARN_ACTIONS.map((action) => <IntentLink key={action.path} action={action} onNavigate={onNavigate} learning />)}</div></section>
        <section className="ce-command-home__check" aria-labelledby="check-title">
          <h2 id="check-title">References</h2>
          <div className="ce-command-home__checks">{CHECK_ACTIONS.map((action) => <IntentLink key={action.path} action={action} onNavigate={onNavigate} />)}</div>
        </section>
      </div>
      <div className="ce-command-home__secondary ce-command-home__links"><IntentLink action={{ label: "Brain Sheets", detail: "Blank printable templates", path: "/brain-sheets", event: "brain_sheets_module_opened" }} onNavigate={onNavigate} /></div>
      <footer className="ce-command-home__footer"><div className="ce-home-footer-copy"><p>Education and reasoning support. Follow local policy and clinical judgment.</p><div className="ce-home-footer-links"><a href="/privacy" onClick={(e) => { e.preventDefault(); onNavigate("/privacy"); }}>Privacy</a><a href="/terms" onClick={(e) => { e.preventDefault(); onNavigate("/terms"); }}>Terms</a><a href="/support" onClick={(e) => { e.preventDefault(); onNavigate("/support"); }}>Support</a></div></div><AppStoreBadge placement="footer" height={40} /></footer>
    </main>
  </div>;
}
