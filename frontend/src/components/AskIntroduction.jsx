export default function AskIntroduction({ compact = false }) {
  return <header className={`ce-ask-intro${compact ? ' ce-ask-intro--compact' : ''}`}>
    <div className="ce-ask-title"><h1>Ask Clinical Edge</h1></div>
    {!compact && <><p className="ce-ask-subtitle">Your AI nursing learning companion.</p>
    <p className="ce-ask-description">Understand nursing concepts, explore clinical reasoning, and learn through conversation.</p></>}
  </header>;
}
