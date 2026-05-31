import { useState, useEffect } from 'react';
import './icu-drips.css';
import { DRIPS, CATEGORIES, SAFETY_DISCLAIMER } from './data/drips.js';

// ─── CE Logo ──────────────────────────────────────────────────────────────────
function CELogo() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 225 200"
      xmlns="http://www.w3.org/2000/svg"
      fill="#0ABFBC"
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

// ─── Normalize search string ───────────────────────────────────────────────────
// Lowercase, strip hyphens → spaces, collapse whitespace.
function norm(s) {
  return s.toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Section({ label, safety, children }) {
  return (
    <div className={`id-section${safety ? ' id-section--safety' : ''}`}>
      <span className="id-section__label">{label}</span>
      {children}
    </div>
  );
}

// ─── Drip Detail ──────────────────────────────────────────────────────────────
function DripsDetail({ drip, onBack }) {
  return (
    <div className="id-detail">
      <button className="id-detail__back" onClick={onBack}>
        ← Back to ICU Drips
      </button>

      <div className="id-detail__category">{drip.categoryLabel}</div>
      <h1 className="id-detail__name">{drip.name}</h1>
      <p className="id-detail__brand">{drip.brandName}</p>
      <p className="id-detail__snapshot">{drip.snapshot}</p>

      <div className="id-sections">

        <Section label="Common clinical use">
          <ul className="id-section__list">
            {drip.clinicalUse.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </Section>

        <Section label="What it is doing">
          <p className="id-section__prose">{drip.mechanism}</p>
        </Section>

        <Section label="What nurses monitor">
          <ul className="id-section__list">
            {drip.monitoring.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </Section>

        <Section label="Titration concept">
          <p className="id-section__prose">{drip.titrationConcept}</p>
        </Section>

        <Section label="Bedside concerns & pitfalls">
          <ul className="id-section__list">
            {drip.bedsideConcerns.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </Section>

        <Section label="Lines, access & compatibility">
          <p className="id-section__prose">{drip.linesAccess}</p>
        </Section>

        <Section label="Signals to escalate">
          <ul className="id-section__list">
            {drip.escalationSignals.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </Section>

        <Section label="Weaning & transition concepts">
          <p className="id-section__prose">{drip.weaningConcepts}</p>
        </Section>

        <Section label="Safety flags" safety>
          <ul className="id-section__list">
            {drip.safetyFlags.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </Section>

      </div>

      <div className="id-detail__disclaimer">
        {SAFETY_DISCLAIMER}
      </div>
    </div>
  );
}

// ─── Drips Landing ────────────────────────────────────────────────────────────
function DripsHome({ onSelect }) {
  const [query,    setQuery]    = useState('');
  const [category, setCategory] = useState('all');

  const q = norm(query);

  const filtered = DRIPS.filter(drip => {
    const matchesCategory = category === 'all' || drip.category === category;
    if (!matchesCategory) return false;
    if (!q) return true;
    return (
      norm(drip.name).includes(q) ||
      norm(drip.brandName).includes(q) ||
      norm(drip.categoryLabel).includes(q) ||
      norm(drip.snapshot).includes(q)
    );
  });

  return (
    <div className="id-landing">
      {/* Hero */}
      <div className="id-hero">
        <span className="id-hero__eyebrow">Infusion Reference</span>
        <h1 className="id-hero__title">ICU Drips</h1>
        <p className="id-hero__desc">
          Clinical context, monitoring priorities, and bedside awareness
          for common critical care infusions. Educational reference — not a dosing guide.
        </p>
      </div>

      {/* Search + filters */}
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
      <div className="id-list">
        {filtered.length > 0
          ? filtered.map(drip => (
              <div
                key={drip.id}
                className="id-drip-row"
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
              </div>
            ))
          : <p className="id-no-results">No matching drips.</p>
        }
      </div>

      {/* Quiet disclaimer */}
      <div className="id-landing__disclaimer">
        {SAFETY_DISCLAIMER}
      </div>
    </div>
  );
}

// ─── Module Shell ─────────────────────────────────────────────────────────────
export default function IcuDripsModule({ onGoHome }) {
  const [view,     setView]     = useState('home');
  const [selected, setSelected] = useState(null);

  // Scroll to top on every view change
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

  return (
    <div className="icu-drips-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;700&display=swap');
      `}</style>

      {/* ── Sticky header ── */}
      <header className="id-header">
        <div className="id-header__inner">
          <CELogo />
          <span className="id-header__brand">Clinical Edge</span>
          <span className="id-header__sep" aria-hidden="true">/</span>
          <span className="id-header__module">ICU Drips</span>
          <button
            className="id-header__back"
            onClick={onGoHome}
            onMouseEnter={e => { e.currentTarget.style.color = '#0ABFBC'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#4A6978'; }}
          >
            ← All tools
          </button>
        </div>
      </header>

      {/* ── Warm content surface ── */}
      <div className="id-body">
        {view === 'detail' && selected
          ? <DripsDetail drip={selected} onBack={handleBack} />
          : <DripsHome onSelect={handleSelect} />
        }
      </div>
    </div>
  );
}
