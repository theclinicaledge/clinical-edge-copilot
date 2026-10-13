export default function AskIntroduction({ beta = false, compact = false }) {
  return <header className={`ce-ask-intro${compact ? ' ce-ask-intro--compact' : ''}`}>
    <div className="ce-ask-title"><h1>Ask Clinical Edge</h1>{beta && <span className="ce-ask-beta">Beta</span>}</div>
    {!compact && <><p className="ce-ask-subtitle">Your AI nursing learning companion.</p>
    <p className="ce-ask-description">Understand nursing concepts, explore clinical reasoning, and learn through conversation.</p></>}
  </header>;
}
