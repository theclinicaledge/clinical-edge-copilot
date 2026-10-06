import { trackEvent } from "./analytics";
import { ClinicalEdgeMark } from "./components/ModuleHeader.jsx";
import { useSeo } from "./seo/useSeo.js";
import { STATIC_ROUTE_SEO } from "./seo/routeSeo.js";
import "./styles/landing.css";

const WORKFLOW = [
  { title: "Reported information", detail: "The facts supplied in a fictional case." },
  { title: "Reasoning", detail: "How a proposed interpretation relates to those facts." },
  { title: "Distinguish possibilities", detail: "What additional information could clarify uncertainty." },
  { title: "Physiology / why", detail: "The learning concept behind the pattern." },
];

function PracticeCta({ placement, onEnterScenario }) {
  return <div className="ce-acquisition__cta-group">
    <button
      type="button"
      className="ce-acquisition__primary"
      disabled
      aria-describedby={`practice-status-${placement}`}
      onClick={() => {
        trackEvent('landing_primary_cta_clicked', { destination: 'scenario', placement });
        onEnterScenario?.();
      }}
    >Try a fictional practice scenario</button>
    <p id={`practice-status-${placement}`} className="ce-acquisition__practice-status">
      Practice entry pending clinical review.
    </p>
  </div>;
}

export default function Landing({ onEnterScenario }) {
  useSeo(STATIC_ROUTE_SEO["/landing"]);
  return <div className="ce-acquisition">
    <header className="ce-acquisition__header">
      <a className="ce-acquisition__brand" href="/" aria-label="Clinical Edge workspace">
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
          Moving into ICU brings new “why” questions. Clinical Edge is a nursing-focused
          learning workspace, designed to connect fictional scenarios with reasoning and physiology.
        </p>
        <PracticeCta placement="hero" onEnterScenario={onEnterScenario} />
        <p className="ce-acquisition__welcome">Designed with ICU transitions in mind. Nurses from other settings are welcome.</p>
      </section>

      <section className="ce-acquisition__section ce-acquisition__example" aria-labelledby="learning-example-title">
        <div className="ce-acquisition__section-intro">
          <p className="ce-acquisition__eyebrow">From information to understanding</p>
          <h2 id="learning-example-title">Fictional learning example</h2>
          <p>One nursing-focused workflow: what is reported, how to reason about it, what remains uncertain, and why the physiology matters.</p>
        </div>
        <figure className="ce-acquisition__workflow">
          <figcaption>
            <span className="ce-acquisition__review-label">Example awaiting clinical-owner approval</span>
            <p>The outline below is not generated output. A reviewed fictional case and learning takeaway will be added before this experience is offered.</p>
          </figcaption>
          <ol>
            {WORKFLOW.map((item, index) => <li key={item.title}>
              <span className="ce-acquisition__step" aria-hidden="true">0{index + 1}</span>
              <h3>{item.title}</h3><p>{item.detail}</p>
            </li>)}
          </ol>
        </figure>
      </section>

      <section className="ce-acquisition__section" aria-labelledby="two-jobs-title">
        <div className="ce-acquisition__section-intro">
          <p className="ce-acquisition__eyebrow">Two learning jobs</p>
          <h2 id="two-jobs-title">A question to understand. A scenario to work through.</h2>
        </div>
        <div className="ce-acquisition__jobs">
          <article>
            <span className="ce-acquisition__job-status">Upcoming · not publicly available</span>
            <h3>Ask a nursing question</h3>
            <p>A dedicated experience for general nursing education questions. This Ask experience is upcoming and is not currently available on the public website.</p>
          </article>
          <article>
            <span className="ce-acquisition__job-status">Practice entry awaiting review</span>
            <h3>Work through a practice scenario</h3>
            <p>Connect reported information, reasoning questions and physiology in a structured fictional case. A reviewed practice entry is being prepared.</p>
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
        <div className="ce-acquisition__links"><a href="/privacy">Privacy</a><a href="/support">Support</a></div>
      </section>

      <section className="ce-acquisition__section ce-acquisition__closing" aria-labelledby="practice-cta-title">
        <h2 id="practice-cta-title">Start with one fictional practice scenario.</h2>
        <PracticeCta placement="closing" onEnterScenario={onEnterScenario} />
      </section>
    </main>

    <footer className="ce-acquisition__footer">
      <span>Clinical Edge · Nursing education &amp; practice</span>
      <div className="ce-acquisition__links"><a href="/privacy">Privacy</a><a href="/support">Support</a></div>
    </footer>
  </div>;
}
