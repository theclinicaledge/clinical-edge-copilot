export function ClinicalEdgeMark({ size = 30 }) {
  return (
    <svg
      className="ce-module-header__logo"
      width={size}
      height={size}
      viewBox="0 0 225 200"
      xmlns="http://www.w3.org/2000/svg"
      fill="var(--ce-teal)"
      aria-hidden="true"
    >
      <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z" />
      <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z" />
      <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z" />
      <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z" />
    </svg>
  );
}

export default function ModuleHeader({
  moduleName,
  onGoHome,
  onBack,
  backLabel = 'Back',
  maxWidth = 'var(--ce-content)',
}) {
  const action = onBack || onGoHome;
  const actionLabel = onBack ? backLabel : 'All tools';

  return (
    <header className="ce-module-header">
      <div className="ce-module-header__inner" style={{ maxWidth }}>
        <button
          type="button"
          className="ce-module-header__brand"
          onClick={onGoHome}
          aria-label="Clinical Edge — all tools"
          disabled={!onGoHome}
        >
          <ClinicalEdgeMark />
          <span className="ce-module-header__titles">
            <span className="ce-module-header__name">Clinical Edge</span>
            <span className="ce-module-header__module">{moduleName}</span>
          </span>
        </button>

        {action ? (
          <button type="button" className="ce-back-link" onClick={action} title={actionLabel}>
            <span className="ce-back-link__arrow" aria-hidden="true">←</span>
            <span className="ce-back-link__label">{actionLabel}</span>
          </button>
        ) : null}
      </div>
    </header>
  );
}
