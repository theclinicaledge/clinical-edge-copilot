import { useState } from 'react';
import { FOUNDATIONS } from '../data/phase1';

export function FoundationsSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="foundations-section">
      <button
        className="foundations-toggle"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <span className="foundations-toggle__eyebrow">Start here</span>
        <span className="foundations-toggle__title">Strip Reading Foundations</span>
        <span className="foundations-toggle__chevron" aria-hidden="true">›</span>
      </button>

      {open && (
        <div className="foundations-grid">
          {FOUNDATIONS.map(card => (
            <div key={card.id} className="foundation-card">
              <p className="foundation-card__title">{card.title}</p>
              <p className="foundation-card__line">{card.line}</p>
              {card.label && (
                <p className="foundation-card__label">{card.label}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
