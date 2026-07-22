import { useCallback, useState } from 'react';
import { useSeo, SITE_URL } from '../../seo/useSeo.js';
import { STATIC_ROUTE_SEO } from '../../seo/routeSeo.js';
import { TEMPLATES, getTemplateById } from './data/templates.jsx';
// TEMPORARY — B2 review-only import. Remove alongside the branch below and
// components/SheetFramePrototypeB2.jsx once B2 is approved and production
// sheets (B3–B5) replace the prototype (removal verified in B9).
import SheetFramePrototypeB2 from './components/SheetFramePrototypeB2.jsx';
import '../../styles/tokens.css';
import './brain-sheets.css';

// ── CE Logo (shared mark) ─────────────────────────────────────────────────────
function CELogo() {
  return (
    <svg width="30" height="30" viewBox="0 0 225 200" xmlns="http://www.w3.org/2000/svg"
      fill="var(--ce-teal)" aria-label="Clinical Edge" style={{ flexShrink: 0, display: 'block' }}>
      <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z" />
      <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z" />
      <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z" />
      <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z" />
    </svg>
  );
}

// ── Header (design-system.md §4.1 recipe) ──────────────────────────────────────
function Header({ showBack, onBack, onGoHome }) {
  return (
    <div style={{
      borderBottom: '1px solid var(--ce-line-dark)',
      paddingTop: 'env(safe-area-inset-top)',
      paddingLeft: 'max(16px, env(safe-area-inset-left))',
      paddingRight: 'max(16px, env(safe-area-inset-right))',
      background: 'var(--ce-navy-header)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 'var(--ce-content)', margin: '0 auto', width: '100%',
        display: 'flex', alignItems: 'center',
        paddingTop: 14, paddingBottom: 14, gap: 11,
      }}>
        <CELogo />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ce-text-light)', letterSpacing: '-0.3px', lineHeight: 1.15 }}>
            Clinical Edge
          </span>
          <span style={{
            fontSize: 'var(--ce-fs-eyebrow)', fontWeight: 700, color: 'var(--ce-text-dim)',
            letterSpacing: 'var(--ce-track-eyebrow)', textTransform: 'uppercase',
            fontFamily: 'var(--ce-font-mono)', lineHeight: 1,
          }}>
            Brain Sheets
          </span>
        </div>

        {showBack ? (
          <button className="ce-back-link" onClick={onBack}>← Brain Sheets</button>
        ) : onGoHome ? (
          <button className="ce-back-link" onClick={onGoHome}>← All tools</button>
        ) : null}
      </div>
    </div>
  );
}

// ── Library index ───────────────────────────────────────────────────────────────
function IndexView({ templates, onSelect, onGoHome }) {
  useSeo(STATIC_ROUTE_SEO['/brain-sheets']);

  return (
    <div className="bs-page">
      <Header onGoHome={onGoHome} />
      <div className="bs-content">
        <div className="bs-eyebrow">Brain Sheet Library</div>
        <h1 className="bs-h1">Blank, printable shift-organization sheets.</h1>
        <p className="bs-lead">
          Seven templates for common bedside assignments — med-surg, ICU,
          telemetry, ED, night shift, and student clinicals. Print one and
          fill it in on paper the way you always have.
        </p>
        <div className="bs-info-banner">
          Every template here starts blank and stays blank in the app. Nothing
          is entered, stored, or transmitted by Clinical Edge. Once a printed
          sheet is filled in, that paper copy may contain PHI — handle it
          under your facility's policy.
        </div>
        <div className="bs-list" role="list">
          {templates.map((t) => (
            <div
              key={t.id}
              role="listitem"
              tabIndex={0}
              className="bs-list-item ce-pressable ce-card-lift"
              onClick={() => onSelect(t.id)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(t.id)}
              aria-label={t.title}
            >
              <div className="bs-list-item-title">{t.title}</div>
              <div className="bs-list-item-audience">{t.audience}</div>
              <div className="bs-list-item-meta">{t.meta}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Template page actions: Download PDF + Print / Save PDF + Copy Link ──────────
// Screen-only — lives inside the already `.bs-screen-only`-wrapped metadata
// block in DetailPlaceholder, so none of this prints. Copy Link follows the
// approved spec exactly (§7): clipboard write → confirmation → non-editable
// fallback text on failure, no analytics event ever.
//
// Download PDF is the primary acquisition action when a template has a
// pre-generated `pdfPath` (currently medsurg-4pt only — see
// data/templates.jsx and scripts/generate-brain-sheets-pdf.mjs). Templates
// without one simply don't render the button; Print / Save PDF and Copy
// Link remain available regardless.
//
// ANALYTICS DECISION PENDING (flagged, not decided silently — see final
// report): `template_downloaded` is not wired in this pass. Once it is,
// Mohamed needs to confirm whether it fires from Download PDF only, or
// from both Download PDF and Print / Save PDF.

function isTouchDevice() {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// `window.print()` is unreliable on iOS: it is a documented no-op when this
// page runs installed to the home screen (`display-mode: standalone` — this
// app is configured as an installable PWA, see index.html), and is
// inconsistent across mobile browser chrome generally. Rather than depend on
// it, touch devices that can share the actual PDF file use the OS share
// sheet instead (which itself offers Print and Save to Files). Feature
// detection uses a throwaway File — this never touches the real PDF or any
// patient data, it only asks the platform "can you share a PDF file at all."
function supportsFileShare() {
  if (typeof navigator === 'undefined' || !navigator.canShare || !navigator.share) return false;
  try {
    return navigator.canShare({ files: [new File(['x'], 'test.pdf', { type: 'application/pdf' })] });
  } catch {
    return false;
  }
}

function TemplateActions({ template }) {
  const [copyState, setCopyState] = useState('idle'); // idle | copied | fallback
  const canonicalUrl = `${SITE_URL}/brain-sheets/${template.id}`;
  const isMobile = isTouchDevice();
  const shareCapable = isMobile && !!template.pdfPath && supportsFileShare();

  const handlePrint = useCallback(() => {
    // No analytics here — template_downloaded wiring is a pending decision
    // (see comment above), not this block's to make silently.
    window.print();
  }, []);

  const handleShare = useCallback(async () => {
    try {
      const response = await fetch(template.pdfPath);
      const blob = await response.blob();
      const file = new File([blob], template.pdfFilename, { type: 'application/pdf' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: template.title });
      }
    } catch {
      // Either the user dismissed the share sheet or the share/fetch failed —
      // both are silent no-ops here. Download PDF remains the primary path.
    }
  }, [template]);

  const handleCopyLink = useCallback(async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(canonicalUrl);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('fallback');
    }
  }, [canonicalUrl]);

  return (
    <div className="bs-actions">
      <div className="bs-actions-row">
        {template.pdfPath && (
          <a
            href={template.pdfPath}
            download={template.pdfFilename}
            target="_blank"
            rel="noopener noreferrer"
            className="bs-btn bs-btn-primary"
          >
            Download PDF
          </a>
        )}
        {!isMobile && (
          <button type="button" className="bs-btn bs-btn-secondary" onClick={handlePrint}>
            Print / Save PDF
          </button>
        )}
        {isMobile && shareCapable && (
          <button type="button" className="bs-btn bs-btn-secondary" onClick={handleShare}>
            Print / Save PDF
          </button>
        )}
        <button type="button" className="bs-btn bs-btn-secondary" onClick={handleCopyLink}>
          <span key={copyState === 'copied' ? 'copied' : 'copy'} className="ce-swap-fast">
            {copyState === 'copied' ? '✓ Copied' : 'Copy Link'}
          </span>
        </button>
      </div>
      {!isMobile && (
        <p className="bs-print-note">
          For best results: Letter, Portrait, 100% scale, browser headers and footers off.
          Browser print settings remain under your control — this path does not
          guarantee removal of browser-added headers or footers.
        </p>
      )}
      {isMobile && !shareCapable && (
        <p className="bs-print-note">
          Open the downloaded PDF, then use your device’s Share or Print option.
        </p>
      )}
      {copyState === 'fallback' && (
        <div className="bs-copy-fallback">
          <div className="bs-copy-fallback-url">{canonicalUrl}</div>
          <span className="bs-copy-fallback-hint">
            {isTouchDevice() ? 'Press and hold to copy' : 'Select and copy this link'}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Sheet preview: fit-to-width default + tap-to-enlarge overlay ────────────────
// Renders the exact same production `Sheet` component used for print/PDF
// generation — never a second hand-built layout. Exactly one `<Sheet />`
// instance is mounted at a time (default OR overlay, never both), so there is
// never a risk of it printing twice. The whole overlay (backdrop, close
// button, and the sheet copy inside it) carries `.bs-screen-only`, so the
// existing print-scoping rule (brain-sheets-print.css) hides all of it
// outright — the overlay itself must never print, full stop, per spec. The
// default (non-overlay) preview has no such class and prints normally.
function TemplatePreview(props) {
  const { Sheet, title } = props;
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <div className="bs-preview-overlay bs-screen-only" role="dialog" aria-modal="true" aria-label={`${title} — full preview`}>
        <button type="button" className="bs-preview-close" onClick={() => setOpen(false)}>
          Close preview
        </button>
        <div className="bs-preview-overlay-frame">
          <Sheet />
        </div>
      </div>
    );
  }

  return (
    <div className="bs-preview-slot">
      <div
        className="bs-preview-frame"
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(true);
          }
        }}
        aria-label={`View a larger preview of ${title}`}
      >
        <Sheet />
      </div>
      <p className="bs-preview-hint">Tap the preview to view it larger.</p>
    </div>
  );
}

// ── Template detail placeholder ─────────────────────────────────────────────────
// The full detail page — pearls rail — is not built yet (spec §10 B7/B8).
// Print / Save PDF and Copy Link are wired here. Explicit guard per the B1
// safe-registry design: render the sheet only when a template's `Sheet` is
// registered, otherwise fall back to metadata-only placeholder text. Never
// assumes `.Sheet` exists.
//
// The header and metadata block (including the actions) are marked
// `.bs-screen-only` — once a real `Sheet` is registered, ONLY the sheet
// itself (which renders its own `.bs-print-root`) may print; none of this
// page's surrounding chrome can leak onto paper.
function DetailPlaceholder({ template, onBack, onGoHome }) {
  const Sheet = template.Sheet;
  return (
    <div className="bs-page">
      <div className="bs-screen-only">
        <Header showBack onBack={onBack} onGoHome={onGoHome} />
      </div>
      <div className="bs-content bs-screen-only">
        <div className="bs-eyebrow">Brain Sheet</div>
        <h1 className="bs-h1">{template.title}</h1>
        <p className="bs-lead">{template.audience}</p>
        <div className="bs-meta-line">{template.meta}</div>
        {Sheet && <TemplateActions template={template} />}
        {!Sheet && (
          <div className="bs-placeholder-note">
            This template's printable sheet isn't built yet. The preview, pearls,
            and Print / Save PDF action ship in a later pass.
          </div>
        )}
      </div>
      {Sheet && (
        <div className="bs-content" style={{ paddingTop: 0 }}>
          <TemplatePreview Sheet={Sheet} title={template.title} />
        </div>
      )}
    </div>
  );
}

// Dedicated PDF-generation URL state (spec Part 3): `?pdf=1` on a template
// detail route renders ONLY that template's production `Sheet` component —
// no header, no metadata, no action buttons, no `.bs-page`/`.bs-content`
// chrome at all. This is what scripts/generate-brain-sheets-pdf.mjs
// navigates to. It reuses the exact same production component the screen
// preview and print path use — there is no separate hand-coded PDF layout.
// The sheet's own print-time sizing still comes from brain-sheets-print.css
// (the generation script activates `body.bs-print-scope` itself), so this
// flag only ever removes surrounding app chrome, never sheet content.
function isPdfGenerationMode() {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('pdf') === '1';
}

// ── Module entry ─────────────────────────────────────────────────────────────
export default function BrainSheetsModule({ templateId, navigate, onGoHome }) {
  // TEMPORARY — B2 review route only. The id is underscore-prefixed so it
  // can never collide with a real (kebab-case) template id. Remove this
  // branch when the B2 prototype is removed (spec §10, verified in B9).
  if (templateId === '_b2-prototype') {
    return (
      <SheetFramePrototypeB2
        onBack={() => navigate('/brain-sheets')}
        onGoHome={onGoHome}
      />
    );
  }

  const template = templateId ? getTemplateById(templateId) : null;

  const goToIndex = useCallback(() => navigate('/brain-sheets'), [navigate]);
  const openTemplate = useCallback((id) => navigate(`/brain-sheets/${id}`), [navigate]);

  if (template?.Sheet && isPdfGenerationMode()) {
    const Sheet = template.Sheet;
    return <Sheet />;
  }

  // Unknown or missing template id falls back to the library index rather
  // than rendering a broken detail page.
  if (!template) {
    return <IndexView templates={TEMPLATES} onSelect={openTemplate} onGoHome={onGoHome} />;
  }

  return <DetailPlaceholder template={template} onBack={goToIndex} onGoHome={onGoHome} />;
}
