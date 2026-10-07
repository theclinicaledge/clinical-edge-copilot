const registry = require('./ask-source-registry.json');
const rules = registry.sources.find(s => s.id === 'merck-acid-base').facts;
const { winterRange, respiratoryRanges, round } = require('./ask-abg-engine');
function calculateAcidBase({ pH, paCO2, hco3 }) {
  if (![pH, paCO2, hco3].every(Number.isFinite) || pH <= 0 || pH >= 14 || paCO2 <= 0 || hco3 <= 0) return { status: 'invalid_values' };
  const state = pH < rules.acidemiaPHBelow ? 'acidemia' : pH > rules.alkalemiaPHAbove ? 'alkalemia' : 'within_pH_reference_interval';
  const result = { status: 'calculated', sourceId: 'merck-acid-base', reported: { pH, paCO2, hco3 }, units: { paCO2: 'mmHg', hco3: 'mmol/L' }, pHState: state, approximate: true, duration: 'unknown', relationships: [], expectedComparisons: {} };
  if (state === 'acidemia') {
    if (paCO2 > rules.referencePaCO2mmHg) {
      result.relationships.push('respiratory_acidifying_direction');
      const ranges = respiratoryRanges(paCO2, 'acidosis');
      result.expectedComparisons.respiratoryAcidosisHCO3 = {
        acuteReference: ranges.acute.map(round),
        chronicReference: ranges.chronic.map(round),
      };
    }
    if (hco3 < rules.metabolicAcidosisHCO3Below) {
      result.relationships.push('metabolic_acidifying_direction');
      result.expectedComparisons.metabolicAcidosisPaCO2 = winterRange(hco3).map(round);
    }
  } else if (state === 'alkalemia') {
    if (paCO2 < rules.respiratoryAlkalosisPaCO2Below) {
      result.relationships.push('respiratory_alkalinizing_direction');
      const ranges = respiratoryRanges(paCO2, 'alkalosis');
      result.expectedComparisons.respiratoryAlkalosisHCO3 = {
        acuteReference: ranges.acute.map(round),
        chronicReference: ranges.chronic.map(round),
      };
    }
    if (hco3 > rules.metabolicAlkalosisHCO3Above) result.relationships.push('metabolic_alkalinizing_direction');
  }
  return result;
}
function acidBaseContext(question) {
  const patterns = { pH: /\bpH\s*(?:is|=|:)?\s*(\d+(?:\.\d+)?)/gi, paCO2: /\bPaCO2\s*(?:is|=|:)?\s*(\d+(?:\.\d+)?)/gi, hco3: /\bHCO3\s*(?:is|=|:)?\s*(\d+(?:\.\d+)?)/gi };
  const captures = Object.fromEntries(Object.entries(patterns).map(([key, re]) => [key, [...question.matchAll(re)]]));
  if (Object.values(captures).some(x => x.length > 1) || /\b(?:previous|earlier|baseline|current)\b.*(?:->|→)/i.test(question)) return { status: 'ambiguous_or_multiple_samples', sourceId: 'merck-acid-base' };
  if (Object.values(captures).some(x => !x.length)) return { status: 'no_complete_labelled_gas', sourceId: 'merck-acid-base' };
  const co2Match = captures.paCO2[0], bicarbMatch = captures.hco3[0];
  const co2Unit = question.slice(co2Match.index + co2Match[0].length).match(/^\s*(mm\s*Hg|kPa)\b/i)?.[1];
  const hco3Unit = question.slice(bicarbMatch.index + bicarbMatch[0].length).match(/^\s*(mmol\s*\/\s*L|mEq\s*\/\s*L)\b/i)?.[1];
  if (!co2Unit || !hco3Unit) return { status: 'units_required', sourceId: 'merck-acid-base' };
  if (!/^mm\s*Hg$/i.test(co2Unit) || !/\bABG\b|\barterial\b/i.test(question)) return { status: 'sample_or_units_outside_calculator', sourceId: 'merck-acid-base' };
  return calculateAcidBase(Object.fromEntries(Object.entries(captures).map(([k,v]) => [k, Number(v[0][1])])));
}
module.exports = { calculateAcidBase, acidBaseContext };
