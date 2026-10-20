import { useEffect, useState } from 'react';
import { patients, staff, policy, reasons, d1Feedback, calls, jordanDirections, hold416, dispatchText, dispatchAcknowledgement, coverageOptions, v5Steps, helpOptions, helpFeedback, looseEnds, references } from './data';
import { CALLS, SEVERITY, fresh, canSubmitDispatch, evaluateDispatch, evaluateCoverage, helpReasons, reportChips, evaluateReport, evaluateD5, ending, canFinish, dismissTeachingClaim } from './rules';
import { loadProgress, saveProgress, clearProgress } from './progress';
import './shift5.css';

const times = ['0700', '0715', '0720', '0724', '0730', '0733', '0800', '0830'];
const names = { you: 'You', jordan: 'Jordan', priya: 'Priya', hold: 'Hold / Sam' };
const stageNames = ['Report', 'Plan your round', 'Answer the lights', 'Room 412', 'Cover your rooms', 'Room 414', 'Close the loops', 'Debrief'];
const coverageSummaries = {
  A: 'Dee takes 412 and watches 410 + 416',
  B: 'Priya takes 412 briefly; Dee watches 410 + 416',
  C: 'Jordan gets the value; Dee reassesses 412',
  D: 'Jordan reports the value to you',
  E: 'Finish your current task first',
  F: 'Ask Jordan to assess 414’s dressing',
};
const staffResponsibilities = {
  early: {
    you: 'RN assessment and decisions',
    jordan: 'Routine assistance; reports changes to the RN',
    priya: 'Charge RN; can accept one call',
    sam: 'Relays messages, not nursing coverage',
  },
  late: {
    you: 'RN assessment of changing Room 414',
    jordan: 'Checked-off glucose value; reports to RN',
    priya: 'One short RN task or staffing call',
    dee: 'Named room coverage and RN reassessment',
  },
};
const coverageActionLabels = { A: 'Send handoff', B: 'Send handoff', C: 'Send handoff', D: 'Ask Jordan for the value', E: 'Finish current task', F: 'Ask Jordan to check 414' };
const coverageMessage = (option, plan) => option.id !== 'E' ? option.text : plan === 'V3' ? "Finish Ms. Whitfield's teaching, then go." : plan === 'V5' ? 'Finish with Ms. Alvarez, then go.' : "Stay with Mr. Okafor until his 0742 recheck, then go.";
const copy = async value => { try { await navigator.clipboard.writeText(value); return true; } catch { return false; } };

function Flags({ reasons: items }) {
  if (!items?.length) return null;
  const sorted = [...items].sort((a, b) => SEVERITY.indexOf(a) - SEVERITY.indexOf(b));
  return <span className="s5-flags" aria-label={`Primary result: ${sorted[0]}; all reasons: ${sorted.join(', ')}`}>{sorted.map((reason, i) => <span className={`s5-flag s5-${reason.toLowerCase().replaceAll(' ', '-')} ${i === 0 ? 'is-primary' : ''}`} key={`${reason}-${i}`}>{reason}</span>)}</span>;
}

function Choice({ selected, children, onClick, disabled = false, className = '', expanded }) {
  return <button type="button" className={`s5-choice ${selected ? 'is-selected' : ''} ${className}`} aria-pressed={!!selected} aria-expanded={expanded} onClick={onClick} disabled={disabled}>{children}</button>;
}

function UnitBoard({ state, onSelect, d1Draft }) {
  const stage = state.stage;
  const status = room => {
    if (stage === 0) return 'Report ready';
    if (stage === 1) {
      const order = state.d1?.order || d1Draft.order;
      return order.includes(room) ? `Visit ${order.indexOf(room) + 1}` : 'On assignment';
    }
    if (stage === 2) return CALLS.includes(room) ? 'Call light' : 'Quiet';
    if (room === '414') return stage >= 6 ? 'Team at bedside' : stage >= 4 ? 'Change reported' : 'Quiet';
    if (room === '412') return stage >= 6 ? state.coverageAcknowledged ? 'Dee to 0830' : 'Coverage expired' : 'Recheck due 0742';
    if (stage >= 6) return state.coverageAcknowledged ? 'Dee to 0830' : 'Coverage expired';
    if (stage >= 4) return state.d3 ? 'Coverage to 0800' : 'Coverage needed';
    return room === '416' ? 'Ride arrived' : 'Needs assistance';
  };
  return <section className={`s5-board ${stage === 4 ? 'is-compact' : ''}`} aria-label="Four-patient unit board">
    <div className="s5-board-head"><span>MED-SURG / FOUR ROOMS</span><strong>{stage === 5 && state.d3?.submitted?.v5Step === 'ii' ? '0735' : times[stage]}</strong></div>
    <div className="s5-board-grid">{patients.map(patient => <button type="button" key={patient.room} className={`s5-room ${state.selectedRoom === patient.room ? 'is-active' : ''} ${stage === 2 && CALLS.includes(patient.room) ? 'is-calling' : ''} ${patient.room === '414' && stage >= 4 && stage < 7 ? 'is-changing' : ''}`} onClick={() => onSelect(patient.room)} aria-label={`Room ${patient.room}, ${patient.name}, ${status(patient.room)}`}>
      <span className="s5-room-number">{patient.room}</span><span className="s5-room-status">{status(patient.room)}</span><small>{patient.name}</small>
    </button>)}</div>
    {stage >= 4 && stage < 7 && <p className="s5-board-note">{stage === 6 ? state.coverageAcknowledged ? 'Dee accepted 410, 412 and 416 through 0830.' : '0800 coverage has ended. Dee has offered an extension; acceptance is pending.' : !state.d3 ? 'Coverage is not assigned yet. A named nurse must accept before you leave.' : state.d3.storyOption === 'B' ? 'Priya to Dee: 412 handoff accepted at 0745. Coverage ends 0800.' : 'Dee accepted coverage through 0800. A new handoff is needed afterward.'}</p>}
  </section>;
}

function Feedback({ children, reasons: items, bridge }) {
  return <div className="s5-feedback" role="status"><Flags reasons={items} /><p>{children}</p>{bridge && <p className="s5-bridge">{bridge}</p>}</div>;
}

function StaffAvailability({ phase }) {
  const ids = phase === 'late' ? ['you', 'jordan', 'priya', 'dee'] : ['you', 'jordan', 'priya', 'sam'];
  return <ul className="s5-staff-list" aria-label="Staff availability">
    {ids.map(id => {
      const person = staff.find(item => item.id === id);
      return <li key={id}><div className="s5-staff-name"><strong>{person.name}</strong><span>{person.role}</span></div><div><span className="s5-staff-availability">{person[phase]}</span><small>{staffResponsibilities[phase][id]}</small></div></li>;
    })}
  </ul>;
}

export default function Shift5({ embedded = false, trackSession = null, debrief = null, nextStep = null }) {
  const [state, setState] = useState(() => trackSession ? trackSession.initial() : loadProgress());
  const [d1Draft, setD1Draft] = useState(() => state.uiDraft?.d1Draft || { order: [], reason: null });
  const [d3Draft, setD3Draft] = useState(() => state.uiDraft?.d3Draft || { option: null, v5Step: null });
  const [checkbackDraft, setCheckbackDraft] = useState(() => state.uiDraft?.checkbackDraft || null);
  const [copied, setCopied] = useState(false);
  useEffect(() => { const snapshot = { ...state, uiDraft: { d1Draft, d3Draft, checkbackDraft } }; if (trackSession) trackSession.persist(snapshot); else saveProgress(snapshot); }, [state, d1Draft, d3Draft, checkbackDraft, trackSession]);
  useEffect(() => {
    const heading = document.querySelector('.s5-scene h1');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [state.stage]);
  const patch = update => {
    if (trackSession) {
      for (const key of ['d2', 'd3']) if (update[key] && !state[key]) trackSession.observe(key, update[key], state);
      for (const key of ['help', 'report']) if (update.d4?.[key] && !state.d4[key]) trackSession.observe(key, update.d4[key], state);
    }
    setState(current => ({ ...current, ...update }));
  };
  const next = () => setState(current => ({ ...current, stage: current.stage + 1, selectedRoom: null }));
  const restart = () => { if (!trackSession) clearProgress(); setState(trackSession ? trackSession.restart() : fresh()); setD1Draft({ order: [], reason: null }); setD3Draft({ option: null, v5Step: null }); setCheckbackDraft(null); };
  const submitD1 = () => { if (d1Draft.order.length === 4 && d1Draft.reason) patch({ d1: structuredClone(d1Draft) }); };
  const setAssignment = (room, person) => setState(current => ({ ...current, d2Draft: { ...current.d2Draft, assignments: { ...current.d2Draft.assignments, [room]: person } } }));
  const submitD2 = () => { if (canSubmitDispatch(state.d2Draft)) patch({ d2: evaluateDispatch(state.d2Draft) }); };
  const submitD3 = () => { if (d3Draft.option && (state.d2.storyPlan !== 'V5' || d3Draft.v5Step)) patch({ d3: evaluateCoverage(d3Draft.option, state.d2.storyPlan === 'V5' ? d3Draft.v5Step : null) }); };
  const toggleRevealed = id => setState(current => ({ ...current, d4: { ...current.d4, revealed: current.d4.revealed.includes(id) ? current.d4.revealed : [...current.d4.revealed, id] } }));
  const toggleHelp = id => setState(current => { const exclusive = ['recheck', 'rounds']; const prev = current.d4.helpDraft; const values = exclusive.includes(id) ? [id] : [...prev.filter(item => !exclusive.includes(item)), ...(prev.includes(id) ? [] : [id])].filter(item => item !== id || !prev.includes(id)); return { ...current, d4: { ...current.d4, helpDraft: values } }; });
  const submitHelp = () => { const selected = state.d4.helpDraft; if (!selected.length) return; const reasons = helpReasons(selected); patch({ d4: { ...state.d4, help: { submitted: [...selected], reasons, bridges: reasons[0] === 'Accepted' ? [] : [{ decision: 'D4 help', original: selected, story: ['provider', 'rapid'], text: 'Taking the safer approach: you call the surgical provider and rapid response now.' }] }, phase: 1 } }); };
  const toggleChip = id => setState(current => { const draft = current.d4.reportDraft; return { ...current, d4: { ...current.d4, reportDraft: draft.includes(id) ? draft.filter(item => item !== id) : draft.length < 3 ? [...draft, id] : draft } }; });
  const submitReport = () => patch({ d4: { ...state.d4, report: evaluateReport(state.d4.reportDraft, state.d4.revealed), phase: 2 } });
  const submitCheckback = () => { if (!checkbackDraft) return; const good = checkbackDraft === 'repeat'; patch({ d4: { ...state.d4, checkback: { submitted: checkbackDraft, reasons: [good ? 'Accepted' : 'Revisit'], bridges: good ? [] : [{ decision: 'D4 check-back', original: checkbackDraft, story: 'repeat', text: 'Taking the safer approach: you repeat the plan back and the responder confirms it.' }] }, phase: 3 } }); };
  const submitEnd = (card, choice) => setState(current => ({ ...current, d5: { ...current.d5, [card]: evaluateD5(card, choice) } }));
  const acknowledgeCoverage = () => patch({ coverageAcknowledged: true });
  const first = state.d1?.order?.[0];
  const d2Plan = state.d2?.storyPlan;
  const room412Owner = ['V3', 'V5'].includes(d2Plan) ? 'Priya' : 'You';
  const optional = [
    { id: 'skin', label: 'Skin', finding: 'Cool and clammy.' },
    { id: 'dressing', label: 'Dressing', finding: 'Bright red drainage, now well past the 0600 pen outline.' },
    { id: 'vitals', label: 'Current vitals', finding: `${state.d3?.submitted?.v5Step === 'ii' ? '0735' : '0733'}: HR 118, BP 92/58, RR 22, SpO2 95% on room air.` },
    { id: 'trend', label: 'Full trend', finding: `0430/0600/0700/0730/${state.d3?.submitted?.v5Step === 'ii' ? '0735' : '0733'}: HR 84/86/88/112/118; systolic BP 132/130/128/98/92.` },
  ];
  return <div className={`s5-app${embedded ? ' is-embedded' : ''}`}>
    <header className="s5-header"><span className="s5-mark">CE</span><span><strong>THE SHIFT</strong><small>SHIFT-005 / Which Patient First?</small></span><button type="button" className="s5-reset" onClick={restart}>Start over</button></header>
    <div className="s5-layout"><aside className="s5-rail"><UnitBoard state={state} d1Draft={d1Draft} onSelect={room => patch({ selectedRoom: room })} />{state.stage === 2 && !state.d2 && <div className="s5-rail-staff"><h2>Who’s available?</h2><StaffAvailability phase="early" /></div>}<details className="s5-team"><summary>View delegation rules</summary><p>{policy}</p></details></aside>
      <main className="s5-main" id="main"><div className="s5-progress"><span>Step {state.stage + 1} of 8</span><span>{stageNames[state.stage]}</span></div>
      {state.stage === 0 && <section className="s5-scene"><p className="s5-eyebrow">NIGHT REPORT</p><h1>Which patient first?</h1><p className="s5-lede">Night shift handed off four patients. Read what you need, then plan your first round.</p><div className="s5-report-list">{patients.map(patient => <details key={patient.room}><summary><span>ROOM {patient.room}</span><strong>{patient.name}, {patient.age}</strong><em>{patient.label}</em></summary><p>{patient.report}</p></details>)}</div><p className="s5-small">Fictional educational scenario. Progress stays on this device. Not patient-specific care.</p><button className="s5-primary" onClick={next}>Plan my round <span aria-hidden="true">→</span></button></section>}
      {state.stage === 1 && <section className="s5-scene s5-round-scene">
        <p className="s5-eyebrow">YOUR FIRST ROUND</p>
        <h1>Plan your first round</h1>
        {!state.d1 ? <>
          <p className="s5-lede">Choose the order you would visit all four rooms. Tap a room to place it next; tap it again to remove it. Its night report stays below for reference.</p>
          <div className="s5-order" aria-label="Your planned room order"><span>FIRST</span>{[0, 1, 2, 3].map(i => <div key={i}>{d1Draft.order[i] || '—'}</div>)}<span>FOURTH</span></div>
          <div className="s5-round-rooms">{patients.map(patient => <Choice key={patient.room} selected={d1Draft.order.includes(patient.room)} onClick={() => { patch({ selectedRoom: patient.room }); setD1Draft(current => ({ ...current, order: current.order.includes(patient.room) ? current.order.filter(room => room !== patient.room) : [...current.order, patient.room] })); }}>
            <span className="s5-round-room-head"><strong>ROOM {patient.room}</strong><span>{patient.label}</span></span>
            <span className="s5-round-room-name">{patient.name}</span>
            <small>{d1Draft.order.includes(patient.room) ? `Visit ${d1Draft.order.indexOf(patient.room) + 1}` : 'Add to round'}</small>
          </Choice>)}</div>
          <div className="s5-report-reminder" aria-live="polite">
            <strong>Night report / {state.selectedRoom ? `Room ${state.selectedRoom}` : 'select a room'}</strong>
            <p>{patients.find(patient => patient.room === state.selectedRoom)?.report || 'Tap a room above or on the unit board to bring back its full report while you plan.'}</p>
          </div>
          <h2>Why did you pick your first room?</h2>
          <div className="s5-choice-grid">{reasons.map(reason => <Choice key={reason.id} selected={d1Draft.reason === reason.id} onClick={() => setD1Draft(current => ({ ...current, reason: reason.id }))}>{reason.label}</Choice>)}</div>
          <button className="s5-primary" disabled={d1Draft.order.length !== 4 || !d1Draft.reason} onClick={submitD1}>Set my plan</button>
        </> : <><Feedback>{d1Feedback(first, state.d1.reason)} How the rooms compare: 414 had surgery recently, which is a reasonable concern. 412 has a check due and was low-normal. 410 is stable but a fall risk. 416 is stable, and her teaching takes time. Several orders are reasonable.</Feedback><p className="s5-path">Your round: {state.d1.order.join(' → ')}</p><button className="s5-primary" onClick={next}>Continue shift</button></>}
      </section>}
      {state.stage === 2 && <section className="s5-scene"><p className="s5-eyebrow">DECISION 2 / 0720</p><h1>Three call lights</h1><p className="s5-lede">You've made your plan. Then three call lights go off. Each person takes one call. You take one too. Hold can take any.</p>{CALLS.map(room => <div className="s5-dispatch" key={room}><div className="s5-dispatch-head"><strong>ROOM {room}</strong><span>Sam: “{calls[room]}”</span></div>{!state.d2 ? <><div className="s5-destinations">{['you', 'jordan', 'priya', 'hold'].map(person => { const taken = person !== 'hold' && CALLS.some(other => other !== room && state.d2Draft.assignments[other] === person); return <Choice key={person} selected={state.d2Draft.assignments[room] === person} disabled={taken} onClick={() => setAssignment(room, person)}>{names[person]}</Choice>; })}</div>{room === '410' && state.d2Draft.assignments[room] === 'jordan' && <div className="s5-subchoice"><strong>Directions for Jordan</strong>{Object.entries(jordanDirections).map(([id, line]) => <Choice key={id} selected={state.d2Draft.jordanDirection === id} onClick={() => setState(current => ({ ...current, d2Draft: { ...current.d2Draft, jordanDirection: id } }))}>{line}</Choice>)}</div>}{room === '416' && state.d2Draft.assignments[room] === 'hold' && <div className="s5-subchoice"><strong>Sam's message</strong>{Object.entries(hold416).map(([id, line]) => <Choice key={id} selected={state.d2Draft.hold416 === id} onClick={() => setState(current => ({ ...current, d2Draft: { ...current.d2Draft, hold416: id } }))}>{line}</Choice>)}</div>}{room === '410' && state.d2Draft.assignments[room] === 'hold' && <p className="s5-muted">Sam: “Please don't get up alone. Someone will be there in a few minutes.”</p>}{room === '412' && state.d2Draft.assignments[room] === 'hold' && <p className="s5-muted">Sam: “Someone will be in shortly.”</p>}</> : <><p>Sent to <strong>{names[state.d2.submitted.assignments[room]]}</strong>. {room === '410' && state.d2.submitted.assignments[room] === 'jordan' ? jordanDirections[state.d2.submitted.jordanDirection] : room === '416' && state.d2.submitted.assignments[room] === 'hold' ? hold416[state.d2.submitted.hold416] : ''}</p><Feedback reasons={state.d2.reasons[room]}>{dispatchText(room, state.d2.submitted)} {dispatchAcknowledgement[room]?.[state.d2.submitted.assignments[room]] && <span>Priya: “{dispatchAcknowledgement[room][state.d2.submitted.assignments[room]]}”</span>}</Feedback></>}</div>)}{!state.d2 ? <button className="s5-primary" disabled={!canSubmitDispatch(state.d2Draft)} onClick={submitD2}>Send assignments</button> : <><p className="s5-muted">{state.d2.plan ? `Dispatch ${state.d2.plan}. Your location at 0730: ${state.d2.storyPlan === 'V3' ? '416' : state.d2.storyPlan === 'V5' ? '410' : '412'}.` : 'No accepted dispatch plan matched the submitted assignments.'}</p>{state.d2.bridges.map((bridge, i) => <p className="s5-bridge" key={i}>{bridge.text}</p>)}<button className="s5-primary" onClick={next}>Follow the shift</button></>}</section>}
      {state.stage === 3 && <section className="s5-scene"><p className="s5-eyebrow">0724–0729 / PARALLEL WORK</p><h1>{room412Owner === 'You' ? 'You reach Room 412' : 'Priya calls from Room 412'}</h1>{room412Owner === 'You' ? <><p className="s5-lede">You are with Mr. Okafor. Explore what is at the bedside, then continue.</p>{[['bedside', 'Hands trembling. Alert, answers clearly, able to swallow. “I just feel off.”'], ['meter', '0724 glucose: 62 mg/dL.'], ['whiteboard', 'Breakfast tray around 0745.']].map(([id, line]) => <div key={id}><Choice selected={state.room412Seen.includes(id)} onClick={() => patch({ room412Seen: state.room412Seen.includes(id) ? state.room412Seen : [...state.room412Seen, id] })}>Examine {id}</Choice>{state.room412Seen.includes(id) && <p className="s5-finding">{line}</p>}</div>)}</> : <><p className="s5-lede">{d2Plan === 'V3' ? "You start Ms. Whitfield's teaching." : 'You help Ms. Alvarez to the bathroom.'}</p><blockquote>“412's glucose was 62. He's alert, talking normally and able to swallow. I started our hypoglycemia protocol at 0727; recheck is due at 0742. My admission's here at 0730, so I'm handing him back to you.” <cite>Priya / 0728</cite></blockquote></>}
        <div className="s5-event"><strong>0729 / HANDOFF</strong><p>{room412Owner === 'You' ? "His glucose is 62 mg/dL, and he's alert and able to swallow. You start the unit's hypoglycemia protocol at 0727. Its recheck is due at 0742." : 'You acknowledge Priya’s handback.'} Symptoms easing, still a little shaky. Alert.</p></div><button className="s5-primary" onClick={next}>Continue to 0730</button></section>}
      {state.stage === 4 && <section className="s5-scene s5-cover-scene">
        <p className="s5-eyebrow">DECISION 3 / 0730</p>
        <h1>Cover your rooms and go</h1>
        <h2 className="s5-section-label">What changed?</h2>
        <div className="s5-change-alert"><span>NEW FROM JORDAN / ROOM 414</span><p>“414's vitals just now: HR 112, BP 98/60, RR 20. He says he feels lightheaded. At 0700 he was HR 88, BP 128/74.”</p></div>
        <h2 className="s5-section-label">What needs covering?</h2>
        <div className="s5-cover-tasks" aria-label="Coverage needed"><div><b>412</b><span>0742 glucose recheck and RN reassessment</span></div><div><b>410 + 416</b><span>A named RN watching your other rooms</span></div><div><b>414</b><span>You respond to the reported change</span></div></div>
        {!state.d3 && <><h2 className="s5-section-label">Who’s available?</h2><StaffAvailability phase="late" /></>}
        {!state.d3 ? <>
          {d2Plan === 'V5' && <div className="s5-v5-handoff"><h2>First, hand off Room 410</h2><p>Ms. Alvarez is still in the bathroom with you. What happens before you go?</p>{v5Steps.map(step => <Choice key={step.id} selected={d3Draft.v5Step === step.id} onClick={() => setD3Draft(current => ({ ...current, v5Step: step.id }))}>{step.text}</Choice>)}</div>}
          <h2 className="s5-section-label">What will you do next?</h2>
          <div className="s5-coverage-options">{coverageOptions.map(option => {
            const selected = d3Draft.option === option.id;
            return <Choice key={option.id} selected={selected} onClick={() => setD3Draft(current => ({ ...current, option: option.id }))}><strong>{option.id}. {coverageSummaries[option.id]}</strong></Choice>;
          })}</div>
          {d3Draft.option && <div className="s5-selected-preview" role="region" aria-label="Selected option preview" aria-live="polite"><strong>{d3Draft.option === 'E' ? 'Selected action' : 'Selected message'}</strong><p>{coverageMessage(coverageOptions.find(option => option.id === d3Draft.option), d2Plan)}</p></div>}
          <button className="s5-primary" disabled={!d3Draft.option || (d2Plan === 'V5' && !d3Draft.v5Step)} onClick={submitD3}>{coverageActionLabels[d3Draft.option] || 'Choose an option'}</button>
        </> : <>
          <div className="s5-submitted-label">YOUR SUBMITTED PLAN / {coverageSummaries[state.d3.submitted.option]}</div>
          <Feedback reasons={[...state.d3.reasons, ...(state.d3.v5Reasons || [])]} bridge={state.d3.bridges[0]?.text}>{coverageOptions.find(item => item.id === state.d3.submitted.option)?.feedback}{state.d3.submitted.v5Step && <> {v5Steps.find(item => item.id === state.d3.submitted.v5Step)?.feedback}</>}</Feedback>
          {coverageOptions.find(item => item.id === state.d3.storyOption)?.ack && <blockquote>{coverageOptions.find(item => item.id === state.d3.storyOption).ack}<cite>Staff acknowledgement / through 0800</cite></blockquote>}
          {state.d3.storyOption === 'B' && <div className="s5-event"><strong>0742–0745 / NAMED HANDBACK</strong><p>Priya: “412's recheck is 104. I reassessed him; he's eating breakfast, which came at 0745. My short task is ending. Dee, will you take 412 along with 410 and 416 until 0800?”</p><p>Dee: “Yes. I have 410, 412 and 416 until 0800, and I'll call if something changes.”</p></div>}
          {state.d3.storyOption !== 'B' && <p className="s5-muted">At 0742, Dee reports glucose 104 and reassessment; he is eating breakfast, which came at 0745.</p>}
          {state.d3.submitted.option === 'C' && <p className="s5-small">This arrangement depends on local policy and confirmed staff competency.</p>}
          <button className="s5-primary" onClick={next}>Go to Room 414</button>
        </>}
      </section>}
      {state.stage === 5 && <section className="s5-scene"><p className="s5-eyebrow">DECISION 4 / {state.d3?.submitted?.v5Step === 'ii' ? '0735' : '0733'}</p><h1>Room 414 is changing</h1><p className="s5-lede">Jordan's 0730 findings: HR 112, BP 98/60, RR 20; at 0700, HR 88 and BP 128/74. Mr. Park is pale and anxious. “I feel like I might pass out.”</p><div className="s5-investigation"><h2>Look at the bedside <small>Optional before or after calling</small></h2>{optional.map(item => <div key={item.id}><Choice selected={state.d4.revealed.includes(item.id)} disabled={state.d4.phase >= 2 && !state.d4.revealed.includes(item.id)} onClick={() => toggleRevealed(item.id)}>{item.label}</Choice>{state.d4.revealed.includes(item.id) && <p className="s5-finding">{item.finding}</p>}</div>)}</div>
      {state.d4.phase === 0 && <><h2>Call for help now</h2><p>Choose who you contact, or a different first action.</p><div className="s5-options">{helpOptions.map(option => <Choice key={option.id} selected={state.d4.helpDraft.includes(option.id)} onClick={() => toggleHelp(option.id)}>{option.label}{option.note && <small>{option.note}</small>}</Choice>)}</div><button className="s5-primary" disabled={!state.d4.helpDraft.length} onClick={submitHelp}>Act now</button></>}
      {state.d4.phase >= 1 && <Feedback reasons={state.d4.help.reasons} bridge={state.d4.help.bridges[0]?.text}>{helpFeedback(state.d4.help.submitted)} {state.d4.revealed.length === 0 && 'Calling when you recognize the pattern is right. Keep assessing while help comes.'}</Feedback>}
      {state.d4.phase === 1 && <><p className="s5-muted">While the call connects, you can keep assessing.</p><h2>Lead with what you have seen</h2><p>Choose up to three findings. The spoken report will use only your selected observations.</p><div className="s5-options">{reportChips(state.d4.revealed).map(chip => <Choice key={chip.id} selected={state.d4.reportDraft.includes(chip.id)} onClick={() => toggleChip(chip.id)}>{chip.text}</Choice>)}</div><button className="s5-primary" onClick={submitReport}>Give report</button></>}
      {state.d4.phase >= 2 && <><div className="s5-event"><strong>YOUR SUBMITTED REPORT</strong><p>{state.d4.report.line}</p></div><Feedback reasons={state.d4.report.reasons} bridge={state.d4.report.saferLine ? `Taking the safer approach, separately: ${state.d4.report.saferLine}` : null}>{state.d4.report.missed.length ? `You saw ${state.d4.report.missed.map(id => id === 'trend' ? 'the vital-sign trend' : 'the spreading bright red drainage').join(' and ')}. It's worth saying early.` : 'You led with the observed findings.'}</Feedback></>}
      {state.d4.phase === 2 && <><blockquote>“I'm coming now, about five minutes. Stay with him.” <cite>Responder</cite></blockquote><h2>Confirm the plan</h2><Choice selected={checkbackDraft === 'repeat'} onClick={() => setCheckbackDraft('repeat')}>Got it: you're coming now, about five minutes. I'll stay with him and call you right away if anything changes.</Choice><Choice selected={checkbackDraft === 'okay'} onClick={() => setCheckbackDraft('okay')}>Okay, thanks.</Choice><button className="s5-primary" disabled={!checkbackDraft} onClick={submitCheckback}>Respond</button></>}
      {state.d4.phase === 3 && <><Feedback reasons={state.d4.checkback.reasons} bridge={state.d4.checkback.bridges[0]?.text}>{state.d4.checkback.submitted === 'repeat' ? "Responder: That's right. See you in five. Repeating the plan and hearing it confirmed closes the loop." : 'Repeat the plan back so the caller can confirm it.'}</Feedback><p className="s5-muted">The responder arrives at {state.d3?.submitted?.v5Step === 'ii' ? '0740' : '0738'}.</p><button className="s5-primary" onClick={next}>Check the loose ends</button></>}</section>}
      {state.stage === 6 && <section className="s5-scene"><p className="s5-eyebrow">DECISION 5 / 0800</p><h1>Check your loose ends</h1><p className="s5-lede">The surgical team is with Mr. Park. Dee's first coverage window has ended. Close these loops in any order; a request is not acceptance.</p><div className="s5-loose-grid">{looseEnds.map(card => { const result = state.d5[card.id]; const pathStatus = card.id === '412' ? state.d3.storyOption === 'B' ? "Priya reported 0742 glucose 104 and reassessment; Dee accepted the 0745 handback until 0800." : "Dee reported 0742 glucose 104 and reassessment; he is eating breakfast." : card.id === '414' ? 'The surgical team is at his bedside. Orders are coming.' : card.id === 'coverage' ? state.coverageAcknowledged ? 'Dee accepted 410, 412 and 416 to 0830.' : 'Dee offered an extension to 0830; it is not yet accepted.' : card.id === '416' ? d2Plan === 'V2' ? 'Priya started teaching before her admission.' : d2Plan === 'V3' ? 'You started teaching before you left at 0730.' : 'She was told about 0750; teaching has not been completed.' : 'Jordan is still doing vitals on your rooms.'; return <article className="s5-loose" key={card.id}><div className="s5-loose-head"><h2>{card.title}</h2><span>{!result ? 'Open' : card.id === 'coverage' && !state.coverageAcknowledged ? 'Awaiting Dee' : ['412', '416'].includes(card.id) && !state.coverageAcknowledged ? 'Pending coverage' : 'Story loop closed'}</span></div><p>{pathStatus}</p>{!result ? <><Choice onClick={() => submitEnd(card.id, 'accepted')}>{card.accepted}{card.id === 'jordan' && d2Plan === 'V5' ? ' Also ask how Ms. Alvarez did.' : ''}</Choice><Choice onClick={() => submitEnd(card.id, 'other')}>{card.other}</Choice></> : <><Feedback reasons={result.reasons} bridge={result.bridges[0] ? `Taking the safer approach: ${card.accepted}` : null}>{result.submitted === 'accepted' ? card.acceptedFeedback : card.otherFeedback}</Feedback>{card.id === 'coverage' && !state.coverageAcknowledged && <div className="s5-event"><strong>AWAITING NAMED ACCEPTANCE</strong><p>{card.accepted}</p><button className="s5-primary" onClick={acknowledgeCoverage}>Hear Dee's reply</button></div>}{card.id === 'coverage' && state.coverageAcknowledged && <blockquote>“Yes. I have 410, 412 and 416 through 0830. I'll call if anything changes.” <cite>Dee / Priya informed</cite></blockquote>}{card.id === '416' && state.coverageAcknowledged && <blockquote>“I'll update her now and tell you whether another RN can finish teaching.” <cite>Dee</cite></blockquote>}{['412', '416'].includes(card.id) && !state.coverageAcknowledged && <p className="s5-muted">Follow-up queued. This loop stays pending until Dee explicitly accepts coverage.</p>}</>}</article>; })}</div><button className="s5-primary" disabled={!canFinish(state)} onClick={next}>See shift debrief</button></section>}
      {state.stage === 7 && <section className="s5-scene"><p className="s5-eyebrow">0830 / END OF SHIFT</p><h1>{ending(state) === 'A' ? 'You kept every room covered, called for help early and closed your loops.' : ending(state) === 'B' ? 'Everyone ended up safe. Some steps were filled in by the safer path:' : 'The safer path, as reviewed above:'}</h1>{ending(state) === 'C' && <p className="s5-lede">This outcome follows the safer choices, not the ones you made at {['D2', 'D3', 'D4', 'D5'].filter((decision) => decision === 'D2' ? Object.values(state.d2.reasons).flat().some(reason => ['Unsafe', 'Outside role'].includes(reason)) : decision === 'D3' ? [...state.d3.reasons, ...(state.d3.v5Reasons || [])].some(reason => ['Unsafe', 'Outside role'].includes(reason)) : decision === 'D4' ? [...state.d4.help.reasons, ...state.d4.report.reasons, ...state.d4.checkback.reasons].some(reason => ['Unsafe', 'Outside role'].includes(reason)) : Object.values(state.d5).flatMap(item => item.reasons).some(reason => ['Unsafe', 'Outside role'].includes(reason))).join(', ')}.</p>}
        <div className="s5-event"><strong>THE STORY'S ENDING / NOT A SCORE</strong><p>0830: The surgical team is with Mr. Park and has a plan. Mr. Okafor finished breakfast and feels like himself. Ms. Alvarez is resting. Ms. Whitfield's ride is waiting. {dismissTeachingClaim(state) ? 'Her discharge teaching is still pending; the covering RN has updated her about the delay.' : 'Her discharge teaching was started earlier; completion is not established here.'}</p></div>
        {debrief}
        <details className="mst-full-report" open={trackSession ? undefined : true}><summary hidden={!trackSession}>Explore your full shift report</summary><h2>Your shift / submitted choices</h2><div className="s5-debrief"><article><strong>D1 / Your first stop</strong><p>You started with {first} because {reasons.find(item => item.id === state.d1.reason)?.label.toLowerCase()}.</p><span>Exploratory, not scored</span></article><article><strong>D2 / Your dispatch</strong>{CALLS.map(room => <p key={room}>{room} → {names[state.d2.submitted.assignments[room]]}{room === '410' && state.d2.submitted.assignments[room] === 'jordan' ? `: ${jordanDirections[state.d2.submitted.jordanDirection]}` : room === '416' && state.d2.submitted.assignments[room] === 'hold' ? `: ${hold416[state.d2.submitted.hold416]}` : ''} <Flags reasons={state.d2.reasons[room]} /></p>)}{state.d2.bridges.map((bridge, i) => <p className="s5-bridge" key={i}>{bridge.text}</p>)}</article><article><strong>D3 / Your coverage plan</strong><p>{coverageOptions.find(item => item.id === state.d3.submitted.option)?.text}</p><Flags reasons={state.d3.reasons} />{state.d3.submitted.option === 'D' && <p>You asked Jordan for the number, but no nurse was named to see him.</p>}{state.d3.submitted.option === 'B' && <p>Priya's short task ended at 0745; Dee then explicitly accepted 412 through 0800.</p>}{state.d3.submitted.v5Step && <p>Before leaving 410: {v5Steps.find(item => item.id === state.d3.submitted.v5Step)?.text} <Flags reasons={state.d3.v5Reasons} /></p>}{state.d3.bridges.map((bridge, i) => <p className="s5-bridge" key={i}>{bridge.text}</p>)}</article><article><strong>D4 / Your escalation</strong><p>You chose: {state.d4.help.submitted.map(id => helpOptions.find(option => option.id === id)?.label).join('; ')}. <Flags reasons={state.d4.help.reasons} /></p><p>You revealed: {state.d4.revealed.length ? state.d4.revealed.map(id => optional.find(item => item.id === id)?.label).join(', ') : 'no optional findings'}.</p><p>Your reported line: “{state.d4.report.line}” <Flags reasons={state.d4.report.reasons} /></p>{!state.d4.revealed.includes('dressing') && <p>A quick look at the dressing while help comes can add a key finding.</p>}{state.d4.report.saferLine && <p className="s5-bridge">Separate safer-path report: “{state.d4.report.saferLine}”</p>}<p>Check-back: {state.d4.checkback.submitted === 'repeat' ? 'You repeated the plan' : 'You said okay'} <Flags reasons={state.d4.checkback.reasons} /></p>{[...state.d4.help.bridges, ...state.d4.checkback.bridges].map((bridge, i) => <p className="s5-bridge" key={i}>{bridge.text}</p>)}</article>{looseEnds.map(card => <article key={card.id}><strong>D5 / {card.title}</strong><p>You chose: {state.d5[card.id].submitted === 'accepted' ? card.accepted : card.other} <Flags reasons={state.d5[card.id].reasons} /></p>{state.d5[card.id].bridges.map((bridge, i) => <p className="s5-bridge" key={i}>Story continuation, not learner credit: {bridge.text} {card.accepted}</p>)}</article>)}</div>
        <div className="s5-takeaways"><p>New and unexpected moves to the front of the line.</p><p>Delegate tasks, not judgment.</p><p>Every handoff and every promise is a loop to close.</p></div>
        <h2>Go further</h2><p>Optional questions for Ask Clinical Edge. Copy a question, then open Ask to decide whether to submit it. Ask's consent, scope and daily limit still apply.</p>{[['delegation', 'How do patient stability, staff competence, RN assessment and local policy affect what a nurse can delegate?'], ['bleeding', 'What are early signs of bleeding after surgery?']].map(([topic, question]) => <div className="s5-ask" key={question}><p>{question}</p><button type="button" onClick={async () => { setCopied(await copy(question)); }}>{copied ? 'Copied' : 'Copy question'}</button><a href={`/ask?topic=${topic}`}>Open Ask ↗</a></div>)}
        <details className="s5-sources"><summary>Sources and review limits</summary><p>These references support general concepts. The founder reports an independent nurse found no material issues with this scenario; reviewer identity, credentials, date and formal validation are not documented.</p>{references.map(([name, url, limit]) => <p key={url}><a href={url} target="_blank" rel="noreferrer">{name}</a> — {limit}</p>)}</details>
        </details><div className="s5-tomorrow"><h2>Want another shift tomorrow?</h2>{['Yes', 'Maybe', 'No'].map(answer => <Choice key={answer} selected={state.tomorrow === answer} onClick={() => patch({ tomorrow: answer })}>{answer}</Choice>)}<p className="s5-small">Your answer stays on this device.</p></div><button className="s5-primary" onClick={restart}>Play again</button></section>}
      {state.stage === 7 && nextStep}
      </main></div><footer className="s5-footer">Clinical Edge · Fictional nursing education · Not patient-specific care</footer>
  </div>;
}
