const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildClinicalEvidenceLedger } = require('../clinical-evidence-ledger');
const { composeEvidenceFallback, validateFallbackGrounding } = require('../priority-map-fallback');
const { recoverEvidenceFallback } = require('../priority-map-fallback');
const runtimeIntegrated = require('node:fs').readFileSync(require.resolve('../server'), 'utf8').includes('composeEvidenceFallback(source, urgency)');
const integrationOnly = { skip: !runtimeIntegrated && 'Candidate integration withdrawn pending the legacy onset expectation decision' };

const snapshot = rows => `PATIENT SNAPSHOT — USER-REPORTED / OBSERVED INFORMATION\n${rows.map(row => `- ${row}`).join('\n')}\nTreat omitted fields as unknown.`;

test('ledger preserves source spans and is recursively immutable', () => {
  const source = snapshot(['BP: previous unknown -> current 85/55 mmHg', 'Medication: fentanyl reported; dose unknown']);
  const ledger = buildClinicalEvidenceLedger(source);
  for (const record of ledger.records) assert.equal(source.slice(record.provenance.start, record.provenance.end), record.text);
  assert.equal(ledger.records[0].comparison.status, 'incomplete');
  assert.equal(ledger.records[1].roles.medicationContext, true);
  assert.equal(ledger.records[1].roles.unknown, true);
  assert.ok(Object.isFrozen(ledger.records[0].roles));
});

test('comparison, negative, baseline, recognition and conflicting entries remain distinct', () => {
  const ledger = buildClinicalEvidenceLedger(snapshot(['BP: previous 120/70 -> current 120/70', 'BP: current 85/55', 'Baseline: usual mentation', 'Context: no cough; recognition recent; onset unknown']));
  assert.equal(ledger.records[0].comparison.status, 'unchanged');
  assert.equal(ledger.conflicts.length, 1);
  assert.equal(ledger.records[2].roles.baselineContext, true);
  assert.equal(ledger.records[3].roles.explicitNegative, true);
  assert.equal(ledger.records[3].roles.onsetContext, true);
});

const leaked = ['SpO2: 92%', 'Bicarbonate: 28', 'RR: 30', 'Oxygen: 6 L/min', 'Mentation: drowsy', 'Glucose: 112', 'BP: 85/55', 'HR: 148', 'MAP: 65', 'Potassium: 3.4', 'Magnesium: 1.8', 'Skin: cool and clammy', 'Urine: 20 mL over the last hour', 'Drain: 35 mL during the most recent hour', 'Temperature: fever', 'Cough: productive', 'WBC: 18.4', 'Onset: unknown', 'Baseline: usual'];
test('independent deletion removes every supplied factual clause throughout output', () => {
  for (let i = 0; i < leaked.length; i++) {
    const rows = leaked.filter((_, index) => index !== i);
    const result = composeEvidenceFallback(snapshot(rows), 'HIGH');
    assert.ok(!result.output.includes(leaked[i]), leaked[i]);
    for (const row of rows) assert.ok(result.output.includes(row));
    assert.equal(result.metadata.accepted, true);
  }
});

test('permutation preserves facts without inventing comparisons', () => {
  for (let shift = 0; shift < leaked.length; shift++) {
    const rows = [...leaked.slice(shift), ...leaked.slice(0, shift)];
    const result = composeEvidenceFallback(snapshot(rows), 'MODERATE');
    assert.deepEqual(result.document.facts.map(fact => fact.text), rows);
    assert.ok(!result.output.includes('falling BP'));
  }
});

test('refill does not create cool skin; normal respiratory values do not create deterioration', () => {
  for (const row of ['Capillary refill: delayed', 'Extremities: cool', 'Respiratory context: pH 7.40; PaCO2 40 mmHg']) {
    const result = composeEvidenceFallback(snapshot([row]), 'LOW');
    assert.equal(result.document.facts.length, 1);
    assert.equal(result.document.facts[0].text, row);
    assert.ok(!result.output.includes('worsening ventilation'));
    assert.ok(!result.output.includes('cool/clammy'));
  }
});

test('whole output tampering is rejected in all sections', () => {
  const source = snapshot(['BP: current 85/55 mmHg']);
  const result = composeEvidenceFallback(source, 'MODERATE');
  for (const marker of ['Observed', 'Interpretation', 'Possible patterns', 'Missing information', 'Assess first', 'SBAR-ready summary', 'Teach me why']) {
    const altered = result.output.replace(marker, `${marker}: patient has fever`);
    assert.equal(validateFallbackGrounding(source, result.document, altered, 'MODERATE').accepted, false);
  }
  const altered = JSON.parse(JSON.stringify(result.document));
  altered.facts.push({ evidenceId: 'e999', text: 'Invented observation' });
  assert.equal(validateFallbackGrounding(source, altered, result.output, 'MODERATE').accepted, false);
});

test('empty input never creates a clinical change; metadata contains no content', () => {
  const result = composeEvidenceFallback('', 'LOW');
  assert.ok(result.output.includes('No structured observations were supplied'));
  assert.ok(!result.output.includes('A clinical change was reported'));
  const synthetic = composeEvidenceFallback(snapshot(['Context: SYNTHETIC_CONTENT_SENTINEL']), 'HIGH');
  assert.ok(!JSON.stringify(synthetic.metadata).includes('SYNTHETIC_CONTENT_SENTINEL'));
});

const families = [
  { id: 'respiratory_worsening', rows: ['pH: previous 7.36 -> current 7.29', 'PaCO2: previous 48 -> current 60 mmHg'], useful: /worsening ventilation with respiratory acidemia/ },
  { id: 'hypercapnia_mentation', rows: ['pH: current 7.29', 'PaCO2: current 60 mmHg', 'Mental status: more drowsy'], useful: /Hypercapnia may be contributing to drowsiness/ },
  { id: 'low_pressure_mentation', rows: ['BP: current 85/55 mmHg', 'Mental status: Changed'], useful: /cerebral perfusion adequacy may be relevant/ },
  { id: 'both_peripheral', rows: ['Extremities: cool', 'Capillary refill: delayed'], useful: /cool extremities and delayed capillary refill/ },
  { id: 'bedside', rows: ['Mental status: more drowsy', 'Capillary refill: delayed', 'Chest discomfort: Present'], useful: /impaired circulation or another systemic process/ },
  { id: 'systemic', rows: ['MAP: previous 85 -> current 67 mmHg', 'Lactate: previous 1.7 -> current 3.2 mmol/L', 'Creatinine: previous 0.9 -> current 1.4 mg/dL'], useful: /worsening systemic perfusion with end-organ warning signs/ },
  { id: 'rhythm', rows: ['Rhythm change: current new irregular rhythm', 'Heart rate: previous 82 -> current 148 bpm', 'MAP: previous 88 -> current 65 mmHg', 'Symptoms: lightheaded'], useful: /hemodynamic intolerance/ },
  { id: 'focal', rows: ['Focal neurologic change: Present'], useful: /localized neurologic process/ },
  { id: 'infection', rows: ['Symptoms: productive cough'], useful: /infectious process a possible contributor/ },
];
for (const family of families) {
  test(`${family.id}: useful interpretation has explicit evidence dependencies`, () => {
    const result = composeEvidenceFallback(snapshot(family.rows), 'HIGH');
    const clause = result.document.clauses.find(n => n.ruleId === family.id);
    assert.ok(clause, family.id);
    assert.ok(clause.evidenceIds.length);
    assert.equal(clause.role, 'qualified_interpretation');
    assert.match(result.output, family.useful);
  });
  for (let i = 0; i < family.rows.length; i++) {
    test(`${family.id}: delete dependency ${i}`, () => {
      const result = composeEvidenceFallback(snapshot(family.rows.filter((_, index) => index !== i)), 'HIGH');
      assert.ok(!result.document.clauses.some(n => n.ruleId === family.id));
    });
    test(`${family.id}: unknown dependency ${i} cannot support interpretation`, () => {
      const rows = [...family.rows];
      rows[i] = rows[i].split(':')[0] + ': not assessed';
      const result = composeEvidenceFallback(snapshot(rows), 'HIGH');
      assert.ok(!result.document.clauses.some(n => n.ruleId === family.id));
    });
  }
  test(`${family.id}: permutation preserves qualified reasoning`, () => {
    const result = composeEvidenceFallback(snapshot([...family.rows].reverse()), 'HIGH');
    assert.ok(result.document.clauses.some(n => n.ruleId === family.id));
  });
  for (let i = 0; i < family.rows.length; i++) {
    test(`${family.id}: explicit negative dependency ${i}`, () => {
      const rows = [...family.rows];
      rows[i] = rows[i].replace(': ', ': no ');
      assert.ok(!composeEvidenceFallback(snapshot(rows), 'HIGH').document.clauses.some(n => n.ruleId === family.id));
    });
  }
  test(`${family.id}: earlier-only findings do not become current`, () => {
    const rows = family.rows.map(row => `Context: Earlier: ${row}`);
    assert.ok(!composeEvidenceFallback(snapshot(rows), 'HIGH').document.clauses.some(n => n.ruleId === family.id));
  });
  test(`${family.id}: discrepant source values are not silently resolved`, () => {
    const conflicting = family.rows[0].split(':')[0] + ': conflicting current observation; needs verification';
    const result = composeEvidenceFallback(snapshot([...family.rows, conflicting]), 'HIGH');
    assert.ok(result.ledger.conflicts.length);
    assert.ok(!result.document.clauses.some(n => n.ruleId === family.id));
    assert.ok(result.output.includes(conflicting));
  });
}

for (const family of families.filter(f => ['respiratory_worsening', 'systemic', 'rhythm'].includes(f.id))) {
  for (const status of ['current-only', 'unchanged', 'improving', 'unknown']) {
    test(`${family.id}: ${status} comparisons do not support deterioration`, () => {
      const rows = family.rows.map(row => {
        const m = row.match(/^(.*?): previous (.*?) -> current (.*)$/);
        if (!m) return row;
        const previous = m[2], current = m[3];
        if (status === 'current-only') return `${m[1]}: current ${current}`;
        if (status === 'unchanged') return `${m[1]}: previous ${current} -> current ${current}`;
        if (status === 'unknown') return `${m[1]}: previous unknown -> current ${current}`;
        return `${m[1]}: previous ${current} -> current ${previous}`;
      });
      assert.ok(!composeEvidenceFallback(snapshot(rows), 'HIGH').document.clauses.some(n => n.ruleId === family.id));
    });
  }
}

for (const [previous, current, expected] of [['20', '10', 'decreasing'], ['10', '20', 'increasing'], ['20', '20', 'unchanged'], ['unknown', '20', 'unknown']]) {
  test(`temporal direction ${expected}`, () => {
    const ledger = buildClinicalEvidenceLedger(snapshot([`Urine output: previous ${previous} -> current ${current} mL/hr`]));
    assert.equal(ledger.comparisons[0].direction, expected);
  });
}
for (const rows of [
  ['pH: previous 7.29 -> current 7.36', 'PaCO2: previous 60 -> current 48 mmHg'],
  ['pH: previous 7.29 -> current 7.29', 'PaCO2: previous 60 -> current 60 mmHg'],
  ['pH: previous unknown -> current 7.29', 'PaCO2: previous unknown -> current 60 mmHg'],
]) test('non-worsening gases retain respiratory relevance without inventing deterioration', () => {
  const result = composeEvidenceFallback(snapshot(rows), 'MODERATE');
  assert.ok(!result.document.clauses.some(n => n.ruleId === 'respiratory_worsening'));
});

test('conflicting current values suppress interpretation and preserve both reports', () => {
  const source = snapshot(['pH: current 7.29', 'pH: current 7.40', 'PaCO2: current 60 mmHg']);
  const result = composeEvidenceFallback(source, 'HIGH');
  assert.ok(result.output.includes('pH: current 7.29'));
  assert.ok(result.output.includes('pH: current 7.40'));
  assert.match(result.output, /limited by a discrepancy/);
  assert.ok(!result.document.clauses.some(n => n.ruleId === 'respiratory'));
});
test('earlier/negative/inquiry features do not support current interpretations', () => {
  for (const context of ['Earlier: drowsy; Current: awake', 'No drowsiness or confusion reported', 'Assess whether confused', 'Mental status: not assessed']) {
    const source = snapshot(['BP: current 85/55 mmHg', `Context: ${context}`]);
    assert.ok(!composeEvidenceFallback(source, 'MODERATE').document.clauses.some(n => n.ruleId === 'low_pressure_mentation'));
  }
});
test('conditional nodes cannot be promoted into reported observations', () => {
  const source = snapshot(['pH: current 7.29', 'PaCO2: current 60 mmHg']);
  const result = composeEvidenceFallback(source, 'MODERATE');
  const document = JSON.parse(JSON.stringify(result.document));
  const node = document.clauses.find(n => n.role === 'conditional_future');
  node.role = 'reported_fact';
  assert.equal(validateFallbackGrounding(source, document, result.output, 'MODERATE').accepted, false);
  const recovery = recoverEvidenceFallback(source, 'MODERATE', document, result.output);
  assert.equal(recovery.metadata.mode, 'minimal');
  assert.equal(recovery.document.clauses.length, 0);
  assert.match(recovery.output, /limited to supplied evidence/);
  assert.equal(validateFallbackGrounding(source, recovery.document, recovery.output, 'MODERATE').accepted, true);
});

test('known baseline and qualitative earlier context are not described as absent', () => {
  const source = snapshot(['Context: mentation more drowsy than earlier; baseline normally alert']);
  assert.ok(!composeEvidenceFallback(source, 'MODERATE').output.includes('No earlier comparison is established'));
});
test('clammy skin cannot create cool extremities', () => {
  const result = composeEvidenceFallback(snapshot(['Skin: clammy', 'Capillary refill: delayed']), 'MODERATE');
  assert.ok(!result.document.clauses.some(n => ['both_peripheral', 'cool_extremities'].includes(n.ruleId)));
});
test('new onset is not inferred from worsening existing drowsiness', () => {
  const source = snapshot(['pH: current 7.29', 'PaCO2: current 60 mmHg', 'Mental status: more drowsy than earlier']);
  const result = composeEvidenceFallback(source, 'HIGH');
  assert.match(result.output, /Hypercapnia may be contributing to drowsiness/);
  assert.ok(!result.output.includes('new drowsiness'));
});
test('chronic rhythm and an unrelated new symptom do not establish new focal/rhythm onset', () => {
  const rhythm = composeEvidenceFallback(snapshot(['Rhythm change: known chronic irregular rhythm', 'Heart rate: previous 82 -> current 148 bpm', 'MAP: previous 88 -> current 65 mmHg', 'Symptoms: lightheaded']), 'HIGH');
  assert.ok(!rhythm.document.title.includes('New rhythm'));
  const focal = composeEvidenceFallback(snapshot(['Focal neurologic change: Present, chronic left arm weakness with a new headache']), 'HIGH');
  assert.ok(!focal.document.title.includes('Acute focal'));
});

for (const row of ['PaCO2: current 60 mmHg nonsense', 'PaCO2: current 60 bananas', 'PaCO2: current 60 kPa', 'PaCO2: current 60/40 mmHg', 'pH: current 7.29/7.40', 'pH: current 7.20-7.40', 'Goal pH: current 7.20', 'Possible pH: current 7.20']) {
  test(`bounded units/value shape suppress unsafe respiratory inference: ${row}`, () => {
    const rows = row.toLowerCase().includes('ph:') ? [row, 'PaCO2: current 60 mmHg'] : ['pH: current 7.29', row];
    const result = composeEvidenceFallback(snapshot(rows), 'MODERATE');
    assert.ok(!result.document.clauses.some(n => n.ruleId === 'respiratory'));
    assert.ok(result.output.includes(row));
    if (result.document.unclassifiedEvidenceCount) assert.match(result.output, /Verify units and measurement context/);
  });
}
for (const row of ['Labs: Hypothetical pH 7.29, PaCO2 60 mmHg', 'Labs: Assess whether pH 7.29, PaCO2 60 mmHg', 'Labs: No pH 7.29, no PaCO2 60 mmHg', 'Clinical context: pH 7.29, PaCO2 60 mmHg', 'Labs: selected=ABG; detail=Earlier ABG: pH 7.36, PaCO2 48 mmHg. Current ABG: pH 7.29, PaCO2 60 mmHg bananas.']) {
  test(`unclassified or hypothetical gas context is not a patient pattern: ${row}`, () => {
    assert.ok(!composeEvidenceFallback(snapshot([row]), 'MODERATE').document.clauses.some(n => n.ruleId === 'respiratory'));
  });
}
test('contradictory numeric values within one lab row suppress dependent reasoning', () => {
  const source = snapshot(['Labs: pH 7.29, pH 7.40, PaCO2 60 mmHg']);
  const result = composeEvidenceFallback(source, 'HIGH');
  assert.ok(result.ledger.conflicts.some(c => c.concept === 'ph'));
  assert.ok(!result.document.clauses.some(n => n.ruleId === 'respiratory'));
  assert.ok(result.output.includes('pH 7.29, pH 7.40'));
});
test('unrecognized comparison units cannot create systemic deterioration', () => {
  const source = snapshot(['MAP: previous 85 bananas -> current 67 bananas', 'Lactate: previous 1.7 -> current 3.2 mmol/L', 'Creatinine: previous 0.9 -> current 1.4 mg/dL']);
  const result = composeEvidenceFallback(source, 'HIGH');
  assert.equal(result.ledger.comparisons.find(c => c.concept === 'map').direction, 'unknown');
  assert.ok(!result.document.clauses.some(n => n.ruleId === 'systemic'));
});
test('unit disagreement is not resolved by choosing the convenient value', () => {
  const source = snapshot(['pH: current 7.29', 'PaCO2: current 60 mmHg', 'PaCO2: current 60 kPa']);
  const result = composeEvidenceFallback(source, 'HIGH');
  assert.ok(result.ledger.conflicts.some(c => c.concept === 'paco2'));
  assert.ok(!result.document.clauses.some(n => n.ruleId === 'respiratory'));
});
for (const row of ['Chest discomfort: None reported', 'Chest discomfort: Denied', 'Symptoms: No lightheadedness', 'Symptoms: assess whether lightheaded']) {
  test(`negative/inquiry symptoms do not become rhythm intolerance: ${row}`, () => {
    const source = snapshot(['Rhythm change: current new irregular rhythm', 'Heart rate: previous 82 -> current 148 bpm', 'MAP: previous 88 -> current 65 mmHg', row]);
    assert.ok(!composeEvidenceFallback(source, 'HIGH').document.clauses.some(n => n.ruleId === 'rhythm'));
  });
}
test('baseline and mixed scopes do not silently become current altered mentation', () => {
  for (const row of ['Baseline: drowsy but unchanged', 'Context: Earlier: confused: Current: alert', 'History: drowsy', 'Context: yesterday drowsy; today alert', 'Context: drowsy 2 hours ago; now awake', 'Context: previously confused; now at baseline', 'Context: Current: improved from earlier confusion', 'Context: nurse is confused about the question', 'Context: mother is drowsy', 'Context: the medic is confused about paperwork']) {
    const result = composeEvidenceFallback(snapshot(['BP: current 85/55 mmHg', row]), 'MODERATE');
    assert.ok(!result.document.clauses.some(n => n.ruleId === 'low_pressure_mentation'));
  }
});
test('known unchanged baseline, unknown baseline, recognition and onset retain independent roles', () => {
  const ledger = buildClinicalEvidenceLedger(snapshot(['Baseline: unchanged, usual mentation', 'History: baseline cardiac status unknown', 'Timeframe: recognized 10 minutes ago; onset unknown']));
  assert.ok(ledger.atoms.some(a => a.concept === 'baseline' && !a.unknown));
  assert.ok(ledger.atoms.some(a => a.concept === 'baseline' && a.unknown));
  assert.ok(ledger.atoms.some(a => a.concept === 'recognition' && !a.unknown));
  assert.ok(ledger.atoms.some(a => a.concept === 'onset' && a.unknown));
});
test('hypothetical baseline and onset do not become known or reported-unknown facts', () => {
  const source = snapshot(['Baseline: possible usual mentation', 'Context: If exact rhythm onset is unknown, clarify it']);
  const ledger = buildClinicalEvidenceLedger(source);
  assert.ok(ledger.atoms.filter(a => ['baseline', 'onset'].includes(a.concept)).every(a => a.unknown));
  assert.ok(!composeEvidenceFallback(source, 'LOW').document.clauses.some(n => n.ruleId === 'rhythm_onset_unknown'));
  const unknown = buildClinicalEvidenceLedger(snapshot(['Context: Exact rhythm onset is not known']));
  assert.ok(unknown.atoms.some(a => a.concept === 'onset' && a.reportedUnknown));
});
for (const [text, exposed] of [['fentanyl administered; dose unknown', true], ['received fentanyl', true], ['norepinephrine is running but dose unknown', true], ['assess whether fentanyl was given', false], ['fentanyl not given', false], ['fentanyl given?', false], ['fentanyl exposure unknown', false], ['propofol given if needed', false]]) {
  test(`medication exposure vs inquiry: ${text}`, () => {
    const ledger = buildClinicalEvidenceLedger(snapshot([`Medication: ${text}`]));
    const actual = ledger.atoms.some(a => a.concept === 'medication_exposure' && !a.negative && !a.unknown && a.temporal === 'current');
    assert.equal(actual, exposed);
    assert.ok(!composeEvidenceFallback(snapshot([`Medication: ${text}`]), 'MODERATE').output.includes('caused'));
  });
}
test('prior medication exposure is retained as prior, never a current infusion', () => {
  const ledger = buildClinicalEvidenceLedger(snapshot(['Medication: received fentanyl yesterday']));
  assert.ok(ledger.atoms.some(a => a.concept === 'medication_exposure' && a.temporal === 'earlier'));
  assert.ok(!ledger.atoms.some(a => a.concept === 'medication_exposure' && a.temporal === 'current'));
});
test('decimal refill time and multi-interval urine values are not overinterpreted', () => {
  const source = snapshot(['Extremities: cool', 'Capillary refill: 0.4 seconds', 'Urine output: amount 20 mL over 1 hour, then 15 mL over the next hour']);
  const result = composeEvidenceFallback(source, 'LOW');
  assert.ok(!result.document.clauses.some(n => ['both_peripheral', 'urine_interval'].includes(n.ruleId)));
});
test('normal WBC alone does not create an infectious contributor', () => {
  const result = composeEvidenceFallback(snapshot(['Context: Current WBC 7.0 x10^3/uL; no earlier WBC available']), 'LOW');
  assert.ok(!result.document.clauses.some(n => n.ruleId === 'infection'));
});
test('record and atom provenance spans refer to exact source strings', () => {
  const source = snapshot(['Labs: selected=ABG; detail=Earlier ABG: pH 7.36, PaCO2 48 mmHg. Current ABG: pH 7.29, PaCO2 60 mmHg.', 'Labs: otherLabs=1) name=Magnesium, current=1.8, unit=mg/dL', 'Context: Current WBC 18.4 x10^3/uL; no earlier WBC available']);
  const ledger = buildClinicalEvidenceLedger(source);
  for (const item of [...ledger.records, ...ledger.atoms]) assert.equal(source.slice(item.provenance.start, item.provenance.end), item.text);
});
test('numeric evidence provenance cannot point at a digit in the field label', () => {
  for (const row of ['PaCO2: current 2', 'PaCO2: previous 2 -> current 60 mmHg']) {
    const source = snapshot([row]);
    const ledger = buildClinicalEvidenceLedger(source);
    for (const a of ledger.atoms.filter(a => a.concept === 'paco2')) assert.ok(a.provenance.start > source.indexOf('PaCO2:') + 'PaCO2:'.length);
  }
});
test('malformed numeric shapes fail conservatively without low-pressure or acidemia interpretation', () => {
  for (const bp of ['BP: current 55/85 mmHg', 'BP: current -85/55 mmHg']) {
    const result = composeEvidenceFallback(snapshot([bp, 'Mental status: Changed']), 'MODERATE');
    assert.ok(!result.document.clauses.some(n => n.ruleId === 'low_pressure_mentation'));
  }
  for (const ph of ['pH: current -7.29', 'pH: current 0']) assert.ok(!composeEvidenceFallback(snapshot([ph, 'PaCO2: current 60 mmHg']), 'MODERATE').document.clauses.some(n => n.ruleId === 'respiratory'));
});
test('onset synonyms remain absent when only worsening and recognition were supplied', () => {
  const result = composeEvidenceFallback(snapshot(['pH: current 7.29', 'PaCO2: current 60 mmHg', 'Mental status: more drowsy than earlier', 'Timeframe: recognized 10 minutes ago; onset unknown']), 'HIGH');
  const inference = result.document.clauses.map(n => n.text).join('\n');
  assert.doesNotMatch(inference, /new drowsiness|new onset|drowsiness (?:began|started)|sudden drowsiness/i);
});
test('prior unknown onset cannot override later supplied known onset', () => {
  const source = snapshot(['Context: Earlier: exact rhythm onset unknown; Current: exact rhythm onset documented at 10:00']);
  assert.ok(!composeEvidenceFallback(source, 'MODERATE').document.clauses.some(n => n.ruleId === 'rhythm_onset_unknown'));
});
test('known baseline information is not relabeled missing or nonexistent', () => {
  const result = composeEvidenceFallback(snapshot(['BP: current 85/55 mmHg', 'Baseline: usual BP 100/60 mmHg']), 'MODERATE');
  assert.ok(!result.output.includes('No earlier comparison is established'));
  assert.ok(result.output.includes('Baseline: usual BP 100/60 mmHg'));
});
test('explicitly unchanged categorical comparisons retain their role without claiming numeric direction', () => {
  const ledger = buildClinicalEvidenceLedger(snapshot(['Mental status: previous At baseline -> current At baseline']));
  assert.equal(ledger.records[0].comparison.status, 'unchanged');
  assert.equal(ledger.records[0].roles.explicitlyUnchanged, true);
  assert.ok(!composeEvidenceFallback(snapshot(['Mental status: previous At baseline -> current At baseline']), 'LOW').document.clauses.some(n => n.ruleId === 'mentation_changed'));
});
test('conditional source text remains conditional context, not a reported clinical finding', () => {
  const source = snapshot(['pH: current 7.29', 'PaCO2: current 60 mmHg', 'Context: If new drowsiness occurs, reassess']);
  const result = composeEvidenceFallback(source, 'MODERATE');
  const conditional = result.document.facts.find(f => f.text.includes('If new drowsiness'));
  assert.equal(conditional.role, 'conditional_context');
  assert.match(result.output, /Conditional\/inquiry context only/);
  assert.ok(!result.output.split('Observed:\n')[1].split('\nInterpretation:')[0].includes('If new drowsiness'));
  assert.ok(!result.document.clauses.some(n => n.ruleId === 'hypercapnia_mentation'));
  const tampered = JSON.parse(JSON.stringify(result.document));
  tampered.facts.find(f => f.text.includes('If new drowsiness')).role = 'reported_fact';
  assert.equal(validateFallbackGrounding(source, tampered, result.output, 'MODERATE').accepted, false);
});
test('a submitted instruction is retained as inquiry context, never promoted to observed treatment', () => {
  const source = snapshot(['Medication: Give fentanyl if needed']);
  const result = composeEvidenceFallback(source, 'LOW');
  assert.equal(result.document.facts[0].role, 'conditional_context');
  assert.ok(!result.output.split('Observed:\n')[1].split('\nInterpretation:')[0].includes('Give fentanyl'));
  assert.ok(result.output.includes('Conditional/inquiry context only: Medication: Give fentanyl if needed'));
});
test('reported negative exposure is not manufactured into unknown exposure', () => {
  const source = snapshot(['pH: current 7.29', 'PaCO2: current 60 mmHg', 'Mental status: drowsy', 'Medication: no opioid or sedative exposure reported']);
  const result = composeEvidenceFallback(source, 'MODERATE');
  assert.match(result.output, /no opioid or sedative exposure reported/);
  assert.ok(!result.document.clauses.some(n => /sedation exposure.*remain unresolved/i.test(n.text)));
});
test('contextual physiology is selected only with its reported dependencies', () => {
  const rows = ['BP: current 85/55 mmHg', 'Mental status: Changed'];
  const full = composeEvidenceFallback(snapshot(rows), 'MODERATE');
  assert.ok(full.document.clauses.some(n => n.ruleId === 'low_pressure_teaching'));
  assert.match(full.output, /Brain function depends on adequate blood flow/);
  for (let i = 0; i < rows.length; i++) assert.ok(!composeEvidenceFallback(snapshot(rows.filter((_, index) => index !== i)), 'MODERATE').document.clauses.some(n => n.ruleId === 'low_pressure_teaching'));
});
test('rhythm physiology requires the same supported intolerance evidence', () => {
  const family = families.find(f => f.id === 'rhythm');
  assert.ok(composeEvidenceFallback(snapshot(family.rows), 'HIGH').document.clauses.some(n => n.ruleId === 'rhythm_teaching'));
  for (let i = 0; i < family.rows.length; i++) assert.ok(!composeEvidenceFallback(snapshot(family.rows.filter((_, index) => index !== i)), 'HIGH').document.clauses.some(n => n.ruleId === 'rhythm_teaching'));
});
test('every positive fallback family still passes the existing whole-map clinical safety validators', () => {
  process.env.ANTHROPIC_API_KEY = 'test-key';
  const { buildPriorityMapFallback, validatePriorityMapReliability } = require('../server');
  for (const family of families) {
    const source = snapshot(family.rows);
    assert.deepEqual(validatePriorityMapReliability(source, buildPriorityMapFallback(source)), [], family.id);
  }
});
test('existing frontend parser receives observations and useful interpretation', async () => {
  const { parsePriorities } = await import('../../frontend/src/components/priorityMapModel.js');
  const result = composeEvidenceFallback(snapshot(['pH: current 7.29', 'PaCO2: current 60 mmHg']), 'HIGH');
  const priority = parsePriorities(result.output)[0];
  assert.equal(priority.observed.length, 2);
  assert.match(priority.interpretation, /impaired ventilation/);
  assert.ok(priority.assessNow.length);
});

for (const variant of ['original_error', 'original_timeout', 'invalid_original', 'incomplete_original', 'invalid_repair', 'repair_error', 'repair_timeout', 'repair_skipped']) {
  test(`terminal path ${variant} returns the same grounded first fallback`, integrationOnly, async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const { runPriorityMapWithBudget, assessDeterministicUrgency } = require('../server');
    const source = snapshot(['pH: current 7.29', 'PaCO2: current 60 mmHg', 'Capillary refill: delayed']);
    let clock = 0, repairs = 0;
    const result = await runPriorityMapWithBudget({ source, now: () => clock,
      originalBudgetMs: 10, repairBudgetMs: 10, minRepairBudgetMs: 1, totalBudgetMs: 100, returnReserveMs: 5,
      validateOutput: () => ['invalid_contract'],
      generateOriginal: async () => {
        if (variant === 'original_error') throw new Error('mock');
        if (variant === 'original_timeout') return new Promise(() => {});
        if (variant === 'repair_skipped') clock = 96;
        return variant === 'incomplete_original' ? { text: 'incomplete synthetic response', stopReason: 'max_tokens' } : 'invalid synthetic response';
      },
      ...(variant.startsWith('repair_') || variant === 'invalid_repair' ? { repair: async () => {
        repairs++;
        if (variant === 'repair_error') throw new Error('mock');
        if (variant === 'repair_timeout') return new Promise(() => {});
        return 'invalid synthetic repair';
      } } : {}),
    });
    assert.equal(result.status, 'fallback');
    assert.ok(repairs <= 1);
    const expected = composeEvidenceFallback(source, assessDeterministicUrgency(source).urgency);
    assert.equal(result.output, expected.output);
    assert.equal(expected.metadata.accepted, true);
  });
}

test('reassessment contains only its supplied current ledger and no old scenario', integrationOnly, () => {
  const { buildReassessmentPriorityMap } = require('../server');
  const source = snapshot(['BP: previous 86/48 -> current 94/56 mmHg', 'Urine output: amount 15 mL over 1 hour']);
  const result = buildReassessmentPriorityMap(source);
  assert.match(result, /Latest verified bedside findings/);
  assert.ok(!result.includes('Norepinephrine'));
  assert.ok(!result.includes('Chest tube'));
});
test('crash shortcut is immediate, evidence-linked, metadata-only and provider-free', integrationOnly, async () => {
  const { app } = require('../server');
  const { EventEmitter } = require('node:events');
  const handler = app.router.stack.find(l => l.route?.path === '/api/copilot').route.stack.at(-1).handle;
  const source = 'The fictional patient is not breathing.';
  const res = new EventEmitter();
  let wire = '', requests = 0;
  res.setHeader = () => {};
  res.write = value => { wire += value; };
  res.end = () => res.emit('finish');
  const logs = [], oldLog = console.log, oldFetch = globalThis.fetch;
  console.log = (...args) => logs.push(args);
  globalThis.fetch = async () => { requests++; throw new Error('provider forbidden'); };
  try { await handler({ body: { question: source, mode: 'deep' } }, res); }
  finally { console.log = oldLog; globalThis.fetch = oldFetch; }
  assert.equal(requests, 0);
  assert.match(wire, /Urgency Level: HIGH/);
  assert.match(wire, /immediate team-level awareness/);
  assert.ok(!wire.includes('Sudden severe deterioration'));
  assert.ok(!JSON.stringify(logs).includes(source));
});

test('minimal emergency recovery retains emergency guidance without inventing onset', () => {
  const source = 'The fictional patient is not breathing.';
  const result = composeEvidenceFallback(source, 'HIGH', { emergency: true });
  const altered = JSON.parse(JSON.stringify(result.document));
  altered.facts.push({ evidenceId: 'a999', role: 'reported_fact', text: 'Sudden collapse' });
  const recovery = recoverEvidenceFallback(source, 'HIGH', altered, result.output, false, true);
  assert.equal(recovery.metadata.mode, 'minimal');
  assert.equal(validateFallbackGrounding(source, recovery.document, recovery.output, 'HIGH', { emergency: true }).accepted, true);
  assert.match(recovery.output, /immediate team-level awareness/);
  assert.doesNotMatch(recovery.output, /Sudden collapse/);
});
