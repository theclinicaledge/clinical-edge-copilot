const { retrieveEvidence } = require('./ask-evidence');
const overview = {
  id: 'merck-ventricular-filling', domain: 'lvedp', title: 'Overview of Heart Failure',
  publisher: 'Merck Manual Professional Edition',
  url: 'https://www.merckmanuals.com/professional/cardiovascular-disorders/heart-failure/overview-of-heart-failure',
  updated: 'Feb 2026', version: 'v103601998', publication: null, accessed: '2026-10-12',
  locator: 'Cardiovascular Physiology; Heart failure with preserved ejection fraction', excerpts: [],
  facts: {
    EFIsFractionOfEndDiastolicVolumeEjected: true,
    PreservedEFDoesNotEstablishNormalDiastolicFilling: true,
    PreloadInvolvesEndDiastolicFiberStretchNotPressureAlone: true,
    ImpairedFillingCanRaiseLVEDPWithPreservedEF: true,
    ImpairedRelaxationAndIncreasedStiffnessAreDifferentFillingMechanisms: true,
    AcuteIschemiaCanImpairDiastolicFunction: true,
    HypertrophyAndAgingCanContributeToDiastolicDysfunction: true,
    ClinicalSyndromeNotEstablishedByPressureAndEFAlone: true,
  },
  factProvenance: 'Own concise paraphrases of the named sections; no dosing, thresholds or treatment included. References checked by engineering, not qualified approval of this prototype.',
};
const COVERAGE = Object.freeze({
  id: 'general-nursing-education-v1', reviewStatus: 'pending_qualified_review',
  allowed: 'Nursing education across specialties and ages for students, new graduates and nurses: physiology, mechanisms, comparisons and natural educational follow-ups. Curated sources are optional; explanations without them must be marked not independently source-verified. Nonurgent reported context may be discussed only as disclosed general education, never an individual determination.',
  excluded: 'Individualized diagnosis/treatment selection, dosing/titration, medication/device choices, active time-critical situations, non-nursing requests, and protocol/regimen-specific treatment thresholds without applicable verified evidence.',
  evidencePolicy: 'Optional reference support is not a topic allowlist. General educational knowledge may proceed without it and must be explicitly marked not independently source-verified.',
});
const accessed = '2026-10-12';
function source(id, domain, title, publisher, url, locator, facts, updated = null) {
  return {id,domain,title,publisher,url,locator,facts,updated,accessed,excerpts:[],
    factProvenance:'Own bounded factual paraphrases of the identified source sections; engineering checked, pending qualified review. No dosing, treatment steps, thresholds or images copied.'};
}
const SOURCES = [
  source('merck-ventilation','respiratory','Ventilatory Failure','Merck Manual Professional Edition',
    'https://www.merckmanuals.com/professional/critical-care-medicine/respiratory-failure-and-mechanical-ventilation/ventilatory-failure',
    'Pathophysiology; Symptoms and Signs', {
      CO2EliminationDependsOnAlveolarVentilationRelativeToCO2Production:true,
      MinuteVentilationAndDeadSpaceAffectAlveolarVentilation:true,
      RespiratoryRateAloneDoesNotDescribeEffectiveVentilation:true,
      DriveMuscleStrengthAndRespiratoryLoadAreDistinctFactors:true,
      HypercapniaCanAffectConsciousnessButDoesNotEstablishAnIndividualCause:true,
    },'Jun 2026'),
  source('apsf-oxygen-ventilation','respiratory','Monitoring for Opioid-Induced Respiratory Depression','Anesthesia Patient Safety Foundation',
    'https://www.apsf.org/article/monitoring-for-opioid-induced-respiratory-depression/',
    'How Should Patients Be Monitored; monitoring limitations', {
      PulseOximetryMeasuresOxygenSaturationNotCO2Elimination:true,
      SupplementalOxygenCanDelayDetectionOfDepressedVentilation:true,
      CapnographyShowsExhaledCO2AndRespiratoryCyclingWithSamplingLimitations:true,
      MultipleMonitoringParametersProvideDifferentInformation:true,
      OpioidExposureIsNotAssumedFromAnEducationalQuestion:true,
    },'2017'),
  source('dailymed-norepinephrine','medication','Norepinephrine Bitartrate injection, solution','DailyMed / Baxter prescribing information',
    'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=6363e9b4-29df-4553-904d-a563e5adda6e',
    '12.1 Mechanism of Action; 12.2 Pharmacodynamics; 5.1 Tissue Ischemia', {
      AlphaAdrenergicVasoconstrictionAndBetaAdrenergicCardiacStimulation:true,
      PeripheralResistanceAndBloodPressureCanIncrease:true,
      CardiacOutputIsNotGuaranteedToIncreaseAndCanDecrease:true,
      NormalBloodPressureDoesNotByItselfEstablishAdequateTissueBloodFlow:true,
      VasoconstrictionCanReduceOrganBloodFlowEspeciallyWithHypovolemia:true,
      NoIndividualTreatmentSelectionOrAdjustmentSupported:true,
    },'Feb 2026'),
  source('merck-pvc','ecg','Ventricular Premature Beats (VPB)','Merck Manual Professional Edition',
    'https://www.merckmanuals.com/professional/cardiovascular-disorders/specific-cardiac-arrhythmias/ventricular-premature-beats-vpb',
    'Definition; Diagnosis', {
      PrematureVentricularImpulsesMayAriseFromReentryOrAbnormalAutomaticity:true,
      TypicalECGHasWideQRSWithoutPrecedingPWave:true,
      CompensatoryPauseIsTypicalNotUniversal:true,
      SignificanceDependsOnSymptomsAndUnderlyingHeartContext:true,
      AReportedPalpitationDoesNotEstablishPVCOrItsCause:true,
    },'Sept 2024'),
];
function fillingEvidence() {
  const pack = retrieveEvidence('Explain LVEDP.');
  return { ...pack, registryVersion: 'private-filling-education-v1', sources: [...pack.sources, overview] };
}
function evidenceInventory() {
  return [...fillingEvidence().sources,...SOURCES].map(({id,domain,title,locator,facts})=>({id,domain,title,locator,facts}));
}
function educationalEvidence(ids) {
  if(ids === undefined)return fillingEvidence();
  if(!Array.isArray(ids)||ids.length<1||ids.length>4||new Set(ids).size!==ids.length)return null;
  const all=[...fillingEvidence().sources,...SOURCES];
  if(ids.some(id=>!all.some(s=>s.id===id)))return null;
  const sources=ids.map(id=>all.find(s=>s.id===id));
  return {registryVersion:'adult-nursing-evidence-v1',domains:[...new Set(sources.map(s=>s.domain))],sources,
    coverage:'concepts',deviceScope:null,calculations:null};
}
module.exports = { COVERAGE, educationalEvidence, evidenceInventory };
