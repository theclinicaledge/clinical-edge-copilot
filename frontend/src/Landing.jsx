import { trackEvent } from "./analytics";
import { ClinicalEdgeMark } from "./components/ModuleHeader.jsx";
import AppStoreBadge from "./components/AppStoreBadge.jsx";
import { useSeo } from "./seo/useSeo.js";
import { STATIC_ROUTE_SEO } from "./seo/routeSeo.js";
import "./styles/landing.css";

function AskCta({ placement, onNavigate }) {
  return <div className="ce-acquisition__cta-group">
    <a
      href="/ask"
      className="ce-acquisition__primary"
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        trackEvent('landing_primary_cta_clicked', { destination: 'ask', placement });
        if (onNavigate) { event.preventDefault(); onNavigate('/ask'); }
      }}
    >Ask Clinical Edge <span aria-hidden="true">&#8594;</span></a>
    <p className="ce-acquisition__practice-status">For nursing education</p>
  </div>;
}

export default function Landing({ onNavigate }) {
  useSeo(STATIC_ROUTE_SEO["/landing"]);
  const navigate = (event) => {
    if (!onNavigate || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); onNavigate(event.currentTarget.getAttribute('href'));
  };
  return <div className="ce-acquisition">
    <header className="ce-acquisition__header">
      <a className="ce-acquisition__brand" href="/" onClick={navigate} aria-label="Clinical Edge workspace">
        <ClinicalEdgeMark size={28} /><strong>Clinical Edge</strong>
      </a>
      <span className="ce-acquisition__header-note">Nursing education &amp; practice</span>
    </header>

    <main>
      <section className="ce-acquisition__hero" aria-labelledby="landing-title">
        <p className="ce-acquisition__eyebrow">For nurses transitioning into critical-care practice</p>
        <h1 id="landing-title">Understand the why <span>behind critical-care nursing.</span></h1>
        <p className="ce-acquisition__category">The bedside clinical copilot built specifically for nurses.</p>
        <p className="ce-acquisition__lead">
          Moving into ICU brings new “why” questions. Explore nursing concepts with Ask Clinical Edge,
          then build understanding with Rhythm Lab, ABG Lab and clinical references.
        </p>
        <AskCta placement="hero" onNavigate={onNavigate} />
        <AppStoreBadge placement="landing" />
        <p className="ce-acquisition__welcome">Designed with ICU transitions in mind. Nurses from other settings are welcome.</p>
      </section>

      <section className="ce-acquisition__section" aria-labelledby="two-jobs-title">
        <div className="ce-acquisition__section-intro">
          <p className="ce-acquisition__eyebrow">Two learning jobs</p>
          <h2 id="two-jobs-title">Ask a question. Keep learning.</h2>
        </div>
        <div className="ce-acquisition__jobs">
          <article>
            <span className="ce-acquisition__job-status">Ask Clinical Edge</span>
            <h3>Ask a nursing question</h3>
            <p>Explore physiology, compare concepts and ask follow-up questions. Educational explanations, not individualized care decisions.</p>
            <a className="ce-acquisition__tool-link" href="/ask" onClick={navigate}>Open Ask <span aria-hidden="true">&#8594;</span></a>
          </article>
          <article>
            <span className="ce-acquisition__job-status">Learning tools</span>
            <h3>Explore rhythms and acid-base concepts</h3>
            <p>Practice rhythm recognition, compare strips and work through ABG interpretation with the existing learning tools.</p>
            <div className="ce-acquisition__links"><a href="/rhythm-lab" onClick={navigate}>Rhythm Lab</a><a href="/abg-lab" onClick={navigate}>ABG Lab</a></div>
          </article>
        </div>
      </section>

      <section className="ce-acquisition__section ce-acquisition__founder" aria-labelledby="founder-title">
        <div>
          <p className="ce-acquisition__eyebrow">Why Clinical Edge exists</p>
          <h2 id="founder-title">Built by a nurse who made the transition.</h2>
        </div>
        <div className="ce-acquisition__founder-story">
          <p className="ce-acquisition__founder-name">Mohamed · practicing CTICU RN</p>
          <p>I’m Mohamed. My path took me from Med-Surg/telemetry through PCU into ICU. That transition brought more “why” questions—and shaped the nursing-focused learning workspace I wanted to build.</p>
          <p className="ce-acquisition__founder-path">Med-Surg/telemetry <span aria-hidden="true">→</span> PCU <span aria-hidden="true">→</span> ICU</p>
        </div>
      </section>

      <section className="ce-acquisition__section ce-acquisition__boundaries" aria-labelledby="boundaries-title">
        <p className="ce-acquisition__eyebrow">Educational boundaries</p>
        <h2 id="boundaries-title">Practice alongside your training.</h2>
        <p>For nursing education and reasoning practice. Use fictional scenarios and general education only; do not enter real patient information.</p>
        <p>AI can be wrong. Clinical Edge does not diagnose or prescribe. Clinical judgment, provider orders, preceptors and local policy remain essential.</p>
        <div className="ce-acquisition__links"><a href="/privacy" onClick={navigate}>Privacy</a><a href="/terms" onClick={navigate}>Terms</a><a href="/support" onClick={navigate}>Support</a></div>
      </section>

      <section className="ce-acquisition__section ce-acquisition__closing" aria-labelledby="practice-cta-title">
        <h2 id="practice-cta-title">Start with your next nursing question.</h2>
        <AskCta placement="closing" onNavigate={onNavigate} />
      </section>
    </main>

    <footer className="ce-acquisition__footer">
      <span>Clinical Edge · Nursing education &amp; practice</span>
      <AppStoreBadge placement="footer" height={40} />
      <div className="ce-acquisition__links"><a href="/privacy" onClick={navigate}>Privacy</a><a href="/terms" onClick={navigate}>Terms</a><a href="/support" onClick={navigate}>Support</a></div>
    </footer>
  </div>;
}
