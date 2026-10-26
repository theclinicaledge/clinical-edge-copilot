import './assign-team.css';

// Assign the team: each team member gets one location. Every token is a radio group, so the
// placement works by keyboard and screen reader; nothing depends on dragging. The board below
// mirrors the current placement so the whole assignment can be read at a glance.
export default function AssignTeam({ tokens, targets, value, onChange, disabled = false, name = 'assign' }) {
  return <div className="assign-team">
    <div className="assign-team-tokens">{tokens.map(token => <fieldset key={token.id} className="assign-team-token" disabled={disabled}>
      <legend><strong>{token.label}</strong></legend>
      <div className="assign-team-options">{targets.map(target => <label key={target.id} className={value[token.id] === target.id ? 'is-selected' : ''}>
        <input type="radio" name={`${name}-${token.id}`} value={target.id} checked={value[token.id] === target.id} onChange={() => onChange(token.id, target.id)} />
        <span>{target.label}</span>
      </label>)}</div>
    </fieldset>)}</div>
    <div className="assign-team-board" aria-hidden="true">{targets.map(target => {
      const here = tokens.filter(token => value[token.id] === target.id);
      return <div key={target.id} className={`assign-team-target ${here.length ? 'is-filled' : ''}`}><span>{target.label}</span><p>{here.length ? here.map(token => token.label).join(', ') : 'No one'}</p></div>;
    })}</div>
  </div>;
}
