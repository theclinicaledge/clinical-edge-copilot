import { useState, useEffect } from 'react';
import './icu-drips.css';
import {
  DRIPS, CATEGORIES, FAMILIES, FOUNDATIONS,
  SAFETY_DISCLAIMER, COMPARE_PAIRS,
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

// ─── Normalize search ─────────────────────────────────────────────────────────
function norm(s) {
  return String(s).toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
}

// ─── Bullet list ──────────────────────────────────────────────────────────────
function BulletList({ items }) {
  return (
    <ul className="id-section__list">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

// ─── Collapsible section ──────────────────────────────────────────────────────
function CollapsibleSection({ label, variant, isOpen, onToggle, children }) {
  const cls = ['id-section', variant ? `id-section--${variant}` : ''].filter(Boolean).join(' ');
  return (
    <div className={cls}>
      <button className="id-section__toggle" onClick={onToggle} aria-expanded={isOpen}>
        <span className="id-section__toggle-label">{label}</span>
        <span className={`id-section__toggle-arrow${isOpen ? ' id-section__toggle-arrow--open' : ''}`}>
          ▾
        </span>
      </button>
      <div className={`id-section__body${isOpen ? '' : ' id-section__body--hidden'}`}>
        {children}
      </div>
    </div>
  );
}

// ─── Detail view ──────────────────────────────────────────────────────────────
const DEFAULT_OPEN = {
  commonlyUsedFor:   true,
  whatItIsDoing:     false,
  whatNursesMonitor: true,
  watchOut:          true,
  signalsToEscalate: true,
  linesAccessPolicy: false,
  keySafetyNotes:    true,
};

function DripsDetail({ drip, onBack, onNavigate }) {
  const [open, setOpen] = useState(DEFAULT_OPEN);

  // Reset accordion state each time we view a different drip
  useEffect(() => { setOpen(DEFAULT_OPEN); }, [drip.id]);

  function toggle(key) {
    setOpen(prev => ({ ...prev, [key]: !prev[key] }));
  }

  // Resolve related drips
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

      {/* Clinical pearl / mental model */}
      <div className="id-pearl">
        <span className="id-pearl__label">Nurse mental model</span>
        <p className="id-pearl__text">{drip.mentalModel}</p>
      </div>

      {/* Collapsible content sections */}
      <div className="id-sections">

        <CollapsibleSection
          label="Commonly used for"
          isOpen={open.commonlyUsedFor}
          onToggle={() => toggle('commonlyUsedFor')}
        >
          <BulletList items={drip.commonlyUsedFor} />
        </CollapsibleSection>

        <CollapsibleSection
          label="What it is doing"
          isOpen={open.whatItIsDoing}
          onToggle={() => toggle('whatItIsDoing')}
        >
          <BulletList items={drip.whatItIsDoing} />
        </CollapsibleSection>

        <CollapsibleSection
          label="What nurses monitor"
          isOpen={open.whatNursesMonitor}
          onToggle={() => toggle('whatNursesMonitor')}
        >
          <BulletList items={drip.whatNursesMonitor} />
        </CollapsibleSection>

        <CollapsibleSection
          label="Watch out"
          variant="watch"
          isOpen={open.watchOut}
          onToggle={() => toggle('watchOut')}
        >
          <BulletList items={drip.watchOut} />
        </CollapsibleSection>

        <CollapsibleSection
          label="Signals to escalate"
          variant="escalate"
          isOpen={open.signalsToEscalate}
          onToggle={() => toggle('signalsToEscalate')}
        >
          <BulletList items={drip.signalsToEscalate} />
        </CollapsibleSection>

        <CollapsibleSection
          label="Lines, access and policy"
          isOpen={open.linesAccessPolicy}
          onToggle={() => toggle('linesAccessPolicy')}
        >
          <BulletList items={drip.linesAccessPolicy} />
        </CollapsibleSection>

        <CollapsibleSection
          label="Key safety notes"
          variant="safety"
          isOpen={open.keySafetyNotes}
          onToggle={() => toggle('keySafetyNotes')}
        >
          <BulletList items={drip.keySafetyNotes} />
        </CollapsibleSection>

      </div>

      {/* Explore next */}
      {relatedDrips.length > 0 && (
        <div className="id-explore-next">
          <span className="id-explore-next__label">Explore next</span>
          {relatedDrips.map(related => (
            <div
              key={related.id}
              className="id-explore-next__row"
              onClick={() => onNavigate(related)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onNavigate(related)}
            >
              <div className="id-explore-next__info">
                <span className="id-explore-next__name">{related.name}</span>
                <span className="id-explore-next__meta">
                  {related.categoryLabel} · {related.brandName}
                </span>
              </div>
              <span className="id-explore-next__arrow">→</span>
            </div>
          ))}
        </div>
      )}

      <div className="id-detail__disclaimer">{SAFETY_DISCLAIMER}</div>
    </div>
  );
}

// ─── Quick Compare ────────────────────────────────────────────────────────────
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
            <button className="id-compare-drip-link" onClick={() => onNavigateToDrip(aDrip)}>
              {aDrip.name} full reference →
            </button>
          )}
          {bDrip && (
            <button className="id-compare-drip-link" onClick={() => onNavigateToDrip(bDrip)}>
              {bDrip.name} full reference →
            </button>
          )}
        </div>
      )}
    </>
  );
}

function QuickCompare({ onBackToHome, onNavigateToDrip }) {
  const [selectedPair, setSelectedPair] = useState(null);

  if (selectedPair) {
    return (
      <div className="id-compare">
        <CompareDetail
          pair={selectedPair}
          onBack={() => setSelectedPair(null)}
          onNavigateToDrip={onNavigateToDrip}
        />
        <div className="id-detail__disclaimer">{SAFETY_DISCLAIMER}</div>
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
            onClick={() => setSelectedPair(pair)}
          >
            <span className="id-compare-pair-row__label">{pair.label}</span>
            <span className="id-compare-pair-row__arrow">→</span>
          </button>
        ))}
      </div>

      <div className="id-landing__disclaimer" style={{ marginTop: 40 }}>
        {SAFETY_DISCLAIMER}
      </div>
    </div>
  );
}

// ─── Landing page ─────────────────────────────────────────────────────────────
function DripsHome({ onSelect, onShowCompare }) {
  const [query,    setQuery]    = useState('');
  const [category, setCategory] = useState('all');

  const q = norm(query);
  const isFiltering = q || category !== 'all';

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

  // Group by family when showing all drips without a search query
  const showFamilies = !isFiltering;

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

      {/* Search + category filter */}
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
              onClick={() => setCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Drip list */}
      {showFamilies ? (
        // Family-grouped view
        <>
          {FAMILIES.map(family => {
            const familyDrips = DRIPS.filter(d => d.family === family.label);
            if (!familyDrips.length) return null;
            return (
              <div key={family.key} className="id-family-block">
                <div className="id-family-header">
                  <span className="id-family-header__label">{family.label}</span>
                  <span className="id-family-header__count">{familyDrips.length}</span>
                </div>
                <div className="id-list">
                  {familyDrips.map(renderDripRow)}
                </div>
              </div>
            );
          })}
        </>
      ) : (
        // Flat filtered view
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
      )}

      {/* Quick Compare CTA */}
      <button className="id-compare-cta" onClick={onShowCompare}>
        <div className="id-compare-cta__inner">
          <span className="id-compare-cta__label">Quick Compare</span>
          <span className="id-compare-cta__sub">
            Side-by-side reference for 5 common drip pairs
          </span>
        </div>
        <span className="id-compare-cta__arrow">→</span>
      </button>

      {/* Foundations */}
      <div className="id-foundations">
        <p className="id-foundations__eyebrow">Foundations</p>
        <div className="id-foundations__grid">
          {FOUNDATIONS.map(f => (
            <div key={f.id} className="id-foundation-card">
              <p className="id-foundation-card__title">{f.title}</p>
              <p className="id-foundation-card__body">{f.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="id-landing__disclaimer">{SAFETY_DISCLAIMER}</div>
    </div>
  );
}

// ─── Module shell ─────────────────────────────────────────────────────────────
export default function IcuDripsModule({ onGoHome }) {
  const [view,     setView]     = useState('home');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [view]);

  function handleSelect(drip) {
    setSelected(drip);
    setView('detail');
  }

  function handleBack() {
    setSelected(null);
    setView('home');
  }

  // Called from Quick Compare when user wants to jump to a drip detail
  function handleNavigateToDrip(drip) {
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
          />
        ) : (
          <DripsHome
            onSelect={handleSelect}
            onShowCompare={() => setView('compare')}
          />
        )}
      </div>
    </div>
  );
}
