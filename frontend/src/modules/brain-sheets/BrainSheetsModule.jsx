import { useCallback, useEffect, useState } from 'react';
import { useSeo, SITE_URL } from '../../seo/useSeo.js';
import { STATIC_ROUTE_SEO } from '../../seo/routeSeo.js';
import { trackEvent } from '../../analytics';
import ModuleHeader from '../../components/ModuleHeader.jsx';
import { TEMPLATES, getTemplateById } from './data/templates.jsx';
// TEMPORARY — B2 review-only import. Remove alongside the branch below and
// components/SheetFramePrototypeB2.jsx once B2 is approved and production
// sheets (B3–B5) replace the prototype (removal verified in B9).
import SheetFramePrototypeB2 from './components/SheetFramePrototypeB2.jsx';
import '../../styles/tokens.css';
import './brain-sheets.css';

function Header({ showBack, onBack, onGoHome }) {
  return <ModuleHeader moduleName="Brain Sheets" onGoHome={onGoHome} onBack={showBack ? onBack : undefined} backLabel="Brain Sheets" />;
}

// ── Library index ───────────────────────────────────────────────────────────────
function IndexView({ templates, onSelect, onGoHome }) {
  useSeo(STATIC_ROUTE_SEO['/brain-sheets']);

  return (
    <div className="bs-page bs-page--library ce-workspace">
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
// Analytics follows brain-sheet-spec.md §8: `template_downloaded` is reserved
// for the explicit Download PDF action only. Print / Save PDF, mobile share,
// preview, and Copy Link intentionally do not fire it.

function isTouchDevice() {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// A raw `<a href="…pdf" download>` navigation is unsafe in two overlapping
// contexts, so both are checked and OR'd together (kept small and local to
// this component — not a shared device-detection utility):
//   - Installed home-screen PWA (`display-mode: standalone`, or iOS's older
//     `navigator.standalone`): there is no browser chrome at all here, so a
//     full-page PDF navigation has no back control whatsoever — confirmed
//     trap on iPhone, the exact bug this fix addresses.
//   - Any touch/mobile browsing context: even inside ordinary mobile Safari,
//     `target="_blank"` and `download` are unreliable enough (iOS/WebKit)
//     that a full-page PDF navigation can still replace the app's tab.
function isStandaloneOrRiskyMobile() {
  if (typeof window === 'undefined') return false;
  const standaloneDisplayMode =
    typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = window.navigator?.standalone === true;
  return standaloneDisplayMode || iosStandalone || isTouchDevice();
}

// `window.print()` is unreliable on iOS: it is a documented no-op when this
// page runs installed to the home screen (`display-mode: standalone` — this
// app is configured as an installable PWA, see index.html), and is
// inconsistent across mobile browser chrome generally. Feature detection
// uses a throwaway File — this never touches the real PDF or any patient
// data, it only asks the platform "can you share a PDF file at all."
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
  const [shareFailed, setShareFailed] = useState(false);
  const canonicalUrl = `${SITE_URL}/brain-sheets/${template.id}`;
  const isMobileRisk = isStandaloneOrRiskyMobile();
  const mobileShareSupported = isMobileRisk && !!template.pdfPath && supportsFileShare();
  const showFallbackPanel = isMobileRisk && !!template.pdfPath && (!mobileShareSupported || shareFailed);

  const handlePrint = useCallback(() => {
    // No analytics here — template_downloaded wiring is a pending decision
    // (see comment above), not this block's to make silently.
    window.print();
  }, []);

  // Mobile/PWA replacement for BOTH Download PDF and Print / Save PDF — the
  // OS share sheet already exposes Save to Files, Print, and AirDrop, so
  // there is no separate mobile print action (spec: "do not show a separate
  // Print button on mobile if the share sheet already exposes Print"). Never
  // navigates `window.location` to the PDF URL; the Clinical Edge page stays
  // open regardless of outcome.
  const handleSaveShare = useCallback(async () => {
    try {
      const response = await fetch(template.pdfPath);
      const blob = await response.blob();
      const file = new File([blob], template.pdfFilename, { type: 'application/pdf' });
      if (!navigator.canShare?.({ files: [file] }) || !navigator.share) {
        setShareFailed(true);
        return;
      }
      await navigator.share({ files: [file], title: template.pdfTitle });
      setShareFailed(false);
    } catch (err) {
      // The share sheet reports a user-dismissed share as AbortError — that
      // is a cancellation, not a failure, and shows no error.
      if (err?.name === 'AbortError') return;
      setShareFailed(true);
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
        {!isMobileRisk && template.pdfPath && (
          <a
            href={template.pdfPath}
            download={template.pdfFilename}
            target="_blank"
            rel="noopener noreferrer"
            className="bs-btn bs-btn-primary"
            onClick={() => trackEvent('template_downloaded', { template_id: template.id })}
          >
            Download PDF
          </a>
        )}
        {!isMobileRisk && (
          <button type="button" className="bs-btn bs-btn-secondary" onClick={handlePrint}>
            Print / Save PDF
          </button>
        )}
        {isMobileRisk && mobileShareSupported && (
          <button type="button" className="bs-btn bs-btn-primary" onClick={handleSaveShare}>
            Save / Share PDF
          </button>
        )}
        <button type="button" className="bs-btn bs-btn-secondary" onClick={handleCopyLink}>
          <span key={copyState === 'copied' ? 'copied' : 'copy'} className="ce-swap-fast">
            {copyState === 'copied' ? '✓ Copied' : 'Copy Link'}
          </span>
        </button>
      </div>
      {!isMobileRisk && (
        <p className="bs-print-note">
          For best results: Letter, Portrait, 100% scale, browser headers and footers off.
          Browser print settings remain under your control — this path does not
          guarantee removal of browser-added headers or footers.
        </p>
      )}
      {isMobileRisk && mobileShareSupported && (
        <p className="bs-print-note">
          Use Save / Share PDF to print, save to Files, or send the blank sheet.
        </p>
      )}
      {showFallbackPanel && (
        <div className="bs-pdf-fallback">
          <p>Your device could not open the PDF safely inside the app.</p>
          <p>Open Clinical Edge in Safari to download the file, or use Copy Link.</p>
          <a
            href={canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bs-btn bs-btn-secondary"
          >
            Open in Safari
          </a>
        </div>
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
  useEffect(() => {
    trackEvent('template_viewed', { template_id: template.id });
  }, [template.id]);

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
  const goToIndex = useCallback(() => navigate('/brain-sheets'), [navigate]);
  const openTemplate = useCallback((id) => navigate(`/brain-sheets/${id}`), [navigate]);

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
