import { useState, useMemo, useEffect, useCallback } from 'react';
import { REFERENCES, CATEGORIES } from './data/references.js';
import { trackEvent } from '../../analytics';
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
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ── Category label lookup ─────────────────────────────────────────────────────

const CAT_LABEL = Object.fromEntries(CATEGORIES.map(c => [c.id, c.label]));

// ── Bedside Pathways data ─────────────────────────────────────────────────────

const BEDSIDE_PATHWAYS = [
  {
    id: 'rising-lactate',
    icon: '↗',
    title: 'Rising Lactate',
    subtitle: 'Perfusion, clearance, and trend direction',
    summaryRefs: 'Includes Lactate, MAP, UO',
    notice: [
      'Lactate is rising across serial draws.',
      'Vital signs may lag behind the cellular oxygen debt.',
      'Urine output, skin temperature, and mentation help complete the picture.',
    ],
    lookAt: [
      'MAP trend',
      'Urine output',
      'Shock Index',
      'Base Excess',
      'Skin and mentation',
    ],
    conceptMap: {
      nodes: ['Perfusion', 'Oxygen Debt', 'Lactate Trend', 'Base Deficit'],
      note: 'A rising lactate is a trend story, not a single-number story.',
    },
    commonPattern:
      'Rising lactate is rarely a single-number problem. The trend connects perfusion, clearance, oxygen delivery, and the patient\'s bedside picture.',
    relatedRefs: ['lactate', 'map', 'urine-output', 'shock-index', 'base-excess'],
  },
  {
    id: 'map-fine-patient-bad',
    icon: '◉',
    title: 'MAP Looks Fine, Patient Looks Bad',
    subtitle: 'Pressure vs perfusion',
    summaryRefs: 'Includes MAP, Lactate, CO/CI',
    notice: [
      'MAP is in range, but the patient still looks poorly perfused.',
      'Cool extremities, altered mentation, or falling urine output do not match the number.',
      'Lactate or base deficit may show a different story.',
    ],
    lookAt: [
      'Urine output',
      'Lactate',
      'Capillary refill',
      'Cardiac output / index',
      'SVR',
    ],
    conceptMap: {
      nodes: ['MAP', 'Cardiac Output', 'Urine Output', 'Lactate'],
      note: 'Pressure can look acceptable while flow and tissue perfusion remain poor.',
    },
    commonPattern:
      'MAP is a pressure number. Perfusion is the patient picture built from multiple trends.',
    relatedRefs: ['map', 'urine-output', 'lactate', 'cardiac-output', 'svr'],
  },
  {
    id: 'peep-hypotension',
    icon: '⇅',
    title: 'PEEP Causing Hypotension?',
    subtitle: 'Oxygenation support with hemodynamic cost',
    summaryRefs: 'Includes PEEP, MAP, Pplat',
    notice: [
      'Oxygenation improves after PEEP changes, but blood pressure softens.',
      'Higher intrathoracic pressure can reduce venous return.',
      'Compliance, plateau pressure, and breath sounds help complete the picture.',
    ],
    lookAt: [
      'MAP',
      'CVP',
      'Plateau pressure',
      'Ventilator compliance',
      'SpO₂',
    ],
    conceptMap: {
      nodes: ['PEEP', 'Venous Return', 'Cardiac Output', 'MAP'],
      note: 'Oxygenation support can change preload and pressure.',
    },
    commonPattern:
      'PEEP can improve oxygenation while changing venous return and right-heart loading. The oxygen number and pressure number may move in opposite directions.',
    relatedRefs: ['peep', 'map', 'cvp', 'plateau-pressure', 'ventilator-compliance'],
  },
  {
    id: 'urine-output-falling',
    icon: '↓',
    title: 'Urine Output Falling',
    subtitle: 'End-organ perfusion signal',
    summaryRefs: 'Includes UO, MAP, Creatinine',
    notice: [
      'Urine output drops before other numbers look dramatic.',
      'The patient may still have a borderline acceptable MAP.',
      'Creatinine can lag behind the bedside trend.',
    ],
    lookAt: [
      'MAP',
      'Lactate',
      'Creatinine',
      'Fluid balance',
      'Capillary refill',
    ],
    conceptMap: {
      nodes: ['MAP', 'Renal Perfusion', 'Urine Output', 'Creatinine'],
      note: 'Urine output often moves before creatinine does.',
    },
    commonPattern:
      'Falling urine output is often an early perfusion signal. It should be read with pressure, labs, and the full bedside picture.',
    relatedRefs: ['urine-output', 'map', 'lactate', 'creatinine', 'capillary-refill'],
  },
  {
    id: 'oxygenation-vs-ventilation',
    icon: '⇌',
    title: 'Oxygen Looks Fine, CO₂ Doesn\'t',
    subtitle: 'SpO₂/PaO₂ vs CO₂ clearance',
    summaryRefs: 'Includes SpO₂, PaCO₂, FiO₂',
    notice: [
      'SpO₂ may look acceptable while PaCO₂ worsens.',
      'Oxygenation and ventilation are separate problems.',
      'FiO₂ and PEEP speak more to oxygenation; minute ventilation speaks more to CO₂ clearance.',
    ],
    lookAt: [
      'SpO₂',
      'PaO₂',
      'PaCO₂',
      'FiO₂',
      'Minute ventilation',
    ],
    conceptMap: {
      nodes: ['FiO₂ / PEEP', 'PaO₂ / SpO₂', 'Minute Ventilation', 'PaCO₂'],
      note: 'Oxygenation and ventilation answer different questions.',
    },
    commonPattern:
      'More oxygen does not always mean better ventilation. Oxygenation asks whether oxygen gets in; ventilation asks whether CO₂ gets out.',
    relatedRefs: ['oxygenation-vs-ventilation', 'spo2', 'pao2', 'paco2', 'minute-ventilation'],
  },
  {
    id: 'high-peak-pressure',
    icon: '▲',
    title: 'Why Is the Vent Alarming?',
    subtitle: 'Peak vs plateau pressure',
    summaryRefs: 'Includes Peak, Pplat, Compliance',
    notice: [
      'Peak pressure rises on the ventilator.',
      'Plateau pressure helps separate airway resistance from lung compliance.',
      'Secretions, biting, bronchospasm, tubing issues, or worsening compliance may each change the pattern differently.',
    ],
    lookAt: [
      'Plateau pressure',
      'Ventilator compliance',
      'Tidal volume',
      'Patient-vent synchrony',
      'Breath sounds',
    ],
    conceptMap: {
      nodes: ['Peak Pressure', 'Plateau Pressure', 'Resistance vs Compliance'],
      note: 'The peak-to-plateau relationship helps separate airway resistance from lung stiffness.',
    },
    commonPattern:
      'Peak pressure alone does not tell the whole story. The peak-to-plateau relationship helps separate airway resistance from lung stiffness.',
    relatedRefs: ['plateau-pressure', 'ventilator-compliance', 'tidal-volume', 'respiratory-rate'],
  },
];

// ── CE Logo (shared mark) ─────────────────────────────────────────────────────

function CELogo() {
  return (
    <svg width="30" height="30" viewBox="0 0 225 200" xmlns="http://www.w3.org/2000/svg"
      fill="#0ABFBC" aria-label="Clinical Edge" style={{ flexShrink: 0, display: 'block' }}>
      <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z" />
      <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z" />
      <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z" />
      <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z" />
    </svg>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────

function Header({ onGoHome, showBack, onBack, backLabel }) {
  return (
    <div style={{
      borderBottom: '1px solid var(--ce-line-dark)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
      paddingTop: 'env(safe-area-inset-top)',
      paddingLeft: 'max(14px, env(safe-area-inset-left))',
      paddingRight: 'max(14px, env(safe-area-inset-right))',
      background: 'linear-gradient(to bottom, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0) 100%), rgba(11,31,42,0.97)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 800, margin: '0 auto', width: '100%',
        display: 'flex', alignItems: 'center',
        paddingTop: 22, paddingBottom: 16, gap: 11,
      }}>
        <CELogo />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#F8FBFC', letterSpacing: '-0.3px', lineHeight: 1.15 }}>
            Clinical Edge
          </span>
          <span style={{
            fontSize: 10, fontWeight: 500, color: '#7F99A5',
            letterSpacing: '0.7px', textTransform: 'uppercase',
            fontFamily: 'var(--ce-font-mono)', lineHeight: 1,
          }}>
            Reference Hub
          </span>
        </div>

        {showBack ? (
          <button className="ce-back-link" onClick={onBack}>
            ← {backLabel || 'Back'}
          </button>
        ) : onGoHome ? (
          <button className="ce-back-link" onClick={onGoHome}>
            ← All tools
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ── Pathway card (landing page) ───────────────────────────────────────────────

function PathwayCard({ pathway, onSelect }) {
  return (
    <div
      className="rh-pathway-card"
      onClick={() => onSelect(pathway)}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelect(pathway)}
      aria-label={pathway.title}
    >
      <span className="rh-pathway-card-icon" aria-hidden="true">{pathway.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="rh-pathway-card-title">{pathway.title}</div>
        <div className="rh-pathway-card-subtitle">{pathway.subtitle}</div>
        <div className="rh-pathway-card-summary">{pathway.summaryRefs}</div>
      </div>
      <span className="rh-pathway-card-arrow">›</span>
    </div>
  );
}

// ── Concept map card ──────────────────────────────────────────────────────────

function ConceptMapCard({ map }) {
  return (
    <div className="rh-concept-map">
      <div className="rh-concept-map__title">Concept Map</div>
      <div className="rh-concept-map__flow">
        {map.nodes.map((node, i) => (
          <span key={i} className="rh-concept-map__step">
            <span className="rh-concept-map__node">{node}</span>
            {i < map.nodes.length - 1 && (
              <span className="rh-concept-map__arrow" aria-hidden="true">→</span>
            )}
          </span>
        ))}
      </div>
      <div className="rh-concept-map__note">{map.note}</div>
    </div>
  );
}

// ── Pathway detail view ───────────────────────────────────────────────────────

function PathwayDetailView({ pathway, onBack, onSelectRef }) {
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
    <div className="rh-pathway-detail">
      <Header showBack onBack={onBack} backLabel="All pathways" />

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
            color: '#111827',
            margin: '0 0 6px',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
          }}>
            {pathway.title}
          </h1>
          <p style={{ fontSize: 14, color: '#526174', margin: 0, lineHeight: 1.5 }}>
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
          <div className="rh-detail-field-label" style={{ color: '#9A7020', marginBottom: 10 }}>
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
          background: 'rgba(212,168,75,0.07)',
          border: '1px solid rgba(212,168,75,0.25)',
          borderRadius: 'var(--ce-r-md)',
          padding: '18px 20px',
          marginBottom: 10,
          display: 'flex',
          gap: 14,
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1, lineHeight: 1, color: 'var(--ce-gold)' }}>◆</span>
          <div>
            <div className="rh-detail-field-label" style={{ color: '#9A7020', marginBottom: 7 }}>
              Common pattern
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.75, color: '#4A3800', fontStyle: 'italic' }}>
              {pathway.commonPattern}
            </div>
          </div>
        </div>

        {/* Connected references */}
        {connectedRefs.length > 0 && (
          <div style={{ marginTop: 24, marginBottom: 10 }}>
            <div className="rh-eyebrow" style={{ marginBottom: 10, color: '#526174' }}>
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

        {/* Safety note */}
        <div style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid var(--ce-warm-line)',
          fontSize: 11,
          color: '#8A9BA8',
          lineHeight: 1.6,
          fontFamily: 'var(--ce-font-mono)',
          textAlign: 'center',
        }}>
          Reference aid only. Verify with your facility's protocols and clinical judgment.
        </div>
      </div>
    </div>
  );
}

// ── Hub view (search + browse) ────────────────────────────────────────────────

function HubView({ onSelect, onGoHome, onSelectPathway }) {
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
        (r.normalRange && r.normalRange.toLowerCase().includes(q))
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
    <div className="rh-page">
      <Header onGoHome={onGoHome} />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* Hero */}
        <div className="rh-hero">
          <div className="rh-hero__eyebrow">Clinical Reference Hub</div>
          <h2 className="rh-hero__title">Find what matters faster.</h2>
          <p className="rh-hero__text">
            Fast bedside answers. No dosing. No diagnosis.
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
              <span className="rh-hero__stat-num">5</span>
              <span className="rh-hero__stat-label">Categories</span>
            </div>
          </div>
        </div>

        {/* Bedside Pathways */}
        <div className="rh-pathways" style={{ marginBottom: 24 }}>
          <div className="rh-eyebrow" style={{ marginBottom: 4 }}>Bedside Pathways</div>
          <p style={{ fontSize: 12, color: '#556B7A', margin: '0 0 14px', lineHeight: 1.4 }}>
            Common patterns nurses connect quickly.
          </p>
          <div className="rh-pathways-grid">
            {BEDSIDE_PATHWAYS.map(pathway => (
              <PathwayCard key={pathway.id} pathway={pathway} onSelect={onSelectPathway} />
            ))}
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
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>

        {/* Category filters */}
        <div className="rh-filters" style={{ marginBottom: 28 }}>
          <button
            className={'rh-filter-btn' + (cat === 'all' ? ' active' : '')}
            onClick={() => handleCategorySelect('all')}
          >
            All
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              className={'rh-filter-btn' + (cat === c.id ? ' active' : '')}
              onClick={() => handleCategorySelect(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

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
    <div
      className="rh-ref-card"
      onClick={() => onSelect(ref_)}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelect(ref_)}
      aria-label={ref_.title}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="rh-ref-cat">{CAT_LABEL[ref_.category]}</div>
          <div className="rh-ref-title">{ref_.title}</div>
          {ref_.normalRange ? (
            <div className="rh-ref-range">{ref_.normalRange}</div>
          ) : (
            <div className="rh-ref-range-null">No standard range</div>
          )}
        </div>
        <span className="rh-ref-arrow">›</span>
      </div>
    </div>
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
    <div className="rh-detail-page">
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
            color: '#111827',
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
          }}>
            {ref_.title}
          </h1>
        </div>

        {/* Normal range */}
        {ref_.normalRange && (
          <div className="rh-detail-field" style={{ borderLeft: '3px solid var(--ce-gold)' }}>
            <div className="rh-detail-field-label" style={{ color: '#9A7020' }}>Normal Range</div>
            <div style={{
              fontFamily: 'var(--ce-font-mono)',
              fontSize: 15,
              fontWeight: 600,
              color: '#7A5A10',
              letterSpacing: '0.02em',
              lineHeight: 1.5,
            }}>
              {ref_.normalRange}
            </div>
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
        <div className="rh-detail-field" style={{ borderLeft: '3px solid #C06B6B' }}>
          <div className="rh-detail-field-label" style={{ color: '#8E2F2F' }}>
            When attention increases
          </div>
          <div className="rh-detail-field-body">{ref_.whenAttentionIncreases}</div>
        </div>

        {/* Common mistake */}
        {ref_.commonMistake && (
          <div className="rh-common-mistake">
            <div className="rh-detail-field-label" style={{ color: '#8A6010', marginBottom: 7 }}>
              Common mistake
            </div>
            <div className="rh-common-mistake-body">{ref_.commonMistake}</div>
          </div>
        )}

        {/* Pearl */}
        <div style={{
          background: 'rgba(212,168,75,0.07)',
          border: '1px solid rgba(212,168,75,0.25)',
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
            <div className="rh-detail-field-label" style={{ color: '#9A7020', marginBottom: 7 }}>
              Quick pearl
            </div>
            <div style={{
              fontSize: 14,
              lineHeight: 1.75,
              color: '#4A3800',
              fontStyle: 'italic',
            }}>
              {ref_.pearl}
            </div>
          </div>
        </div>

        {/* Related refs */}
        {related.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div className="rh-detail-field-label" style={{ color: '#526174', marginBottom: 10 }}>
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

        {/* Safety note */}
        <div style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid var(--ce-warm-line)',
          fontSize: 11,
          color: '#8A9BA8',
          lineHeight: 1.6,
          fontFamily: 'var(--ce-font-mono)',
          textAlign: 'center',
        }}>
          Reference aid only. Verify with your facility's protocols and clinical judgment.
        </div>
      </div>
    </div>
  );
}

// ── Root module ───────────────────────────────────────────────────────────────

export default function ReferenceHubModule({ onGoHome }) {
  const [selected, setSelected]               = useState(null);
  const [selectedPathway, setSelectedPathway] = useState(null);

  const handleSelectRef = useCallback((ref) => {
    try {
      const prev = JSON.parse(localStorage.getItem(LS_RECENT) || '[]');
      const updated = [ref.id, ...prev.filter(id => id !== ref.id)].slice(0, MAX_RECENT);
      localStorage.setItem(LS_RECENT, JSON.stringify(updated));
    } catch {}
    setSelected(ref);
  }, []);

  const handleBackFromDetail = useCallback(() => {
    setSelected(null);
    // stays on pathway view if one is active, otherwise hub shows
  }, []);

  if (selected) {
    return (
      <DetailView
        ref_={selected}
        onBack={handleBackFromDetail}
        onSelect={handleSelectRef}
        backLabel={selectedPathway ? 'Back to pathway' : 'All references'}
      />
    );
  }

  if (selectedPathway) {
    return (
      <PathwayDetailView
        pathway={selectedPathway}
        onBack={() => setSelectedPathway(null)}
        onSelectRef={handleSelectRef}
      />
    );
  }

  return (
    <HubView
      onSelect={handleSelectRef}
      onGoHome={onGoHome}
      onSelectPathway={setSelectedPathway}
    />
  );
}
