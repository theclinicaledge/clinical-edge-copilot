import { ASSIGNMENTS, CALLS, CHANGED, CHECKS, CONCERNS, FINDINGS, INFORMATION, MAPPING_VERSION, REWINDS, VERSION } from './content.js';
import { feedbackFor, mappedRecord, a3Records, callRecord } from './evidence.js';
import { freshProgress } from '../the-shift/progress.js';
import { fresh as fresh5 } from '../the-shift/shift5/rules.js';
export const KEY = 'ce-med-surg-track-private';
let memory = null;
const clone = value => structuredClone(value);
export const freshHandoff = () => ({ version: VERSION, phase: 'action', opened: [], tab: null, callDraft: null, information: null, committed: null, concern: null, findings: [], checks: [], time: '0800' });
export const freshSnapshot = id => id === 'a1' ? freshProgress() : id === 'a2' ? fresh5() : freshHandoff();
const newRun = id => ({ sourceVersion: ASSIGNMENTS.find(a => a.id === id).sourceVersion, snapshot: freshSnapshot(id), decisions: {}, hintBefore: [], completedAt: null });
export const fresh = () => ({ schema: 1, contentVersion: VERSION, mappingVersion: MAPPING_VERSION, assignments: {}, revision: 0 });
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const strings = value => Array.isArray(value) && value.every(id => typeof id === 'string');
function sourceShape(id, s) {
  if (!object(s)) return false;
  if (id === 'a1') return Number.isInteger(s.stage) && s.stage >= 0 && s.stage <= 6 && ['viewed', 'revealed', 'selected'].every(key => strings(s[key])) && object(s.answers);
  if (id === 'a2') return Number.isInteger(s.stage) && s.stage >= 0 && s.stage <= 7 && object(s.d2Draft?.assignments) && strings(s.room412Seen) && object(s.d5) && object(s.d4) && Number.isInteger(s.d4.phase) && s.d4.phase >= 0 && s.d4.phase <= 3 && ['revealed', 'helpDraft', 'reportDraft'].every(key => strings(s.d4[key]));
  return true;
}
function valid(value) {
  if (value?.schema !== 1 || value.contentVersion !== VERSION || value.mappingVersion !== MAPPING_VERSION || !value.assignments || !Number.isInteger(value.revision)) return false;
  for (const [id, item] of Object.entries(value.assignments)) {
    const assignment = ASSIGNMENTS.find(a => a.id === id);
    if (!assignment || !Array.isArray(item.runs) || !item.runs.length || !Array.isArray(item.rewind?.attempts)) return false;
    if (!item.runs.every(run => run.sourceVersion === assignment.sourceVersion && object(run.decisions) && strings(run.hintBefore) && run.snapshot?.version === freshSnapshot(id).version && sourceShape(id, run.snapshot) && Object.values(run.decisions).every(e => e && typeof e.key === 'string' && e.mappingVersion === MAPPING_VERSION && ['Accepted', 'Accepted with a note', 'Revisit', 'Outside role', 'Unsafe'].includes(e.label) && strings(e.components) && strings(e.assistance) && typeof e.independent === 'boolean' && Number.isFinite(e.at)))) return false;
    if (!item.rewind.attempts.every(a => REWINDS[id].some(v => v.id === a.variation) && CALLS.some(c => c.id === a.call) && ['Accepted', 'Revisit', 'Unsafe'].includes(a.label) && a.guided === true)) return false;
    if (id === 'a3') for (const run of item.runs) {
      const s = run.snapshot;
      if (!['action', 'reason', 'debrief'].includes(s.phase) || !Array.isArray(s.opened) || !s.opened.every(id => ['history', 'flowsheet', 'note', 'bedside'].includes(id)) || !Array.isArray(s.findings) || s.findings.length > 3 || !s.findings.every(id => FINDINGS.some(([key]) => id === key)) || !Array.isArray(s.checks) || s.checks.length > 2 || !s.checks.every(id => CHECKS.some(c => c.id === id))) return false;
      if (s.phase !== 'action' && (!s.committed || !CALLS.some(c => c.id === s.committed.call))) return false;
      if (s.phase === 'debrief' && (!run.decisions.concern || !run.decisions.findings)) return false;
    }
  }
  return true;
}
export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (memory?.unsaved) return { value: clone(memory.value), status: 'unavailable', blocked: false };
    if (!raw) return { value: fresh(), status: 'saved', blocked: false };
    const value = JSON.parse(raw);
    if (valid(value)) return { value, status: 'saved', blocked: false };
    return { value: null, status: 'incompatible', blocked: true, raw };
  } catch {
    // Preserve corrupt bytes if storage is readable; never silently replace them.
    try { const raw = localStorage.getItem(KEY); if (raw) return { value: null, status: 'incompatible', blocked: true, raw }; } catch { /* blocked storage */ }
    return { value: memory ? clone(memory.value) : fresh(), status: 'unavailable', blocked: false };
  }
}
export function currentRun(state, id) { return state.assignments[id]?.runs.at(-1); }
export function firstRun(state, id) { return state.assignments[id]?.runs[0]; }
export function completed(state, id) { return !!state.assignments[id]?.runs.some(run => run.completedAt); }
export function canEnter(state, id) {
  const index = ASSIGNMENTS.findIndex(a => a.id === id);
  return index >= 0 && ASSIGNMENTS.slice(0, index).every(a => completed(state, a.id));
}
function publish() { if (typeof window !== 'undefined') window.dispatchEvent(new Event('ce-med-surg-change')); }
function write(value) {
  try { localStorage.setItem(KEY, JSON.stringify(value)); memory = { value: clone(value), unsaved: false }; publish(); return { value, status: 'saved', blocked: false }; }
  catch { memory = { value: clone(value), unsaved: true }; publish(); return { value, status: 'unavailable', blocked: false }; }
}
export function transact(edit) {
  const current = load();
  if (current.blocked) return current;
  const next = clone(current.value); edit(next); next.revision++;
  if (!valid(next)) return { ...current, status: 'invalid', blocked: true, raw: JSON.stringify(current.value) };
  return write(next);
}
export function start(id) {
  return transact(state => {
    if (!canEnter(state, id) || state.assignments[id]) return;
    state.assignments[id] = { runs: [newRun(id)], card: null, cardRecorded: false, rewind: { opened: 0, attempts: [], selected: null } };
  });
}
export function restart(id) {
  return transact(state => { if (state.assignments[id]) state.assignments[id].runs.push(newRun(id)); });
}
function capture(run, record, retry = false) {
  if (run.decisions[record.key]) return;
  const assistance = [...record.assistance, ...run.hintBefore, ...(retry ? ['Repeated assignment after an earlier attempt'] : [])];
  run.decisions[record.key] = { ...clone(record), at: Date.now(), assistance, independent: assistance.length === 0, mappingVersion: MAPPING_VERSION };
}
export function record(id, key, value, before) {
  return transact(state => {
    const item = state.assignments[id]; if (!item) return;
    const run = item.runs.at(-1), mapped = mappedRecord(id, key, value, before);
    if (run.decisions[key] || (id === 'a1' && run.snapshot.answers[key] !== undefined) || (id === 'a2' && ['d2', 'd3'].includes(key) && run.snapshot[key])) return;
    // Commit the source submission with its evidence, before React saves its next screen.
    // A refresh between those operations must not reopen a submitted choice.
    run.snapshot = { ...run.snapshot, ...clone(before) };
    if (id === 'a1') run.snapshot.answers = { ...run.snapshot.answers, [key]: clone(value) };
    else if (['help', 'report'].includes(key)) run.snapshot.d4 = { ...run.snapshot.d4, [key]: clone(value), phase: Math.max(run.snapshot.d4.phase, key === 'help' ? 1 : 2) };
    else run.snapshot[key] = clone(value);
    if (mapped.components.length) capture(run, mapped, item.runs.length > 1);
  });
}
export function markHint(id, reason = 'Requested hint') { return transact(state => { const run = currentRun(state, id); if (run) run.hintBefore.push(reason); }); }
export function persist(id, snapshot) {
  return transact(state => {
    const item = state.assignments[id]; if (!item) return;
    const run = item.runs.at(-1); run.snapshot = clone(snapshot);
    const end = id === 'a1' ? 6 : 7;
    if (snapshot.stage === end && !run.completedAt) {
      run.completedAt = Date.now();
      if (!item.cardRecorded) { item.card = feedbackFor(id, item.runs[0]); item.cardRecorded = true; }
    }
  });
}
export const A1_SESSION = { initial: () => currentRun(load().value, 'a1')?.snapshot || freshProgress(), observe: (key, value, before) => record('a1', key, value, before), persist: snapshot => persist('a1', snapshot), restart: () => { restart('a1'); return freshProgress(); } };
export const A2_SESSION = { initial: () => currentRun(load().value, 'a2')?.snapshot || fresh5(), observe: (key, value, before) => record('a2', key, value, before), persist: snapshot => persist('a2', snapshot), restart: () => { restart('a2'); return fresh5(); } };
export function editHandoff(edit) {
  return transact(state => { const run = currentRun(state, 'a3'); if (run) edit(run.snapshot); });
}
export function commitHandoff() {
  return transact(state => {
    const item = state.assignments.a3, run = item?.runs.at(-1), s = run?.snapshot;
    if (!s || s.phase !== 'action' || !CALLS.some(c => c.id === s.callDraft) || (s.callDraft === 'information' && !INFORMATION.some(([id]) => id === s.information))) return;
    s.committed = { call: s.callDraft, information: s.callDraft === 'information' ? s.information : null, opened: [...s.opened], at: Date.now() };
    capture(run, callRecord(s.committed.call, s.committed.information), item.runs.length > 1);
    s.phase = 'reason';
  });
}
export function submitHandoff() {
  return transact(state => {
    const item = state.assignments.a3, run = item?.runs.at(-1), s = run?.snapshot;
    if (!s || s.phase !== 'reason' || !CONCERNS.some(([id]) => id === s.concern) || s.findings.length < 2 || s.findings.length > 3) return;
    for (const record of a3Records(s)) capture(run, record, item.runs.length > 1);
    s.phase = 'debrief'; run.completedAt = Date.now();
    if (!item.cardRecorded) { item.card = feedbackFor('a3', item.runs[0]); item.cardRecorded = true; }
  });
}
export function rewindResult(variation, call, information) {
  const supported = variation.accepted.includes(call) && (call !== 'information' || variation.info.includes(information));
  return { label: supported ? 'Accepted' : variation.unsafe.includes(call) ? 'Unsafe' : 'Revisit', why: variation.rationale, alternative: variation.alternatives };
}
export function openRewind(id) { return transact(state => { if (completed(state, id)) state.assignments[id].rewind.opened++; }); }
export function rewindSelect(id, variation) { return transact(state => { if (REWINDS[id].some(v => v.id === variation) && completed(state, id)) state.assignments[id].rewind.selected = variation; }); }
export function submitRewind(id, variationId, call, information) {
  return transact(state => {
    const variation = REWINDS[id].find(v => v.id === variationId), item = state.assignments[id];
    if (!variation || !completed(state, id) || !CALLS.some(c => c.id === call) || (call === 'information' && !INFORMATION.some(([id]) => id === information))) return;
    item.rewind.attempts.push({ variation: variationId, call, information: call === 'information' ? information : null, ...rewindResult(variation, call, information), guided: true, at: Date.now(), contentVersion: VERSION });
  });
}
export function clearRecord() {
  try { localStorage.removeItem(KEY); memory = null; publish(); return true; } catch { return false; }
}
export function exportRecord() { const record = load(); return record.blocked ? record.raw : JSON.stringify(record.value, null, 2); }
