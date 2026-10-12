export default function AskIntroduction({ beta = false }) {
  return <header className="ce-ask-intro">
    <div className="ce-ask-title"><h1>Ask Clinical Edge</h1>{beta && <span className="ce-ask-beta">Beta</span>}</div>
    <p className="ce-ask-subtitle">Your AI nursing learning companion.</p>
    <p className="ce-ask-description">Understand nursing concepts, explore clinical reasoning, and learn through conversation.</p>
  </header>;
}
