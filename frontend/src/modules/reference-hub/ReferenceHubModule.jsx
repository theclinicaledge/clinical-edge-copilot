import { useState, useMemo, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import { REFERENCES, CATEGORIES } from './data/references.js';
import { BEDSIDE_PATHWAYS, CLINICAL_CONCEPTS } from './data/pathways.js';
import { REFERENCE_TRUST, getReferenceSources } from './data/sources.js';
import { trackEvent } from '../../analytics';
import ModuleHeader from '../../components/ModuleHeader.jsx';
import '../../styles/tokens.css';
import './reference-hub.css';

// ── localStorage ─────────────────────────────────────────────────────────────

const LS_RECENT = 'ce_ref_hub_recent';
const MAX_RECENT = 5;

function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {
    // Recents are best-effort only.
  }
}

// ── Category label lookup ─────────────────────────────────────────────────────

const CAT_LABEL = Object.fromEntries(CATEGORIES.map(c => [c.id, c.label]));

// ── Header ────────────────────────────────────────────────────────────────────

function Header({ onGoHome, showBack, onBack, backLabel }) {
  return <ModuleHeader moduleName="Reference Hub" onGoHome={onGoHome} onBack={showBack ? onBack : undefined} backLabel={backLabel || 'Back'} maxWidth="800px" />;
}

function Sources({ id, pattern = false }) {
  const sources = getReferenceSources(id, pattern);
  return (
    <details className="rh-sources">
      <summary>Sources &amp; scope <span>Adult educational reference</span></summary>
      <p>{REFERENCE_TRUST.scope}</p>
      <ul>
        {sources.map(source => (
          <li key={source.id}>
            <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>
            <span>{source.organization}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

function WhyCheck({ check }) {
  const [choice, setChoice] = useState(null);
  return (
    <details className="rh-why-check">
      <summary>Quick why check</summary>
      <fieldset>
        <legend>{check.question}</legend>
        <div className="rh-why-options">
          {check.options.map((option, index) => (
            <button
              type="button"
              key={option}
              aria-pressed={choice === index}
              onClick={() => setChoice(index)}
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>
      {choice !== null && (
        <p className="rh-why-feedback" role="status">
          <strong>{choice === check.answer ? 'That connects the clues. ' : 'Reconsider the connection. '}</strong>
          {check.explanation}
        </p>
      )}
    </details>
  );
}

// ── Pathway card (landing page) ───────────────────────────────────────────────

function PathwayCard({ pathway, onSelect }) {
  return (
    <button
      type="button"
      className="rh-pathway-card"
      onClick={() => onSelect(pathway)}
      aria-label={pathway.title}
    >
      <span className="rh-pathway-card-icon" aria-hidden="true">{pathway.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="rh-pathway-card-title">{pathway.title}</div>
        <div className="rh-pathway-card-subtitle">{pathway.subtitle}</div>
        <div className="rh-pathway-card-summary">{pathway.summaryRefs}</div>
      </div>
      <span className="rh-pathway-card-arrow">›</span>
    </button>
  );
}

// ── Concept map card ──────────────────────────────────────────────────────────

function ConceptMapCard({ map }) {
  return (
    <div className="rh-concept-map">
      <div className="rh-concept-map__title">Connect the clues</div>
      <div className="rh-concept-map__flow">
        {map.nodes.map((node, i) => (
          <span key={i} className="rh-concept-map__step">
            <span className="rh-concept-map__node">{node}</span>
            {i < map.nodes.length - 1 && (
              <span className="rh-concept-map__arrow" aria-hidden="true">·</span>
            )}
          </span>
        ))}
      </div>
      <div className="rh-concept-map__note">{map.note}</div>
    </div>
  );
}

// ── Pathway detail view ───────────────────────────────────────────────────────

function PathwayDetailView({ pathway, onBack, onSelectRef, backLabel }) {
  useEffect(() => {
    trackEvent('reference_pathway_opened', { pathway_id: pathway.id });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathway.id]);

  const connectedRefs = useMemo(() =>
    pathway.relatedRefs.map(id => REFERENCES.find(r => r.id === id)).filter(Boolean),
  [pathway.relatedRefs]);

  const handleRefClick = useCallback((ref) => {
    trackEvent('reference_pathway_related_clicked', { pathway_id: pathway.id, reference_id: ref.id });
    onSelectRef(ref);
  }, [pathway.id, onSelectRef]);

  return (
    <div className="rh-pathway-detail ce-page-enter">
      <Header showBack onBack={onBack} backLabel={backLabel || 'All pathways'} />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* Title */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontFamily: 'var(--ce-font-mono)',
            fontSize: 9.5,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1.4px',
            color: 'var(--ce-teal)',
            marginBottom: 8,
            opacity: 0.85,
          }}>
            Bedside Pathway
          </div>
          <h1 style={{
            fontSize: 'clamp(22px, 5vw, 28px)',
            fontWeight: 700,
            color: 'var(--ce-text-dark)',
            margin: '0 0 6px',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
          }}>
            {pathway.title}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ce-text-muted)', margin: 0, lineHeight: 1.5 }}>
            {pathway.subtitle}
          </p>
        </div>

        {/* What nurses notice */}
        <div className="rh-pathway-section" style={{ borderLeft: '3px solid var(--ce-teal)' }}>
          <div className="rh-detail-field-label" style={{ color: 'var(--ce-teal-deep)', marginBottom: 10 }}>
            What nurses notice
          </div>
          <ul className="rh-nurses-notice-list">
            {pathway.notice.map((item, i) => (
              <li key={i} className="rh-nurses-notice-item">{item}</li>
            ))}
          </ul>
        </div>

        {/* Look at */}
        <div className="rh-pathway-section" style={{ borderLeft: '3px solid var(--ce-gold)' }}>
          <div className="rh-detail-field-label" style={{ color: 'var(--ce-gold-deep)', marginBottom: 10 }}>
            Look at
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {pathway.lookAt.map((item, i) => (
              <span key={i} className="rh-look-chip">{item}</span>
            ))}
          </div>
        </div>

        {/* Concept map */}
        {pathway.conceptMap && <ConceptMapCard map={pathway.conceptMap} />}

        {/* Common pattern */}
        <div style={{
          background: 'rgba(212,168,75,0.06)',
          border: '1px solid rgba(212,168,75,0.22)',
          borderRadius: 'var(--ce-r-md)',
          padding: '18px 20px',
          marginBottom: 10,
          display: 'flex',
          gap: 14,
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1, lineHeight: 1, color: 'var(--ce-gold)' }}>◆</span>
          <div>
            <div className="rh-detail-field-label" style={{ color: 'var(--ce-gold-deep)', marginBottom: 7 }}>
              Common pattern
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--ce-gold-deep)', fontStyle: 'italic' }}>
              {pathway.commonPattern}
            </div>
            <WhyCheck key={pathway.id} check={pathway.check} />
          </div>
        </div>

        {/* Connected references */}
        {connectedRefs.length > 0 && (
          <div style={{ marginTop: 24, marginBottom: 10 }}>
            <div className="rh-eyebrow" style={{ marginBottom: 10, color: 'var(--ce-text-muted)' }}>
              Connected references
            </div>
            <div className="rh-connected-chips">
              {connectedRefs.map(ref => (
                <button
                  key={ref.id}
                  className="rh-connected-chip"
                  onClick={() => handleRefClick(ref)}
                >
                  <span className="rh-connected-chip__category">{CAT_LABEL[ref.category]}</span>
                  <span className="rh-connected-chip__title">{ref.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <Sources key={pathway.id} id={pathway.id} pattern />

        {/* Safety note */}
        <div style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid var(--ce-warm-line)',
          fontSize: 11,
          color: 'var(--ce-text-dim)',
          lineHeight: 1.6,
          fontFamily: 'var(--ce-font-mono)',
          textAlign: 'center',
        }}>
          Educational reference only. Clinical decisions belong with the treating team, active orders, and local protocol.
        </div>
      </div>
    </div>
  );
}

// ── Concept card (landing page) ───────────────────────────────────────────────

function ConceptCard({ concept, onSelect }) {
  const pathwayCount = concept.connectedPathwayIds.length;
  const refCount     = concept.connectedRefIds.length;
  return (
    <button
      type="button"
      className="rh-concept-card"
      onClick={() => onSelect(concept)}
      aria-label={concept.title}
    >
      <div className="rh-concept-card__accent" aria-hidden="true">◆</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="rh-concept-card__title">{concept.title}</div>
        <div className="rh-concept-card__subtitle">{concept.subtitle}</div>
        <div className="rh-concept-card__summary">{concept.preview}</div>
        <div className="rh-concept-card__meta">
          {pathwayCount} pathway{pathwayCount !== 1 ? 's' : ''} · {refCount} references
        </div>
      </div>
      <span className="rh-concept-card__arrow">›</span>
    </button>
  );
}

// ── Concept detail view ───────────────────────────────────────────────────────

function ConceptDetailView({ concept, onBack, onSelectPathway, onSelectRef }) {
  useEffect(() => {
    trackEvent('reference_concept_opened', { concept_id: concept.id });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [concept.id]);

  const connectedPathways = useMemo(() =>
    concept.connectedPathwayIds.map(id => BEDSIDE_PATHWAYS.find(p => p.id === id)).filter(Boolean),
  [concept.connectedPathwayIds]);

  const connectedRefs = useMemo(() =>
    concept.connectedRefIds.map(id => REFERENCES.find(r => r.id === id)).filter(Boolean),
  [concept.connectedRefIds]);

  const handlePathwayClick = useCallback((pathway) => {
    trackEvent('reference_concept_pathway_clicked', { concept_id: concept.id, pathway_id: pathway.id });
    onSelectPathway(pathway);
  }, [concept.id, onSelectPathway]);

  const handleRefClick = useCallback((ref) => {
    trackEvent('reference_concept_reference_clicked', { concept_id: concept.id, reference_id: ref.id });
    onSelectRef(ref);
  }, [concept.id, onSelectRef]);

  return (
    <div className="rh-concept-detail ce-page-enter">
      <Header showBack onBack={onBack} backLabel="All concepts" />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* Title block */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontFamily: 'var(--ce-font-mono)',
            fontSize: 9.5,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1.4px',
            color: 'var(--ce-gold)',
            marginBottom: 8,
            opacity: 0.85,
          }}>
            Clinical Concept
          </div>
          <h1 style={{
            fontSize: 'clamp(22px, 5vw, 28px)',
            fontWeight: 700,
            color: 'var(--ce-text-dark)',
            margin: '0 0 6px',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
          }}>
            {concept.title}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ce-text-muted)', margin: 0, lineHeight: 1.5 }}>
            {concept.subtitle}
          </p>
        </div>

        {/* Big idea */}
        <div className="rh-concept-section" style={{ borderLeft: '3px solid var(--ce-gold)' }}>
          <div className="rh-detail-field-label" style={{ color: 'var(--ce-gold-deep)', marginBottom: 9 }}>
            Big idea
          </div>
          <div style={{ fontSize: 14.5, lineHeight: 1.75, color: 'var(--ce-text-mid)', fontWeight: 500 }}>
            {concept.summary}
          </div>
        </div>

        {/* What nurses notice */}
        <div className="rh-concept-section" style={{ borderLeft: '3px solid var(--ce-teal)' }}>
          <div className="rh-detail-field-label" style={{ color: 'var(--ce-teal-deep)', marginBottom: 10 }}>
            What nurses notice
          </div>
          <ul className="rh-nurses-notice-list">
            {concept.notice.map((item, i) => (
              <li key={i} className="rh-nurses-notice-item">{item}</li>
            ))}
          </ul>
        </div>

        {/* Concept map */}
        {concept.conceptMap && <ConceptMapCard map={concept.conceptMap} />}

        {/* Connected pathways */}
        {connectedPathways.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div className="rh-eyebrow" style={{ marginBottom: 10, color: 'var(--ce-text-muted)' }}>
              Connected pathways
            </div>
            <div className="rh-concept-connected">
              {connectedPathways.map(pathway => (
                <button
                  key={pathway.id}
                  className="rh-concept-pathway-chip"
                  onClick={() => handlePathwayClick(pathway)}
                >
                  <span className="rh-concept-pathway-chip__icon" aria-hidden="true">{pathway.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="rh-concept-pathway-chip__title">{pathway.title}</div>
                    <div className="rh-concept-pathway-chip__sub">{pathway.subtitle}</div>
                  </div>
                  <span style={{ color: 'var(--ce-text-dim)', fontSize: 14, flexShrink: 0 }}>›</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Connected references */}
        {connectedRefs.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div className="rh-eyebrow" style={{ marginBottom: 10, color: 'var(--ce-text-muted)' }}>
              Connected references
            </div>
            <div className="rh-connected-chips">
              {connectedRefs.map(ref => (
                <button
                  key={ref.id}
                  className="rh-concept-ref-chip"
                  onClick={() => handleRefClick(ref)}
                >
                  <span className="rh-concept-ref-chip__category">{CAT_LABEL[ref.category]}</span>
                  <span className="rh-concept-ref-chip__title">{ref.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <Sources key={concept.id} id={concept.id} pattern />

        {/* Safety note */}
        <div style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid var(--ce-warm-line)',
          fontSize: 11,
          color: 'var(--ce-text-dim)',
          lineHeight: 1.6,
          fontFamily: 'var(--ce-font-mono)',
          textAlign: 'center',
        }}>
          Educational reference only. Clinical decisions belong with the treating team, active orders, and local protocol.
        </div>
      </div>
    </div>
  );
}

// ── Hub view (search + browse) ────────────────────────────────────────────────

function HubView({ onSelect, onGoHome, onSelectPathway, onSelectConcept, active }) {
  const root = useRef(null);
  const position = useRef(null);
  function rememberPosition(event) {
    const target = event.target.closest('[role="button"], button');
    if (target) position.current = { label: target.getAttribute('aria-label') || target.textContent.trim(), top: target.getBoundingClientRect().top, scroll: window.scrollY };
  }
  useLayoutEffect(() => {
    if (!active || !position.current) return;
    const { label, top, scroll } = position.current;
    const target = [...root.current.querySelectorAll('[role="button"], button')].find(el => (el.getAttribute('aria-label') || el.textContent.trim()) === label);
    if (target) {
      target.focus({ preventScroll: true });
      window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top - top, behavior: 'instant' });
    } else window.scrollTo({ top: scroll, behavior: 'instant' });
  }, [active]);
  const [query, setQuery]   = useState('');
  const [cat, setCat]       = useState('all');
  const [recent, setRecent] = useState(() => lsGet(LS_RECENT, []));

  useEffect(() => {
    trackEvent('reference_hub_opened');
  }, []);

  const handleCategorySelect = (id) => {
    setCat(id);
    trackEvent('reference_category_selected', { category: id });
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length > 1) {
      trackEvent('reference_search_used', { query_length: val.trim().length });
    }
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return REFERENCES.filter(r => {
      const matchCat = cat === 'all' || r.category === cat;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.nursesCare.toLowerCase().includes(q) ||
        r.pearl.toLowerCase().includes(q) ||
        (r.normalRange && r.normalRange.toLowerCase().includes(q)) ||
        (r.aliases || []).some(alias => alias.toLowerCase().includes(q))
      );
    });
  }, [query, cat]);

  const handleSelect = useCallback((ref) => {
    setRecent(prev => {
      const updated = [ref.id, ...prev.filter(id => id !== ref.id)].slice(0, MAX_RECENT);
      lsSet(LS_RECENT, updated);
      return updated;
    });
    onSelect(ref);
  }, [onSelect]);

  const recentRefs = useMemo(() =>
    recent.map(id => REFERENCES.find(r => r.id === id)).filter(Boolean),
  [recent]);

  return (
    <div ref={root} className="rh-page ce-workspace" onClickCapture={rememberPosition} onKeyDownCapture={event => {
      if (event.key === 'Enter' || event.key === ' ') {
        rememberPosition(event);
        if (event.target.matches('[role="button"]')) event.preventDefault();
      }
    }}>
      <Header onGoHome={onGoHome} />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* Hero */}
        <div className="rh-hero">
          <div className="rh-hero__eyebrow">Clinical Reference Hub</div>
          <h2 className="rh-hero__title">Browse nursing reference topics.</h2>
          <p className="rh-hero__text">
            Educational references. No dosing. No diagnosis.
          </p>
          <div className="rh-hero__stats">
            <div className="rh-hero__stat">
              <span className="rh-hero__stat-num">{REFERENCES.length}</span>
              <span className="rh-hero__stat-label">References</span>
            </div>
            <div className="rh-hero__stat-divider" aria-hidden="true" />
            <div className="rh-hero__stat">
              <span className="rh-hero__stat-num">{BEDSIDE_PATHWAYS.length}</span>
              <span className="rh-hero__stat-label">Pathways</span>
            </div>
            <div className="rh-hero__stat-divider" aria-hidden="true" />
            <div className="rh-hero__stat">
              <span className="rh-hero__stat-num">{CATEGORIES.length}</span>
              <span className="rh-hero__stat-label">Categories</span>
            </div>
          </div>
        </div>


        {/* Search */}
        <div className="rh-search-wrap" style={{ marginBottom: 14 }}>
          <span className="rh-search-icon">⌕</span>
          <input
            className="rh-search"
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search references…"
            aria-label="Search references"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>

        {/* Category filters */}
        <div className="rh-filters" style={{ marginBottom: 28 }}>
          <button
            className={'rh-filter-btn' + (cat === 'all' ? ' active' : '')}
            aria-pressed={cat === 'all'}
            onClick={() => handleCategorySelect('all')}
          >
            All
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              className={'rh-filter-btn' + (cat === c.id ? ' active' : '')}
              aria-pressed={cat === c.id}
              onClick={() => handleCategorySelect(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <details className="ce-lookup-extras">
          <summary>Pathways &amp; clinical concepts</summary>
        {/* Bedside Pathways */}
        <div className="rh-pathways" style={{ marginBottom: 24 }}>
          <div className="rh-eyebrow" style={{ marginBottom: 4 }}>Bedside Pathways</div>
          <p style={{ fontSize: 12, color: 'var(--ce-text-muted)', margin: '0 0 14px', lineHeight: 1.4 }}>
            Common patterns nurses connect quickly.
          </p>
          <div className="rh-pathways-grid">
            {BEDSIDE_PATHWAYS.map(pathway => (
              <PathwayCard key={pathway.id} pathway={pathway} onSelect={onSelectPathway} />
            ))}
          </div>
        </div>

        {/* Clinical Concepts */}
        <div className="rh-concepts" style={{ marginBottom: 24 }}>
          <div className="rh-eyebrow" style={{ marginBottom: 4 }}>Clinical Concepts</div>
          <p style={{ fontSize: 12, color: 'var(--ce-text-muted)', margin: '0 0 14px', lineHeight: 1.4 }}>
            Bigger frameworks built from bedside clues.
          </p>
          <div className="rh-concepts-grid">
            {CLINICAL_CONCEPTS.map(concept => (
              <ConceptCard key={concept.id} concept={concept} onSelect={onSelectConcept} />
            ))}
          </div>
        </div>

        </details>

        {/* Recently viewed */}
        {recentRefs.length > 0 && !query && (
          <div style={{ marginBottom: 28 }}>
            <div className="rh-eyebrow">Recently viewed</div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {recentRefs.map(r => (
                <button key={r.id} className="rh-recent-chip" onClick={() => handleSelect(r)}>
                  {r.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="rh-empty">
            <div style={{ fontSize: 28, marginBottom: 10 }}>—</div>
            No references match your search.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {!query && cat === 'all' && (
              <div className="rh-eyebrow" style={{ marginBottom: 2 }}>
                {REFERENCES.length} references
              </div>
            )}
            {query || cat !== 'all' ? (
              <div className="rh-eyebrow" style={{ marginBottom: 2 }}>
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </div>
            ) : null}
            {filtered.map(ref => (
              <RefCard key={ref.id} ref_={ref} onSelect={handleSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Reference card ────────────────────────────────────────────────────────────

function RefCard({ ref_, onSelect }) {
  return (
    <button
      type="button"
      className="rh-ref-card"
      onClick={() => onSelect(ref_)}
      aria-label={ref_.title}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="rh-ref-cat">{CAT_LABEL[ref_.category]}</div>
          <div className="rh-ref-title">{ref_.title}</div>
          {ref_.normalRange ? (
            <div className="rh-ref-range">{ref_.rangeSummary || ref_.normalRange}</div>
          ) : (
            <div className="rh-ref-range-null">No standard range</div>
          )}
        </div>
        <span className="rh-ref-arrow">›</span>
      </div>
    </button>
  );
}

// ── Detail view ───────────────────────────────────────────────────────────────

function DetailView({ ref_, onBack, onSelect, backLabel }) {
  useEffect(() => {
    trackEvent('reference_viewed', { reference_id: ref_.id, category: ref_.category });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [ref_.id, ref_.category]);

  const related = useMemo(() =>
    (ref_.relatedRefs || []).map(id => REFERENCES.find(r => r.id === id)).filter(Boolean),
  [ref_.relatedRefs]);

  const handleRelatedClick = useCallback((target) => {
    trackEvent('reference_related_clicked', { from_ref_id: ref_.id, to_ref_id: target.id });
    onSelect(target);
  }, [ref_.id, onSelect]);

  return (
    <div className="rh-detail-page ce-page-enter">
      <Header showBack onBack={onBack} backLabel={backLabel || 'All references'} />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* Title block */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontFamily: 'var(--ce-font-mono)',
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1.3px',
            color: 'var(--ce-teal-deep)',
            marginBottom: 7,
            opacity: 0.9,
          }}>
            {CAT_LABEL[ref_.category]}
          </div>
          <h1 style={{
            fontSize: 'clamp(22px, 5vw, 28px)',
            fontWeight: 700,
            color: 'var(--ce-text-dark)',
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
          }}>
            {ref_.title}
          </h1>
        </div>

        {/* Context, including example intervals rather than universal targets */}
        {ref_.normalRange && (
          <div className="rh-detail-field" style={{ borderLeft: '3px solid var(--ce-gold)' }}>
            <div className="rh-detail-field-label" style={{ color: 'var(--ce-gold-deep)' }}>Reference / context</div>
            <div style={{
              fontFamily: 'var(--ce-font-mono)',
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--ce-gold-deep)',
              letterSpacing: '0.02em',
              lineHeight: 1.5,
            }}>
              {ref_.normalRange}
            </div>
            <p className="rh-range-note">Adult examples. Use the reporting laboratory, baseline, measurement conditions, and individualized orders.</p>
          </div>
        )}

        {/* Why nurses care */}
        <div className="rh-detail-field" style={{ borderLeft: '3px solid var(--ce-teal)' }}>
          <div className="rh-detail-field-label" style={{ color: 'var(--ce-teal-deep)' }}>
            Why nurses care
          </div>
          <div className="rh-detail-field-body">{ref_.nursesCare}</div>
        </div>

        {/* What nurses notice */}
        {ref_.nursesNotice && ref_.nursesNotice.length > 0 && (
          <div className="rh-nurses-notice">
            <div className="rh-detail-field-label" style={{ color: 'var(--ce-teal-deep)', marginBottom: 10 }}>
              What nurses notice
            </div>
            <ul className="rh-nurses-notice-list">
              {ref_.nursesNotice.map((item, i) => (
                <li key={i} className="rh-nurses-notice-item">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* When attention increases */}
        <div className="rh-detail-field" style={{ borderLeft: '3px solid var(--ce-urgency-high-line)' }}>
          <div className="rh-detail-field-label" style={{ color: 'var(--ce-urgency-high)' }}>
            When attention increases
          </div>
          <div className="rh-detail-field-body">{ref_.whenAttentionIncreases}</div>
        </div>

        {/* Common mistake */}
        {ref_.commonMistake && (
          <div className="rh-common-mistake">
            <div className="rh-detail-field-label" style={{ color: 'var(--ce-gold-deep)', marginBottom: 7 }}>
              Common mistake
            </div>
            <div className="rh-common-mistake-body">{ref_.commonMistake}</div>
          </div>
        )}

        {/* Pearl */}
        <div style={{
          background: 'rgba(212,168,75,0.06)',
          border: '1px solid rgba(212,168,75,0.22)',
          borderRadius: 'var(--ce-r-md)',
          padding: '18px 20px',
          marginBottom: 10,
          display: 'flex',
          gap: 14,
          alignItems: 'flex-start',
        }}>
          <span style={{
            fontSize: 18,
            flexShrink: 0,
            marginTop: 1,
            lineHeight: 1,
            color: 'var(--ce-gold)',
          }}>◆</span>
          <div>
            <div className="rh-detail-field-label" style={{ color: 'var(--ce-gold-deep)', marginBottom: 7 }}>
              Quick pearl
            </div>
            <div style={{
              fontSize: 14,
              lineHeight: 1.75,
              color: 'var(--ce-gold-deep)',
              fontStyle: 'italic',
            }}>
              {ref_.pearl}
            </div>
          </div>
        </div>

        {/* Related refs */}
        {related.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div className="rh-detail-field-label" style={{ color: 'var(--ce-text-muted)', marginBottom: 10 }}>
              Commonly connected with
            </div>
            <div className="rh-related-refs">
              {related.map(r => (
                <button
                  key={r.id}
                  className="rh-related-chip"
                  onClick={() => handleRelatedClick(r)}
                >
                  <span className="rh-related-chip-cat">{CAT_LABEL[r.category]}</span>
                  {r.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <Sources key={ref_.id} id={ref_.id} />

        {/* Safety note */}
        <div style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid var(--ce-warm-line)',
          fontSize: 11,
          color: 'var(--ce-text-dim)',
          lineHeight: 1.6,
          fontFamily: 'var(--ce-font-mono)',
          textAlign: 'center',
        }}>
          Educational reference only. Clinical decisions belong with the treating team, active orders, and local protocol.
        </div>
      </div>
    </div>
  );
}

// ── Root module ───────────────────────────────────────────────────────────────

export default function ReferenceHubModule({ onGoHome, initialReferenceId = null }) {
  const [selected, setSelected]               = useState(() => REFERENCES.find(reference => reference.id === initialReferenceId) || null);
  const [selectedPathway, setSelectedPathway] = useState(null);
  const [selectedConcept, setSelectedConcept] = useState(null);

  const handleSelectRef = useCallback((ref) => {
    try {
      const prev = JSON.parse(localStorage.getItem(LS_RECENT) || '[]');
      const updated = [ref.id, ...prev.filter(id => id !== ref.id)].slice(0, MAX_RECENT);
      localStorage.setItem(LS_RECENT, JSON.stringify(updated));
    } catch {
      // Recents are best-effort only.
    }
    setSelected(ref);
  }, []);

  const handleBackFromDetail = useCallback(() => { setSelected(null); }, []);

  const handleSelectPathwayFromConcept = useCallback((pathway) => {
    setSelectedPathway(pathway);
  }, []);

  const handleBackFromPathway = useCallback(() => {
    setSelectedPathway(null);
    // if opened from concept, selectedConcept is still set → returns to concept
  }, []);

  // Detail back label: prefer pathway context, then concept, then hub
  const detailBackLabel = selectedPathway
    ? 'Back to pathway'
    : selectedConcept
    ? 'Back to concept'
    : 'All references';

  // Pathway back label: if opened from concept, go back to concept
  const pathwayBackLabel = selectedConcept ? 'Back to concept' : 'All pathways';

  const hubActive = !selected && !selectedPathway && !selectedConcept;
  return <>
    <div hidden={!hubActive} inert={!hubActive}>
      <HubView active={hubActive} onSelect={handleSelectRef} onGoHome={onGoHome} onSelectPathway={setSelectedPathway} onSelectConcept={setSelectedConcept} />
    </div>
    {selected ? <DetailView ref_={selected} onBack={handleBackFromDetail} onSelect={handleSelectRef} backLabel={detailBackLabel} />
      : selectedPathway ? <PathwayDetailView pathway={selectedPathway} onBack={handleBackFromPathway} onSelectRef={handleSelectRef} backLabel={pathwayBackLabel} />
      : selectedConcept ? <ConceptDetailView concept={selectedConcept} onBack={() => setSelectedConcept(null)} onSelectPathway={handleSelectPathwayFromConcept} onSelectRef={handleSelectRef} />
      : null}
  </>;
}
