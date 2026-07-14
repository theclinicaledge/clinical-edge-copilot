// ─── Clinical Edge — Clinical Trust Panel ────────────────────────────────────
// Reusable "Sources & review" disclosure. Content modules pass their own
// source list, review metadata, and reused safety disclaimer — this
// component owns only presentation, accessibility, and the analytics event.

import { useId, useState } from 'react';
import { trackEvent } from '../../analytics';
import './clinicalTrust.css';

export default function ClinicalTrustPanel({ module, context, sources, reviewMeta, disclaimer }) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();

  function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      trackEvent('clinical_sources_opened', { module, source_context: context });
    }
  }

  return (
    <div className="ctp-panel">
      <div className="ctp-summary">
        <span className="ctp-summary__label">Sources &amp; review</span>
        <p className="ctp-summary__line">{reviewMeta.summaryLine}</p>
        <p className="ctp-summary__status">{reviewMeta.statusLabel}</p>
      </div>

      <button
        type="button"
        className="ctp-toggle"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={handleToggle}
      >
        <span>{open ? 'Hide sources and review details' : 'View sources and review details'}</span>
        <span className={`ctp-toggle__chevron${open ? ' ctp-toggle__chevron--open' : ''}`} aria-hidden="true">
          ›
        </span>
      </button>

      <div id={bodyId} className={`ctp-body${open ? '' : ' ctp-body--hidden'}`}>
        <p className="ctp-body__explainer">
          {reviewMeta.reviewScope} draws on the authoritative source categories below.
          {reviewMeta.reviewStatus === 'reviewed' && reviewMeta.lastReviewed
            ? ` Last reviewed ${reviewMeta.lastReviewed}.`
            : ' A dated clinical review has not yet been published for this content.'}
        </p>

        {sources.length > 0 && (
          <ul className="ctp-source-list">
            {sources.map(source => (
              <li key={source.id} className="ctp-source">
                <a
                  className="ctp-source__link"
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {source.title}
                </a>
                <span className="ctp-source__org">{source.organization}</span>
                {source.description && (
                  <span className="ctp-source__desc">{source.description}</span>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="ctp-body__policy">
          Bedside administration is governed by the active order, pharmacy guidance, and local institutional policy.
        </p>

        {disclaimer && <p className="ctp-body__disclaimer">{disclaimer}</p>}
      </div>
    </div>
  );
}
