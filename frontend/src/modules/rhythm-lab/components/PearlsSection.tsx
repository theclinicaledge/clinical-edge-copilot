import { PEARLS } from '../data/phase1';

export function PearlsSection() {
  return (
    <div className="pearls-section">
      <p className="pearls-section__eyebrow">Recognition Pearls</p>
      <p className="pearls-section__heading">What experienced eyes notice</p>
      <div className="pearls-list">
        {PEARLS.map((pearl, i) => (
          <div key={pearl.id} className="pearl-item">
            <span className="pearl-item__num">{String(i + 1).padStart(2, '0')}</span>
            <span className="pearl-item__text">{pearl.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
