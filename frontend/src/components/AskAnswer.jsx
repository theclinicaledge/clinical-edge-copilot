import { useId, useRef, useState } from 'react';
import AskABGResult from './AskABGResult.jsx';
import { SOURCES } from '../data/clinicalSources.js';

// Same supported emphasis as the existing Copilot renderer. Everything else is
// literal React text: no raw HTML, autolinks or generated link destinations.
function inline(text) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g).map((part, i) => part.startsWith('**') && part.endsWith('**')
    ? <strong key={i}>{part.slice(2, -2)}</strong>
    : part.startsWith('*') && part.endsWith('*') ? <em key={i}>{part.slice(1, -1)}</em> : part);
}
function AnswerText({ text }) {
  const blocks = [];
  let lines = [], kind = null;
  const flush = () => {
    if (!lines.length) return;
    const key = blocks.length;
    if (kind === 'ul' || kind === 'ol') {
      const List = kind;
      blocks.push(<List key={key}>{lines.map((line, i) => {
        const match = /^(?:[-*]\s+|(\d+)[.)]\s+)(.*)$/.exec(line);
        return <li key={i} value={kind === 'ol' ? Number(match[1]) : undefined}>{inline(match[2])}</li>;
      })}</List>);
    } else blocks.push(<p key={key}>{inline(lines.join('\n'))}</p>);
    lines = [];
  };
  for (const line of text.split('\n')) {
    if (!line.trim()) { flush(); kind = null; continue; }
    const next = /^[-*]\s+/.test(line) ? 'ul' : /^\d+[.)]\s+/.test(line) ? 'ol' : 'p';
    if (next !== kind) flush();
    kind = next; lines.push(line);
  }
  flush();
  return blocks;
}

const STATUS = {
  not_independently_source_verified: 'Model-generated education, not independently source-verified. Pending clinical accuracy review.',
  curated_evidence: 'References supplied for this answer',
  scope_limited: 'Limited evidence coverage',
  deterministic_rules: 'Sources for these rules',
  snapshot_reference: 'References supplied for this answer',
};
const REFRAMING = "Your reported context is being discussed as general education, not a determination of this individual's diagnosis or care.";
function Evidence({ evidence, abg, id, dialogRef }) {
  if (!evidence || abg && abg.status !== 'verified') return null;
  const referenced = ['curated_evidence', 'scope_limited', 'deterministic_rules', 'snapshot_reference'].includes(evidence.status);
  const sources = (Array.isArray(evidence.sources) ? evidence.sources : []).filter(source => source && typeof source.title === 'string' && typeof source.publisher === 'string' && typeof source.url === 'string' && source.url.startsWith('https://'));
  const content = <>
      {referenced ? <>
        <p>{evidence.status === 'snapshot_reference' ? 'Reported facts come from the confirmed Snapshot. Curated references support the bounded physiology explanation, not independent verification of the case. ABG calculations remain code-owned.' : evidence.status === 'scope_limited' ? 'A bounded reference explanation, not a complete model-generated answer.' : evidence.status === 'deterministic_rules' ? 'Code applies these source-backed rules. Calculations and interpretation are not generated or independently verified by the AI.' : 'Curated excerpts were provided before generation. References support general concepts, not additional patient findings or independent verification of every sentence.'}</p>
        {evidence.deviceScope && <p>{evidence.deviceScope}</p>}
        {sources.length ? <ul className="ce-ask-sources">{sources.map(source => <li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a><span>{source.publisher}{source.publication && ` · ${source.publication}`}{source.updated && ` · Updated ${source.updated}`}</span></li>)}</ul> : <p>No reference links supplied with this answer.</p>}
      </> : <p>{evidence.requiresVerification ? 'Reference check required. This generated explanation was not verified against a current source. Confirm medication specifics, numerical criteria and device guidance in approved references and local policy.' : 'Educational support, not a source-verified clinical recommendation. Use clinical judgment and local protocol/provider guidance.'}</p>}
      {evidence.categories?.includes('medication') && <a href={SOURCES['dailymed-fda-labeling'].url} target="_blank" rel="noopener noreferrer">Check official medication labeling</a>}
    </>;
  return <aside className="ce-ask-evidence" aria-label="Evidence boundary">
    {dialogRef ? <>
      <button type="button" className="ce-ask-reference-button" data-copy-omit onClick={() => dialogRef.current?.showModal()}>References and limitations</button>
      <dialog className="ce-ask-reference-dialog" ref={dialogRef} id={id} aria-labelledby={`${id}-title`} onKeyDown={event => {
        if (event.key !== 'Tab') return;
        const controls = event.currentTarget.querySelectorAll('button:not(:disabled), a[href]');
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}>
        <div className="ce-ask-reference-heading" data-copy-omit><h2 id={`${id}-title`}>References and limitations</h2><button type="button" onClick={() => dialogRef.current?.close()} autoFocus>Return to reading</button></div>
        {content}
      </dialog>
    </> : <details id={id}><summary>References and limitations</summary>{content}</details>}
  </aside>;
}

// Include closed source disclosures and ABG limitations when copying. Copy is
// user initiated; no chat content leaves this browser except to its clipboard.
function copyText(node) {
  if (node.nodeType === 3) return node.textContent;
  if (node.nodeType !== 1 || node.hasAttribute('data-copy-omit')) return '';
  const content = Array.from(node.childNodes, copyText).join('');
  const url = node.tagName === 'A' && node.getAttribute('href')?.startsWith('https://') ? ` (${node.getAttribute('href')})` : '';
  const marker = node.tagName !== 'LI' ? '' : node.parentElement.tagName === 'OL'
    ? `${node.getAttribute('value') || Array.from(node.parentElement.children).indexOf(node) + Number(node.parentElement.getAttribute('start') || 1)}. ` : '- ';
  return `${marker}${content}${url}${/^(P|LI|UL|OL|DIV|SECTION|ASIDE|DETAILS|SUMMARY|H[1-6]|DT|DD|HEADER)$/.test(node.tagName) ? '\n\n' : ''}`;
}

export default function AskAnswer({ turn, beta, conversation, earlier = false, answerRef, navigate, busy, onExplain, onFollowUp, notice }) {
  const { question, answer, details = [], context, abg, teaching = [], requestId } = turn;
  const id = useId();
  const root = useRef(null);
  const references = useRef(null);
  const [copyStatus, setCopyStatus] = useState('');
  const length = answer.length + details.reduce((n, d) => n + d.text.length, 0);
  const long = length > 1000 || length > 600 && details.length > 1;
  const evidenceStatus = STATUS[context?.evidence?.status] || 'Educational support, not independently source-verified.';
  const hasEvidence = context?.evidence && (!abg || abg.status === 'verified');
  const jump = targetId => {
    const target = document.getElementById(targetId);
    if (!target) return;
    target.scrollIntoView({ block: 'start', behavior: 'instant' });
    target.focus({ preventScroll: true });
  };
  const explanation = <div id={`${id}-explanation`} tabIndex={-1} className={`ce-ask-explanation${long ? ' ce-ask-explanation--lead' : ''}`}>
    {long && <h3>Main answer</h3>}
    {abg ? <AskABGResult result={abg} /> : <div className="ce-ask-direct"><AnswerText text={answer} /></div>}
  </div>;
  // Show the complete direct-answer field, never a truncated or inferred summary.
  const leadFirst = !abg && answer.length <= 600;
  const navigation = long && <nav className="ce-ask-jump" aria-label="Answer sections" data-copy-omit><span>Explore this answer</span><div>{details.map((detail, index) => <a key={index} href={`#${id}-${index}`} onClick={event => { event.preventDefault(); jump(`${id}-${index}`); }}>{detail.heading}</a>)}{hasEvidence && <button type="button" onClick={() => references.current?.showModal()}>References & limitations</button>}{onFollowUp && <button type="button" onClick={onFollowUp}>Ask a follow-up ↓</button>}</div></nav>;
  const copy = async () => {
    try { await navigator.clipboard.writeText(copyText(root.current).trim()); setCopyStatus('Answer copied, including source status and limitations.'); }
    catch { setCopyStatus('Copy unavailable. You can select the answer text instead.'); }
  };
  return <div className="ce-ask-turn" ref={root}>
    <div className="ce-ask-user-message"><span>You</span><p>{question}</p></div>
    <section className="ce-ask-answer" ref={answerRef} tabIndex={-1} aria-label={earlier ? 'Earlier educational explanation' : 'Latest educational explanation'}>
      <header className="ce-ask-answer-header"><strong>Clinical Edge</strong><span className="ce-ask-answer-mode">{beta ? 'Educational explanation' : conversation ? 'Bounded educational preview' : context?.snapshotUse ? 'Using Patient Snapshot' : 'General Ask'}</span></header>
      <p className="ce-ask-evidence-status">{evidenceStatus}</p>
      {conversation && context?.educationalReframing && <p className="ce-ask-reframing">{REFRAMING}</p>}
      {!conversation && <p className="ce-ask-scope">{context?.questionKind === 'reported_context' ? 'Reported context · Not a diagnosis' : 'Nursing education'}</p>}
      {!leadFirst && navigation}
      {explanation}
      {leadFirst && navigation}
      {context?.snapshotUse && <>
        <details className="ce-ask-context"><summary>REPORTED · Information used</summary><ul>{context.snapshotUse.reported.map(fact => <li key={fact.id}><strong>{fact.label}: </strong>{fact.text}</li>)}</ul></details>
        {context.snapshotUse.calculated && (context.snapshotUse.synthesisBindings
          ? <details className="ce-ask-context"><summary>CALCULATED · ABG rule check</summary><AskABGResult result={context.snapshotUse.calculated} /></details>
          : <section className="ce-ask-detail"><h3>CALCULATED · ABG rule check</h3><AskABGResult result={context.snapshotUse.calculated} /></section>)}
        <p className="ce-ask-scope">{context.snapshotUse.interpretationLabel} · {context.snapshotUse.resolution === 'model_selected' ? 'AI-selected reference explanation' : 'Reference-guided explanation; not a model-generated answer'}</p>
        {context.snapshotUse.unknown.length > 0 && <section className="ce-ask-detail"><h3>UNKNOWN · What would change interpretation</h3><ul>{context.snapshotUse.unknown.map(text => <li key={text}>{text}</li>)}</ul></section>}
      </>}
      {teaching.length > 0 && <section className="ce-ask-detail" aria-label="ABG physiology explanation"><h3>Why</h3>{teaching.map(point => <p key={point.id}>{point.text}</p>)}</section>}
      {abg?.status === 'verified' && !conversation && onExplain && <div className="ce-ask-controls" data-copy-omit><button type="button" disabled={busy} onClick={onExplain}>Explain this pattern <span aria-hidden="true">&#8594;</span></button></div>}
      {notice && <p role="status">{notice}</p>}
      {details.map((detail, index) => <section className={`ce-ask-detail${detail.heading === 'Safety' ? ' ce-ask-detail--safety' : detail.heading === 'At the bedside' ? ' ce-ask-detail--bedside' : ''}`} aria-labelledby={`${id}-${index}`} key={index}><h3 id={`${id}-${index}`} tabIndex={-1}>{detail.heading}</h3><AnswerText text={detail.text} /></section>)}
      {long && <button type="button" className="ce-ask-return" data-copy-omit onClick={() => jump(`${id}-explanation`)}>Back to explanation ↑</button>}
      <div className="ce-ask-answer-utilities">
      <Evidence evidence={context?.evidence} abg={abg} id={`${id}-evidence`} dialogRef={long ? references : undefined} />
      {context?.offerSnapshot && <div className="ce-ask-handoff" data-copy-omit><button type="button" onClick={() => navigate('/copilot?capture=rapid')}>Open Shift Brain <span aria-hidden="true">&#8594;</span></button><span>No question or answer is transferred.</span></div>}
      <footer className="ce-ask-answer-actions" data-copy-omit>
        <button type="button" className="ce-ask-copy" onClick={copy} title="Copy answer with source status and limitations"><span aria-hidden="true">&#x29C9;</span> Copy answer</button>
        {requestId && <a href={`mailto:clinicaledgehq@gmail.com?subject=${encodeURIComponent('Ask concern: '+requestId)}&body=${encodeURIComponent('Request ID: '+requestId+'\nConcern: inaccurate / confusing / concerning (choose one).\nDo not include patient information or copy clinical chat content.')}`}>Report a concern</a>}
        {copyStatus && <span role="status" className="ce-ask-copy-status">{copyStatus}</span>}
      </footer>
      </div>
    </section>
  </div>;
}
