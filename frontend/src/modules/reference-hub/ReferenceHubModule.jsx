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

// ── Hub view (search + browse) ────────────────────────────────────────────────

function HubView({ onSelect, onGoHome }) {
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
        <div style={{ marginBottom: 28 }}>
          <h2 style={{
            fontFamily: 'var(--ce-font-sans)',
            fontWeight: 700,
            fontSize: 'clamp(20px, 4.5vw, 26px)',
            color: '#F8FBFC',
            margin: '0 0 6px',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
          }}>
            Clinical Reference Hub
          </h2>
          <p style={{ fontSize: 13, color: '#7F99A5', margin: 0, lineHeight: 1.5 }}>
            Fast bedside answers. No dosing. No diagnosis. Just the reference.
          </p>
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

function DetailView({ ref_, onBack, onSelect }) {
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
      <Header showBack onBack={onBack} backLabel="All references" />

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
  const [selected, setSelected] = useState(null);

  const handleSelect = useCallback((ref) => {
    // add to recently viewed via HubView's localStorage mechanism
    try {
      const prev = JSON.parse(localStorage.getItem('ce_ref_hub_recent') || '[]');
      const updated = [ref.id, ...prev.filter(id => id !== ref.id)].slice(0, 5);
      localStorage.setItem('ce_ref_hub_recent', JSON.stringify(updated));
    } catch {}
    setSelected(ref);
  }, []);

  return selected ? (
    <DetailView ref_={selected} onBack={() => setSelected(null)} onSelect={handleSelect} />
  ) : (
    <HubView onSelect={handleSelect} onGoHome={onGoHome} />
  );
}
