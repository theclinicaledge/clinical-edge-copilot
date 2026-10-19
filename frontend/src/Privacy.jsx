import { useSeo } from "./seo/useSeo.js";
import { STATIC_ROUTE_SEO } from "./seo/routeSeo.js";
import { useState, useSyncExternalStore } from "react";
import { consentSnapshot, onConsentChange, parseConsentSnapshot, saveConsent } from "./consent.js";
import "./styles/consent.css";

// In-app way to grant or withdraw consent (App Store Review Guideline 5.1.1(ii)).
function PrivacyChoices() {
  const consent = parseConsentSnapshot(useSyncExternalStore(onConsentChange, consentSnapshot, () => "none"));
  const [saved, setSaved] = useState("");
  const update = (key, value) => {
    saveConsent({ ai: consent?.ai === true, analytics: consent?.analytics === true, [key]: value });
    setSaved(key === "ai" && !value ? "AI processing turned off. Shift Brain and Ask will ask again before sending anything." : "Choice saved on this device.");
  };
  return (
    <section className="ce-privacy-choices" aria-labelledby="privacy-choices-title">
      <h2 id="privacy-choices-title">Your choices on this device</h2>
      <p>Change these anytime. They apply to this browser or app install only.</p>
      <label><input type="checkbox" checked={consent?.ai === true} onChange={(e) => update("ai", e.target.checked)} /><span>Send my Shift Brain and Ask entries to Anthropic to generate responses</span></label>
      <label><input type="checkbox" checked={consent?.analytics === true} onChange={(e) => update("analytics", e.target.checked)} /><span>Share pseudonymous product usage events with PostHog (optional)</span></label>
      <p role="status" aria-live="polite">{saved}</p>
    </section>
  );
}

export default function Privacy({ onNavigate }) {
  useSeo(STATIC_ROUTE_SEO["/privacy"]);
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--ce-navy-900)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        a { outline: none; -webkit-tap-highlight-color: transparent; }
        .privacy-back-link {
          transition: color var(--ce-dur-fast) var(--ce-ease-out);
          text-decoration-color: transparent;
          text-underline-offset: 3px;
        }
        .privacy-back-link:hover { color: var(--ce-teal); text-decoration: underline; text-decoration-color: var(--ce-teal); }
        .privacy-back-link:focus-visible { outline: 2px solid var(--ce-teal); outline-offset: 2px; }
        .privacy-footer-link { text-underline-offset: 3px; }
        .privacy-footer-link:hover { color: var(--ce-teal-deep) !important; text-decoration: underline !important; }
        .privacy-footer-link:focus-visible { outline: 2px solid var(--ce-teal); outline-offset: 2px; }
      `}</style>

      {/* ── Header — unified Clinical Edge header recipe (design-system.md §4.1) ── */}
      <div style={{
        borderBottom: "1px solid var(--ce-line-dark)",
        background: "var(--ce-navy-header)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        paddingTop: "env(safe-area-inset-top)",
        paddingLeft: "max(0px, env(safe-area-inset-left))",
        paddingRight: "max(0px, env(safe-area-inset-right))",
      }}>
        <div style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "18px 20px 14px",
          display: "flex",
          alignItems: "center",
          gap: 11,
        }}>
          <svg width="30" height="30" viewBox="0 0 225 200" xmlns="http://www.w3.org/2000/svg"
            fill="var(--ce-teal)" aria-label="Clinical Edge" style={{ flexShrink: 0 }}>
            <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z" />
            <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z" />
            <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z" />
            <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z" />
          </svg>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ce-text-light)", letterSpacing: "-0.3px", lineHeight: 1.15 }}>
            Clinical Edge
          </span>
          <a
            href="/"
            onClick={(event) => { if (!onNavigate || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onNavigate('/'); }}
            className="privacy-back-link"
            style={{
            marginLeft: "auto",
            fontSize: 11,
            color: "var(--ce-text-dim)",
            textDecoration: "none",
            fontWeight: 500,
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: "var(--ce-r-sm)",
            padding: "4px 10px",
            letterSpacing: "0.01em",
            fontFamily: "'IBM Plex Mono', monospace",
            outline: "none",
            WebkitTapHighlightColor: "transparent",
          }}
          >
            ← Home
          </a>
        </div>
      </div>

      {/* ── Warm content surface ──────────────────────────────────────── */}
      <main style={{ background: "var(--ce-warm-bg)", minHeight: "calc(100vh - 58px)", padding: "0 0 80px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px 0" }}>

          <h1 style={{
            fontWeight: 700,
            fontSize: "clamp(22px, 5vw, 30px)",
            color: "var(--ce-text-dark)",
            margin: "0 0 6px",
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
          }}>
            Privacy Policy
          </h1>
          <p style={{
            fontSize: 13,
            color: "var(--ce-text-muted)",
            fontFamily: "'IBM Plex Mono', monospace",
            margin: "0 0 36px",
            letterSpacing: "0.01em",
          }}>
            Effective date: October 18, 2026
          </p>

          <PrivacyChoices />

          {/* ── Policy sections ── */}
          {[
            {
              title: "What Clinical Edge Copilot is",
              body: "Clinical Edge supports nursing education for nurses and nursing students. Educational Ask explains concepts using general questions and fictional examples. It is not individualized diagnosis, treatment selection or emergency guidance. It does not replace clinical judgment, provider orders, or institutional protocols.",
            },
            {
              title: "Do not enter patient information",
              body: "Clinical Edge Copilot is not a HIPAA-covered platform and is not designed to handle protected health information (PHI). Do not enter patient names, medical record numbers (MRNs), dates of birth, Social Security numbers, phone numbers, addresses, or any other information that could identify a specific patient. Use general education questions or fictional examples, not real patient narratives.",
            },
            {
              title: "Information you provide in prompts",
              body: "Before anything is sent, the app asks for your explicit permission. When you submit a query or Snapshot, the information you enter is sent to our backend server and forwarded to Anthropic's Claude API, a third-party AI service, for generation; educational Ask also processes admission, relevant conversation history and complete-answer safety review. Anthropic automatically deletes API inputs and outputs within 30 days, except where content is flagged under its usage policy or longer retention is required by law. Anthropic's commercial terms apply. We do not store prompt text, normalized prompt text, or response excerpts in backend operational logs. Operational logs contain non-content metadata such as request category, length, completion status, timing, and error type. Automated identifier checks are limited and do not make the service HIPAA compliant or safe for PHI. To enforce fair-use limits, the app stores a random anonymous device ID on your device and sends it with AI requests; it is not linked to your identity, not used for tracking or advertising, and is deleted when you clear site data or delete the app.",
            },
            {
              title: "Local storage",
              body: "Clinical Edge does not automatically retain submitted clinical snapshots as recent history. If you explicitly select Save Case, the scenario, response, urgency level, timestamp, and any note you add are stored in your browser's localStorage on that device. Saved-case content is not sent through analytics. You can delete saved cases in the app or clear them through your browser settings.",
            },
            {
              title: "The Shift: device-local progress",
              body: "The private Med-Surg Clinical track keeps versioned fictional assignment snapshots, first responses, assistance history, guided retries, feedback shown and Rewind practice on this device only. Standalone Rewind practice stores its selected situation, guided responses and feedback separately on this device; it does not change original Shift responses or send practice analytics. It remains until site or app local data is cleared. Unreadable or incompatible practice records are preserved without replacement. Earlier standalone Shift and Replay progress is separate and is not reclassified as independent track evidence. Unknown content versions stop for export or explicit clearing rather than being scored against a new key. Storage failures are disclosed; in-memory progress can be lost on refresh. Learners control exporting or clearing their record. The private track sends no analytics events and has no autocapture or session recording. The Shift uses fictional, prewritten nursing scenarios. It does not ask you to enter patient information or use AI to generate gameplay. Your place, selected choices, revealed findings and optional another-shift response are saved in this browser or app on this device. Your choices and findings are not submitted as scenario responses to Clinical Edge. If you opt in to product analytics, we send only the scenario identifier and version, an anonymous play identifier, and the step reached, resumed or completed. We do not send your answers. Progress remains until you restart that scenario or clear the site or app's local data; clearing data may remove progress. When device storage is unavailable, progress lasts only while this tab remains open. Progress is not synchronized across devices. Opening Ask is separate: the handoff lets you copy an educational question. It does not automatically submit that question or your scenario choices. Ask's existing consent, AI-processing disclosures, privacy limits and daily allowance apply when you choose to submit a question there.",
            },
            {
              title: "Analytics and usage data",
              body: "Only if you opt in, we send limited product usage events to PostHog: page or feature visited, Shift scenario/version and step, and whether an Ask or tool request succeeded or failed. We do not send questions, answers, form inputs, patient information or your Shift choices. A random pseudonymous identifier stored on this device connects visits over time; it is not your Ask usage-limit identifier. Campaign labels from links may be included after validation. PostHog receives standard connection information such as IP address when events are sent. Analytics is off unless you opt in. Turning it off stops future collection and clears our analytics identifier on this device, but cannot erase events already received by PostHog. Clearing local data or using another device creates a different identifier.",
            },
            {
              title: "Approximate location in analytics",
              body: "PostHog previously used connection IP addresses to add approximate location to opted-in usage events, including city, region, country, postal code, approximate coordinates and timezone. These estimates are linked to the device's pseudonymous analytics identifier; they are not GPS measurements. We disabled PostHog's GeoIP enrichment on October 17, 2026. Previously enriched events still retain their location properties; disabling enrichment does not remove historical data. Our current PostHog Free plan specifies one year of event retention. This is not a confirmed automatic-deletion deadline, and we have not confirmed a maximum storage period for historical events. Withdrawing analytics consent stops future analytics from this device. Neither withdrawal nor clearing the local identifier erases events already received. Selective removal of historical location properties is not available through PostHog's documented self-service tools, and removal has not been confirmed. Contact us using the address below for privacy requests.",
            },
            {
              title: "How information is used",
              body: "Information processed through the app is used to: (1) check educational scope, generate explanations and review complete answers; (2) monitor reliability through aggregate, non-content operational metadata; and (3) if you opt in, understand aggregate product usage through analytics. We do not sell data, use it for advertising, or track you across other apps or websites. We do not share query content with third parties beyond what is necessary for the disclosed AI processing, and we do not use it for any other purpose without asking you again.",
            },
            {
              title: "Third-party services",
              body: "Clinical Edge Copilot uses the following third-party services:\n\n• Anthropic (Claude API): processes the information you submit to generate AI responses.\n• Render: hosts our backend server, which processes requests and temporarily holds educational conversation history in volatile memory for up to ten minutes; no durable chat storage is used.\n• Vercel: hosts the website.\n• PostHog: receives limited product events only after optional analytics consent.\n• Google Fonts: fonts are loaded from Google's servers, which receive standard request information such as your IP address.\n\nWe share data with these providers only as needed to run the service. Their own privacy policies also apply.",
            },
            {
              title: "Retention, deletion and withdrawing consent",
              body: "Educational Ask retains submitted questions and delivered educational turns in volatile server memory for up to ten minutes, until withdrawal or expiry, and loses them on server restart. Relevant history and generated answers are sent to Anthropic for admission, generation and safety review. Conversation content is not written to operational logs or durable chat storage. Operational logs hold only non-content metadata. Saved cases remain a separate explicit feature and stay on your device until deleted. Anthropic's retention is described above. You can withdraw AI processing or analytics consent at any time using the choices at the top of this page, or withdraw educational conversation consent inside Ask. Withdrawal stops future sending and cancels active educational work when the server receives it; it cannot recall data already processed by Anthropic. For any other privacy request, email the contact below.",
            },
            {
              title: "Cookies",
              body: "Clinical Edge Copilot does not use cookies for tracking or advertising. With analytics opt-in, we use a device-local random identifier for product measurement; no session replay or input capture is enabled. Google Fonts may use similar technologies subject to its policy.",
            },
            {
              title: "No accounts or payments",
              body: "Clinical Edge Copilot does not currently require user accounts, registration, or payment. No personal information is collected at sign-up because no sign-up exists.",
            },
            {
              title: "Contact",
              body: "For questions about this privacy policy or the app, contact: clinicaledgehq@gmail.com",
            },
          ].map(({ title, body }) => (
            <div key={title} style={{
              background: "var(--ce-warm-card)",
              border: "1px solid var(--ce-warm-line)",
              borderLeft: "3px solid var(--ce-gold)",
              borderRadius: "var(--ce-r-md)",
              padding: "16px 18px",
              marginBottom: 10,
            }}>
              <div style={{
                fontSize: "var(--ce-fs-eyebrow)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "var(--ce-track-eyebrow)",
                color: "var(--ce-gold-deep)",
                marginBottom: 8,
                fontFamily: "'IBM Plex Mono', monospace",
              }}>
                {title}
              </div>
              <p style={{
                fontSize: 14,
                lineHeight: 1.78,
                color: "var(--ce-navy-700)",
                margin: 0,
                whiteSpace: "pre-line",
              }}>
                {body}
              </p>
            </div>
          ))}

          {/* ── Footer ── */}
          <footer style={{
            marginTop: 40,
            paddingTop: 20,
            borderTop: "1px solid rgba(0,0,0,0.08)",
            fontSize: 11,
            color: "var(--ce-text-muted)",
            fontFamily: "'IBM Plex Mono', monospace",
            lineHeight: 1.75,
            textAlign: "center",
          }}>
            Clinical Edge Copilot · theclinicaledge.org<br />
            Your clinical judgment comes first.<br />
            <span style={{ display: "inline-flex", gap: 16 }}>
              <a href="/terms" onClick={(event) => { if (!onNavigate || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onNavigate('/terms'); }} className="privacy-footer-link" style={{ color: "var(--ce-text-muted)", textDecoration: "none" }}>Terms</a>
              <a href="/support" onClick={(event) => { if (!onNavigate || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onNavigate('/support'); }} className="privacy-footer-link" style={{ color: "var(--ce-text-muted)", textDecoration: "none" }}>Support</a>
            </span>
          </footer>

        </div>
      </main>
    </div>
  );
}
