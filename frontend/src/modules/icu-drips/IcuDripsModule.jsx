import { useState, useEffect } from 'react';
import { trackEvent } from '../../analytics';
import ClinicalTrustPanel from '../../components/clinical-trust/ClinicalTrustPanel.jsx';
import { ICU_DRIPS_TRUST, getSourcesForDrip } from '../../data/clinicalSources.js';
import './icu-drips.css';
import {
  DRIPS, CATEGORIES, FAMILIES, FOUNDATIONS,
  SAFETY_DISCLAIMER, COMPARE_PAIRS, CLINICAL_PEARLS,
} from './data/drips.js';

// ─── Urgency config ───────────────────────────────────────────────────────────
// Brand palette (tags sit on the dark navy hero card): gold, soft red, info blue.
const URGENCY_CONFIG = {
  watch:     { label: 'Watch',     color: 'var(--ce-gold)', bg: 'rgba(212,168,75,0.12)', border: 'rgba(212,168,75,0.30)' },
  caution:   { label: 'Caution',   color: '#E96B6B', bg: 'rgba(233,107,107,0.10)', border: 'rgba(233,107,107,0.28)' },
  reference: { label: 'Reference', color: 'var(--ce-blue)', bg: 'rgba(77,163,255,0.09)', border: 'rgba(77,163,255,0.22)' },
};

// ─── Practice deck ────────────────────────────────────────────────────────────
const PRACTICE_DECK = [
  {
    id: 'q-norepi-perfusion',
    prompt: 'MAP improves, but skin remains cool and urine output is still low. What should this pattern remind you?',
    context: 'A patient on norepinephrine reaches the MAP target, but the peripheral exam tells a different story.',
    options: [
      'MAP improvement alone confirms that perfusion has improved',
      'MAP is one signal — peripheral perfusion markers tell a fuller picture',
      'Cool extremities are not meaningful while on a vasopressor',
      'Low urine output is only relevant in kidney disease',
    ],
    correctOption: 1,
    explanation: 'MAP is a target, but skin temperature, urine output, and mentation together indicate whether perfusion is actually improving. A rising MAP number does not automatically mean the organs are perfusing better.',
    relatedDripId: 'norepinephrine',
    learningPearl: 'Peripheral perfusion — not just MAP — tells the fuller clinical story on vasopressors.',
  },
  {
    id: 'q-phenyl-bradycardia',
    prompt: 'Blood pressure improves while the heart rate drifts down. Which hemodynamic pattern fits best?',
    context: 'A patient\'s MAP rises after a vasopressor adjustment. The heart rate has been trending down over the past 30 minutes.',
    options: [
      'Beta-1 stimulation is elevating the heart rate',
      'Pure alpha vasoconstriction can be associated with reflex bradycardia',
      'The lower heart rate suggests the patient is now well-compensated',
      'Heart rate slowing with BP improvement always means vagal tone',
    ],
    correctOption: 1,
    explanation: 'Phenylephrine acts on alpha-1 receptors only — no direct cardiac stimulation. Pure vasoconstriction can trigger reflex bradycardia as blood pressure rises. This pattern is a useful bedside signal when reading a vasopressor trend.',
    relatedDripId: 'phenylephrine',
    learningPearl: 'With pure alpha vasoconstrictors, the heart rate can drop as MAP rises — reflex bradycardia is the mechanism.',
  },
  {
    id: 'q-dobut-milrinone-co-bp',
    prompt: 'Cardiac output improves but blood pressure softens. What does this pattern suggest?',
    context: 'A patient on an inotrope shows better CO numbers, but MAP has drifted lower than expected.',
    options: [
      'The inotropy is working and the blood pressure drop is irrelevant',
      'Inotropy and vasodilation can move in opposite directions at the same time',
      'Soft blood pressure after an inotrope always signals clinical deterioration',
      'This pattern only occurs with catecholamine inotropes',
    ],
    correctOption: 1,
    explanation: 'Both dobutamine and milrinone support cardiac output, but both have vasodilatory effects that can lower blood pressure even as output improves. Recognizing this pattern helps anticipate that CO and MAP can trend in opposite directions simultaneously.',
    relatedDripId: 'dobutamine',
    learningPearl: 'Improved CO does not guarantee a higher MAP — vasodilation from inotropes can lower pressure even as the cardiac output number rises.',
  },
  {
    id: 'q-milrinone-halftime',
    prompt: 'Hemodynamics remain soft several hours after a rate change was reversed. What fits this pattern best?',
    context: 'A patient on milrinone had a rate reduction ordered by the provider. Blood pressure is still lower than expected hours later.',
    options: [
      'The rate change must not have been entered correctly',
      'Milrinone has a shorter half-life than most vasopressors',
      'Milrinone\'s longer half-life means hemodynamic effects linger well after a rate change',
      'Soft hemodynamics always indicate volume depletion in this setting',
    ],
    correctOption: 2,
    explanation: 'Milrinone\'s longer half-life means the hemodynamic picture reflects what was running hours earlier, not just the current rate. Expecting immediate resolution after a rate change does not account for the drug\'s pharmacokinetic behavior.',
    relatedDripId: 'milrinone',
    learningPearl: 'With milrinone, what the numbers show now may reflect what was running hours ago — not just the current rate.',
  },
  {
    id: 'q-vaso-no-hr-change',
    prompt: 'MAP improves with little change in heart rate or rhythm. Which mechanism fits this pattern?',
    context: 'A patient\'s blood pressure improves on a running vasopressor, but the heart rate has remained relatively stable throughout.',
    options: [
      'Beta-1 stimulation is improving vascular tone without cardiac effect',
      'Non-catecholamine vascular tone support via V1 receptors',
      'The MAP rise confirms improved cardiac output',
      'Heart rate stability means the vasopressor is not yet working',
    ],
    correctOption: 1,
    explanation: 'Vasopressin works through V1 receptors rather than adrenergic pathways. Unlike catecholamine vasopressors, it does not directly stimulate the heart. MAP improvement without a significant heart rate shift is a pattern consistent with non-catecholamine vascular tone support.',
    relatedDripId: 'vasopressin',
    learningPearl: 'Vasopressin raises MAP through a different receptor system — heart rate often stays stable because there is no direct beta stimulation.',
  },
  {
    id: 'q-sedation-hemo-pattern',
    prompt: 'Two calm patients are on different sedation infusions. One has softer blood pressure, the other has a slower heart rate. What does this pattern highlight?',
    context: 'Both patients appear similarly sedated on assessment. One is on propofol, the other on dexmedetomidine.',
    options: [
      'Sedation depth is the only hemodynamic variable that matters',
      'Hemodynamic pattern differs between sedation infusions — vasodilation vs bradycardia',
      'The patient with the slower heart rate is more deeply sedated',
      'Blood pressure softening on sedation always means the level is too high',
    ],
    correctOption: 1,
    explanation: 'Propofol commonly causes hypotension through vasodilation. Dexmedetomidine\'s primary hemodynamic concern is bradycardia. Two patients can look equally calm while having distinctly different hemodynamic patterns depending on which agent is running.',
    relatedDripId: 'propofol',
    learningPearl: 'Sedation depth is not the only story — the hemodynamic pattern on the monitor helps identify which agent\'s dominant effect is showing.',
  },
  {
    id: 'q-nicardipine-ntg-context',
    prompt: 'Both infusions lower blood pressure. What is the most meaningful distinction in the pattern they produce?',
    context: 'A nurse is reviewing the hemodynamic and clinical context for two patients on different antihypertensive infusions.',
    options: [
      'One lowers MAP faster than the other in all situations',
      'Nicardipine reduces afterload (arterial); nitroglycerin reduces preload (venous) — the clinical context differs',
      'Nitroglycerin is always more potent than nicardipine at the same MAP target',
      'Reflex bradycardia is more prominent with nitroglycerin',
    ],
    correctOption: 1,
    explanation: 'Nicardipine primarily lowers blood pressure through arterial vasodilation (afterload reduction). Nitroglycerin acts predominantly through venodilation (preload reduction). The same MAP number can reflect very different hemodynamic mechanisms — and different monitoring priorities follow.',
    relatedDripId: 'nicardipine',
    learningPearl: 'Both lower MAP, but the hemodynamic mechanism differs — afterload vs preload — and the clinical context shapes which pattern to monitor for.',
  },
  {
    id: 'q-heparin-no-hemo',
    prompt: 'The infusion has no direct effect on MAP, SVR, CO, CI, or HR. What is the primary monitoring focus?',
    context: 'A patient is on an IV heparin infusion. Vitals have been stable overnight.',
    options: [
      'Blood pressure — heparin lowers SVR over time',
      'Heart rate — heparin can cause reflex tachycardia',
      'Lab-guided anticoagulation monitoring, not hemodynamics',
      'Cardiac output — heparin has mild positive inotropic effects',
    ],
    correctOption: 2,
    explanation: 'Heparin has no direct hemodynamic action. Its effect is anticoagulation, tracked through lab values. Recognizing that not all infusions have a hemodynamic footprint helps redirect monitoring attention appropriately — toward lab trends and bleeding signs.',
    relatedDripId: 'heparin',
    learningPearl: 'Heparin is a lab-guided infusion, not a hemodynamic one. Monitoring focus shifts to anticoagulation levels and bleeding risk.',
  },
  {
    id: 'q-insulin-potassium',
    prompt: 'An insulin infusion is running for glucose management. Which other lab trend requires close attention?',
    context: 'A patient is on an insulin infusion per provider order. Glucose checks are in progress per protocol.',
    options: [
      'Sodium — insulin commonly causes hypernatremia',
      'Potassium — insulin shifts potassium into cells and can lower serum levels',
      'Creatinine — insulin directly affects renal clearance',
      'Hemoglobin — insulin suppresses red cell production',
    ],
    correctOption: 1,
    explanation: 'Insulin drives glucose into cells and simultaneously shifts potassium intracellularly, which can lower serum potassium levels. Close monitoring of potassium alongside glucose is an essential nursing awareness point during insulin infusions.',
    relatedDripId: 'insulin-infusion',
    learningPearl: 'Glucose is not the only number that matters on an insulin infusion — potassium moves with it and can drop silently.',
  },
  {
    id: 'q-amiodarone-tail',
    prompt: 'The amiodarone infusion has stopped. When do its effects and interactions end?',
    context: 'A patient\'s amiodarone infusion was discontinued. The team is planning next steps.',
    options: [
      'Effects resolve within a few hours of stopping the infusion',
      'Effects and drug interactions can persist for weeks after the infusion ends',
      'Amiodarone has a short half-life — monitoring can stop when the infusion does',
      'Thyroid and liver monitoring is only relevant while the infusion is running',
    ],
    correctOption: 1,
    explanation: 'Amiodarone has an exceptionally long half-life measured in weeks. Its effects on heart rhythm, QTc, thyroid function, and drug interactions can persist long after the infusion is stopped. This is especially important when other medications are being added or adjusted.',
    relatedDripId: 'amiodarone',
    learningPearl: 'Amiodarone\'s effects outlast the infusion — monitoring for QTc, thyroid, liver, and drug interactions continues well beyond discontinuation.',
  },
];

// ─── Shift challenges ─────────────────────────────────────────────────────────
const SHIFT_CHALLENGES = [
  {
    id: 'pressor-map-vs-perfusion',
    title: 'MAP improved, perfusion did not',
    patientSnapshot: 'Patient on norepinephrine. MAP is now within the ordered goal range, but urine output is falling and extremities remain cool.',
    prompt: 'What should this pattern remind you?',
    options: [
      'MAP alone does not prove perfusion improved',
      'Cool extremities are expected and do not matter',
      'Urine output only matters in kidney disease',
      'The blood pressure number is the only trend that matters',
    ],
    correctOption: 0,
    explanation: 'MAP is important, but bedside perfusion markers — urine output, skin temperature, capillary refill, and mentation — help show whether circulation is actually reaching the tissues.',
    pearl: 'Pressure is a number. Perfusion is a patient picture.',
    relatedDripIds: ['norepinephrine'],
  },
  {
    id: 'phenyl-hr-drop',
    title: 'Pressure up, heart rate down',
    patientSnapshot: 'Patient on a vasopressor. Blood pressure improves while heart rate trends from 88 to 52 over the last 30 minutes.',
    prompt: 'Which pattern fits best?',
    options: [
      'Pure alpha vasoconstriction with reflex bradycardia',
      'Direct beta-1 stimulation',
      'Improved cardiac output',
      'This pattern has no hemodynamic meaning',
    ],
    correctOption: 0,
    explanation: 'Phenylephrine is a predominantly alpha-1 agent. When vascular tone rises without beta stimulation, reflex slowing of the heart rate can become the visible bedside pattern.',
    pearl: 'When pressure rises and the heart slows, think about the receptor profile.',
    relatedDripIds: ['phenylephrine'],
  },
  {
    id: 'milrinone-output-pressure',
    title: 'Output better, pressure softer',
    patientSnapshot: 'Cardiac output and cardiac index look improved, but the blood pressure remains soft after an inotrope change.',
    prompt: 'Which interpretation fits best?',
    options: [
      'Inotropy and vasodilation can move in opposite directions',
      'Improved output always raises MAP',
      'SVR is unrelated to blood pressure',
      'Heart rate is the only useful trend',
    ],
    correctOption: 0,
    explanation: 'Some inotropes can improve pump performance while lowering vascular resistance. The result can be better output with softer pressure — both trends matter at the same time.',
    pearl: 'Better pump function does not always mean higher pressure.',
    relatedDripIds: ['milrinone', 'dobutamine'],
  },
  {
    id: 'sedation-monitor-pattern',
    title: 'Calm patient, different monitor story',
    patientSnapshot: 'Two sedated patients appear calm. One has softer blood pressure. The other has a gradually slowing heart rate.',
    prompt: 'What should this pattern remind you?',
    options: [
      'Sedation depth and hemodynamic pattern are separate bedside stories',
      'Calm appearance means the hemodynamics are stable',
      'Heart rate trends do not matter during sedation',
      'Blood pressure changes only matter with vasopressors',
    ],
    correctOption: 0,
    explanation: 'Different sedatives can create different hemodynamic patterns. Calm appearance does not replace trending pressure, heart rate, rhythm, and respiratory status throughout the shift.',
    pearl: 'Stillness is not the same thing as stability.',
    relatedDripIds: ['propofol', 'dexmedetomidine'],
  },
  {
    id: 'insulin-potassium',
    title: 'Glucose drip, potassium story',
    patientSnapshot: 'Patient is on an insulin infusion. Glucose is improving, but potassium is trending lower.',
    prompt: 'Which monitoring focus fits best?',
    options: [
      'Glucose and potassium both matter',
      'Only glucose matters during insulin infusion',
      'Potassium does not change with insulin',
      'Hemodynamics are the primary direct effect',
    ],
    correctOption: 0,
    explanation: 'Insulin shifts glucose into cells and can shift potassium into cells too. The glucose trend matters, but potassium is part of the bedside watch throughout the infusion.',
    pearl: 'Insulin infusions are really two labs: glucose and potassium.',
    relatedDripIds: ['insulin-infusion'],
  },
];

// ─── Clinical pearls ──────────────────────────────────────────────────────────
const ICU_PEARLS = [
  {
    id: 'phenyl-reflex-brady',
    title: 'Pressure up, heart rate down',
    pearl: 'Pure alpha vasoconstriction can be followed by reflex bradycardia as MAP rises.',
    whyItMatters: 'The bedside clue may appear in the heart rate trend, not just the MAP number.',
    relatedDripIds: ['phenylephrine'],
  },
  {
    id: 'map-vs-perfusion',
    title: 'MAP is a number, not the whole story',
    pearl: 'A blood pressure within the goal range does not confirm that circulation is reaching the tissues.',
    whyItMatters: 'Urine output, skin temperature, and mentation give the rest of the perfusion picture that MAP alone cannot.',
    relatedDripIds: ['norepinephrine'],
  },
  {
    id: 'milrinone-delayed',
    title: "Milrinone's effects linger",
    pearl: "Milrinone has a longer half-life than most inotropes — its hemodynamic footprint outlasts recent rate changes.",
    whyItMatters: "What the monitor shows now may reflect what was running hours ago, not just the current rate.",
    relatedDripIds: ['milrinone'],
  },
  {
    id: 'dobutamine-hr',
    title: 'Dobutamine and heart rate',
    pearl: 'Beta-1 stimulation from dobutamine can raise heart rate alongside improving cardiac output.',
    whyItMatters: 'A climbing heart rate on an inotrope may be the drug working, not a new arrhythmia — but both need trending.',
    relatedDripIds: ['dobutamine'],
  },
  {
    id: 'vasopressin-not-catecolamine',
    title: 'Vasopressin is a different class',
    pearl: 'Vasopressin acts on V1 receptors, not adrenergic receptors — it is not a stronger norepinephrine.',
    whyItMatters: 'Expecting the same dose-response pattern as catecholamine vasopressors can lead to misreading the hemodynamic trend.',
    relatedDripIds: ['vasopressin'],
  },
  {
    id: 'dex-gradual-brady',
    title: 'Dexmedetomidine and creeping bradycardia',
    pearl: 'Heart rate slowing on dexmedetomidine is often gradual rather than abrupt.',
    whyItMatters: 'Trending the heart rate over 30-minute windows helps catch the pattern before it becomes hemodynamically significant.',
    relatedDripIds: ['dexmedetomidine'],
  },
  {
    id: 'propofol-soft-bp',
    title: 'Propofol and softer blood pressure',
    pearl: 'Propofol can cause hypotension through vasodilation, especially at higher infusion parameters.',
    whyItMatters: 'Blood pressure softening during or after a propofol adjustment is a pattern worth anticipating, not just reacting to.',
    relatedDripIds: ['propofol'],
  },
  {
    id: 'nicardipine-afterload',
    title: 'Nicardipine reduces afterload',
    pearl: 'Nicardipine lowers blood pressure primarily through arterial vasodilation — it targets systemic vascular resistance.',
    whyItMatters: 'Reflex tachycardia is a more common bedside pattern with nicardipine than with venodilators like nitroglycerin.',
    relatedDripIds: ['nicardipine'],
  },
  {
    id: 'ntg-preload',
    title: 'Nitroglycerin reduces preload',
    pearl: 'Nitroglycerin works predominantly through venodilation at lower infusion parameters — reducing venous return to the heart.',
    whyItMatters: 'The same MAP drop from nitroglycerin and nicardipine represents different hemodynamic mechanisms and different monitoring priorities.',
    relatedDripIds: ['nitroglycerin'],
  },
  {
    id: 'insulin-potassium',
    title: 'Insulin moves more than glucose',
    pearl: 'Insulin shifts glucose into cells and shifts potassium into cells at the same time.',
    whyItMatters: 'Glucose checks alone may miss a falling potassium level — both trends matter throughout the infusion.',
    relatedDripIds: ['insulin-infusion'],
  },
  {
    id: 'heparin-lab-not-hemo',
    title: 'Heparin is lab-guided, not hemodynamic',
    pearl: 'Heparin has no direct effect on MAP, SVR, CO, or heart rate — its effect is entirely anticoagulation.',
    whyItMatters: 'Monitoring attention appropriately shifts to lab values and bleeding signs rather than vital sign trends.',
    relatedDripIds: ['heparin'],
  },
  {
    id: 'amiodarone-long-tail',
    title: "Amiodarone's effects outlast the infusion",
    pearl: 'Amiodarone has an exceptionally long half-life — rhythm, QTc, thyroid, and drug interaction effects persist for weeks after stopping.',
    whyItMatters: 'Stopping the infusion does not stop the monitoring — effects and interactions remain relevant long after discontinuation.',
    relatedDripIds: ['amiodarone'],
  },
  {
    id: 'peripheral-perfusion',
    title: 'Peripheral perfusion is a bedside exam',
    pearl: 'Skin temperature, capillary refill, and urine output reflect peripheral perfusion in a way that blood pressure alone cannot.',
    whyItMatters: 'A vasopressor achieving its MAP target does not guarantee that end-organ perfusion has improved.',
    relatedDripIds: ['norepinephrine', 'vasopressin'],
  },
  {
    id: 'co-vs-map',
    title: 'Cardiac output and MAP are not the same',
    pearl: 'CO and MAP can move in opposite directions — improved output with softer pressure is a real hemodynamic pattern.',
    whyItMatters: 'Trending both together gives a more accurate picture of what is happening hemodynamically than either number alone.',
    relatedDripIds: ['dobutamine', 'milrinone'],
  },
  {
    id: 'trending-beats-isolated',
    title: 'Trending beats isolated numbers',
    pearl: 'A single value tells you where the patient is; a trend tells you which direction they are heading.',
    whyItMatters: 'Patterns over time — in MAP, heart rate, urine output, and labs — are more actionable than any one data point.',
    relatedDripIds: [],
  },
];

// ─── Recently viewed helpers (localStorage, max 5) ────────────────────────────
function getRecentDripIds() {
  try { return JSON.parse(localStorage.getItem('ce_id_recent') || '[]'); }
  catch { return []; }
}
function addRecentDripId(id) {
  try {
    const updated = [id, ...getRecentDripIds().filter(x => x !== id)].slice(0, 5);
    localStorage.setItem('ce_id_recent', JSON.stringify(updated));
  } catch { /* fail silently */ }
}

// ─── CE Logo ──────────────────────────────────────────────────────────────────
function CELogo() {
  return (
    <svg
      width="26" height="26" viewBox="0 0 225 200"
      xmlns="http://www.w3.org/2000/svg" fill="var(--ce-teal)"
      aria-label="Clinical Edge"
      style={{ flexShrink: 0, display: 'block' }}
    >
      <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z" />
      <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z" />
      <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z" />
      <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z" />
    </svg>
  );
}

// ─── Search normalization ─────────────────────────────────────────────────────
function norm(s) {
  return String(s).toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
}

// ─── Icons ────────────────────────────────────────────────────────────────────
// All icons: 13×13 SVG, currentColor, no fill by default
function Icon({ type, size = 13 }) {
  const p = {
    width: size, height: size,
    viewBox: '0 0 12 12',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true,
    style: { display: 'block', flexShrink: 0 },
  };
  switch (type) {
    // Section icons
    case 'target':
      return <svg {...p}>
        <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.1"/>
        <circle cx="6" cy="6" r="1.7" fill="currentColor" opacity="0.55"/>
      </svg>;
    case 'mechanism':
      return <svg {...p}>
        <circle cx="6" cy="6" r="2.8" stroke="currentColor" strokeWidth="1.1"/>
        <path d="M6 1v1.3M6 9.7V11M1 6h1.3M9.7 6H11M2.5 2.5l.9.9M8.6 8.6l.9.9M9.5 2.5l-.9.9M3.4 8.6l-.9.9"
          stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>;
    case 'monitor':
      return <svg {...p}>
        <path d="M1 6s1.8-4 5-4 5 4 5 4-1.8 4-5 4-5-4-5-4z"
          stroke="currentColor" strokeWidth="1.1"/>
        <circle cx="6" cy="6" r="1.4" fill="currentColor" opacity="0.55"/>
      </svg>;
    case 'watch':
      return <svg {...p}>
        <path d="M6 1.5 1 10.5h10Z"
          stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
        <path d="M6 5.5v2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
        <circle cx="6" cy="9" r="0.5" fill="currentColor"/>
      </svg>;
    case 'escalate':
      return <svg {...p}>
        <path d="M6 1a3.5 3.5 0 0 1 3.5 3.5V8l.5 1H2l.5-1V4.5A3.5 3.5 0 0 1 6 1z"
          stroke="currentColor" strokeWidth="1.1"/>
        <path d="M4.5 9a1.5 1.5 0 0 0 3 0"
          stroke="currentColor" strokeWidth="1.1"/>
      </svg>;
    case 'lines':
      return <svg {...p}>
        <path d="M2.5 6h7M8.5 3.5 11 6 8.5 8.5"
          stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="2.5" cy="6" r="1.2" stroke="currentColor" strokeWidth="1.1"/>
      </svg>;
    case 'safety':
      return <svg {...p}>
        <path d="M6 1 2 2.5V6c0 2.5 1.8 4 4 5 2.2-1 4-2.5 4-5V2.5Z"
          stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
        <path d="M4 6l1.5 1.5L8 4"
          stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>;
    // Family icons (rendered at 13px, same viewBox)
    case 'pressors':
      return <svg {...p}>
        <path d="M6 10V2M3.5 4.5 6 2l2.5 2.5"
          stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>;
    case 'sedation':
      return <svg {...p}>
        <path d="M2 8.5A4 4 0 0 1 10 8.5"
          stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M4.5 10a1.5 1.5 0 0 0 3 0"
          stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M6 4V3M3.8 4.8 3.2 4.2M8.2 4.8l.6-.6"
          stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>;
    case 'rhythm':
      return <svg {...p}>
        <path d="M1 6h2l1.5-4.5L6.5 10l1.5-5.5L9 6h2"
          stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>;
    case 'anticoag':
      return <svg {...p}>
        <path d="M6 1.5C6 1.5 2.5 5 2.5 7.5a3.5 3.5 0 0 0 7 0C9.5 5 6 1.5 6 1.5z"
          stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      </svg>;
    // New family icons
    case 'inotropes':
      return <svg {...p}>
        <path d="M6 10.5C6 10.5 1.5 7.5 1.5 4.8a2.5 2.5 0 0 1 4.5-1.5 2.5 2.5 0 0 1 4.5 1.5c0 2.7-4.5 5.7-4.5 5.7z"
          stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      </svg>;
    case 'vasodilators':
      return <svg {...p}>
        <path d="M2 5h8M2 7h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M1 3.5l1.5 2.5L1 8.5M11 3.5 9.5 6l1.5 2.5"
          stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>;
    case 'diuretics':
      return <svg {...p}>
        <path d="M6 1.5C6 1.5 2.5 5.5 2.5 7.5a3.5 3.5 0 0 0 7 0C9.5 5.5 6 1.5 6 1.5z"
          stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
        <path d="M4.5 8a1.8 1.8 0 0 0 1 1"
          stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.55"/>
      </svg>;
    case 'glycemic':
      return <svg {...p}>
        <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="6" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
      </svg>;
    case 'compare':
      return <svg {...p} viewBox="0 0 12 12">
        <rect x="1" y="2.5" width="3.5" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
        <rect x="7.5" y="2.5" width="3.5" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
        <path d="M5.5 6H6.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>;
    default:
      return null;
  }
}

// ─── Family icon helper ───────────────────────────────────────────────────────
const FAMILY_ICON_TYPE = {
  pressors:        'pressors',
  inotropes:       'inotropes',
  sedation:        'sedation',
  rhythm:          'rhythm',
  vasodilators:    'vasodilators',
  diuretics:       'diuretics',
  anticoagulation: 'anticoag',
  glycemic:        'glycemic',
};

// ─── Bullet list (inside ref rows) ───────────────────────────────────────────
function RefBulletList({ items }) {
  return (
    <ul className="id-ref-list">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

// ─── Reference row accordion ──────────────────────────────────────────────────
function RefRow({ iconType, label, variant, count, isOpen, onToggle, children }) {
  const cls = ['id-ref-row', variant ? `id-ref-row--${variant}` : ''].filter(Boolean).join(' ');
  return (
    <div className={cls}>
      <button
        className="id-ref-row__header"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="id-ref-row__icon">
          <Icon type={iconType} size={13} />
        </span>
        <span className="id-ref-row__label">{label}</span>
        {count != null && (
          <span className="id-ref-row__count">{count}</span>
        )}
        <span className={`id-ref-row__chevron${isOpen ? ' id-ref-row__chevron--open' : ''}`}>
          ›
        </span>
      </button>
      <div className={`id-ref-row__body${isOpen ? '' : ' id-ref-row__body--hidden'}`}>
        {children}
      </div>
    </div>
  );
}

// ─── Hemodynamic Effect card ──────────────────────────────────────────────────
const DIRECTION_DISPLAY = {
  up:          { symbol: '↑',        cls: 'id-hemo-val--up'       },
  up_strong:   { symbol: '↑↑',       cls: 'id-hemo-val--up'       },
  down:        { symbol: '↓',        cls: 'id-hemo-val--down'     },
  down_strong: { symbol: '↓↓',       cls: 'id-hemo-val--down'     },
  neutral:     { symbol: '↔',        cls: 'id-hemo-val--neutral'  },
  variable:    { symbol: 'variable', cls: 'id-hemo-val--variable' },
};

function HemodynamicCard({ hemodynamics }) {
  if (!hemodynamics) return null;
  const { rows, note } = hemodynamics;
  return (
    <div className="id-hemo-card">
      <div className="id-hemo-card__header">
        <span className="id-hemo-card__eyebrow">Hemodynamic Effect</span>
        <span className="id-hemo-card__sub">Typical direction · not a protocol target</span>
      </div>
      <div className="id-hemo-grid">
        {rows.map(row => {
          const disp = DIRECTION_DISPLAY[row.direction] ?? DIRECTION_DISPLAY.neutral;
          return (
            <div key={row.key} className="id-hemo-cell">
              <span className="id-hemo-cell__key">{row.label}</span>
              <span className={`id-hemo-cell__val ${disp.cls}`}>{disp.symbol}</span>
            </div>
          );
        })}
      </div>
      {note && <p className="id-hemo-card__note">{note}</p>}
    </div>
  );
}

// ─── Hemodynamic Compare Matrix ───────────────────────────────────────────────
const HEMO_METRICS = ['MAP', 'SVR', 'CO', 'CI', 'HR'];

function HemodynamicCompareMatrix({ aDrip, bDrip, aLabel, bLabel, pairId }) {
  // Fire analytics when a pair with hemodynamics data is viewed
  useEffect(() => {
    if (aDrip?.hemodynamics && bDrip?.hemodynamics) {
      trackEvent('drip_hemodynamic_compare_viewed', { pair_id: pairId ?? '' });
    }
  }, [pairId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fail gracefully if either drip is missing hemodynamics
  if (!aDrip?.hemodynamics || !bDrip?.hemodynamics) return null;

  const aRows = aDrip.hemodynamics.rows ?? [];
  const bRows = bDrip.hemodynamics.rows ?? [];

  function getDir(rows, key) {
    return rows.find(r => r.key === key)?.direction ?? 'neutral';
  }

  return (
    <div className="id-hcm">
      <div className="id-hcm__header">
        <span className="id-hcm__eyebrow">Hemodynamic Direction</span>
        <span className="id-hcm__sub">Typical pattern · not a protocol target</span>
      </div>

      <div className="id-hcm__table">
        {/* Column headers */}
        <div className="id-hcm__row id-hcm__row--head">
          <div className="id-hcm__cell id-hcm__cell--metric" aria-hidden="true" />
          <div className="id-hcm__cell id-hcm__cell--colhead">
            <span className="id-hcm__col-tag id-hcm__col-tag--a">A</span>
            <span className="id-hcm__col-name">{aLabel}</span>
          </div>
          <div className="id-hcm__cell id-hcm__cell--colhead">
            <span className="id-hcm__col-tag id-hcm__col-tag--b">B</span>
            <span className="id-hcm__col-name">{bLabel}</span>
          </div>
        </div>

        {/* One row per metric */}
        {HEMO_METRICS.map(key => {
          const aDir  = getDir(aRows, key);
          const bDir  = getDir(bRows, key);
          const aDisp = DIRECTION_DISPLAY[aDir]  ?? DIRECTION_DISPLAY.neutral;
          const bDisp = DIRECTION_DISPLAY[bDir]  ?? DIRECTION_DISPLAY.neutral;
          const differs = aDir !== bDir;
          return (
            <div
              key={key}
              className={`id-hcm__row${differs ? ' id-hcm__row--differs' : ''}`}
            >
              <div className="id-hcm__cell id-hcm__cell--metric">{key}</div>
              <div className="id-hcm__cell id-hcm__cell--val">
                <span className={`id-hcm__val ${aDisp.cls}`}>{aDisp.symbol}</span>
              </div>
              <div className="id-hcm__cell id-hcm__cell--val">
                <span className={`id-hcm__val ${bDisp.cls}`}>{bDisp.symbol}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Default accordion state ──────────────────────────────────────────────────
const DEFAULT_OPEN = {
  commonlyUsedFor:   true,
  whatItIsDoing:     false,
  whatNursesMonitor: true,
  watchOut:          true,
  signalsToEscalate: false,
  linesAccessPolicy: false,
  keySafetyNotes:    false,
};

// ─── Detail view ──────────────────────────────────────────────────────────────
function DripsDetail({ drip, onBack, onNavigate }) {
  const [open, setOpen] = useState(DEFAULT_OPEN);

  // Reset accordion + record view when drip changes
  useEffect(() => {
    setOpen(DEFAULT_OPEN);
    addRecentDripId(drip.id);
  }, [drip.id]);

  function toggle(key) {
    setOpen(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const relatedDrips = (drip.related || [])
    .map(id => DRIPS.find(d => d.id === id))
    .filter(Boolean);

  return (
    <div className="id-detail">
      <button className="id-detail__back" onClick={onBack}>
        ← Back to ICU Drips
      </button>

      {/* Dark navy hero card */}
      <div className={`id-hero-card id-hero-card--${drip.category}`}>
        <div className="id-hero-card__top">
          <span className="id-hero-card__category">{drip.categoryLabel}</span>
          {drip.urgency && (() => {
            const u = URGENCY_CONFIG[drip.urgency];
            return (
              <span
                className="id-urgency-tag"
                style={{ color: u.color, background: u.bg, borderColor: u.border }}
              >
                {u.label}
              </span>
            );
          })()}
          {drip.badge && (
            <span className="id-hero-card__badge">{drip.badge}</span>
          )}
        </div>
        <h1 className="id-hero-card__name">{drip.name}</h1>
        <p className="id-hero-card__brand">{drip.brandName}</p>
        <p className="id-hero-card__snapshot">{drip.snapshot}</p>
        <div className="id-hero-card__chips">
          {drip.effectChips.map((e, i) => (
            <span key={i} className="id-hero-chip">{e.label}</span>
          ))}
        </div>
      </div>

      {/* Lead Finding — single most important bedside observation */}
      {drip.leadFinding && (
        <div className="id-lead-finding">
          <span className="id-lead-finding__label">Lead Finding</span>
          <p className="id-lead-finding__text">{drip.leadFinding}</p>
        </div>
      )}

      {/* Per-drip Clinical Pearl */}
      {drip.pearl && (
        <div className="id-drip-pearl">
          <span className="id-drip-pearl__label">Clinical Pearl</span>
          <p className="id-drip-pearl__text">{drip.pearl}</p>
        </div>
      )}

      {/* Hemodynamic Effect card */}
      <HemodynamicCard hemodynamics={drip.hemodynamics} />

      {/* Clinical pearl / nurse mental model */}
      <div className="id-pearl">
        <span className="id-pearl__label">Nurse mental model</span>
        <p className="id-pearl__text">{drip.mentalModel}</p>
      </div>

      {/* Reference rows — single containing card */}
      <div className="id-ref-card">

        <RefRow
          iconType="target"
          label="Commonly used for"
          count={drip.commonlyUsedFor.length}
          isOpen={open.commonlyUsedFor}
          onToggle={() => toggle('commonlyUsedFor')}
        >
          <RefBulletList items={drip.commonlyUsedFor} />
        </RefRow>

        <RefRow
          iconType="mechanism"
          label="What it is doing"
          count={drip.whatItIsDoing.length}
          isOpen={open.whatItIsDoing}
          onToggle={() => toggle('whatItIsDoing')}
        >
          <RefBulletList items={drip.whatItIsDoing} />
        </RefRow>

        <RefRow
          iconType="monitor"
          label="What nurses monitor"
          count={drip.whatNursesMonitor.length}
          isOpen={open.whatNursesMonitor}
          onToggle={() => toggle('whatNursesMonitor')}
        >
          <RefBulletList items={drip.whatNursesMonitor} />
        </RefRow>

        <RefRow
          iconType="watch"
          label="Watch out"
          variant="watch"
          count={drip.watchOut.length}
          isOpen={open.watchOut}
          onToggle={() => toggle('watchOut')}
        >
          <RefBulletList items={drip.watchOut} />
        </RefRow>

        <RefRow
          iconType="escalate"
          label="Signals to escalate"
          variant="escalate"
          count={drip.signalsToEscalate.length}
          isOpen={open.signalsToEscalate}
          onToggle={() => toggle('signalsToEscalate')}
        >
          <RefBulletList items={drip.signalsToEscalate} />
        </RefRow>

        <RefRow
          iconType="lines"
          label="Lines, access and policy"
          count={drip.linesAccessPolicy.length}
          isOpen={open.linesAccessPolicy}
          onToggle={() => toggle('linesAccessPolicy')}
        >
          <RefBulletList items={drip.linesAccessPolicy} />
        </RefRow>

        <RefRow
          iconType="safety"
          label="Key safety notes"
          variant="safety"
          count={drip.keySafetyNotes.length}
          isOpen={open.keySafetyNotes}
          onToggle={() => toggle('keySafetyNotes')}
        >
          <RefBulletList items={drip.keySafetyNotes} />
        </RefRow>

      </div>

      {/* Explore next */}
      {relatedDrips.length > 0 && (
        <div className="id-explore-next">
          <span className="id-explore-next__label">Explore next</span>
          {relatedDrips.map(related => (
            <button
              key={related.id}
              className="id-explore-next__row"
              onClick={() => onNavigate(related)}
            >
              <div className="id-explore-next__info">
                <span className="id-explore-next__name">{related.name}</span>
                <span className="id-explore-next__meta">
                  {related.categoryLabel} · {related.brandName}
                </span>
              </div>
              <span className="id-explore-next__arrow">→</span>
            </button>
          ))}
        </div>
      )}

      {/* Sources & review — clinical trust layer */}
      <ClinicalTrustPanel
        module={ICU_DRIPS_TRUST.module}
        context="medication_detail"
        sources={getSourcesForDrip(drip)}
        reviewMeta={ICU_DRIPS_TRUST}
      />

      <div className="id-detail__disclaimer">{SAFETY_DISCLAIMER}</div>
    </div>
  );
}

// ─── Key Difference card ─────────────────────────────────────────────────────
function KeyDifferenceCard({ pair }) {
  if (!pair.keyDistinction && !pair.commonConfusion && !pair.bedsidePearl) return null;
  return (
    <div className="id-key-diff">
      <div className="id-key-diff__eyebrow">Key Difference</div>
      {pair.keyDistinction && (
        <p className="id-key-diff__distinction">{pair.keyDistinction}</p>
      )}
      {pair.commonConfusion && (
        <div className="id-key-diff__row">
          <span className="id-key-diff__row-label">Common confusion</span>
          <p className="id-key-diff__row-text">{pair.commonConfusion}</p>
        </div>
      )}
      {pair.bedsidePearl && (
        <div className="id-key-diff__row id-key-diff__row--pearl">
          <span className="id-key-diff__row-label">Bedside pearl</span>
          <p className="id-key-diff__row-text">{pair.bedsidePearl}</p>
        </div>
      )}
    </div>
  );
}

// ─── Clinical Scenario card ───────────────────────────────────────────────────
function ClinicalScenarioCard({ scenario }) {
  if (!scenario) return null;
  return (
    <div className="id-scenario-card">
      <div className="id-scenario-card__eyebrow">Clinical Scenario</div>
      <p className="id-scenario-card__title">{scenario.title}</p>
      <div className="id-scenario-card__row">
        <span className="id-scenario-card__row-label">Situation</span>
        <p className="id-scenario-card__row-text">{scenario.setup}</p>
      </div>
      <div className="id-scenario-card__row">
        <span className="id-scenario-card__row-label">Bedside read</span>
        <p className="id-scenario-card__row-text">{scenario.bedsideRead}</p>
      </div>
      <div className="id-scenario-card__row">
        <span className="id-scenario-card__row-label">Why it matters</span>
        <p className="id-scenario-card__row-text">{scenario.whyItMatters}</p>
      </div>
    </div>
  );
}

// ─── Compare detail ───────────────────────────────────────────────────────────
function CompareDetail({ pair, onBack, onNavigateToDrip }) {
  const aDrip = pair.aId ? DRIPS.find(d => d.id === pair.aId) : null;
  const bDrip = pair.bId ? DRIPS.find(d => d.id === pair.bId) : null;
  const [tableOpen, setTableOpen] = useState(false);

  useEffect(() => {
    if (pair.clinicalScenario) {
      trackEvent('clinical_scenario_viewed', { pair_id: pair.id });
    }
  }, [pair.id]);

  function handleToggleTable() {
    if (!tableOpen) {
      trackEvent('hemodynamic_compare_detail_expanded', { pair_id: pair.id });
    }
    setTableOpen(prev => !prev);
  }

  return (
    <>
      <button className="id-compare__back" onClick={onBack}>
        ← All comparisons
      </button>

      <h2 className="id-compare-detail__title">{pair.label}</h2>

      {/* Hemodynamic Compare Matrix — quick direction scan */}
      <HemodynamicCompareMatrix
        aDrip={aDrip}
        bDrip={bDrip}
        aLabel={pair.aLabel}
        bLabel={pair.bLabel}
        pairId={pair.id}
      />

      {/* Key Difference — scannable in under 10 seconds */}
      <KeyDifferenceCard pair={pair} />

      {/* Clinical Scenario — supporting context after Key Difference */}
      <ClinicalScenarioCard scenario={pair.clinicalScenario} />

      {/* Collapsible detailed comparison table */}
      <div className="id-compare-detail-toggle">
        <button
          className="id-compare-detail-toggle__btn"
          onClick={handleToggleTable}
          aria-expanded={tableOpen}
        >
          <span>Detailed comparison</span>
          <span className="id-compare-detail-toggle__arrow">{tableOpen ? '▲' : '▼'}</span>
        </button>
        {tableOpen && (
          <table className="id-compare-table">
            <thead>
              <tr>
                <th> </th>
                <th>{pair.aLabel}</th>
                <th>{pair.bLabel}</th>
              </tr>
            </thead>
            <tbody>
              {pair.rows.map((row, i) => (
                <tr key={i}>
                  <td>{row.aspect}</td>
                  <td>{row.a}</td>
                  <td>{row.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="id-compare-bottom-line">
        <span className="id-compare-bottom-line__label">Bottom line</span>
        <p className="id-compare-bottom-line__text">{pair.bottomLine}</p>
      </div>

      {(aDrip || bDrip) && (
        <div className="id-compare-drip-links">
          {aDrip && (
            <button
              className="id-compare-drip-link"
              onClick={() => onNavigateToDrip(aDrip)}
            >
              {aDrip.name} full reference →
            </button>
          )}
          {bDrip && (
            <button
              className="id-compare-drip-link"
              onClick={() => onNavigateToDrip(bDrip)}
            >
              {bDrip.name} full reference →
            </button>
          )}
        </div>
      )}
    </>
  );
}

// ─── Quick Compare view ───────────────────────────────────────────────────────
function QuickCompare({ onBackToHome, onNavigateToDrip, initialPairId }) {
  const [selectedPair, setSelectedPair] = useState(
    initialPairId ? (COMPARE_PAIRS.find(p => p.id === initialPairId) ?? null) : null
  );

  if (selectedPair) {
    return (
      <div className="id-compare">
        <CompareDetail
          pair={selectedPair}
          onBack={() => setSelectedPair(null)}
          onNavigateToDrip={onNavigateToDrip}
        />
        <div className="id-detail__disclaimer" style={{ marginTop: 24 }}>
          {SAFETY_DISCLAIMER}
        </div>
      </div>
    );
  }

  return (
    <div className="id-compare">
      <button className="id-compare__back" onClick={onBackToHome}>
        ← All drips
      </button>
      <span className="id-compare__eyebrow">Quick Compare</span>
      <h2 className="id-compare__title">Side-by-side reference</h2>
      <p className="id-compare__sub">
        Educational comparisons across common drip pairs. No dosing. No protocol instructions.
      </p>

      <div className="id-compare-pair-list">
        {COMPARE_PAIRS.map(pair => (
          <button
            key={pair.id}
            className="id-compare-pair-row"
            onClick={() => { trackEvent('drip_compare_pair_selected', { pair_id: pair.id }); trackEvent('hemodynamic_compare_pair_selected', { pair_id: pair.id }); setSelectedPair(pair); }}
          >
            <span className="id-compare-pair-row__label">{pair.label}</span>
            <span className="id-compare-pair-row__arrow">→</span>
          </button>
        ))}
      </div>

      <div className="id-landing__disclaimer" style={{ marginTop: 36 }}>
        {SAFETY_DISCLAIMER}
      </div>
    </div>
  );
}

// ─── Landing page ─────────────────────────────────────────────────────────────
function DripsHome({ onSelect, onShowCompare, onShowPractice, onShowChallenge, onShowPearl }) {
  const [query,    setQuery]    = useState('');
  const [category, setCategory] = useState('all');

  // Load recently viewed from localStorage on mount (DripsHome remounts on each back-nav)
  const recentIds = getRecentDripIds();
  const recentDrips = recentIds
    .map(id => DRIPS.find(d => d.id === id))
    .filter(Boolean);

  const q             = norm(query);
  const isFiltering   = q || category !== 'all';

  const filtered = DRIPS.filter(drip => {
    const matchesCategory = category === 'all' || drip.category === category;
    if (!matchesCategory) return false;
    if (!q) return true;
    const chipsText = drip.effectChips.map(e => e.label).join(' ');
    return (
      norm(drip.name).includes(q) ||
      norm(drip.brandName).includes(q) ||
      norm(drip.categoryLabel).includes(q) ||
      norm(drip.snapshot).includes(q) ||
      norm(chipsText).includes(q)
    );
  });

  // Shared drip row renderer
  function renderDripRow(drip) {
    return (
      <div
        key={drip.id}
        className={`id-drip-row id-drip-row--${drip.category}`}
        onClick={() => onSelect(drip)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onSelect(drip)}
      >
        <div className="id-drip-row__category">{drip.categoryLabel}</div>
        <div className="id-drip-row__top">
          <span className="id-drip-row__name">{drip.name}</span>
          <span className="id-drip-row__brand">{drip.brandName}</span>
          <span className="id-drip-row__chevron">›</span>
        </div>
        <div className="id-drip-row__snapshot">{drip.snapshot}</div>
        <div className="id-drip-row__tags">
          {drip.effectChips.map((e, i) => (
            <span key={i} className="id-drip-tag">{e.label}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="id-landing">

      {/* Hero */}
      <div className="id-hero">
        <span className="id-hero__eyebrow">Infusion Reference</span>
        <h1 className="id-hero__title">ICU Drips</h1>
        <p className="id-hero__desc">
          Clinical context, monitoring priorities, and bedside awareness for
          common critical care infusions. Educational reference, not a dosing guide.
        </p>
      </div>

      {/* Recently viewed chips */}
      {recentDrips.length > 0 && (
        <div className="id-recent-drips">
          <span className="id-recent-drips__label">Recently viewed</span>
          <div className="id-recent-drips__chips">
            {recentDrips.map(drip => (
              <button
                key={drip.id}
                className="id-recent-chip"
                onClick={() => onSelect(drip)}
              >
                {drip.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Today's Clinical Pearl */}
      {ICU_PEARLS[0] && (
        <button
          className="id-pearl-home-card"
          onClick={() => { trackEvent('icu_drips_pearl_opened', { pearl_id: ICU_PEARLS[0].id }); onShowPearl(ICU_PEARLS[0].id); }}
        >
          <span className="id-pearl-home-card__eyebrow">Clinical Pearl</span>
          <p className="id-pearl-home-card__title">{ICU_PEARLS[0].title}</p>
          <p className="id-pearl-home-card__body">{ICU_PEARLS[0].pearl}</p>
          <span className="id-pearl-home-card__cta">Learn more →</span>
        </button>
      )}

      {/* Home actions — challenge + practice + compare */}
      <div className="id-home-actions">
        <button className="id-home-action id-home-action--challenge" onClick={onShowChallenge}>
          <div className="id-home-action__body">
            <span className="id-home-action__label">Shift Challenge</span>
            <span className="id-home-action__sub">1 quick bedside pattern</span>
          </div>
          <span className="id-home-action__arrow">→</span>
        </button>
        <button className="id-home-action id-home-action--practice" onClick={onShowPractice}>
          <div className="id-home-action__body">
            <span className="id-home-action__label">Practice hemodynamics</span>
            <span className="id-home-action__sub">Pattern recognition · {PRACTICE_DECK.length} questions</span>
          </div>
          <span className="id-home-action__arrow">→</span>
        </button>
        <button className="id-home-action id-home-action--compare" onClick={() => { trackEvent('icu_drips_compare_entry_clicked', { source: 'home_action' }); onShowCompare(); }}>
          <div className="id-home-action__body">
            <span className="id-home-action__label">Common ICU confusions</span>
            <span className="id-home-action__sub">Compare drip patterns</span>
          </div>
          <span className="id-home-action__arrow">→</span>
        </button>
      </div>

      {/* Search + filter */}
      <div className="id-search-bar">
        <input
          className="id-search-input"
          type="search"
          placeholder="Search drips"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          aria-label="Search drips"
        />
        <div className="id-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`id-filter-btn${category === cat.key ? ' active' : ''}`}
              onClick={() => { if (cat.key !== 'all') trackEvent('drip_category_filter_used', { category: cat.key }); setCategory(cat.key); }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Drip list */}
      {isFiltering ? (
        // Flat filtered / searched view
        <>
          <div className="id-list-header">
            <span className="id-list-header__label">
              {category !== 'all'
                ? CATEGORIES.find(c => c.key === category)?.label ?? 'Drips'
                : 'Results'}
            </span>
            <span className="id-list-header__count">{filtered.length}</span>
          </div>
          <div className="id-list">
            {filtered.length > 0
              ? filtered.map(renderDripRow)
              : <p className="id-no-results">No matching drips.</p>}
          </div>
        </>
      ) : (
        // Family-grouped view
        FAMILIES.map(family => {
          const familyDrips = DRIPS.filter(d => family.categories.includes(d.category));
          if (!familyDrips.length) return null;
          const primaryCat = family.categories[0];
          return (
            <div
              key={family.key}
              className={`id-family-block id-family-block--${primaryCat}`}
            >
              <div className="id-family-header">
                <span className="id-family-icon">
                  <Icon type={FAMILY_ICON_TYPE[family.key]} size={13} />
                </span>
                <span className="id-family-header__label">{family.label}</span>
                <span className="id-family-header__count">{familyDrips.length}</span>
              </div>
              <div className="id-list">
                {familyDrips.map(renderDripRow)}
              </div>
            </div>
          );
        })
      )}

      {/* Foundations — compact rows */}
      <div className="id-foundations">
        <span className="id-foundations__eyebrow">Foundations</span>
        {FOUNDATIONS.map(f => (
          <div key={f.id} className="id-foundation-row">
            <span className="id-foundation-row__title">{f.title}</span>
            <span className="id-foundation-row__body">{f.body}</span>
          </div>
        ))}
      </div>

      {/* Clinical Edge Pearls */}
      <div className="id-pearls-section">
        <div className="id-pearls__header">
          <span className="id-pearls__eyebrow">Clinical Edge Pearls</span>
          <p className="id-pearls__sub">Fast bedside takeaways from the drip library.</p>
        </div>
        {CLINICAL_PEARLS.map((pearl, i) => (
          <div key={i} className="id-pearl-card">
            <p className="id-pearl-card__text">{pearl}</p>
          </div>
        ))}
      </div>

      <div className="id-landing__disclaimer">{SAFETY_DISCLAIMER}</div>
    </div>
  );
}

// ─── Practice mode ────────────────────────────────────────────────────────────
function PracticeMode({ onBack, onNavigateToDrip }) {
  const [index,         setIndex]         = useState(0);
  const [selected,      setSelected]      = useState(null); // index of chosen option
  const [score,         setScore]         = useState(0);
  const [done,          setDone]          = useState(false);
  const [missedDripIds, setMissedDripIds] = useState([]);

  const total = PRACTICE_DECK.length;

  useEffect(() => {
    trackEvent('icu_drips_practice_opened');
  }, []);

  function handleAnswer(optionIndex) {
    if (selected !== null) return; // locked after first answer
    const q = PRACTICE_DECK[index];
    const correct = optionIndex === q.correctOption;
    setSelected(optionIndex);
    if (correct) {
      setScore(s => s + 1);
    } else if (q.relatedDripId) {
      setMissedDripIds(prev => prev.includes(q.relatedDripId) ? prev : [...prev, q.relatedDripId]);
    }
    trackEvent('icu_drips_practice_answered', { question_id: q.id, correct });
  }

  function handleNext() {
    if (index + 1 >= total) {
      trackEvent('icu_drips_practice_completed', { score: score + (selected === PRACTICE_DECK[index].correctOption ? 1 : 0), total });
      setDone(true);
    } else {
      setIndex(i => i + 1);
      setSelected(null);
    }
  }

  function handleRestart() {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setDone(false);
    setMissedDripIds([]);
    trackEvent('icu_drips_practice_opened');
  }

  if (done) {
    const finalScore = score;
    const pct = Math.round((finalScore / total) * 100);
    const msg = pct === 100
      ? 'Perfect — strong pattern recognition.'
      : pct >= 70
        ? 'Solid work. A few patterns worth a second look.'
        : 'Keep going — each pass sharpens the pattern.';
    const reviewDrips = missedDripIds.slice(0, 3)
      .map(id => DRIPS.find(d => d.id === id))
      .filter(Boolean);
    return (
      <div className="id-practice">
        <button className="id-practice__back" onClick={onBack}>← Back to ICU Drips</button>
        <div className="id-practice-end">
          <div className="id-practice-end__eyebrow">Practice complete</div>
          <div className="id-practice-end__score">{finalScore} / {total}</div>
          <p className="id-practice-end__msg">{msg}</p>
          {reviewDrips.length > 0 ? (
            <div className="id-practice-end__review">
              <span className="id-practice-end__review-label">Review next</span>
              {reviewDrips.map(drip => (
                <button
                  key={drip.id}
                  className="id-practice-end__review-link"
                  onClick={() => {
                    trackEvent('icu_drips_practice_review_drip_clicked', { drip_id: drip.id });
                    onNavigateToDrip(drip);
                  }}
                >
                  {drip.name} →
                </button>
              ))}
            </div>
          ) : (
            <p className="id-practice-end__review-clean">
              Clean pass — review any drip from the library when you're ready.
            </p>
          )}
          <button className="id-practice-btn id-practice-btn--primary" onClick={handleRestart}>
            Practice again
          </button>
          <button className="id-practice-btn id-practice-btn--ghost" onClick={onBack}>
            Back to ICU Drips
          </button>
        </div>
        <div className="id-detail__disclaimer" style={{ marginTop: 24 }}>{SAFETY_DISCLAIMER}</div>
      </div>
    );
  }

  const q = PRACTICE_DECK[index];
  const answered = selected !== null;
  const correct = answered && selected === q.correctOption;
  const relatedDrip = q.relatedDripId ? DRIPS.find(d => d.id === q.relatedDripId) : null;

  return (
    <div className="id-practice">
      <button className="id-practice__back" onClick={onBack}>← Back to ICU Drips</button>

      {/* Header */}
      <div className="id-practice-header">
        <div className="id-practice-header__top">
          <span className="id-practice-header__title">ICU Drips Practice</span>
          <span className="id-practice-header__progress">{index + 1} / {total}</span>
        </div>
        <p className="id-practice-header__sub">Pattern recognition, not medication selection.</p>
        <div className="id-practice-progress-bar">
          <div className="id-practice-progress-bar__fill" style={{ width: `${((index) / total) * 100}%` }} />
        </div>
      </div>

      {/* Question card */}
      <div className="id-practice-card">
        {q.context && <p className="id-practice-card__context">{q.context}</p>}
        <p className="id-practice-card__prompt">{q.prompt}</p>
      </div>

      {/* Options */}
      <div className="id-practice-options">
        {q.options.map((opt, i) => {
          let cls = 'id-practice-option';
          if (answered) {
            if (i === q.correctOption) cls += ' id-practice-option--correct';
            else if (i === selected)   cls += ' id-practice-option--incorrect';
            else                       cls += ' id-practice-option--dim';
          } else if (i === selected) {
            cls += ' id-practice-option--selected';
          }
          return (
            <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={answered}>
              <span className="id-practice-option__letter">{String.fromCharCode(65 + i)}</span>
              <span className="id-practice-option__text">{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {answered && (
        <div className="id-practice-feedback">
          <div className={`id-practice-feedback__verdict ${correct ? 'id-practice-feedback__verdict--correct' : 'id-practice-feedback__verdict--incorrect'}`}>
            {correct ? 'Correct' : 'Not quite'}
          </div>
          <p className="id-practice-feedback__explanation">{q.explanation}</p>
          <div className="id-practice-feedback__pearl">
            <span className="id-practice-feedback__pearl-label">Pearl</span>
            <p className="id-practice-feedback__pearl-text">{q.learningPearl}</p>
          </div>
          {relatedDrip && (
            <button
              className="id-practice-feedback__drip-link"
              onClick={() => {
                trackEvent('icu_drips_practice_review_drip_clicked', { drip_id: relatedDrip.id });
                onNavigateToDrip(relatedDrip);
              }}
            >
              Review {relatedDrip.name} →
            </button>
          )}
          <button className="id-practice-btn id-practice-btn--primary" onClick={handleNext}>
            {index + 1 >= total ? 'See results' : 'Next question'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Shift Challenge ──────────────────────────────────────────────────────────
function ShiftChallenge({ onBack, onNavigateToDrip }) {
  const [index,    setIndex]    = useState(0);
  const [selected, setSelected] = useState(null);
  const [done,     setDone]     = useState(false);

  const total = SHIFT_CHALLENGES.length;

  useEffect(() => {
    trackEvent('icu_drips_shift_challenge_opened');
  }, []);

  function handleAnswer(optionIndex) {
    if (selected !== null) return;
    const ch = SHIFT_CHALLENGES[index];
    const correct = optionIndex === ch.correctOption;
    setSelected(optionIndex);
    trackEvent('icu_drips_shift_challenge_answered', { challenge_id: ch.id, correct });
  }

  function handleNext() {
    if (index + 1 >= total) {
      trackEvent('icu_drips_shift_challenge_completed', { total });
      setDone(true);
    } else {
      setIndex(i => i + 1);
      setSelected(null);
    }
  }

  function handleRestart() {
    setIndex(0);
    setSelected(null);
    setDone(false);
    trackEvent('icu_drips_shift_challenge_opened');
  }

  if (done) {
    return (
      <div className="id-challenge">
        <button className="id-challenge__back" onClick={onBack}>← Back to ICU Drips</button>
        <div className="id-challenge-end">
          <div className="id-challenge-end__eyebrow">Shift complete</div>
          <p className="id-challenge-end__msg">All {total} patterns reviewed.</p>
          <button className="id-challenge-btn id-challenge-btn--primary" onClick={handleRestart}>
            Start over
          </button>
          <button className="id-challenge-btn id-challenge-btn--ghost" onClick={onBack}>
            Back to ICU Drips
          </button>
        </div>
        <div className="id-detail__disclaimer" style={{ marginTop: 24 }}>{SAFETY_DISCLAIMER}</div>
      </div>
    );
  }

  const ch = SHIFT_CHALLENGES[index];
  const answered = selected !== null;
  const correct = answered && selected === ch.correctOption;

  return (
    <div className="id-challenge">
      <button className="id-challenge__back" onClick={onBack}>← Back to ICU Drips</button>

      {/* Header */}
      <div className="id-challenge-header">
        <div className="id-challenge-header__top">
          <span className="id-challenge-header__title">Shift Challenge</span>
          <span className="id-challenge-header__count">{index + 1} of {total}</span>
        </div>
        <p className="id-challenge-header__sub">One quick bedside pattern.</p>
        <div className="id-challenge-progress-bar">
          <div className="id-challenge-progress-bar__fill" style={{ width: `${(index / total) * 100}%` }} />
        </div>
      </div>

      {/* Scenario card */}
      <div className="id-challenge-card">
        <div className="id-challenge-card__title">{ch.title}</div>
        <p className="id-challenge-card__snapshot">{ch.patientSnapshot}</p>
        <p className="id-challenge-card__prompt">{ch.prompt}</p>
      </div>

      {/* Options */}
      <div className="id-challenge-options">
        {ch.options.map((opt, i) => {
          let cls = 'id-challenge-option';
          if (answered) {
            if (i === ch.correctOption)  cls += ' id-challenge-option--correct';
            else if (i === selected)     cls += ' id-challenge-option--incorrect';
            else                         cls += ' id-challenge-option--dim';
          }
          return (
            <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={answered}>
              <span className="id-challenge-option__letter">{String.fromCharCode(65 + i)}</span>
              <span className="id-challenge-option__text">{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {answered && (
        <div className="id-challenge-feedback">
          <div className={`id-challenge-feedback__verdict ${correct ? 'id-challenge-feedback__verdict--correct' : 'id-challenge-feedback__verdict--incorrect'}`}>
            {correct ? 'Correct' : 'Not quite'}
          </div>
          <p className="id-challenge-feedback__explanation">{ch.explanation}</p>
          <div className="id-challenge-pearl">
            <span className="id-challenge-pearl__label">Pearl</span>
            <p className="id-challenge-pearl__text">{ch.pearl}</p>
          </div>
          {ch.relatedDripIds?.length > 0 && (
            <div className="id-challenge-feedback__drip-links">
              {ch.relatedDripIds.map(dripId => {
                const drip = DRIPS.find(d => d.id === dripId);
                if (!drip) return null;
                return (
                  <button
                    key={dripId}
                    className="id-challenge-feedback__drip-link"
                    onClick={() => {
                      trackEvent('icu_drips_shift_challenge_review_drip_clicked', { drip_id: drip.id });
                      onNavigateToDrip(drip);
                    }}
                  >
                    Review {drip.name} →
                  </button>
                );
              })}
            </div>
          )}
          <button className="id-challenge-btn id-challenge-btn--primary" onClick={handleNext}>
            {index + 1 >= total ? 'See results' : 'Next challenge'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Pearl view ───────────────────────────────────────────────────────────────
function PearlView({ initialPearlId, onBack, onNavigateToDrip }) {
  const [pearlId, setPearlId] = useState(initialPearlId);

  useEffect(() => {
    trackEvent('icu_drips_pearl_viewed', { pearl_id: pearlId });
  }, [pearlId]);

  const pearl = ICU_PEARLS.find(p => p.id === pearlId);
  if (!pearl) return null;

  const currentIndex = ICU_PEARLS.findIndex(p => p.id === pearlId);
  const morePearls = [1, 2, 3]
    .map(offset => ICU_PEARLS[(currentIndex + offset) % ICU_PEARLS.length])
    .filter(Boolean);

  return (
    <div className="id-pearl-view">
      <button className="id-pearl-view__back" onClick={onBack}>← Back to ICU Drips</button>

      <div className="id-pearl-view__header">
        <span className="id-pearl-view__eyebrow">Clinical Pearl</span>
      </div>

      <div className="id-pearl-view__card">
        <h2 className="id-pearl-view__title">{pearl.title}</h2>
        <p className="id-pearl-view__body">{pearl.pearl}</p>
        <div className="id-pearl-view__why">
          <span className="id-pearl-view__why-label">Why it matters</span>
          <p className="id-pearl-view__why-text">{pearl.whyItMatters}</p>
        </div>
      </div>

      {pearl.relatedDripIds?.length > 0 && (
        <div className="id-pearl-view__related">
          <span className="id-pearl-view__related-label">Related drips</span>
          {pearl.relatedDripIds.map(dripId => {
            const drip = DRIPS.find(d => d.id === dripId);
            if (!drip) return null;
            return (
              <button
                key={dripId}
                className="id-pearl-view__drip-link"
                onClick={() => {
                  trackEvent('icu_drips_pearl_related_drip_clicked', { drip_id: drip.id });
                  onNavigateToDrip(drip);
                }}
              >
                Review {drip.name} →
              </button>
            );
          })}
        </div>
      )}

      <div className="id-pearl-view__more">
        <span className="id-pearl-view__more-label">More pearls</span>
        {morePearls.map(p => (
          <button
            key={p.id}
            className="id-pearl-view__more-link"
            onClick={() => { trackEvent('icu_drips_pearl_opened', { pearl_id: p.id }); setPearlId(p.id); }}
          >
            {p.title} →
          </button>
        ))}
      </div>

      <div className="id-detail__disclaimer" style={{ marginTop: 24 }}>{SAFETY_DISCLAIMER}</div>
    </div>
  );
}

// ─── Module shell ─────────────────────────────────────────────────────────────
export default function IcuDripsModule({ onGoHome }) {
  const [view,           setView]           = useState('home');
  const [selected,       setSelected]       = useState(null);
  const [comparePairId,  setComparePairId]  = useState(null);
  const [activePearlId,  setActivePearlId]  = useState(null);

  // Track module opened once on mount
  useEffect(() => {
    trackEvent('icu_drips_opened', { route: '/icu-drips' });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [view]);

  function handleSelect(drip) {
    trackEvent('drip_selected', { drip_id: drip.id, family: drip.family ?? '', category: drip.category ?? '' });
    trackEvent('drip_detail_viewed', { drip_id: drip.id });
    setSelected(drip);
    setView('detail');
  }

  function handleBack() {
    setSelected(null);
    setView('home');
  }

  function handleShowCompare(pairId = null) {
    trackEvent('drip_compare_opened');
    trackEvent('hemodynamic_compare_opened');
    setComparePairId(pairId);
    setView('compare');
  }

  function handleShowPractice() {
    setView('practice');
  }

  function handleShowChallenge() {
    setView('challenge');
  }

  function handleShowPearl(pearlId) {
    setActivePearlId(pearlId);
    setView('pearl');
  }

  function handleNavigateToDrip(drip) {
    trackEvent('drip_detail_viewed', { drip_id: drip.id });
    setSelected(drip);
    setView('detail');
  }

  return (
    <div className="icu-drips-root">
      {/* Sticky header */}
      <header className="id-header">
        <div className="id-header__inner">
          <CELogo />
          <span className="id-header__brand">Clinical Edge</span>
          <span className="id-header__sep" aria-hidden="true">/</span>
          <span className="id-header__module">ICU Drips</span>
          <button className="id-header__back" onClick={onGoHome}>
            ← All tools
          </button>
        </div>
      </header>

      {/* Content surface */}
      <div className="id-body">
        {view === 'detail' && selected ? (
          <DripsDetail
            drip={selected}
            onBack={handleBack}
            onNavigate={handleSelect}
          />
        ) : view === 'compare' ? (
          <QuickCompare
            onBackToHome={() => setView('home')}
            onNavigateToDrip={handleNavigateToDrip}
            initialPairId={comparePairId}
          />
        ) : view === 'practice' ? (
          <PracticeMode
            onBack={() => setView('home')}
            onNavigateToDrip={handleNavigateToDrip}
          />
        ) : view === 'challenge' ? (
          <ShiftChallenge
            onBack={() => setView('home')}
            onNavigateToDrip={handleNavigateToDrip}
          />
        ) : view === 'pearl' && activePearlId ? (
          <PearlView
            initialPearlId={activePearlId}
            onBack={() => setView('home')}
            onNavigateToDrip={handleNavigateToDrip}
          />
        ) : (
          <DripsHome
            onSelect={handleSelect}
            onShowCompare={handleShowCompare}
            onShowPractice={handleShowPractice}
            onShowChallenge={handleShowChallenge}
            onShowPearl={handleShowPearl}
          />
        )}
      </div>
    </div>
  );
}
