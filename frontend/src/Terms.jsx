import { useSeo } from "./seo/useSeo.js";
import { STATIC_ROUTE_SEO } from "./seo/routeSeo.js";

// Text is verbatim from the approved Terms of Use. Change it only with Mohamed's approval
// and update the effective date when it changes.
const EFFECTIVE_DATE = "October 17, 2026";

const TERMS_SECTIONS = [
    {
      "title": "1. Agreement",
      "blocks": [
        {
          "text": "These Terms of Use govern your use of the Clinical Edge website at theclinicaledge.org and the Clinical Edge iOS app (together, the \"Service\"). The Service is operated by Mohamed Laayouni, doing business as Clinical Edge (\"Clinical Edge,\" \"we,\" \"us\"). By using the Service, you agree to these Terms and to our Privacy Policy. If you do not agree, do not use the Service."
        }
      ]
    },
    {
      "title": "2. Who can use Clinical Edge",
      "blocks": [
        {
          "text": "The Service is designed for registered nurses, nursing students and other healthcare professionals. You must be at least 18 years old to use it. The Service is not intended for patients or the general public seeking medical advice about themselves or others."
        }
      ]
    },
    {
      "title": "3. What Clinical Edge is",
      "blocks": [
        {
          "text": "Clinical Edge is an educational and clinical-reasoning support tool. It helps nurses learn concepts, organize their thinking and prepare to communicate with their care team. It includes AI-generated explanations, reference content, rhythm and acid-base learning tools, and printable templates."
        }
      ]
    },
    {
      "title": "4. Not medical advice",
      "blocks": [
        {
          "text": "The Service provides general educational information only. It does not:"
        },
        {
          "list": [
            "diagnose, treat or prevent any condition;",
            "provide medical, nursing, pharmacy or other professional advice for any specific patient;",
            "replace your clinical judgment, a provider's orders, your facility's policies and protocols, or your professional scope of practice; or",
            "create any clinician-patient or professional relationship."
          ]
        },
        {
          "text": "You are solely responsible for your clinical decisions. Always verify information against your facility's approved references and confirm decisions with the treating provider. Content may be incomplete, out of date or wrong, and AI-generated content can contain errors even when it sounds confident."
        }
      ]
    },
    {
      "title": "5. No patient identifiers",
      "blocks": [
        {
          "text": "The Service is not designed to receive protected health information. Do not enter names, initials, medical record numbers, dates of birth, room or bed numbers, contact details, images of records, or any other information that could identify a patient. Describe clinical situations only in general terms."
        },
        {
          "text": "You are responsible for following the privacy laws, employer policies and professional rules that apply to you, including HIPAA where relevant. Automated identifier checks in the Service are limited and do not make it safe for patient information."
        }
      ]
    },
    {
      "title": "6. Not for emergencies",
      "blocks": [
        {
          "text": "Do not use the Service to make or delay decisions in an emergency or time-critical situation. If a patient may be deteriorating, assess the patient and use your facility's rapid response, code or escalation process. Never wait for a response from the Service before acting."
        }
      ]
    },
    {
      "title": "7. Acceptable use",
      "blocks": [
        {
          "text": "You agree not to:"
        },
        {
          "list": [
            "use the Service in violation of any law, professional standard or employer policy;",
            "attempt to bypass, disable or test the limits of its safety features, rate limits, consent controls or access restrictions;",
            "copy, scrape, resell or redistribute its content, or use it to train or build a competing product;",
            "reverse engineer the Service except where the law allows it;",
            "interfere with the Service's servers or other users; or",
            "misrepresent AI-generated output as reviewed clinical guidance."
          ]
        }
      ]
    },
    {
      "title": "8. AI features",
      "blocks": [
        {
          "text": "Some features, including Ask Clinical Edge and Shift Brain, send what you enter to a third-party AI provider to generate a response. We ask for your permission before any of your entries are sent, and you can withdraw it at any time on the Privacy page. AI output is generated automatically, is not reviewed by a clinician before you see it, and may be inaccurate, incomplete or inappropriate for your situation. We may limit, pause or change AI features at any time, including for safety reasons."
        }
      ]
    },
    {
      "title": "9. Privacy",
      "blocks": [
        {
          "text": "Our Privacy Policy explains what we collect, how it is used, who receives it and how to withdraw consent. It is part of these Terms."
        }
      ]
    },
    {
      "title": "10. Third-party services",
      "blocks": [
        {
          "text": "The Service relies on third parties such as Anthropic (AI processing), Render and Vercel (hosting) and, only if you opt in, PostHog (product analytics). Their own terms and policies also apply to their services. We are not responsible for third-party services or websites linked from the Service."
        }
      ]
    },
    {
      "title": "11. Apple App Store",
      "blocks": [
        {
          "text": "If you use the iOS app, these Terms are between you and Clinical Edge, not Apple. Apple is not responsible for the app or its content, has no obligation to provide maintenance or support, and is not responsible for any claims relating to the app. Apple and its subsidiaries are third-party beneficiaries of these Terms and may enforce them against you. Your use of the app must also comply with Apple's Media Services Terms and the Licensed Application End User License Agreement."
        }
      ]
    },
    {
      "title": "12. Ownership",
      "blocks": [
        {
          "text": "The Service, including its software, design, text, rhythm strips, reference content, templates and branding, is owned by Clinical Edge or its licensors and protected by intellectual property laws. We grant you a personal, non-exclusive, non-transferable, revocable license to use the Service for your own learning and professional development. You may print Brain Sheets templates for your own use at work."
        }
      ]
    },
    {
      "title": "13. Your content",
      "blocks": [
        {
          "text": "You keep any rights you have in what you enter. You give us permission to process it only as needed to operate the Service, as described in the Privacy Policy. Saved cases are stored on your device, not on our servers. If you send us feedback or suggestions, we may use them without obligation to you."
        }
      ]
    },
    {
      "title": "14. Changes, suspension and termination",
      "blocks": [
        {
          "text": "The Service is under active development. We may add, change, pause or remove features at any time, including AI features. We may suspend or end your access if you violate these Terms or if needed to protect users, patients or the Service. You can stop using the Service at any time; clearing site data or deleting the app removes what is stored on your device."
        }
      ]
    },
    {
      "title": "15. Disclaimers",
      "blocks": [
        {
          "text": "TO THE FULLEST EXTENT PERMITTED BY LAW, THE SERVICE IS PROVIDED \"AS IS\" AND \"AS AVAILABLE,\" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF ACCURACY, COMPLETENESS, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE OR ITS CONTENT, INCLUDING AI-GENERATED CONTENT, IS ACCURATE, CURRENT, CLINICALLY APPROPRIATE, UNINTERRUPTED OR ERROR-FREE."
        }
      ]
    },
    {
      "title": "16. Limitation of liability",
      "blocks": [
        {
          "text": "TO THE FULLEST EXTENT PERMITTED BY LAW, CLINICAL EDGE WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY OR PUNITIVE DAMAGES, OR FOR ANY LOSS ARISING FROM CLINICAL DECISIONS MADE BY YOU OR OTHERS, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY FOR ANY CLAIM RELATING TO THE SERVICE WILL NOT EXCEED THE GREATER OF THE AMOUNT YOU PAID US IN THE 12 MONTHS BEFORE THE CLAIM OR $100. SOME JURISDICTIONS DO NOT ALLOW THESE LIMITATIONS, SO THEY MAY NOT FULLY APPLY TO YOU."
        }
      ]
    },
    {
      "title": "17. Indemnification",
      "blocks": [
        {
          "text": "You agree to defend and indemnify Clinical Edge against claims, losses and expenses, including reasonable attorneys' fees, arising from your misuse of the Service, your violation of these Terms or applicable law, or information you enter in violation of Section 5."
        }
      ]
    },
    {
      "title": "18. Governing law",
      "blocks": [
        {
          "text": "These Terms are governed by the laws of the State of California, without regard to conflict-of-law rules. Any dispute will be brought in the state or federal courts located in Los Angeles County, California, and you and Clinical Edge consent to their jurisdiction."
        }
      ]
    },
    {
      "title": "19. Changes to these Terms",
      "blocks": [
        {
          "text": "We may update these Terms as the Service changes. We will post the updated Terms with a new effective date and, for material changes, give notice in the Service. Continuing to use the Service after changes take effect means you accept them."
        }
      ]
    },
    {
      "title": "20. General",
      "blocks": [
        {
          "text": "If any part of these Terms is found unenforceable, the rest remains in effect. Our failure to enforce a provision is not a waiver. You may not transfer these Terms without our consent; we may transfer them in connection with a reorganization, such as forming a company, or a sale of the Service. These Terms and the Privacy Policy are the entire agreement between you and Clinical Edge about the Service."
        }
      ]
    },
    {
      "title": "21. Contact",
      "blocks": [
        {
          "text": "Questions about these Terms: clinicaledgehq@gmail.com"
        }
      ]
    }
  ];

const cardStyle = {
  background: "var(--ce-warm-card)",
  border: "1px solid var(--ce-warm-line)",
  borderLeft: "3px solid var(--ce-gold)",
  borderRadius: "var(--ce-r-md)",
  padding: "16px 18px",
  marginBottom: 10,
};

const titleStyle = {
  fontSize: "var(--ce-fs-eyebrow)",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "var(--ce-track-eyebrow)",
  color: "var(--ce-gold-deep)",
  margin: "0 0 8px",
  fontFamily: "'IBM Plex Mono', monospace",
};

const bodyStyle = {
  fontSize: 14,
  lineHeight: 1.78,
  color: "var(--ce-navy-700)",
  margin: 0,
};

function FooterLink({ path, label, onNavigate }) {
  return (
    <a
      href={path}
      onClick={(event) => { if (!onNavigate || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onNavigate(path); }}
      className="terms-footer-link"
      style={{ color: "var(--ce-text-muted)", textDecoration: "none" }}
    >
      {label}
    </a>
  );
}

export default function Terms({ onNavigate }) {
  useSeo(STATIC_ROUTE_SEO["/terms"]);
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--ce-navy-900)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        a { outline: none; -webkit-tap-highlight-color: transparent; }
        .terms-back-link {
          transition: color var(--ce-dur-fast) var(--ce-ease-out);
          text-decoration-color: transparent;
          text-underline-offset: 3px;
        }
        .terms-back-link:hover { color: var(--ce-teal); text-decoration: underline; text-decoration-color: var(--ce-teal); }
        .terms-back-link:focus-visible { outline: 2px solid var(--ce-teal); outline-offset: 2px; }
        .terms-footer-link { text-underline-offset: 3px; }
        .terms-footer-link:hover { color: var(--ce-teal-deep) !important; text-decoration: underline !important; }
        .terms-footer-link:focus-visible { outline: 2px solid var(--ce-teal); outline-offset: 2px; }
      `}</style>

      {/* ── Header: unified Clinical Edge header recipe (design-system.md §4.1) ── */}
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
            className="terms-back-link"
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
            Terms of Use
          </h1>
          <p style={{
            fontSize: 13,
            color: "var(--ce-text-muted)",
            fontFamily: "'IBM Plex Mono', monospace",
            margin: "0 0 36px",
            letterSpacing: "0.01em",
          }}>
            Effective date: {EFFECTIVE_DATE}
          </p>

          {TERMS_SECTIONS.map(({ title, blocks }) => (
            <section key={title} style={cardStyle}>
              <h2 style={titleStyle}>{title}</h2>
              {blocks.map((block, index) => block.list
                ? <ul key={index} style={{ ...bodyStyle, paddingLeft: 20, margin: index ? "10px 0 0" : 0 }}>{block.list.map((item) => <li key={item}>{item}</li>)}</ul>
                : <p key={index} style={{ ...bodyStyle, margin: index ? "10px 0 0" : 0 }}>{block.text}</p>)}
            </section>
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
            Clinical Edge · theclinicaledge.org<br />
            <span style={{ display: "inline-flex", gap: 16 }}>
              <FooterLink path="/privacy" label="Privacy" onNavigate={onNavigate} />
              <FooterLink path="/support" label="Support" onNavigate={onNavigate} />
            </span>
          </footer>

        </div>
      </main>
    </div>
  );
}
