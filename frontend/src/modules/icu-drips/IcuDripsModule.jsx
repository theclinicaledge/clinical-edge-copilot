import { useState, useEffect } from 'react';
import { trackEvent } from '../../analytics';
import './icu-drips.css';
import {
  DRIPS, CATEGORIES, FAMILIES, FOUNDATIONS,
  SAFETY_DISCLAIMER, COMPARE_PAIRS, CLINICAL_PEARLS,
} from './data/drips.js';

// ─── CE Logo ──────────────────────────────────────────────────────────────────
function CELogo() {
  return (
    <svg
      width="26" height="26" viewBox="0 0 225 200"
      xmlns="http://www.w3.org/2000/svg" fill="#0ABFBC"
      aria-label="Clinical Edge"
      style={{ flexShrink: 0, display: 'block' }}
    >
      <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z" />
      <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z" />
      <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z" />
      <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z" />
    </svg>
  );
}

// ─── Search normalization ─────────────────────────────────────────────────────
function norm(s) {
  return String(s).toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
}

// ─── Icons ────────────────────────────────────────────────────────────────────
// All icons: 13×13 SVG, currentColor, no fill by default
function Icon({ type, size = 13 }) {
  const p = {
    width: size, height: size,
    viewBox: '0 0 12 12',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true,
    style: { display: 'block', flexShrink: 0 },
  };
  switch (type) {
    // Section icons
    case 'target':
      return <svg {...p}>
        <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.1"/>
        <circle cx="6" cy="6" r="1.7" fill="currentColor" opacity="0.55"/>
      </svg>;
    case 'mechanism':
      return <svg {...p}>
        <circle cx="6" cy="6" r="2.8" stroke="currentColor" strokeWidth="1.1"/>
        <path d="M6 1v1.3M6 9.7V11M1 6h1.3M9.7 6H11M2.5 2.5l.9.9M8.6 8.6l.9.9M9.5 2.5l-.9.9M3.4 8.6l-.9.9"
          stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>;
    case 'monitor':
      return <svg {...p}>
        <path d="M1 6s1.8-4 5-4 5 4 5 4-1.8 4-5 4-5-4-5-4z"
          stroke="currentColor" strokeWidth="1.1"/>
        <circle cx="6" cy="6" r="1.4" fill="currentColor" opacity="0.55"/>
      </svg>;
    case 'watch':
      return <svg {...p}>
        <path d="M6 1.5 1 10.5h10Z"
          stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
        <path d="M6 5.5v2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
        <circle cx="6" cy="9" r="0.5" fill="currentColor"/>
      </svg>;
    case 'escalate':
      return <svg {...p}>
        <path d="M6 1a3.5 3.5 0 0 1 3.5 3.5V8l.5 1H2l.5-1V4.5A3.5 3.5 0 0 1 6 1z"
          stroke="currentColor" strokeWidth="1.1"/>
        <path d="M4.5 9a1.5 1.5 0 0 0 3 0"
          stroke="currentColor" strokeWidth="1.1"/>
      </svg>;
    case 'lines':
      return <svg {...p}>
        <path d="M2.5 6h7M8.5 3.5 11 6 8.5 8.5"
          stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="2.5" cy="6" r="1.2" stroke="currentColor" strokeWidth="1.1"/>
      </svg>;
    case 'safety':
      return <svg {...p}>
        <path d="M6 1 2 2.5V6c0 2.5 1.8 4 4 5 2.2-1 4-2.5 4-5V2.5Z"
          stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
        <path d="M4 6l1.5 1.5L8 4"
          stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>;
    // Family icons (rendered at 13px, same viewBox)
    case 'pressors':
      return <svg {...p}>
        <path d="M6 10V2M3.5 4.5 6 2l2.5 2.5"
          stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>;
    case 'sedation':
      return <svg {...p}>
        <path d="M2 8.5A4 4 0 0 1 10 8.5"
          stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M4.5 10a1.5 1.5 0 0 0 3 0"
          stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M6 4V3M3.8 4.8 3.2 4.2M8.2 4.8l.6-.6"
          stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>;
    case 'rhythm':
      return <svg {...p}>
        <path d="M1 6h2l1.5-4.5L6.5 10l1.5-5.5L9 6h2"
          stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>;
    case 'anticoag':
      return <svg {...p}>
        <path d="M6 1.5C6 1.5 2.5 5 2.5 7.5a3.5 3.5 0 0 0 7 0C9.5 5 6 1.5 6 1.5z"
          stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      </svg>;
    // New family icons
    case 'inotropes':
      return <svg {...p}>
        <path d="M6 10.5C6 10.5 1.5 7.5 1.5 4.8a2.5 2.5 0 0 1 4.5-1.5 2.5 2.5 0 0 1 4.5 1.5c0 2.7-4.5 5.7-4.5 5.7z"
          stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      </svg>;
    case 'vasodilators':
      return <svg {...p}>
        <path d="M2 5h8M2 7h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M1 3.5l1.5 2.5L1 8.5M11 3.5 9.5 6l1.5 2.5"
          stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>;
    case 'diuretics':
      return <svg {...p}>
        <path d="M6 1.5C6 1.5 2.5 5.5 2.5 7.5a3.5 3.5 0 0 0 7 0C9.5 5.5 6 1.5 6 1.5z"
          stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
        <path d="M4.5 8a1.8 1.8 0 0 0 1 1"
          stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.55"/>
      </svg>;
    case 'glycemic':
      return <svg {...p}>
        <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="6" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
      </svg>;
    case 'compare':
      return <svg {...p} viewBox="0 0 12 12">
        <rect x="1" y="2.5" width="3.5" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
        <rect x="7.5" y="2.5" width="3.5" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
        <path d="M5.5 6H6.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>;
    default:
      return null;
  }
}

// ─── Family icon helper ───────────────────────────────────────────────────────
const FAMILY_ICON_TYPE = {
  pressors:        'pressors',
  inotropes:       'inotropes',
  sedation:        'sedation',
  rhythm:          'rhythm',
  vasodilators:    'vasodilators',
  diuretics:       'diuretics',
  anticoagulation: 'anticoag',
  glycemic:        'glycemic',
};

// ─── Bullet list (inside ref rows) ───────────────────────────────────────────
function RefBulletList({ items }) {
  return (
    <ul className="id-ref-list">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

// ─── Reference row accordion ──────────────────────────────────────────────────
function RefRow({ iconType, label, variant, count, isOpen, onToggle, children }) {
  const cls = ['id-ref-row', variant ? `id-ref-row--${variant}` : ''].filter(Boolean).join(' ');
  return (
    <div className={cls}>
      <button
        className="id-ref-row__header"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="id-ref-row__icon">
          <Icon type={iconType} size={13} />
        </span>
        <span className="id-ref-row__label">{label}</span>
        {count != null && (
          <span className="id-ref-row__count">{count}</span>
        )}
        <span className={`id-ref-row__chevron${isOpen ? ' id-ref-row__chevron--open' : ''}`}>
          ›
        </span>
      </button>
      <div className={`id-ref-row__body${isOpen ? '' : ' id-ref-row__body--hidden'}`}>
        {children}
      </div>
    </div>
  );
}

// ─── Default accordion state ──────────────────────────────────────────────────
const DEFAULT_OPEN = {
  commonlyUsedFor:   true,
  whatItIsDoing:     false,
  whatNursesMonitor: true,
  watchOut:          true,
  signalsToEscalate: false,
  linesAccessPolicy: false,
  keySafetyNotes:    false,
};

// ─── Detail view ──────────────────────────────────────────────────────────────
function DripsDetail({ drip, onBack, onNavigate }) {
  const [open, setOpen] = useState(DEFAULT_OPEN);

  // Reset accordion when drip changes
  useEffect(() => { setOpen(DEFAULT_OPEN); }, [drip.id]);

  function toggle(key) {
    setOpen(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const relatedDrips = (drip.related || [])
    .map(id => DRIPS.find(d => d.id === id))
    .filter(Boolean);

  return (
    <div className="id-detail">
      <button className="id-detail__back" onClick={onBack}>
        ← Back to ICU Drips
      </button>

      {/* Dark navy hero card */}
      <div className={`id-hero-card id-hero-card--${drip.category}`}>
        <div className="id-hero-card__top">
          <span className="id-hero-card__category">{drip.categoryLabel}</span>
          {drip.badge && (
            <span className="id-hero-card__badge">{drip.badge}</span>
          )}
        </div>
        <h1 className="id-hero-card__name">{drip.name}</h1>
        <p className="id-hero-card__brand">{drip.brandName}</p>
        <p className="id-hero-card__snapshot">{drip.snapshot}</p>
        <div className="id-hero-card__chips">
          {drip.effectChips.map((e, i) => (
            <span key={i} className="id-hero-chip">{e.label}</span>
          ))}
        </div>
      </div>

      {/* Clinical pearl / nurse mental model */}
      <div className="id-pearl">
        <span className="id-pearl__label">Nurse mental model</span>
        <p className="id-pearl__text">{drip.mentalModel}</p>
      </div>

      {/* Reference rows — single containing card */}
      <div className="id-ref-card">

        <RefRow
          iconType="target"
          label="Commonly used for"
          count={drip.commonlyUsedFor.length}
          isOpen={open.commonlyUsedFor}
          onToggle={() => toggle('commonlyUsedFor')}
        >
          <RefBulletList items={drip.commonlyUsedFor} />
        </RefRow>

        <RefRow
          iconType="mechanism"
          label="What it is doing"
          count={drip.whatItIsDoing.length}
          isOpen={open.whatItIsDoing}
          onToggle={() => toggle('whatItIsDoing')}
        >
          <RefBulletList items={drip.whatItIsDoing} />
        </RefRow>

        <RefRow
          iconType="monitor"
          label="What nurses monitor"
          count={drip.whatNursesMonitor.length}
          isOpen={open.whatNursesMonitor}
          onToggle={() => toggle('whatNursesMonitor')}
        >
          <RefBulletList items={drip.whatNursesMonitor} />
        </RefRow>

        <RefRow
          iconType="watch"
          label="Watch out"
          variant="watch"
          count={drip.watchOut.length}
          isOpen={open.watchOut}
          onToggle={() => toggle('watchOut')}
        >
          <RefBulletList items={drip.watchOut} />
        </RefRow>

        <RefRow
          iconType="escalate"
          label="Signals to escalate"
          variant="escalate"
          count={drip.signalsToEscalate.length}
          isOpen={open.signalsToEscalate}
          onToggle={() => toggle('signalsToEscalate')}
        >
          <RefBulletList items={drip.signalsToEscalate} />
        </RefRow>

        <RefRow
          iconType="lines"
          label="Lines, access and policy"
          count={drip.linesAccessPolicy.length}
          isOpen={open.linesAccessPolicy}
          onToggle={() => toggle('linesAccessPolicy')}
        >
          <RefBulletList items={drip.linesAccessPolicy} />
        </RefRow>

        <RefRow
          iconType="safety"
          label="Key safety notes"
          variant="safety"
          count={drip.keySafetyNotes.length}
          isOpen={open.keySafetyNotes}
          onToggle={() => toggle('keySafetyNotes')}
        >
          <RefBulletList items={drip.keySafetyNotes} />
        </RefRow>

      </div>

      {/* Explore next */}
      {relatedDrips.length > 0 && (
        <div className="id-explore-next">
          <span className="id-explore-next__label">Explore next</span>
          {relatedDrips.map(related => (
            <button
              key={related.id}
              className="id-explore-next__row"
              onClick={() => onNavigate(related)}
            >
              <div className="id-explore-next__info">
                <span className="id-explore-next__name">{related.name}</span>
                <span className="id-explore-next__meta">
                  {related.categoryLabel} · {related.brandName}
                </span>
              </div>
              <span className="id-explore-next__arrow">→</span>
            </button>
          ))}
        </div>
      )}

      <div className="id-detail__disclaimer">{SAFETY_DISCLAIMER}</div>
    </div>
  );
}

// ─── Compare detail ───────────────────────────────────────────────────────────
function CompareDetail({ pair, onBack, onNavigateToDrip }) {
  const aDrip = pair.aId ? DRIPS.find(d => d.id === pair.aId) : null;
  const bDrip = pair.bId ? DRIPS.find(d => d.id === pair.bId) : null;

  return (
    <>
      <button className="id-compare__back" onClick={onBack}>
        ← All comparisons
      </button>

      <h2 className="id-compare-detail__title">{pair.label}</h2>

      <table className="id-compare-table">
        <thead>
          <tr>
            <th> </th>
            <th>{pair.aLabel}</th>
            <th>{pair.bLabel}</th>
          </tr>
        </thead>
        <tbody>
          {pair.rows.map((row, i) => (
            <tr key={i}>
              <td>{row.aspect}</td>
              <td>{row.a}</td>
              <td>{row.b}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="id-compare-bottom-line">
        <span className="id-compare-bottom-line__label">Bottom line</span>
        <p className="id-compare-bottom-line__text">{pair.bottomLine}</p>
      </div>

      {(aDrip || bDrip) && (
        <div className="id-compare-drip-links">
          {aDrip && (
            <button
              className="id-compare-drip-link"
              onClick={() => onNavigateToDrip(aDrip)}
            >
              {aDrip.name} full reference →
            </button>
          )}
          {bDrip && (
            <button
              className="id-compare-drip-link"
              onClick={() => onNavigateToDrip(bDrip)}
            >
              {bDrip.name} full reference →
            </button>
          )}
        </div>
      )}
    </>
  );
}

// ─── Quick Compare view ───────────────────────────────────────────────────────
function QuickCompare({ onBackToHome, onNavigateToDrip, initialPairId }) {
  const [selectedPair, setSelectedPair] = useState(
    initialPairId ? (COMPARE_PAIRS.find(p => p.id === initialPairId) ?? null) : null
  );

  if (selectedPair) {
    return (
      <div className="id-compare">
        <CompareDetail
          pair={selectedPair}
          onBack={() => setSelectedPair(null)}
          onNavigateToDrip={onNavigateToDrip}
        />
        <div className="id-detail__disclaimer" style={{ marginTop: 24 }}>
          {SAFETY_DISCLAIMER}
        </div>
      </div>
    );
  }

  return (
    <div className="id-compare">
      <button className="id-compare__back" onClick={onBackToHome}>
        ← All drips
      </button>
      <span className="id-compare__eyebrow">Quick Compare</span>
      <h2 className="id-compare__title">Side-by-side reference</h2>
      <p className="id-compare__sub">
        Educational comparisons across common drip pairs. No dosing. No protocol instructions.
      </p>

      <div className="id-compare-pair-list">
        {COMPARE_PAIRS.map(pair => (
          <button
            key={pair.id}
            className="id-compare-pair-row"
            onClick={() => { trackEvent('drip_compare_pair_selected', { pair_id: pair.id }); setSelectedPair(pair); }}
          >
            <span className="id-compare-pair-row__label">{pair.label}</span>
            <span className="id-compare-pair-row__arrow">→</span>
          </button>
        ))}
      </div>

      <div className="id-landing__disclaimer" style={{ marginTop: 36 }}>
        {SAFETY_DISCLAIMER}
      </div>
    </div>
  );
}

// ─── Landing page ─────────────────────────────────────────────────────────────
function DripsHome({ onSelect, onShowCompare }) {
  const [query,    setQuery]    = useState('');
  const [category, setCategory] = useState('all');

  const q             = norm(query);
  const isFiltering   = q || category !== 'all';

  const filtered = DRIPS.filter(drip => {
    const matchesCategory = category === 'all' || drip.category === category;
    if (!matchesCategory) return false;
    if (!q) return true;
    const chipsText = drip.effectChips.map(e => e.label).join(' ');
    return (
      norm(drip.name).includes(q) ||
      norm(drip.brandName).includes(q) ||
      norm(drip.categoryLabel).includes(q) ||
      norm(drip.snapshot).includes(q) ||
      norm(chipsText).includes(q)
    );
  });

  // Shared drip row renderer
  function renderDripRow(drip) {
    return (
      <div
        key={drip.id}
        className={`id-drip-row id-drip-row--${drip.category}`}
        onClick={() => onSelect(drip)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onSelect(drip)}
      >
        <div className="id-drip-row__category">{drip.categoryLabel}</div>
        <div className="id-drip-row__top">
          <span className="id-drip-row__name">{drip.name}</span>
          <span className="id-drip-row__brand">{drip.brandName}</span>
          <span className="id-drip-row__chevron">›</span>
        </div>
        <div className="id-drip-row__snapshot">{drip.snapshot}</div>
        <div className="id-drip-row__tags">
          {drip.effectChips.map((e, i) => (
            <span key={i} className="id-drip-tag">{e.label}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="id-landing">

      {/* Hero */}
      <div className="id-hero">
        <span className="id-hero__eyebrow">Infusion Reference</span>
        <h1 className="id-hero__title">ICU Drips</h1>
        <p className="id-hero__desc">
          Clinical context, monitoring priorities, and bedside awareness for
          common critical care infusions. Educational reference, not a dosing guide.
        </p>
      </div>

      {/* Search + filter */}
      <div className="id-search-bar">
        <input
          className="id-search-input"
          type="search"
          placeholder="Search drips"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          aria-label="Search drips"
        />
        <div className="id-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`id-filter-btn${category === cat.key ? ' active' : ''}`}
              onClick={() => { if (cat.key !== 'all') trackEvent('drip_category_filter_used', { category: cat.key }); setCategory(cat.key); }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Drip list */}
      {isFiltering ? (
        // Flat filtered / searched view
        <>
          <div className="id-list-header">
            <span className="id-list-header__label">
              {category !== 'all'
                ? CATEGORIES.find(c => c.key === category)?.label ?? 'Drips'
                : 'Results'}
            </span>
            <span className="id-list-header__count">{filtered.length}</span>
          </div>
          <div className="id-list">
            {filtered.length > 0
              ? filtered.map(renderDripRow)
              : <p className="id-no-results">No matching drips.</p>}
          </div>
        </>
      ) : (
        // Family-grouped view
        FAMILIES.map(family => {
          const familyDrips = DRIPS.filter(d => family.categories.includes(d.category));
          if (!familyDrips.length) return null;
          const primaryCat = family.categories[0];
          return (
            <div
              key={family.key}
              className={`id-family-block id-family-block--${primaryCat}`}
            >
              <div className="id-family-header">
                <span className="id-family-icon">
                  <Icon type={FAMILY_ICON_TYPE[family.key]} size={13} />
                </span>
                <span className="id-family-header__label">{family.label}</span>
                <span className="id-family-header__count">{familyDrips.length}</span>
              </div>
              <div className="id-list">
                {familyDrips.map(renderDripRow)}
              </div>
            </div>
          );
        })
      )}

      {/* Quick Compare section — dark navy pair cards */}
      <div className="id-compare-section">
        <div className="id-compare-section__header">
          <span className="id-compare-section__icon">
            <Icon type="compare" size={13} />
          </span>
          <span className="id-compare-section__eyebrow">Quick Compare</span>
        </div>
        <p className="id-compare-section__sub">
          Side-by-side reference for common drip pairs
        </p>
        {COMPARE_PAIRS.map(pair => (
          <button
            key={pair.id}
            className="id-compare-pair-card"
            onClick={() => onShowCompare(pair.id)}
          >
            <div className="id-compare-pair-card__names">
              <span className="id-compare-pair-card__name">{pair.aLabel}</span>
              <span className="id-compare-pair-card__vs">vs</span>
              <span className="id-compare-pair-card__name">{pair.bLabel}</span>
            </div>
            <span className="id-compare-pair-card__arrow">›</span>
          </button>
        ))}
      </div>

      {/* Foundations — compact rows */}
      <div className="id-foundations">
        <span className="id-foundations__eyebrow">Foundations</span>
        {FOUNDATIONS.map(f => (
          <div key={f.id} className="id-foundation-row">
            <span className="id-foundation-row__title">{f.title}</span>
            <span className="id-foundation-row__body">{f.body}</span>
          </div>
        ))}
      </div>

      {/* Clinical Edge Pearls */}
      <div className="id-pearls-section">
        <div className="id-pearls__header">
          <span className="id-pearls__eyebrow">Clinical Edge Pearls</span>
          <p className="id-pearls__sub">Fast bedside takeaways from the drip library.</p>
        </div>
        {CLINICAL_PEARLS.map((pearl, i) => (
          <div key={i} className="id-pearl-card">
            <p className="id-pearl-card__text">{pearl}</p>
          </div>
        ))}
      </div>

      <div className="id-landing__disclaimer">{SAFETY_DISCLAIMER}</div>
    </div>
  );
}

// ─── Module shell ─────────────────────────────────────────────────────────────
export default function IcuDripsModule({ onGoHome }) {
  const [view,          setView]          = useState('home');
  const [selected,      setSelected]      = useState(null);
  const [comparePairId, setComparePairId] = useState(null);

  // Track module opened once on mount
  useEffect(() => {
    trackEvent('icu_drips_opened', { route: '/icu-drips' });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [view]);

  function handleSelect(drip) {
    trackEvent('drip_selected', { drip_id: drip.id, family: drip.family ?? '', category: drip.category ?? '' });
    trackEvent('drip_detail_viewed', { drip_id: drip.id });
    setSelected(drip);
    setView('detail');
  }

  function handleBack() {
    setSelected(null);
    setView('home');
  }

  function handleShowCompare(pairId = null) {
    trackEvent('drip_compare_opened');
    setComparePairId(pairId);
    setView('compare');
  }

  function handleNavigateToDrip(drip) {
    trackEvent('drip_detail_viewed', { drip_id: drip.id });
    setSelected(drip);
    setView('detail');
  }

  return (
    <div className="icu-drips-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;700&display=swap');
      `}</style>

      {/* Sticky header */}
      <header className="id-header">
        <div className="id-header__inner">
          <CELogo />
          <span className="id-header__brand">Clinical Edge</span>
          <span className="id-header__sep" aria-hidden="true">/</span>
          <span className="id-header__module">ICU Drips</span>
          <button className="id-header__back" onClick={onGoHome}>
            ← All tools
          </button>
        </div>
      </header>

      {/* Content surface */}
      <div className="id-body">
        {view === 'detail' && selected ? (
          <DripsDetail
            drip={selected}
            onBack={handleBack}
            onNavigate={handleSelect}
          />
        ) : view === 'compare' ? (
          <QuickCompare
            onBackToHome={() => setView('home')}
            onNavigateToDrip={handleNavigateToDrip}
            initialPairId={comparePairId}
          />
        ) : (
          <DripsHome
            onSelect={handleSelect}
            onShowCompare={handleShowCompare}
          />
        )}
      </div>
    </div>
  );
}
