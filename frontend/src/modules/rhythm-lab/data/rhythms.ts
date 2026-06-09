export type UrgencyLevel = 'stable' | 'monitor' | 'urgent' | 'critical';

export interface BreakdownRow {
  finding: string;
  whyItMatters: string;
}

export interface RecognitionBreakdown {
  rate: BreakdownRow;
  regularity: BreakdownRow;
  pWaves: BreakdownRow;
  prRelationship: BreakdownRow;
  qrsWidth: BreakdownRow;
  firstClue: string;
}

export interface Rhythm {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  rate: string;
  regularity: string;
  pWave: string;
  qrs: string;
  recognitionCues: string[];
  nursesNotice: string;
  confusedWith: string;
  bedsideRelevance: string;
  whenMoreUrgent: string;
  urgency: UrgencyLevel;
  urgencyLabel: string;
  breakdown?: RecognitionBreakdown;
}

export const RHYTHMS: Rhythm[] = [
  {
    id: "nsr",
    name: "Normal Sinus Rhythm",
    shortName: "NSR",
    tagline: "One P before every QRS, right on time — the baseline you compare everything else to.",
    rate: "60–100 bpm",
    regularity: "Regular — RR intervals are consistent throughout",
    pWave: "Upright, uniform, one before every QRS complex",
    qrs: "Narrow (< 0.12 sec), consistent morphology beat to beat",
    recognitionCues: [
      "Upright P wave before every QRS — one to one, no exceptions",
      "Beat-to-beat spacing is regular enough to tap out steadily",
      "Rate between 60 and 100",
      "Narrow QRS with the same morphology every beat",
    ],
    nursesNotice:
      "The strip is repetitive in the best way — same P wave, same QRS, same spacing, over and over. It reads as calm and organized. NSR is the rhythm you use to confirm everything looks right before you move on.",
    confusedWith:
      "Sinus arrhythmia: the RR intervals vary slightly with the breathing cycle, but the P-wave morphology and PR interval are both normal. NSR stays perfectly regular; sinus arrhythmia has a gentle, cyclical wobble in the spacing that speeds up on inspiration and slows on expiration.",
    bedsideRelevance:
      "NSR is the reference. Every time you see a new rhythm, you are quietly comparing it to what normal sinus looks like on that patient. A shift away from NSR — even to a mild variant — is worth noting and trending. The strip that was NSR at 8 AM and is something else at 10 AM is a data point.",
    whenMoreUrgent:
      "NSR itself is not an urgent finding. What matters is a change away from it. A patient who converts from NSR to any new rhythm warrants documentation, comparison to prior strips, and a clinical reassessment.",
    urgency: "stable",
    urgencyLabel: "Stable",
    breakdown: {
      rate: {
        finding: "60–100 bpm",
        whyItMatters: "Within normal range — confirms the sinus node is driving the heart at a sustainable rate without strain.",
      },
      regularity: {
        finding: "Regular throughout — RR intervals are consistent",
        whyItMatters: "Consistent spacing confirms the sinus node is pacing steadily. Any irregularity changes the diagnosis.",
      },
      pWaves: {
        finding: "Upright, uniform — one before every QRS complex",
        whyItMatters: "Same morphology every beat confirms all impulses originate from the sinus node. A different-looking P wave would point to an ectopic source.",
      },
      prRelationship: {
        finding: "Constant, 0.12–0.20 sec — every beat",
        whyItMatters: "Normal AV conduction. Each atrial impulse reaches the ventricle after the same delay — no block, no shortcut, no variability.",
      },
      qrsWidth: {
        finding: "Narrow (< 0.12 sec) — consistent morphology",
        whyItMatters: "Normal ventricular activation through the His-Purkinje system. A wide QRS here would demand explanation.",
      },
      firstClue: "The strip looks the same from left to right — same P, same QRS, same spacing, every beat. That repetition is the recognition.",
    },
  },
  {
    id: "sinus_bradycardia",
    name: "Sinus Bradycardia",
    shortName: "Brady",
    tagline: "Often tolerated if perfusing well — context matters more than the number.",
    rate: "< 60 bpm",
    regularity: "Regular — RR intervals are wide but consistent",
    pWave: "Upright, uniform, one before every QRS complex",
    qrs: "Narrow (< 0.12 sec), normal morphology",
    recognitionCues: [
      "Rate below 60 — noticeably wider gaps between beats",
      "Morphology identical to NSR: P wave, QRS, T wave all present and normal",
      "Consistent PR interval beat to beat",
      "Long flat TP segment — more isoelectric line visible than usual",
    ],
    nursesNotice:
      "The strip looks like NSR but stretched out. There is more flat baseline between each complex than you expect. The shape of each beat is completely normal — nothing is wrong with the morphology. Only the rate is slow.",
    confusedWith:
      "Second- or third-degree heart block: both can produce a slow ventricular rate, but the P-wave-to-QRS relationship is abnormal — PRs that progressively lengthen, P waves that fail to conduct, or P waves and QRS complexes running completely independently. In sinus bradycardia, every P is followed by a QRS with a consistent and normal PR interval.",
    bedsideRelevance:
      "A rate below 60 is not automatically a problem. Athletes and well-conditioned patients often live here and tolerate it without symptoms. What matters is whether the patient is maintaining adequate perfusion at that rate — and only an assessment tells you that. The number on the monitor is context, not a verdict.",
    whenMoreUrgent:
      "A slow rate that is chronic and asymptomatic is different from one that is new, dropping, or paired with symptoms. Dizziness, hypotension, near-syncope, chest discomfort, or altered mentation alongside bradycardia changes the clinical picture and the timeline for escalation significantly.",
    urgency: "monitor",
    urgencyLabel: "Monitor",
  },
  {
    id: "sinus_tachycardia",
    name: "Sinus Tachycardia",
    shortName: "S-Tachy",
    tagline: "Usually a response to something else — pain, fever, volume, anxiety, hypoxia.",
    rate: "> 100 bpm",
    regularity: "Regular — RR intervals are short but consistent",
    pWave: "Upright, uniform, one before every QRS — may merge into the preceding T wave at higher rates",
    qrs: "Narrow (< 0.12 sec), normal morphology",
    recognitionCues: [
      "Rate above 100 — complexes are tightly packed on the strip",
      "P wave before each QRS, though it may hide at the tail of the preceding T wave",
      "Consistent RR intervals — still regular, just fast",
      "Narrow QRS with normal morphology — same shape as NSR",
    ],
    nursesNotice:
      "The strip looks like NSR running fast — same morphology, shorter spacing. Above 130 bpm, the P wave can get swallowed by the preceding T wave and takes some searching to find. The regularity and narrow QRS are the reassuring features that point toward sinus origin.",
    confusedWith:
      "SVT (supraventricular tachycardia): also fast and narrow, but rates typically exceed 150 and the onset is abrupt — patients often describe it as starting suddenly. Sinus tachycardia typically ramps up gradually and there is usually an identifiable cause. Retrograde, absent, or buried P waves push toward SVT.",
    bedsideRelevance:
      "The rate is rarely the problem — sinus tachycardia is almost always a physiological response to something else. Pain, fever, anxiety, dehydration, bleeding, hypoxia, and medication effects are common drivers. Treating the rate without finding the cause delays the right intervention. This is the rhythm where the clinical question is not \"what is the rhythm?\" but \"what is the body reacting to?\"",
    whenMoreUrgent:
      "Persistent tachycardia without an identifiable cause, or a rate that continues to rise despite treatment of a presumed cause, warrants escalation. Tachycardia in the setting of low blood pressure, poor perfusion, or altered mental status changes the urgency regardless of where the rhythm originates.",
    urgency: "monitor",
    urgencyLabel: "Monitor",
  },
  {
    id: "afib",
    name: "Atrial Fibrillation",
    shortName: "A-Fib",
    tagline: "Irregularly irregular with no organized P waves — you cannot tap along with this rhythm.",
    rate: "Ventricular: 60–150 bpm — variable and unpredictable",
    regularity: "Irregularly irregular — no two RR intervals are the same",
    pWave: "Absent — replaced by chaotic fibrillatory baseline (f-waves)",
    qrs: "Narrow (< 0.12 sec) unless aberrant conduction is also present",
    recognitionCues: [
      "Irregularly irregular rhythm — no two RR intervals are the same",
      "No identifiable P waves anywhere on the strip",
      "Fine, chaotic fibrillatory baseline between QRS complexes",
      "Narrow QRS unless aberrant conduction is also present",
    ],
    nursesNotice:
      "You cannot tap along with this rhythm — there is no pattern to lock onto. The baseline between complexes is not flat; it has a fine, chaotic shimmer. The beats arrive unpredictably, and that unpredictability is itself the hallmark. If you try to call the next beat and cannot, you are probably looking at A-Fib.",
    confusedWith:
      "Multifocal atrial tachycardia (MAT): also irregular, but MAT has clearly visible P waves in three or more different shapes. If you can identify distinct P waves anywhere on the strip, it is not A-Fib. A-Fib has no organized atrial activity — only the fine chaotic baseline.",
    bedsideRelevance:
      "A-Fib is one of the most common sustained arrhythmias you will see on a cardiac monitor. Two things drive the bedside response: whether this is new or chronic, and how fast the ventricular rate is. A rate-controlled A-Fib in a patient with a known history is a very different clinical situation from new-onset A-Fib at 140. The loss of organized atrial contraction reduces cardiac output and carries a stroke risk that providers will want to factor into their plan.",
    whenMoreUrgent:
      "New-onset A-Fib, a ventricular rate above the patient's baseline that is not responding to their usual medications, hemodynamic compromise, or any change in clinical status warrants prompt provider notification. Duration matters — providers will want to know when the rhythm started or when the patient was last confirmed in normal sinus.",
    urgency: "urgent",
    urgencyLabel: "Urgent",
    breakdown: {
      rate: {
        finding: "Variable — ventricular response typically 60–150 bpm",
        whyItMatters: "No reliable sinus rate. The ventricle responds to whatever fibrillatory signals the AV node allows through. Rate can change minute to minute.",
      },
      regularity: {
        finding: "Irregularly irregular — no pattern to the spacing",
        whyItMatters: "No two RR intervals are the same. This is the hallmark. If you can predict the next beat, you are probably not looking at A-Fib.",
      },
      pWaves: {
        finding: "Absent — replaced by fine fibrillatory baseline (f-waves)",
        whyItMatters: "The atria are quivering, not contracting. No organized P waves exist — only a fine chaotic shimmer between QRS complexes. No P wave anywhere means no organized atrial activity.",
      },
      prRelationship: {
        finding: "No measurable PR interval",
        whyItMatters: "Without organized atrial activity there is no P-to-QRS relationship to measure. QRS complexes arrive based on how the AV node filters random fibrillatory signals.",
      },
      qrsWidth: {
        finding: "Narrow (< 0.12 sec) unless aberrant conduction coexists",
        whyItMatters: "The problem is at the atrial level, not ventricular. Once an impulse filters through the AV node, the ventricles activate normally.",
      },
      firstClue: "No P waves anywhere on the strip and completely unpredictable spacing. If you cannot find a P wave and cannot predict the next beat, A-Fib is the leading diagnosis.",
    },
  },
  {
    id: "aflutter",
    name: "Atrial Flutter",
    shortName: "Flutter",
    tagline: "Regular rate near 150? Look hard for hidden flutter waves — the sawtooth never stops.",
    rate: "Atrial: ~300 bpm · Ventricular: 75–150 bpm (depends on conduction ratio)",
    regularity: "Regular ventricular response when the conduction ratio is fixed",
    pWave: "Sawtooth flutter waves (F-waves) at ~300/min — no true P waves. Most visible in leads II, III, aVF.",
    qrs: "Narrow (< 0.12 sec) unless aberrant conduction is present",
    recognitionCues: [
      "Continuous sawtooth baseline — the flat line between beats disappears",
      "Flutter waves (F-waves) at approximately 300/min, regular and identical",
      "QRS appears at a fixed ratio to the flutter waves — 2:1, 3:1, or 4:1 most common",
      "Narrow QRS unless aberrant conduction is also present",
    ],
    nursesNotice:
      "The flat baseline disappears — replaced by a continuous up-and-down sawtooth that never stops, even behind the QRS complexes. The complexes seem to emerge from the wave pattern at a fixed interval. If you see a ventricular rate sitting at exactly 150, think flutter at 2:1 until the strip proves otherwise.",
    confusedWith:
      "A-Fib: also lacks organized P waves but has an irregular ventricular response and a chaotic rather than organized baseline. At 2:1 conduction near 150 bpm, flutter can look like a straightforward tachycardia — the sawtooth hides behind the QRS and T waves and takes deliberate searching to find. Slowing AV conduction unmasks the F-waves and makes the diagnosis clear.",
    bedsideRelevance:
      "The ventricular rate depends entirely on how many flutter waves conduct through the AV node. At 2:1 conduction the rate runs near 150 — fast enough to reduce cardiac output in many patients. At 4:1 the rate is around 75 and patients may be comfortable. The ratio can shift abruptly, causing a sudden jump in ventricular rate without warning. A patient who looks stable in 4:1 flutter can deteriorate quickly if conduction changes to 2:1.",
    whenMoreUrgent:
      "A ventricular rate near 150 without a clear explanation should prompt a closer look for flutter waves. Hemodynamic compromise, a sudden rate change, or new-onset flutter with any symptoms warrants prompt escalation. The comfortable-looking patient in slow flutter can change status faster than most rhythms.",
    urgency: "urgent",
    urgencyLabel: "Urgent",
  },
  {
    id: "pac",
    name: "Premature Atrial Contraction",
    shortName: "PAC",
    tagline: "An early beat with a different-looking P wave — narrow QRS confirms atrial, not ventricular, origin.",
    rate: "Underlying sinus rate — usually 60–100 bpm",
    regularity: "Predominantly regular with one or more early beats interrupting the pattern",
    pWave: "Early P wave with different morphology — may be smaller, taller, biphasic, or inverted. Normal P waves on all other beats.",
    qrs: "Narrow (< 0.12 sec) on the PAC beat — the impulse conducts normally through the ventricles",
    recognitionCues: [
      "One beat arrives earlier than expected — interrupts an otherwise regular rhythm",
      "The early beat has a P wave, but it looks different from the surrounding sinus P waves",
      "The QRS of the early beat is narrow — same width and morphology as the other beats",
      "Non-compensatory pause follows — the next beat returns sooner than a PVC pause would",
    ],
    nursesNotice:
      "The strip looks regular, then one beat arrives early. Look closely before that early QRS and you will find a P wave — but it looks a little different from the others. The QRS is the same shape as everything else on the strip. After the PAC, the rhythm picks back up without the long pause you would see after a PVC.",
    confusedWith:
      "PVCs: both are early beats, but a PVC has a wide, bizarre QRS and no P wave before it. A PAC has a narrow QRS and a differently shaped P wave. If you see an early beat with a narrow QRS, look for that P wave before calling it anything else. The P wave morphology and the QRS width together separate the two.",
    bedsideRelevance:
      "PACs are common and usually incidental. Many patients have them without any symptoms, and they are more frequent with caffeine, stress, dehydration, or electrolyte shifts. On the monitor they appear as single early beats in an otherwise regular rhythm. Occasional PACs in a stable patient are typically a documentation finding, not an intervention finding.",
    whenMoreUrgent:
      "Frequent PACs — several per minute or short runs — can trigger supraventricular tachycardia in susceptible patients. A patient with new, frequent PACs and symptoms such as palpitations, lightheadedness, or chest discomfort warrants provider notification. Electrolyte levels, particularly potassium and magnesium, are worth reviewing when PACs increase.",
    urgency: "stable",
    urgencyLabel: "Stable",
  },
  {
    id: "pvc",
    name: "Premature Ventricular Contraction",
    shortName: "PVC",
    tagline: "Early wide beat interrupting the underlying rhythm — no P wave before it, long pause after it.",
    rate: "Underlying sinus rate — usually 60–100 bpm",
    regularity: "Predominantly regular with one or more early wide beats interrupting the pattern",
    pWave: "No P wave before the PVC — the ventricle fires independently. Normal P waves present on all surrounding sinus beats.",
    qrs: "Wide (>= 0.12 sec) and bizarre on the PVC beat — visually distinct from every surrounding beat. Narrow on all other beats.",
    recognitionCues: [
      "One beat arrives early with a wide, bizarre QRS — nothing about it looks like the surrounding beats",
      "No P wave precedes the wide beat — the ventricle fired without a sinus signal",
      "Full compensatory pause follows — the next beat arrives later than a PAC pause would",
      "The beat after the pause looks completely normal — underlying rhythm resumes unchanged",
    ],
    nursesNotice:
      "You see one beat that looks fundamentally wrong — wide, differently shaped, and visually striking compared to everything else on the strip. No P wave before it. After the PVC, there is a noticeably long pause before the next normal beat returns. If you can feel a pulse, PVCs often produce a weak or absent peripheral pulse on that beat because the ventricle fires before it has filled adequately.",
    confusedWith:
      "PACs with aberrant conduction: an early beat with a wide QRS is almost always a PVC, but occasionally a PAC conducts with bundle branch block and looks wide. The key distinction is the P wave — PVCs have none before the wide beat. If you see any kind of P wave, even a differently shaped one, before an early wide beat, think PAC with aberrancy rather than PVC. The presence or absence of a P wave is the deciding feature.",
    bedsideRelevance:
      "Isolated PVCs are extremely common and many patients have them with no structural cause. They are more frequent with electrolyte disturbances (especially low potassium and magnesium), hypoxia, stress, and certain medications. On the monitor they are visually striking. In an otherwise stable patient with occasional PVCs and no symptoms, the usual response is documentation and electrolyte review.",
    whenMoreUrgent:
      "Frequent PVCs — more than 6 per minute, couplets (two in a row), or triplets — warrant provider notification and electrolyte assessment. R-on-T phenomenon, where a PVC falls on the T wave of the preceding beat, carries a higher risk of triggering ventricular fibrillation and should be reported promptly. Any patient with symptoms during PVCs — palpitations, presyncope, chest discomfort, or hemodynamic changes — changes the urgency regardless of how often the PVCs occur.",
    urgency: "monitor",
    urgencyLabel: "Monitor",
  },
  {
    id: "junctional_rhythm",
    name: "Junctional Rhythm",
    shortName: "Jxn",
    tagline: "The AV node takes over when the sinus node slows — organized and narrow, but at a rate the body did not choose.",
    rate: "40–60 bpm",
    regularity: "Regular — RR intervals are consistent and steady",
    pWave: "No upright P wave before the QRS — absent, inverted in the ST segment, or buried within the QRS complex",
    qrs: "Narrow (< 0.12 sec) — ventricular conduction is normal once the junctional impulse fires",
    recognitionCues: [
      "Rate between 40 and 60 — noticeably slow, organized spacing",
      "No upright P wave before the QRS — absent, retrograde, or hidden inside the complex",
      "Narrow QRS — same morphology beat to beat, normal ventricular conduction",
      "Inverted P wave may appear just after the QRS in the ST segment (retrograde P)",
    ],
    nursesNotice:
      "The strip looks organized — regular spacing, narrow QRS — but there is no visible upright P wave where you expect one. The rate sits between 40 and 60, and the rhythm is completely regular. If a P wave appears at all, it is inverted and sits just after the QRS in the ST segment, or it is hidden inside the complex itself. The uniformity of the strip is almost reassuring until you realize the sinus node is not in charge.",
    confusedWith:
      "Sinus bradycardia: also slow and regular with a narrow QRS, but sinus bradycardia has a normal upright P wave before every QRS with a consistent PR interval. The absence of an upright P wave before the QRS — or the presence of an inverted P wave in the ST segment — is the finding that points to junctional origin. If you can find a normal-looking upright P before each QRS with a consistent PR, it is sinus, not junctional.",
    bedsideRelevance:
      "A junctional rhythm means the heart is relying on the AV node rather than the sinus node to pace the rate. The sinus node may have slowed due to medication effects (beta-blockers, calcium channel blockers, digoxin), increased vagal tone, inferior MI, or sinus node dysfunction. Whether the patient is tolerating this rate depends entirely on their clinical condition — some patients maintain adequate perfusion at 45 bpm; others do not. The strip cannot answer that question. Only a bedside assessment can.",
    whenMoreUrgent:
      "A junctional rhythm with any hemodynamic consequence — hypotension, altered mentation, dizziness, diaphoresis, chest discomfort — warrants prompt provider notification. A new junctional rhythm in the context of acute inferior MI, recent medication changes, or progressive rate slowing should be escalated regardless of current symptoms. Junctional rhythm replacing previously normal sinus rhythm is a pacemaker shift that providers need to know about, even when the patient appears comfortable.",
    urgency: "monitor",
    urgencyLabel: "Monitor",
  },
  {
    id: "accelerated_junctional",
    name: "Accelerated Junctional Rhythm",
    shortName: "Accel Jxn",
    tagline: "Near-normal rate, junctional origin — the rate looks fine, but the missing upright P reveals who is driving.",
    rate: "60–100 bpm",
    regularity: "Regular — perfectly steady beat-to-beat spacing",
    pWave: "No upright P wave before the QRS — absent, retrograde, or inverted in the ST segment",
    qrs: "Narrow (< 0.12 sec) — normal ventricular conduction",
    recognitionCues: [
      "Rate 60–100 bpm — appears nearly normal on first glance",
      "No upright P wave before the QRS — absent, inverted, or retrograde",
      "Narrow QRS — identical morphology every beat",
      "Perfectly regular rhythm — nothing irregular anywhere on the strip",
    ],
    nursesNotice:
      "The rhythm looks regular and the rate is between 60 and 100 — nothing alarming at first. The QRS is narrow. But there is no upright P wave before each QRS, and that absence is what separates this from normal sinus. It is easy to overlook because the rate does not trigger an alarm and the QRS looks completely normal. Careful P-wave inspection is what identifies it. If a P wave is visible at all, it is inverted — often sitting just after the QRS in the ST segment.",
    confusedWith:
      "Normal sinus rhythm: the rate, regularity, and QRS width can all be identical. The distinction is the P wave. In NSR, a normal upright P precedes every QRS with a consistent PR interval. In accelerated junctional rhythm, the P wave is absent, inverted, or retrograde — never a normal upright P before the QRS. If you measure a very short PR under 0.12 seconds with an inverted P, or find no visible P at all before the QRS, the rhythm is junctional.",
    bedsideRelevance:
      "Accelerated junctional rhythm occurs when the AV node fires faster than its inherent escape rate but still within the normal sinus range. Common causes include digoxin toxicity, inferior MI, post-cardiac catheterization or surgery, and electrolyte disturbances — particularly hypokalemia and hypomagnesemia. Because the rate appears normal, patients are often asymptomatic and may not feel any different. The clinical concern is not the rate itself but what is causing the AV node to accelerate and whether that underlying process needs attention.",
    whenMoreUrgent:
      "Any accelerated junctional rhythm in the context of digoxin use warrants provider notification and digoxin level review — this is a recognized early sign of toxicity. New accelerated junctional rhythm in the setting of an acute inferior MI requires escalation. A rhythm that was previously normal sinus and has become junctional, even at a normal rate, represents a change in dominant pacemaker that providers need to know about regardless of how the patient currently looks.",
    urgency: "monitor",
    urgencyLabel: "Monitor",
  },
  {
    id: "junctional_tachycardia",
    name: "Junctional Tachycardia",
    shortName: "Jxn Tachy",
    tagline: "The AV node firing faster than it should — narrow-complex tachycardia without a normal P wave.",
    rate: "> 100 bpm — typically 100–130 bpm",
    regularity: "Regular — consistent RR intervals throughout",
    pWave: "No upright P wave before the QRS — absent or retrograde/inverted after the QRS",
    qrs: "Narrow (< 0.12 sec) — identical morphology beat to beat",
    recognitionCues: [
      "Rate typically 100–130 bpm — regular and clearly fast",
      "No upright P wave before the QRS — absent or retrograde after it",
      "Narrow QRS — same shape every beat, normal ventricular conduction",
      "Rate typically slower than classic SVT — usually below 140 bpm",
    ],
    nursesNotice:
      "The strip shows a fast, regular, narrow-complex tachycardia running between 100 and 130 beats per minute. There is no upright P wave before each QRS. The rhythm looks organized — fast but not chaotic. If a P wave is visible, it is inverted and sits just after the QRS or is merged into the T wave. The rate is faster than the accelerated junctional rhythm but usually distinctly slower than the classic rates seen in SVT.",
    confusedWith:
      "SVT (AVNRT or AVRT): both show fast, regular, narrow-complex tachycardia without a visible upright P wave before each QRS. The rate often separates them — junctional tachycardia typically runs 100–130 bpm, while SVT more commonly runs 150–250. Junctional tachycardia is also less likely to start and stop abruptly in the paroxysmal way that SVT classically does. Sinus tachycardia: also fast and narrow, but sinus tachycardia always shows a clear upright P wave before every QRS. No upright P before each QRS makes sinus origin unlikely.",
    bedsideRelevance:
      "Junctional tachycardia at rates above 100 bpm is less common than junctional or accelerated junctional rhythm and often indicates a more significant underlying process. Causes include digoxin toxicity, acute inferior or right ventricular MI, post-cardiac surgery state, and electrolyte disturbances. Patients may tolerate rates of 100–110 bpm if their underlying cardiac function is intact, but rates above 120 can begin to compromise cardiac output — particularly if the loss of organized atrial contraction reduces ventricular filling.",
    whenMoreUrgent:
      "Junctional tachycardia above 120 bpm with any sign of hemodynamic compromise — hypotension, chest pain, altered mentation, diaphoresis — warrants immediate provider notification. If digoxin toxicity is suspected, this rhythm is an urgent finding. New junctional tachycardia in a post-operative cardiac patient or in the setting of an acute MI should be escalated promptly. Do not wait for hemodynamics to deteriorate before notifying the provider if the clinical picture is already concerning.",
    urgency: "urgent",
    urgencyLabel: "Urgent",
  },
  {
    id: "svt",
    name: "Supraventricular Tachycardia",
    shortName: "SVT",
    tagline: "A sudden, fast, narrow-complex tachycardia that starts and stops abruptly — the onset is as diagnostic as the strip.",
    rate: "150–250 bpm — most commonly 160–200 bpm",
    regularity: "Regular — RR intervals are strikingly consistent, beat to beat",
    pWave: "Absent, retrograde, or buried in the QRS or preceding T wave — no distinct upright P wave visible before each QRS",
    qrs: "Narrow (< 0.12 sec) unless aberrant conduction is also present — identical morphology beat to beat",
    recognitionCues: [
      "Very fast rate — typically 160–200 bpm, complexes are tightly packed",
      "Mechanically regular — the RR spacing is nearly identical throughout the strip",
      "Narrow QRS — same shape beat to beat, no wide bizarre complexes",
      "No identifiable upright P wave before each QRS — P absent, retrograde, or hidden in T wave",
    ],
    nursesNotice:
      "The strip looks like sinus rhythm running extremely fast — narrow identical complexes packed tightly together. What separates SVT from sinus tachycardia is the rate (typically above 150), the absence of a visible upright P wave before each QRS, and the abrupt onset patients often describe as starting like a switch being flipped. The regularity is mechanical. There is no visible P wave to find before each beat.",
    confusedWith:
      "Sinus tachycardia: also fast and narrow, but sinus tachy usually runs 100–150, has visible upright P waves before every QRS, and ramps up gradually with a physiological cause. SVT typically starts suddenly, runs above 150, and lacks identifiable P waves. VT with aberrant conduction is the dangerous alternative — any wide-complex tachycardia at this rate is treated as VT until definitively proven otherwise.",
    bedsideRelevance:
      "SVT can start and stop spontaneously. Patients often feel a sudden onset of palpitations, chest tightness, or lightheadedness. The strip pattern is striking in its regularity and speed. The clinical question is whether the patient is tolerating the rate hemodynamically — blood pressure, mentation, and perfusion signs tell you that, not the strip alone. The duration of the episode and the patient's symptoms guide the urgency of response.",
    whenMoreUrgent:
      "Hemodynamic compromise during SVT — hypotension, altered mentation, chest pain, or signs of poor perfusion — requires immediate provider notification regardless of rate. Persistent SVT that does not terminate spontaneously is not a rhythm to observe and wait on. Even a hemodynamically stable patient in sustained SVT needs assessment and a provider-directed plan.",
    urgency: "urgent",
    urgencyLabel: "Urgent",
  },
  {
    id: "first_degree_avb",
    name: "First-Degree AV Block",
    shortName: "1° AVB",
    tagline: "Every P conducts, but slowly — the PR interval is prolonged and constant, and no beats are dropped.",
    rate: "Underlying sinus rate — usually 60–100 bpm",
    regularity: "Regular — RR intervals are consistent throughout, identical to NSR",
    pWave: "Upright, uniform, one before every QRS — all P waves conduct successfully",
    qrs: "Narrow (< 0.12 sec), normal morphology — ventricular conduction is normal once the impulse arrives",
    recognitionCues: [
      "Regular rhythm — looks like NSR at first glance",
      "Prolonged PR interval — the flat line between P wave and QRS is visibly longer than normal",
      "Every P wave is followed by a QRS — no dropped beats anywhere on the strip",
      "Constant PR — the same extended delay repeats identically beat to beat",
    ],
    nursesNotice:
      "The strip looks like normal sinus rhythm, but something is slightly off. The flat line between the P wave and the QRS is too long — wider than you expect. Once you see it, you will see it every beat. Every P wave connects to a QRS, and the delay is the same each time. Nothing is dropped. The rate and QRS morphology are completely normal.",
    confusedWith:
      "Second-degree AV block: also involves prolonged PR intervals, but second-degree produces dropped beats — a P wave that is not followed by a QRS. In first-degree AVB, every single P wave conducts to a QRS without exception. If you find even one P wave anywhere on the strip that is not followed by a QRS, it is not first-degree. The rule is simple: every P gets a QRS, every time.",
    bedsideRelevance:
      "First-degree AV block is common, usually asymptomatic, and frequently an incidental finding. It can appear with increased vagal tone, medications that slow AV conduction (beta-blockers, calcium channel blockers, digoxin), electrolyte disturbances, or underlying structural disease. The rhythm itself causes no hemodynamic compromise — the underlying sinus rate is maintained and every impulse conducts. It is a documentation finding, not an intervention finding.",
    whenMoreUrgent:
      "First-degree AVB alone rarely warrants immediate action. What matters is change — a PR interval that is progressively lengthening on serial strips, or first-degree AVB appearing in the context of an acute inferior MI where higher-degree block can evolve. New first-degree AVB after a medication change is worth reviewing with the provider. A single stable PR prolongation in an otherwise asymptomatic patient is typically monitored and documented.",
    urgency: "stable",
    urgencyLabel: "Stable",
  },
  {
    id: "mobitz_i",
    name: "Second-Degree AV Block — Mobitz I",
    shortName: "Wenckebach",
    tagline: "Progressive PR lengthening until one beat drops — then the pattern resets and repeats.",
    rate: "Atrial rate usually 60–100 bpm — ventricular rate slower due to dropped beats",
    regularity: "Grouped beating — repeating clusters with a pause after each dropped QRS. Ventricular rhythm is irregular overall.",
    pWave: "Regular P waves at a consistent atrial rate — but not every P conducts. The P that ends each group fires without producing a QRS.",
    qrs: "Narrow (< 0.12 sec) on all conducted beats — normal ventricular morphology when the impulse gets through",
    recognitionCues: [
      "PR interval progressively lengthens with each successive beat in the group",
      "A P wave occurs without a following QRS — the dropped beat ends each group",
      "After the dropped beat, the PR resets to its shortest value and the cycle repeats",
      "Grouped beating — irregular overall, but the same cluster-then-pause pattern repeats",
    ],
    nursesNotice:
      "You notice the rhythm is irregular, but there is a structure to it — beats arrive in groups with pauses between them. If you measure the PR intervals across consecutive beats, each one is longer than the last. Then comes a P wave with no QRS after it. Then the whole sequence starts again from a shorter PR. The repeating grouped footprint is the hallmark. Once you see the grouping, the progressive PR prolongation confirms Wenckebach.",
    confusedWith:
      "Mobitz II (Second-degree Type II): also drops QRS complexes, but the PR interval is constant before the dropped beat — no progressive lengthening. This distinction matters clinically because Mobitz II carries a much higher risk of progressing to complete heart block and requires a different response. When you see a dropped QRS, examine the PR intervals of the beats that preceded it. Lengthening PRs before the drop point to Wenckebach. A constant PR before the drop points to Mobitz II.",
    bedsideRelevance:
      "Wenckebach is the more common and generally less dangerous form of second-degree AV block. It is often seen with increased vagal tone, inferior MI, medication effects (beta-blockers, digoxin), or metabolic causes. The dropped beats reduce the ventricular rate, and perfusion depends on how slow that rate becomes. A patient in 4:3 Wenckebach at a ventricular rate in the 60s is a very different situation from the same pattern at a much slower rate.",
    whenMoreUrgent:
      "Symptomatic Wenckebach — dizziness, presyncope, hypotension, or signs of poor perfusion — warrants prompt provider notification. New-onset Wenckebach in the context of an inferior MI requires prompt evaluation because it can progress to higher-degree block. Any block that is worsening — longer dropped sequences or more frequent pauses — should be escalated. Asymptomatic Wenckebach with a clear reversible cause is monitored, but always with provider awareness.",
    urgency: "monitor",
    urgencyLabel: "Monitor",
    breakdown: {
      rate: {
        finding: "Atrial rate 60–100 bpm — ventricular rate slower due to dropped beats",
        whyItMatters: "The ventricular rate depends on how many beats conduct. More drops mean a slower effective rate and potentially compromised perfusion.",
      },
      regularity: {
        finding: "Grouped — irregular overall, repeating cluster-then-pause pattern",
        whyItMatters: "The grouping is the tell. An irregular rhythm with a repeating structure almost always points to second-degree AV block.",
      },
      pWaves: {
        finding: "Regular P-to-P intervals — not all P waves conduct to a QRS",
        whyItMatters: "The sinus node is working normally. The P wave that ends each group fires on time but produces no QRS — the AV node blocked it.",
      },
      prRelationship: {
        finding: "Progressively lengthens with each beat — then resets after the dropped QRS",
        whyItMatters: "This is the defining feature of Wenckebach. Each PR is longer than the last. The AV node tires with every conducted beat until it fails, then recovers and the cycle repeats.",
      },
      qrsWidth: {
        finding: "Narrow on all conducted beats",
        whyItMatters: "When the impulse does get through, the ventricles conduct normally. The block is at the AV node, not the bundle branches.",
      },
      firstClue: "Watch the PR intervals march out — each one longer than the last. Then a P wave appears with no QRS after it, and the whole sequence resets from a shorter PR.",
    },
  },
  {
    id: "mobitz_ii",
    name: "Second-Degree AV Block — Mobitz II",
    shortName: "Mobitz II",
    tagline: "Sudden QRS drops with no warning — the PR interval never changes before the block.",
    rate: "Atrial rate usually 60–100 bpm — ventricular rate slower due to dropped beats",
    regularity: "Regular P-to-P intervals — ventricular rhythm irregular due to sudden, unpredictable dropped beats",
    pWave: "Regular P waves at consistent intervals — some P waves block suddenly without any preceding warning",
    qrs: "Narrow (< 0.12 sec) on conducted beats unless bundle branch block coexists — often wide when block is infranodal",
    recognitionCues: [
      "PR interval is identical before every conducted beat — constant, no progressive lengthening",
      "One or more P waves occur without a following QRS — the drop is sudden with no warning",
      "After the dropped beat, the PR resets to the same constant value — not shorter as in Wenckebach",
      "Fixed conduction ratio — 2:1, 3:1, or 3:2 most common",
    ],
    nursesNotice:
      "The strip looks organized — regular P waves, normal PR intervals, consistent QRS morphology — until suddenly a P wave appears with nothing after it. No build-up, no warning, no change in the PR before the drop. The beat just does not come. This is what makes Mobitz II harder to dismiss than Wenckebach: the block appears out of nowhere in an otherwise normal-looking conduction pattern.",
    confusedWith:
      "Wenckebach (Mobitz I): also drops QRS complexes, but the PR interval lengthens progressively before each dropped beat. If you see the PR changing before the drop, it is Wenckebach. If the PR is identical in every conducted beat immediately before the drop, it is Mobitz II. This distinction is clinically critical — they carry very different risks and management implications.",
    bedsideRelevance:
      "Mobitz II carries a significantly higher risk of progressing to complete heart block than Wenckebach. The block occurs at or below the bundle of His — a more distal and less reliable location than the AV node. The ventricular rate depends on the conduction ratio: 3:2 Mobitz II may produce only a modest rate reduction, but 2:1 block halves the ventricular rate immediately. Because the progression to complete block can occur suddenly and without warning, this rhythm demands provider awareness regardless of how stable the patient appears.",
    whenMoreUrgent:
      "Any new or worsening Mobitz II warrants prompt provider notification — this is not a rhythm to observe silently. Symptoms of hypoperfusion, a dropping ventricular rate, or increasing frequency of dropped beats are escalating signs. In the context of an acute MI — particularly anterior MI, which can damage the bundle branches — Mobitz II may require urgent pacing. A patient who appears comfortable in Mobitz II can deteriorate rapidly if the block advances.",
    urgency: "urgent",
    urgencyLabel: "Urgent",
    breakdown: {
      rate: {
        finding: "Atrial rate 60–100 bpm — ventricular rate slower due to dropped beats",
        whyItMatters: "At 2:1 conduction, the ventricular rate is immediately halved. The degree of rate reduction depends entirely on the conduction ratio.",
      },
      regularity: {
        finding: "Regular P-to-P — ventricular rhythm interrupted by sudden dropped beats",
        whyItMatters: "The atria are regular. The ventricle is interrupted without warning when a beat suddenly fails to conduct. That unpredictability is what makes this rhythm dangerous.",
      },
      pWaves: {
        finding: "Regular P waves at consistent intervals — some block without warning",
        whyItMatters: "P waves march out at a regular rate. Some simply have no QRS after them, with no preceding change to signal the drop is coming.",
      },
      prRelationship: {
        finding: "Constant PR on all conducted beats — no lengthening before the dropped QRS",
        whyItMatters: "This is the critical distinction from Wenckebach. The PR never changes before the block. The beat fails without warning — that absence of warning is what makes Mobitz II more dangerous.",
      },
      qrsWidth: {
        finding: "Narrow on conducted beats — may be wide if bundle branch block coexists",
        whyItMatters: "A wide QRS in Mobitz II suggests the block is infranodal — in the bundle branches. This carries a higher risk of sudden progression to complete heart block.",
      },
      firstClue: "Every conducted beat has the exact same PR interval — then a QRS is simply absent. No build-up, no warning. That sudden unexplained absence is the hallmark.",
    },
  },
  {
    id: "complete_heart_block",
    name: "Third-Degree AV Block",
    shortName: "3° AVB",
    tagline: "Complete electrical divorce — atria and ventricles beat independently with no communication between them.",
    rate: "Atrial rate 60–100 bpm — ventricular escape rate 20–40 bpm (ventricular) or 40–60 bpm (junctional)",
    regularity: "Both P waves and QRS complexes are internally regular — at completely different, independent rates",
    pWave: "Regular P waves at their own rate — none conduct to the ventricles. Walk through the strip independently.",
    qrs: "Wide (≥ 0.12 sec) and slow — ventricular escape morphology. Narrow only if junctional escape drives the rhythm.",
    recognitionCues: [
      "P waves and QRS complexes march independently — the PR interval varies with every beat",
      "Ventricular rate is slow, typically 20–40 bpm from a ventricular escape pacemaker",
      "P waves bear no relationship to QRS complexes — some fall before, inside, or after each QRS",
      "Regular slow wide complexes with faster unrelated P waves marching between them",
    ],
    nursesNotice:
      "The strip has two rhythms happening at once. You can see P waves marching across at one rate and wide QRS complexes arriving at a completely different, slower rate. If you measure the P-to-P intervals they are regular. The QRS-to-QRS intervals are also regular. But the distance from any P wave to the next QRS is never the same — because they are not talking to each other. The flattest, most organized-looking complete heart block strip still represents a potentially life-threatening emergency if the patient is not tolerating the rate.",
    confusedWith:
      "Second-degree AV block with high-grade block: may also show multiple non-conducted P waves per QRS, but some P waves still conduct with a consistent PR. In complete heart block, no P wave ever conducts — the PR interval is never constant because conduction has completely failed. If you can find even one consistent PR on the strip, it is not complete heart block. AV dissociation without complete block (as in VTach) can look similar — wide QRS and visible P waves — but the P wave rate in CHB is typically faster than the QRS rate, while in VTach the QRS rate is faster.",
    bedsideRelevance:
      "The ventricular escape rate is the only thing maintaining circulation. A junctional escape at 50 bpm in a young patient may be tolerated; a ventricular escape at 25 bpm in an elderly patient with structural disease is a hemodynamic emergency. The stability of the patient depends entirely on the escape rate, the underlying myocardium, and the volume status. This rhythm demands immediate provider notification and preparation for pacing. The monitor tells you the rhythm — the bedside assessment tells you how fast you need to move.",
    whenMoreUrgent:
      "Complete heart block in any symptomatic patient — hypotension, altered mentation, chest pain, syncope, or signs of poor perfusion — is an emergency. Even an asymptomatic patient in complete heart block requires immediate provider evaluation and likely transcutaneous or transvenous pacing preparation. New complete heart block in the context of an acute MI is a critical finding that changes the response pathway. Do not wait for symptoms to escalate before notifying the provider.",
    urgency: "critical",
    urgencyLabel: "Critical",
  },
  {
    id: "vtach",
    name: "Ventricular Tachycardia",
    shortName: "V-Tach",
    tagline: "Wide, fast, organized rhythm — respect it until proven otherwise, and correlate with the patient immediately.",
    rate: "> 100 bpm — often 140–250 bpm",
    regularity: "Regular — RR intervals are consistent despite grossly abnormal morphology",
    pWave: "Absent or dissociated — P waves may be present but bear no relationship to the QRS",
    qrs: "Wide (≥ 0.12 sec), bizarre, often notched — the dominant visual feature of the strip",
    recognitionCues: [
      "Wide, bizarre QRS — visually dominates the entire strip",
      "Rate above 100, often 140–250 bpm",
      "No organized P waves visible",
      "Regular rhythm despite grossly abnormal morphology",
    ],
    nursesNotice:
      "The strip is visually striking — every complex is wide, deformed, and unfamiliar. Nothing about the morphology looks like anything you see in normal sinus. The regular spacing is there, but the shape of each beat looks fundamentally wrong. This is the rhythm that demands immediate patient correlation before anything else happens.",
    confusedWith:
      "SVT with aberrant conduction: also wide and fast, and can look morphologically identical on the strip. The rule that has held for decades: any wide-complex tachycardia with an uncertain origin should be treated as VTach until definitively proven otherwise. Patient history, hemodynamics, and provider assessment — not strip interpretation alone — determine the next step. Do not delay assessment to debate morphology.",
    bedsideRelevance:
      "VTach can be perfusing or pulseless — the strip does not tell you which. Only a hands-on assessment does. A patient talking to you in VTach and a patient unresponsive in VTach are on completely different response pathways. Clinical correlation comes before strip analysis, every time. Morphology, rate, and duration all matter for the provider's decision-making, but the patient tells you the urgency — not the monitor.",
    whenMoreUrgent:
      "Pulseless VTach is cardiac arrest — follow your local emergency protocol immediately. Perfusing VTach with any sign of hemodynamic compromise — hypotension, chest pain, altered mentation, signs of poor perfusion — requires immediate escalation. Even a hemodynamically stable patient in sustained VTach is not a situation to observe and wait on. Notify the provider.",
    urgency: "critical",
    urgencyLabel: "Critical",
    breakdown: {
      rate: {
        finding: "> 100 bpm — often 140–250 bpm",
        whyItMatters: "The fast rate limits ventricular filling. Combined with abnormal contraction, cardiac output may drop rapidly. Rate does not tell you perfusion status — only a clinical assessment does.",
      },
      regularity: {
        finding: "Regular — consistent RR intervals despite grossly abnormal morphology",
        whyItMatters: "The regularity is a diagnostic clue. A fast, regular, wide-complex rhythm with consistent bizarre morphology is VTach until proven otherwise.",
      },
      pWaves: {
        finding: "Absent or dissociated — no organized atrial activity visible",
        whyItMatters: "AV dissociation — when P waves are visible at a different rate than the QRS — definitively confirms ventricular origin. Most of the time P waves are simply buried or absent.",
      },
      prRelationship: {
        finding: "No consistent P-QRS relationship — AV dissociation",
        whyItMatters: "The ventricles are firing independently of any sinus impulse. This complete uncoupling from atrial activity is what separates VTach from fast supraventricular rhythms.",
      },
      qrsWidth: {
        finding: "Wide (≥ 0.12 sec), bizarre — the dominant visual feature of the strip",
        whyItMatters: "Every complex is activated outside the normal His-Purkinje pathway. Fast + wide + bizarre = VTach until the strip and clinical picture prove otherwise.",
      },
      firstClue: "Every complex is wide and visually wrong. That immediate recognition — the whole strip looks abnormal — is the trigger for immediate patient assessment before anything else happens.",
    },
  },
  {
    id: "idioventricular",
    name: "Idioventricular Rhythm",
    shortName: "IVR",
    tagline: "The ventricle fires on its own at a dangerous rate — the heart's last fallback when every upstream pacemaker has failed.",
    rate: "20–40 bpm",
    regularity: "Regular — the ventricular pacemaker fires at a steady but very slow rate",
    pWave: "Absent or dissociated — P waves may appear at an independent atrial rate but bear no consistent relationship to the QRS",
    qrs: "Wide (≥ 0.12 sec) and bizarre — ventricular conduction is entirely abnormal, producing a wide, unfamiliar complex",
    recognitionCues: [
      "Very slow rate — 20 to 40 bpm, with large gaps of flat baseline between each wide complex",
      "Wide, bizarre QRS — looks nothing like the patient's baseline narrow complex",
      "No consistent P-QRS relationship — P waves, if visible, march independently at their own rate",
      "Regular ventricular rhythm — the slow wide complexes arrive at a predictable but dangerously slow cadence",
    ],
    nursesNotice:
      "The strip is strikingly slow — wide, unfamiliar complexes appearing every two to three seconds with long flat stretches between them. Nothing about the QRS morphology looks normal. If you know this patient's baseline strip, this looks fundamentally different. The rate alone — 20 to 40 beats per minute — is enough to prompt immediate clinical correlation and provider alert. Do not wait for additional findings before acting.",
    confusedWith:
      "Complete heart block with ventricular escape: both produce a very slow wide-complex rhythm with dissociated P waves, and the strip appearance can be nearly identical. The distinction is not always clinically urgent at the bedside — both require immediate escalation. In complete heart block the sinus node is still firing and no conduction reaches the ventricles; in idioventricular rhythm the ventricle itself is the only functioning pacemaker. The response is the same for both: notify the provider immediately and prepare for potential pacing.",
    bedsideRelevance:
      "Idioventricular rhythm means the heart is relying on the ventricle as its only pacemaker. At 20 to 40 beats per minute, most patients are not maintaining adequate perfusion. This rhythm appears in severe bradycardia, post-cardiac arrest states, advanced conduction disease, and situations where every upstream pacemaker has failed. Clinical correlation is immediate — this rhythm can be perfusing or pulseless, and the monitor cannot tell you which. The patient's condition determines the urgency and the response pathway.",
    whenMoreUrgent:
      "Any hemodynamic compromise — hypotension, altered mentation, absent peripheral pulses, or signs of poor perfusion — requires emergency escalation. If the patient is pulseless, this is a cardiac arrest and your local emergency protocol applies immediately. Even a perfusing idioventricular rhythm at these rates is a critical finding. Do not wait for the patient to deteriorate further before notifying the provider and beginning preparation for transcutaneous pacing.",
    urgency: "critical",
    urgencyLabel: "Critical",
  },
  {
    id: "aivr",
    name: "Accelerated Idioventricular Rhythm",
    shortName: "AIVR",
    tagline: "The ventricle briefly leads at a near-normal rate — often a sign of reperfusion, rarely dangerous on its own.",
    rate: "40–100 bpm — faster than idioventricular rhythm, slower than ventricular tachycardia",
    regularity: "Regular — steady wide-complex beats at a rate that falls between junctional escape and VTach",
    pWave: "Absent or dissociated — P waves may appear at an independent rate but do not reliably precede each QRS",
    qrs: "Wide (≥ 0.12 sec) and bizarre — ventricular origin, same morphology beat to beat",
    recognitionCues: [
      "Rate 40–100 bpm — looks nearly normal speed but the morphology is visually wrong",
      "Wide, bizarre QRS — does not match the patient's baseline narrow complex",
      "No upright P wave before the QRS — absent or dissociated",
      "Regular rhythm — steady beat to beat, distinctly slower than ventricular tachycardia",
    ],
    nursesNotice:
      "The rate looks almost normal — between 40 and 100 beats per minute — but the QRS morphology is wide and unfamiliar. This is what makes AIVR easy to miss on a first pass: the rate does not trigger an alarm, but the shape of every complex is wrong. There is no upright P wave before the QRS. Beat to beat, the rhythm is regular and the complexes are identical — wide, broad, and different from anything this patient had in sinus rhythm.",
    confusedWith:
      "Ventricular tachycardia: also wide and bizarre, but VTach runs above 100 bpm — often well above. AIVR stays within the normal rate range. If the wide-complex rhythm is at 60 or 80 bpm, it is not VTach by rate. Accelerated junctional rhythm: also runs at 60–100 bpm, but the QRS is narrow. Wide QRS at a near-normal rate points to ventricular origin. Sinus rhythm with bundle branch block: also produces wide QRS complexes, but there is always an upright P wave with a consistent PR before every complex. No visible upright P before a wide QRS is the key finding pointing to ventricular rather than supraventricular origin.",
    bedsideRelevance:
      "AIVR is most commonly seen as a reperfusion arrhythmia — it appears transiently after a coronary artery opens, whether spontaneously, after thrombolytics, or after percutaneous intervention. In this context it is often benign and self-limited, lasting seconds to minutes before sinus rhythm returns. It can also appear with digoxin toxicity, electrolyte disturbances, and cardiomyopathy. Because the rate is within the normal range and the rhythm is organized, most patients tolerate AIVR without significant hemodynamic compromise. The clinical context and whether the patient is symptomatic drive the response.",
    whenMoreUrgent:
      "AIVR in a patient who is hemodynamically compromised — hypotension, altered mental status, chest pain, or diaphoresis — warrants immediate provider notification regardless of rate. In a post-MI or post-intervention setting, any new wide-complex rhythm should be reported promptly even if the patient appears stable, so the provider can assess whether it represents reperfusion or a more concerning process. AIVR that accelerates toward or above 100 bpm, or that the patient is not tolerating, should not be observed silently.",
    urgency: "urgent",
    urgencyLabel: "Urgent",
  },
  {
    id: "ventricular_escape",
    name: "Ventricular Escape Beat",
    shortName: "V-Escape",
    tagline: "A late wide beat appearing after a pause — the ventricle stepping in when the sinus impulse fails to arrive.",
    rate: "Escape rate 20–40 bpm — fires at the ventricle's inherent rate when upstream pacemakers are silent",
    regularity: "Underlying rhythm interrupted — the escape beat arrives late, after a pause longer than the normal RR interval",
    pWave: "No P wave before the escape beat — the sinus node failed to fire or the impulse failed to conduct through",
    qrs: "Wide (≥ 0.12 sec) and bizarre on the escape beat — ventricular origin. Surrounding conducted beats are narrow and normal.",
    recognitionCues: [
      "A pause longer than the normal RR interval — the expected beat does not arrive on time",
      "A wide, bizarre beat appears at the end of the pause — morphologically different from surrounding narrow beats",
      "No P wave precedes the wide beat — the ventricle fired independently, not in response to a sinus impulse",
      "The escape beat arrives late, not early — this is the opposite of a PVC",
    ],
    nursesNotice:
      "The strip looks normal, then there is a gap — an expected beat does not come. After the pause, a wide, differently shaped beat appears. That is the escape beat. The ventricle waited as long as it could for an impulse from above and then fired on its own to prevent a longer pause. The beat looks wrong compared to everything around it, and it comes late rather than early — that timing distinction separates it from a PVC at a glance.",
    confusedWith:
      "PVC (premature ventricular contraction): also a wide, bizarre beat with no preceding P wave. The critical difference is timing. A PVC arrives early — before the next expected beat. A ventricular escape beat arrives late — after a pause where the expected beat should have appeared but did not. If the wide beat comes early, it is a PVC. If it comes after a gap, it is an escape. The clinical implications are opposite: a PVC is an irritable ectopic beat; an escape beat is a protective rescue response to a failing pacemaker.",
    bedsideRelevance:
      "An escape beat is the heart's safety mechanism. When the sinus node fails to fire or an impulse fails to conduct, the ventricular pacemaker fires late to prevent a prolonged pause and maintain some cardiac output. A single occasional escape beat in a patient with mild bradycardia is different from frequent escapes paired with long pauses. What matters clinically is the frequency of the escapes, the length of the pause triggering them, whether the patient is symptomatic, and whether the underlying cause is identifiable and reversible.",
    whenMoreUrgent:
      "Frequent ventricular escape beats, escape beats triggering pauses that cause symptoms — presyncope, dizziness, hypotension — or a patient whose only reliable beats are escape beats requires prompt provider notification. A single incidental escape beat in an otherwise stable patient with a known cause is a documentation finding, but any trend toward more frequent escape activity or lengthening pauses should be escalated before symptoms appear. An escape beat that represents a narrow window between pauses is a sign of significant conduction disease that needs provider awareness now, not after the patient is symptomatic.",
    urgency: "urgent",
    urgencyLabel: "Urgent",
  },
  {
    id: "torsades",
    name: "Torsades de Pointes",
    shortName: "TdP",
    tagline: "Polymorphic VT with a twisting baseline — the QRS amplitude cycles above and below the line, fast and unstable.",
    rate: "> 150 bpm — often 200–250 bpm, highly variable beat to beat",
    regularity: "Irregular — the rate and morphology vary continuously throughout the episode",
    pWave: "Absent — no organized atrial activity visible during the arrhythmia",
    qrs: "Wide and polymorphic — QRS amplitude and axis shift continuously, twisting above and below the baseline in a characteristic sinusoidal envelope",
    recognitionCues: [
      "QRS complexes twist around the baseline — amplitude waxes and wanes in a sinusoidal pattern",
      "Polymorphic morphology — the shape of each complex is different from the one before it",
      "Fast and chaotic rate — typically 200–250 bpm with variable RR intervals",
      "Context: preceding prolonged QT interval is the critical risk factor and often visible on earlier strips",
    ],
    nursesNotice:
      "The strip looks like VTach at first glance, but the complexes are not all pointing the same way — they twist. You will see groups of beats pointing up, then a transition through small complexes at the axis crossing, then groups pointing down, then the pattern may reverse. It is fast, irregular, and visually chaotic in a way that is distinct from the steady same-direction complexes of monomorphic VTach. Once you have seen the twisting envelope, you will recognize it.",
    confusedWith:
      "Monomorphic ventricular tachycardia: also fast and wide, but every complex in monomorphic VT has the same morphology and points the same direction. The shifting amplitude and axis of TdP — especially the groups of upward complexes transitioning through small beats to groups of downward complexes — is the visual distinction. Coarse ventricular fibrillation: also chaotic, but VFib has no identifiable QRS complexes at all. TdP still has a discernible, if twisting, QRS structure within the chaos.",
    bedsideRelevance:
      "Torsades de Pointes occurs in the setting of a prolonged QT interval — from medications (antiarrhythmics, antibiotics, antipsychotics, antiemetics), electrolyte disturbances (low potassium, low magnesium), or underlying cardiac disease. It often starts with a long-short RR sequence and may terminate spontaneously before recurring in longer runs. A patient in TdP may be conscious, confused, or pulseless — correlate immediately with the patient. This rhythm has a strong tendency to deteriorate into ventricular fibrillation if not addressed.",
    whenMoreUrgent:
      "Torsades de Pointes is always urgent. If the patient has a pulse, notify the provider immediately — review the medication list for QT-prolonging agents, check electrolytes, and prepare for the rhythm to deteriorate. If the patient is pulseless, this is a cardiac arrest. Recurrent or sustained TdP requires immediate provider intervention. Do not observe and wait.",
    urgency: "critical",
    urgencyLabel: "Critical",
  },
  {
    id: "vfib_coarse",
    name: "Coarse Ventricular Fibrillation",
    shortName: "VFib",
    tagline: "Chaotic ventricular activity with no organized complexes — pulseless by definition.",
    rate: "Not measurable — no organized ventricular rate exists",
    regularity: "Completely chaotic — no two deflections are alike in width, height, or timing",
    pWave: "Absent — no organized atrial or ventricular electrical activity of any kind",
    qrs: "Absent — replaced by continuous high-amplitude chaotic fibrillatory waveform with no recognizable morphology",
    recognitionCues: [
      "Completely chaotic baseline — no organized QRS complexes anywhere on the strip",
      "High-amplitude fibrillatory waves — larger and more energetic than fine VFib",
      "No regularity of any kind — width, height, and spacing all vary continuously",
      "Patient is always pulseless — clinical assessment comes before strip analysis, every time",
    ],
    nursesNotice:
      "The strip shows nothing but chaotic, disorganized electrical activity — no QRS complexes, no P waves, no organized rhythm of any kind. The waveform is large and irregular, with unpredictable deflections that fill the strip. You will not find a pattern because there is none. When you see this strip, the physical examination comes before any analysis: correlate with the patient immediately.",
    confusedWith:
      "Fine ventricular fibrillation: also chaotic with no organized QRS, but the fibrillatory wave amplitude is much smaller — fine VFib waves are subtle and low, coarse VFib waves are large. Torsades de Pointes: also fast and visually chaotic, but TdP still has identifiable QRS complexes with a twisting envelope. VFib has no QRS complexes at all. Loose electrode or motion artifact: can produce a chaotic-looking strip, but the patient will have a pulse and the artifact typically resolves with repositioning. Confirm in two leads.",
    bedsideRelevance:
      "Coarse ventricular fibrillation is cardiac arrest. The ventricles are quivering chaotically with no effective contraction and no cardiac output. Coarse VFib is often seen in earlier or more electrically active arrest states and is generally considered more responsive to defibrillation than fine VFib. The amplitude of the fibrillatory waves is not a reliable predictor of outcome — the duration of the arrest and the speed of response are what matter.",
    whenMoreUrgent:
      "This is always the highest urgency finding. Follow your local emergency protocol immediately. Time from recognition to escalation is the critical variable. Do not spend time analyzing the strip — correlate with the patient, call for help, and follow your local code protocol without delay.",
    urgency: "critical",
    urgencyLabel: "Critical",
  },
  {
    id: "vfib_fine",
    name: "Fine Ventricular Fibrillation",
    shortName: "Fine VFib",
    tagline: "Nearly flat chaos — fine VFib and asystole look almost identical; confirm in two leads before concluding.",
    rate: "Not measurable — no organized ventricular rate",
    regularity: "Completely chaotic — no organized electrical pattern of any kind",
    pWave: "Absent — no organized atrial or ventricular electrical activity",
    qrs: "Absent — replaced by a low-amplitude irregular waveform that can be mistaken for asystole",
    recognitionCues: [
      "Very low-amplitude irregular waveform — clearly not flat, but barely above baseline",
      "Continuous subtle oscillations — the irregularity is consistent and present throughout",
      "No organized QRS complexes anywhere on the strip",
      "Clinically indistinguishable from asystole at the bedside — confirm in two leads before concluding the rhythm",
    ],
    nursesNotice:
      "The strip looks almost flat — close enough to asystole that you need to look carefully. What separates fine VFib from asystole is that the baseline is not completely still: there are continuous low, irregular undulations that vary in width and height throughout the strip. They are subtle, but they are consistent. Fine VFib often represents a more prolonged arrest state than coarse VFib — the fibrillatory waves have diminished as myocardial energy is depleted.",
    confusedWith:
      "Asystole: the most critical distinction. Fine VFib has continuous low chaotic oscillations — the baseline moves, even if subtly. Asystole has a near-flat line with only rare isolated artifact. Confirm in at least two leads — a truly flat line in two leads points toward asystole. Any consistent irregular oscillation in any lead should prompt consideration of fine VFib. Coarse ventricular fibrillation: also VFib, but with large high-amplitude waves — fine VFib waves are barely visible by comparison.",
    bedsideRelevance:
      "Fine VFib typically appears after a prolonged arrest or when myocardial energy stores are severely depleted. The small fibrillatory waves suggest the ventricles retain some electrical activity but have lost the amplitude of coarse VFib. Regardless of wave size, the patient is pulseless. The appropriate response depends on the clinical situation and elapsed arrest time — provider judgment and local protocol guide the decision.",
    whenMoreUrgent:
      "Fine VFib is always a cardiac arrest. Follow your local emergency protocol. Confirm in two leads before concluding the rhythm is asystole. CPR should be ongoing without interruption for rhythm analysis. The distinction between fine VFib and asystole matters for the next clinical decision — but it is a provider decision, not a bedside nurse decision in isolation.",
    urgency: "critical",
    urgencyLabel: "Critical",
  },
  {
    id: "asystole",
    name: "Asystole",
    shortName: "Asystole",
    tagline: "Flatline pattern — confirm leads and patient before trusting the screen.",
    rate: "None — no measurable cardiac electrical rate",
    regularity: "None — no electrical activity to form a pattern",
    pWave: "Absent — no atrial or ventricular electrical activity. Rare P waves without QRS (ventricular standstill) should be reported specifically.",
    qrs: "Absent — no organized ventricular depolarization. Only occasional minor baseline artifact may be present.",
    recognitionCues: [
      "Near-flat line — no organized electrical complexes of any kind",
      "Only very occasional minor baseline artifact — no consistent oscillations",
      "Confirmed in at least two leads — true asystole is flat in every lead",
      "Patient is always pulseless — do not delay clinical response to analyze strip findings",
    ],
    nursesNotice:
      "The strip is essentially flat. There are no complexes, no P waves, no organized deflections of any kind — only an occasional subtle baseline artifact. Unlike fine VFib, the line is still between those artifacts. The near-absence of any waveform is the hallmark. Before treating as asystole, confirm the lead is attached and check at least one other lead — a loose electrode can produce a flat line in a patient with a perfusing rhythm.",
    confusedWith:
      "Fine ventricular fibrillation: the most important distinction. Fine VFib shows continuous low-amplitude chaotic oscillations throughout — the baseline moves in a consistent irregular pattern. Asystole is truly flat between rare isolated artifact. Confirm in two leads. Loose electrode artifact: a disconnected or displaced lead produces a flat line that resolves with lead repositioning — the patient will have a pulse. P-wave asystole (ventricular standstill): P waves are visible at a slow regular rate but no QRS follows — report this finding specifically, as the management differs from complete asystole.",
    bedsideRelevance:
      "Asystole represents the cessation of organized cardiac electrical activity. It is most commonly a terminal rhythm in prolonged cardiac arrest after the failure of other rhythms, though it can occur as a primary event. Prognosis is poor, particularly when asystole represents a progression through other rhythms during an extended resuscitation. The clinical focus is on high-quality CPR and identifying reversible causes — the 'H's and T's' of cardiac arrest. Strip analysis is secondary to resuscitation quality.",
    whenMoreUrgent:
      "Asystole is always a cardiac arrest. Follow your local emergency protocol immediately. Confirm in two leads before concluding the rhythm is asystole — fine VFib can look nearly identical and the response may differ. CPR should not be interrupted for rhythm confirmation. If P waves are visible with no QRS complexes, report ventricular standstill specifically — providers need to know. Reversible causes should be identified and addressed as part of the resuscitation.",
    urgency: "critical",
    urgencyLabel: "Critical",
  },
  {
    id: "sinus_arrhythmia",
    name: "Sinus Arrhythmia",
    shortName: "Sinus Arrhy",
    tagline: "Normal sinus rhythm with a breathing-driven wobble in the RR intervals — the morphology is perfect, only the spacing varies.",
    rate: "60–100 bpm — rate rises on inspiration, slows on expiration",
    regularity: "Irregular — RR intervals vary in a cyclical pattern linked to the respiratory cycle",
    pWave: "Normal — upright, uniform, one before every QRS with a consistent PR interval. Morphology identical beat to beat.",
    qrs: "Narrow (< 0.12 sec), normal morphology — every complex looks the same",
    recognitionCues: [
      "Irregular RR intervals — the spacing between beats clearly varies across the strip",
      "P wave morphology is identical every beat — same shape, same height, same PR",
      "The irregularity follows a pattern — beats cluster slightly faster then slightly slower",
      "Everything except the spacing is normal — no dropped beats, no abnormal morphology",
    ],
    nursesNotice:
      "The strip looks like normal sinus rhythm until you measure the RR intervals. They are not the same — some are tighter, some are wider — but every P wave looks identical, every QRS looks identical, and the PR interval stays consistent. The rhythm speeds up with a breath in and slows with a breath out. If you ask the patient to hold their breath, the variation often resolves. That is the bedside test that distinguishes it from a more significant irregularity.",
    confusedWith:
      "Atrial fibrillation: also irregular, but AFib has no identifiable P waves and the irregularity is random with no cyclic pattern. In sinus arrhythmia, the P waves are present and normal, the PR interval is consistent, and the irregularity follows the breathing rhythm. Wandering atrial pacemaker: also produces P wave variation, but in wandering pacemaker the P wave morphology changes beat to beat — in sinus arrhythmia it stays the same. Frequent PACs: also disrupt an otherwise regular rhythm, but PACs produce an early beat with a different P wave. Sinus arrhythmia produces late and early beats with the same normal P wave morphology.",
    bedsideRelevance:
      "Sinus arrhythmia is a normal physiological finding — especially in younger patients, athletes, and patients with high vagal tone. It is the normal coupling of heart rate to the respiratory cycle. It does not cause symptoms, does not reduce cardiac output, and does not require intervention. The clinical importance is in recognizing it as benign so you do not misread it as AFib or a more significant irregularity and initiate an unnecessary workup or escalation.",
    whenMoreUrgent:
      "Sinus arrhythmia itself is not urgent. What matters is whether the irregularity is truly sinus arrhythmia or something else. If the P-wave morphology changes between beats, or if you see a dropped beat, or if the irregularity does not follow a breathing cycle, the rhythm is not simple sinus arrhythmia and warrants closer review. A patient with a new irregular rhythm who is symptomatic always deserves a provider notification regardless of what the strip looks like.",
    urgency: "stable",
    urgencyLabel: "Stable",
  },
  {
    id: "mat",
    name: "Multifocal Atrial Tachycardia",
    shortName: "MAT",
    tagline: "Multiple atrial foci firing chaotically — the P waves look different every few beats, the rhythm is irregular, and the rate is fast.",
    rate: "100–150 bpm — atrial rate drives a fast irregular ventricular response",
    regularity: "Irregularly irregular — no two RR intervals are the same",
    pWave: "At least three distinct P-wave morphologies on the same strip — the defining feature. PR interval varies between beats.",
    qrs: "Narrow (< 0.12 sec) — ventricular conduction is normal each time a conducted P wave arrives",
    recognitionCues: [
      "P waves are present but look different from beat to beat — at least three distinct shapes",
      "Irregularly irregular rhythm — the RR intervals vary without a pattern",
      "Rate above 100 bpm — each differently shaped P wave conducts to a narrow QRS",
      "PR interval varies — each atrial focus has its own conduction time to the AV node",
    ],
    nursesNotice:
      "The strip looks chaotic — irregular, fast, with P waves that do not all look the same. Unlike AFib where there are no P waves at all, MAT has P waves — they just keep changing shape from beat to beat. If you look closely at consecutive P waves, you will see that they are not identical: some are tall and rounded, some are shorter and narrower, some may be biphasic. The presence of identifiable P waves in a different morphology every few beats is what separates MAT from AFib on the strip.",
    confusedWith:
      "Atrial fibrillation: the most important distinction. AFib has NO organized P waves — just a fibrillatory baseline. MAT has P waves, but they look different. If you can identify distinct P waves in three or more shapes anywhere on the strip, it is not AFib. Sinus tachycardia with PACs: also fast with some differently shaped P waves, but in sinus tachycardia most beats have the same normal sinus P, with only occasional differently-shaped early beats. In MAT, the morphology variation is continuous — there is no dominant 'normal-looking' P wave that accounts for most beats.",
    bedsideRelevance:
      "MAT is almost always a sign of significant underlying disease rather than a primary arrhythmia. It is classically associated with severe COPD exacerbation, pulmonary hypertension, heart failure, and critical illness with metabolic derangements including hypomagnesemia and hypokalemia. Treating the arrhythmia without identifying the underlying cause will not work — the focus is on treating hypoxia, optimizing electrolytes, and managing the driving illness. Patients in MAT are usually sick for reasons beyond the rhythm itself.",
    whenMoreUrgent:
      "MAT at a rate that is compromising hemodynamics — causing hypotension, altered mentation, or worsening respiratory status — warrants prompt provider notification. Any patient whose MAT is worsening rather than improving with treatment of the underlying cause should be escalated. Electrolyte levels, particularly magnesium, should be reviewed promptly. MAT that is new in a patient without a known lung or cardiac history requires urgent evaluation.",
    urgency: "urgent",
    urgencyLabel: "Urgent",
  },
  {
    id: "pea",
    name: "Pulseless Electrical Activity",
    shortName: "PEA",
    tagline: "The monitor shows an organized rhythm. The patient has no pulse. The strip is not the patient.",
    rate: "Variable — the organized rhythm on screen can be any rate; the rate is clinically irrelevant without a pulse",
    regularity: "Appears regular — the electrical activity is organized, but mechanical contraction is absent or ineffective",
    pWave: "May be present — the electrical pattern can look like sinus rhythm, bradycardia, or any organized rhythm",
    qrs: "Appears organized — narrow or wide depending on the underlying electrical pattern. Morphology alone does not diagnose PEA.",
    recognitionCues: [
      "An organized-looking rhythm on the monitor in a patient with no palpable pulse",
      "The strip may look like normal sinus rhythm, bradycardia, or any organized pattern",
      "Nothing on the strip itself identifies PEA — the diagnosis requires a pulse check",
      "The monitor provides false reassurance — this patient is in cardiac arrest",
    ],
    nursesNotice:
      "This is the rhythm that kills patients who are not examined. The monitor shows a regular organized rhythm — P waves, QRS complexes, T waves — and everything on the screen looks like it should be fine. It is not fine. The patient has no pulse. Effective cardiac output is absent. PEA cannot be diagnosed by looking at a monitor; it requires a hands-on clinical assessment. Any patient who becomes unresponsive, loses blood pressure, or appears to be in arrest must be assessed immediately — regardless of what the monitor shows.",
    confusedWith:
      "Any organized rhythm in a perfusing patient: the ECG appearance of PEA is indistinguishable from a normal rhythm in a patient who is perfusing normally. The only distinguishing feature is the clinical assessment — is there a palpable pulse? If yes, the rhythm is not PEA. If no, it is PEA until proven otherwise. Artifact mimicking a normal rhythm: occasionally artifact from patient movement or a malfunctioning lead can look like an organized rhythm in a patient with a true arrest. Always correlate with the patient — never rely on the monitor alone to rule out arrest.",
    bedsideRelevance:
      "PEA is one of the four cardiac arrest rhythms (alongside VFib, pulseless VTach, and asystole). Unlike VFib, it is not shockable — defibrillation has no role. The treatment is high-quality CPR and identifying and reversing the cause. The reversible causes are summarized as the H's and T's: hypovolemia, hypoxia, hydrogen ion (acidosis), hypo/hyperkalemia, hypothermia, tension pneumothorax, tamponade, toxins, thrombosis (pulmonary), and thrombosis (coronary). A patient in PEA is in full cardiac arrest — the organized electrical activity on the monitor is not a reason for reassurance or hesitation.",
    whenMoreUrgent:
      "PEA is always the highest urgency — it is cardiac arrest. Call the code, begin CPR immediately, and identify reversible causes. The most rapidly reversible causes (tension pneumothorax, hypovolemia, tamponade, hypoxia) should be addressed without waiting for laboratory results. Do not be reassured by the organized monitor pattern — the patient determines urgency, not the strip.",
    urgency: "critical",
    urgencyLabel: "Critical",
  },
  {
    id: "hyperkalemia_t",
    name: "Hyperkalemia: Peaked T Waves",
    shortName: "HyperK-T",
    tagline: "Elevated potassium changes how the ventricle repolarizes — the T wave narrows and rises into a tall symmetric tent.",
    rate: "Underlying sinus rate — typically 60–100 bpm",
    regularity: "Regular — underlying sinus rhythm unchanged at this stage",
    pWave: "Present but may be slightly smaller — early hyperkalemia reduces atrial conduction velocity",
    qrs: "Normal width — ventricular conduction still intact at this potassium level",
    recognitionCues: [
      "T wave is disproportionately tall and narrow — a symmetric tent, not the usual dome",
      "T wave amplitude often exceeds the R wave height in the same lead",
      "QRS is still normal width — the problem is in the T, not the QRS",
      "Pattern is consistent across beats — every T wave looks the same",
    ],
    nursesNotice:
      "The strip looks like normal sinus rhythm until you examine the T waves. Instead of the usual gentle asymmetric dome, each T wave rises steeply, reaches a sharp peak, and descends just as steeply — a tent shape rather than a rounded hill. The taller and narrower the T wave relative to the QRS, the more suspicious the pattern. Peaked T waves are the earliest warning that the potassium is high enough to affect cardiac conduction, and the strip can look like this before the patient has any symptoms.",
    confusedWith:
      "Normal sinus rhythm with tall T waves: some patients have naturally tall T waves, particularly in precordial leads. The hyperkalemia pattern is distinguished by the narrow, symmetric tent shape — normal tall T waves are still asymmetric with a gradual rise and faster fall. Early repolarization: also produces tall T waves, but typically upsloping ST segment before a tall T, and usually in younger patients without a hyperkalemia history. When in doubt, the potassium level is the clinical answer — not the strip alone.",
    bedsideRelevance:
      "Peaked T waves are the earliest ECG change in hyperkalemia and the stage at which the rhythm is still stable. However, the strip tells you where the patient is on the progression curve — not how fast they are moving along it. A potassium that is rising will progress through these changes: peaked T waves, then QRS widening, then the sine wave pattern, then cardiac arrest. The strip is a snapshot, not a prediction. The trend in potassium levels and the clinical context are as important as the pattern you see now.",
    whenMoreUrgent:
      "Peaked T waves with a confirmed or suspected elevated potassium require provider notification regardless of how stable the patient looks. Prompt potassium level confirmation, repeat ECG at a defined interval, and provider-directed treatment should begin without delay. A patient whose T waves are changing on serial ECGs — getting taller, or beginning to widen — is progressing and needs escalation now, not at the next scheduled assessment.",
    urgency: "urgent",
    urgencyLabel: "Urgent",
  },
  {
    id: "hyperkalemia_qrs",
    name: "Hyperkalemia: QRS Widening",
    shortName: "HyperK-QRS",
    tagline: "Rising potassium now impairs ventricular conduction — the QRS broadens, the P wave flattens, and QRS and T begin to merge.",
    rate: "Variable — underlying rate usually maintained but rhythm instability increases at this stage",
    regularity: "Regular or becoming irregular — instability possible as conduction deteriorates",
    pWave: "Flattened or nearly absent — atrial muscle is affected first; the P wave may be barely visible or gone",
    qrs: "Wide (≥ 0.12 sec) — bundle conduction slowing; the complex becomes broad and slurred",
    recognitionCues: [
      "P wave is very flat or absent — atrial standstill beginning",
      "QRS is visibly wider than normal — slurred upstroke and prolonged descent",
      "T wave is still peaked but the separation between QRS tail and T is narrowing",
      "The overall complex is beginning to look like a single merged shape",
    ],
    nursesNotice:
      "The strip has changed from the peaked-T-waves pattern. The P wave is barely there — a flat bump, or gone entirely. The QRS is wider than it should be, with a slurred rise and a broader descent. The peaked T wave is still visible but it is closer to the QRS — the isoelectric segment between them is shortening. This is the stage where hyperkalemia has moved beyond a T wave finding and into active impairment of the conduction system. Every beat looks wrong in a new way compared to normal.",
    confusedWith:
      "Bundle branch block: also produces wide QRS complexes in an otherwise normal-looking rhythm, but with a consistent and characteristic morphology (RBBB or LBBB pattern). Hyperkalemia QRS widening is diffuse and non-specific — it does not fit the clean template of a right or left bundle block. The absence of P waves, the peaked T wave, and the progressive nature of the change (compared to a prior strip) point toward hyperkalemia. Ventricular tachycardia: also wide bizarre QRS, but fast. Hyperkalemia QRS widening occurs at the underlying sinus rate or slower.",
    bedsideRelevance:
      "QRS widening in the setting of hyperkalemia represents significant toxicity. The cardiac conduction system is now directly impaired, not just repolarization. At this stage, the risk of progression to the sine wave pattern and then cardiac arrest is real and the timeline is unpredictable. The strip is changing faster than the labs can confirm what you are already seeing. A patient whose strip shows this pattern needs a provider actively at the bedside, not a routine notification.",
    whenMoreUrgent:
      "QRS widening from hyperkalemia is already an urgent finding — there is no stable version of this pattern. Notify the provider immediately. If the QRS continues to widen on serial ECGs, the rate slows, or any hemodynamic instability develops, this becomes an emergent resuscitation situation. Prepare for rapid deterioration: the sine wave and cardiac arrest can follow without further warning.",
    urgency: "critical",
    urgencyLabel: "Critical",
  },
  {
    id: "hyperkalemia_sine",
    name: "Hyperkalemia: Sine Wave",
    shortName: "HyperK-Sine",
    tagline: "Severe potassium toxicity — all landmarks gone, smooth sine wave remains. This is a pre-arrest rhythm.",
    rate: "40–80 bpm — rate is unreliable at this stage; cardiac arrest imminent",
    regularity: "Regular in appearance but mechanically failing — effective cardiac output is minimal or absent",
    pWave: "Absent — atrial standstill is complete; no organized atrial electrical activity",
    qrs: "Absent as a discrete complex — merged entirely into one continuous wave with the T wave",
    recognitionCues: [
      "No identifiable P wave, QRS, or T wave — all landmarks have dissolved",
      "Smooth, continuous sinusoidal waveform cycling above and below baseline",
      "Broad rounded peaks with no sharp R spike anywhere on the strip",
      "Regular but dangerously abnormal — this pattern is immediately pre-arrest",
    ],
    nursesNotice:
      "The strip looks like nothing you have been taught to recognize — because the normal landmarks are gone. There is no P wave, no sharp QRS spike, no T wave. What remains is a smooth, slow, sinusoidal wave that rises above baseline and falls below it in a continuous, undulating pattern. It can look almost organized, which is what makes it deceptive. This rhythm represents the heart's conduction system at the edge of total failure. Correlate with the patient immediately — this patient may have a pulse, but they are moments from not having one.",
    confusedWith:
      "Atrial flutter: also shows a regular undulating baseline, but flutter waves are sharp sawtooth deflections at ~300/min with distinct QRS complexes superimposed. The sine wave pattern has no discrete QRS complexes at any rate and the wave is smooth, not sawtooth. Ventricular fibrillation: chaotic, high-amplitude, completely irregular — the opposite of the organized sine wave. The sine wave is terrifyingly regular and smooth. Artifact or lead noise: motion artifact is irregular and does not have the consistent smooth sinusoidal morphology. Confirm in two leads.",
    bedsideRelevance:
      "The sine wave pattern is a pre-arrest rhythm. It does not represent stable hyperkalemia — it represents the moment before cardiac arrest from hyperkalemia. Effective mechanical contraction at this stage is minimal or absent even if the monitor shows a rhythm. Correlate with the patient immediately, call for help, and be ready to initiate resuscitation. If the patient has a pulse, this requires a provider response within minutes, not a scheduled follow-up. This is not a rhythm to watch and trend.",
    whenMoreUrgent:
      "The sine wave pattern is the most urgent non-arrest hyperkalemia finding. If the patient has a pulse, this is an immediate code-level emergency — provider and response team at the bedside now. If the patient is pulseless, follow your local cardiac arrest protocol: hyperkalemia is one of the reversible H's and is addressed during resuscitation. Do not wait for a potassium level to confirm what the strip is already telling you.",
    urgency: "critical",
    urgencyLabel: "Critical",
  },
  {
    id: "rbbb",
    name: "Right Bundle Branch Block",
    shortName: "RBBB",
    tagline: "The right ventricle depolarizes late — a wide QRS with a broad S wave and a secondary terminal deflection after the main spike.",
    rate: "Underlying sinus rate — usually 60–100 bpm",
    regularity: "Regular — RR intervals identical to the underlying sinus rhythm",
    pWave: "Normal — upright, uniform, one before every QRS with a consistent PR interval",
    qrs: "Wide (≥ 0.12 sec) — the initial forces are normal but the terminal rightward delay widens the complex",
    recognitionCues: [
      "Normal P wave with normal PR — the problem is in the QRS, not the P",
      "Broad S wave below baseline after the initial R spike — the terminal delay signature",
      "Secondary upward deflection (terminal R′) follows the S wave — the defining RBBB notch",
      "Upright T wave — concordant with the main QRS deflection in inferior leads",
    ],
    nursesNotice:
      "The strip looks like normal sinus rhythm until you examine the QRS. The P wave is normal, the rate and regularity are normal — but each complex is wider than it should be. After the initial R spike, instead of cleanly returning to baseline, the complex dips below the line (broad S wave) and then bumps upward again before returning. That double motion — S dip then secondary upward bump — is the visual fingerprint of RBBB.",
    confusedWith:
      "Left bundle branch block: also produces a wide QRS in sinus rhythm, but the morphologies are opposite. In RBBB, there is a clear initial R spike followed by a broad S below baseline and a terminal upward R′. In LBBB, there is no Q wave, no S below baseline, and the broad R is notched at the top — with an inverted T wave. The T wave direction is also a quick differentiator: RBBB has an upright T; LBBB has an inverted T in the same leads. VTach: also wide and bizarre, but VTach is fast and has no organized P-QRS relationship.",
    bedsideRelevance:
      "Isolated RBBB is common and often incidental — it can be a lifelong finding related to age, right heart strain, or congenital anatomy. The rhythm itself causes no hemodynamic compromise. The clinical significance comes from context: new RBBB in the setting of chest pain, shortness of breath, or acute illness is a different finding than chronic RBBB on a patient's baseline ECG. Right heart strain from pulmonary embolism is a classic cause of new RBBB. Document whether this is new or known.",
    whenMoreUrgent:
      "New RBBB in the setting of chest pain, hemodynamic instability, or suspected pulmonary embolism warrants prompt provider notification. RBBB that progresses to bifascicular block (RBBB plus left anterior or posterior fascicular block) or alternates with LBBB on serial strips indicates significant conduction system disease and requires escalation. A known RBBB patient who develops a new bundle branch block pattern on top of their baseline requires evaluation.",
    urgency: "monitor",
    urgencyLabel: "Monitor",
  },
  {
    id: "lbbb",
    name: "Left Bundle Branch Block",
    shortName: "LBBB",
    tagline: "The left ventricle depolarizes late via a detour — a broad notched R wave with an inverted T, no Q wave, and wide QRS throughout.",
    rate: "Underlying sinus rate — usually 60–100 bpm",
    regularity: "Regular — RR intervals identical to the underlying sinus rhythm",
    pWave: "Normal — upright, uniform, one before every QRS with a consistent PR interval",
    qrs: "Wide (≥ 0.12 sec) and broad — no initial Q wave, slurred upstroke, notched or plateau peak, no S below baseline",
    recognitionCues: [
      "No Q wave before the wide R — septal Q is absent in LBBB (lateral leads)",
      "Broad slurred upstroke to a wide notched or bifid R peak — the 'M' shape",
      "No S wave below baseline — the QRS stays above the line throughout",
      "Inverted T wave — discordant, pointing opposite to the main QRS deflection",
    ],
    nursesNotice:
      "The QRS complex looks fundamentally different from any normally conducted beat. There is no initial Q dip — the complex rises slowly from the baseline, reaches a broad notched peak that may look like a flattened 'M' shape, then descends broadly without dipping below the baseline. The T wave is inverted — pointing the wrong way. In a patient with an upright T elsewhere, a suddenly inverted T paired with that wide notched R makes LBBB visually unmistakable once you have seen it.",
    confusedWith:
      "Right bundle branch block: also wide QRS in sinus rhythm, but RBBB has a clear initial R spike, a broad S dip below baseline, and an upright T wave — the opposite pattern. LBBB has no S below baseline, no visible Q, and an inverted T. Ventricular paced rhythm: the QRS morphology is nearly identical to LBBB because right ventricular pacing creates a left-sided delay identical to LBBB. The distinction is the pacing spike — a sharp vertical artifact before the QRS that is absent in intrinsic LBBB. If no spike is visible, it is LBBB.",
    bedsideRelevance:
      "New LBBB is the rhythm where context defines the urgency. In a patient with chest pain, new LBBB is treated as an ST-elevation equivalent — a possible acute anterior MI that requires the same emergent response pathway as STEMI because the block obscures the ST-segment changes that would otherwise be visible. Chronic LBBB in a known patient without symptoms is a monitoring finding. The word 'new' in front of LBBB changes everything. If you cannot confirm prior ECGs, escalate as new until proven otherwise.",
    whenMoreUrgent:
      "New LBBB in any patient with chest pain, shortness of breath, or any symptoms of acute coronary syndrome is an emergent finding — notify the provider and activate your institution's STEMI response if that is protocol. Even in the absence of typical symptoms, new LBBB that cannot be confirmed as chronic warrants immediate provider evaluation. LBBB makes the ECG difficult to interpret for ischemia — it is not a reason to defer the workup, but a reason to escalate it.",
    urgency: "urgent",
    urgencyLabel: "Urgent",
  },
  {
    id: "atrial_paced",
    name: "Atrial Paced Rhythm",
    shortName: "A-Paced",
    tagline: "Find the spike before naming the rhythm — one spike before each P wave, narrow QRS follows.",
    rate: "Set by pacemaker — typically 60–80 bpm",
    regularity: "Regular — pacemaker fires at a fixed programmed rate",
    pWave: "Present after each pacing spike — upright but slightly different morphology than intrinsic sinus P waves",
    qrs: "Narrow (< 0.12 sec) — AV node and bundle branches conduct normally once the atrial impulse arrives",
    recognitionCues: [
      "Pacing spike visible just before each P wave — a sharp vertical artifact",
      "P wave follows every spike — upright but may look slightly different from the patient's intrinsic P",
      "Narrow QRS — ventricular conduction is normal, not paced",
      "Regular rhythm at the pacemaker's programmed rate",
    ],
    nursesNotice:
      "The strip looks like normal sinus rhythm with one extra feature: a tiny sharp vertical spike immediately before each P wave. The QRS is narrow because the ventricles are conducting normally — only the atrium is being paced. The rate will be strikingly consistent, locked to the pacemaker's setting. Learn to look for that spike first; once you find it, the rest of the strip will make sense.",
    confusedWith:
      "Normal sinus rhythm: also regular with upright P waves and narrow QRS. The distinguishing feature is the pacing spike — a brief sharp vertical artifact immediately before the P wave that does not appear in native sinus rhythm. If you can see a spike before each P, the atrium is being paced. If there is no spike, it is intrinsic sinus conduction.",
    bedsideRelevance:
      "Atrial pacing maintains the organized atrial contribution to ventricular filling (the atrial kick), which can contribute up to 20–30% of cardiac output in patients with diastolic dysfunction or poor reserve. The pacemaker is doing the atrial node's job. As long as the spikes are followed by P waves and then narrow QRS complexes, the pacemaker is sensing, pacing, and capturing appropriately. Your job is to confirm those three events are linked on every beat.",
    whenMoreUrgent:
      "A pacing spike not followed by a P wave, or a P wave not followed by a QRS, indicates pacemaker malfunction — notify the provider. A rate that has changed from the programmed setting, a new loss of the pacing spike, or any patient symptoms (dizziness, presyncope, fatigue) in the context of a paced rhythm warrant immediate provider notification and cardiology involvement.",
    urgency: "stable",
    urgencyLabel: "Stable",
  },
  {
    id: "ventricular_paced",
    name: "Ventricular Paced Rhythm",
    shortName: "V-Paced",
    tagline: "The pacemaker fires the ventricle directly — a spike before each wide bizarre QRS, no organized P wave.",
    rate: "Set by pacemaker — typically 60–80 bpm",
    regularity: "Regular — pacemaker fires at a fixed programmed rate",
    pWave: "Absent or dissociated — no organized atrial activity captured by the pacemaker; P waves may appear independently at a different rate",
    qrs: "Wide (≥ 0.12 sec) and bizarre — the pacemaker depolarizes the ventricle directly from the electrode tip, spreading impulse cell-to-cell rather than through the normal conduction system",
    recognitionCues: [
      "Pacing spike before each wide bizarre QRS — a sharp vertical artifact immediately before the complex",
      "Wide, broad QRS — looks like LBBB morphology when pacing from the right ventricle",
      "Discordant T wave — T wave deflects opposite to the main QRS direction",
      "No organized upright P wave before the spike — the atrium is not being paced",
    ],
    nursesNotice:
      "Every beat is wide and bizarre — every single one. There is a consistent sharp spike immediately before each complex, and the complex itself looks nothing like normal sinus beats. The T wave goes the opposite direction to the QRS. This is not VTach: the rate is slow and controlled (set by the pacemaker), the rhythm is perfectly regular, and there is a spike before each complex. Wide-complex-with-a-spike at a normal rate is ventricular pacing until proven otherwise.",
    confusedWith:
      "Ventricular tachycardia: also shows wide bizarre QRS complexes, but VTach is fast (above 100 bpm) and has no pacing spikes. A ventricular paced rhythm runs at the pacemaker's programmed rate (usually 60–80 bpm) and has a distinct spike before every beat. If the rate is controlled and you can find a spike, it is paced — not VTach. Bundle branch block: also produces wide QRS complexes but with no pacing spike before each complex.",
    bedsideRelevance:
      "Ventricular pacing is used when the AV node or ventricle cannot be relied upon to conduct and contract reliably. The loss of coordinated atrial contraction (the atrial kick) can reduce cardiac output, particularly in patients who depend on it. A patient who is pacemaker-dependent — who has no reliable intrinsic rhythm — is more vulnerable if the pacemaker malfunctions. Document the paced rate and whether every spike is followed by a QRS (capture) and whether the pacemaker is firing when it should.",
    whenMoreUrgent:
      "Any pacing spike not followed by a QRS complex is failure to capture — notify the provider immediately. A rate significantly different from the programmed setting, complete loss of pacing spikes, or a patient with symptoms (dizziness, presyncope, hypotension) in the context of pacemaker changes warrants immediate provider notification and cardiology involvement. Magnet application over a pacemaker changes its behavior — report any new or unexplained rhythm changes in pacemaker patients.",
    urgency: "stable",
    urgencyLabel: "Stable",
  },
  {
    id: "av_sequential_paced",
    name: "AV Sequential Paced Rhythm",
    shortName: "AV-Paced",
    tagline: "Both chambers are paced in sequence — two spikes per beat, preserving the atrial contribution to ventricular filling.",
    rate: "Set by pacemaker — typically 60–80 bpm",
    regularity: "Regular — both spikes fire at the pacemaker's programmed intervals",
    pWave: "Present after the first spike — paced P wave follows atrial pacing artifact",
    qrs: "Wide (≥ 0.12 sec) — ventricular pacing produces a wide bizarre complex, identical morphology to pure ventricular pacing",
    recognitionCues: [
      "Two spikes per beat — atrial spike before P wave, ventricular spike before wide QRS",
      "Paced P wave visible between the two spikes",
      "Wide bizarre QRS after the second spike — ventricular pacing morphology",
      "Regular rhythm at the pacemaker's programmed rate",
    ],
    nursesNotice:
      "This rhythm has two spikes per beat — that is the defining visual feature. First spike, then a P wave, then a short flat line, then a second spike, then a wide QRS. The atrium fires first (first spike → P wave), then the ventricle fires after a programmed AV delay (second spike → wide QRS). If you see two spikes every beat, the pacemaker is pacing both chambers in sequence. This is the most physiological dual-chamber pacing mode.",
    confusedWith:
      "Ventricular paced rhythm: also wide bizarre QRS with a pacing spike, but only one spike per beat, and no P wave before it. AV sequential pacing has two spikes — the first precedes a P wave, the second precedes the QRS. If you count the spikes and find one per beat, it is ventricular pacing. If you count two, it is AV sequential. Atrial paced rhythm: one spike per beat before a narrow QRS — no second spike, no wide QRS.",
    bedsideRelevance:
      "AV sequential pacing maintains both the rate and the timing relationship between atrial and ventricular contraction — preserving the atrial kick that contributes to ventricular filling. This matters most in patients with poor systolic function, hypertrophic cardiomyopathy, or any condition where the atrial contribution to cardiac output is clinically significant. The pacemaker is doing the work of the sinus node and AV node together. Confirm that both spikes are followed by their expected events: spike 1 → P wave, spike 2 → wide QRS.",
    whenMoreUrgent:
      "If the first spike is not followed by a P wave (atrial failure to capture), or the second spike is not followed by a QRS (ventricular failure to capture), notify the provider. Any change in the number of spikes per beat, a loss of P waves between the spikes, or patient symptoms associated with a rhythm change are findings that require prompt provider notification and cardiology involvement.",
    urgency: "stable",
    urgencyLabel: "Stable",
  },
  {
    id: "pacemaker_failure_capture",
    name: "Pacemaker Failure to Capture",
    shortName: "Fail Capture",
    tagline: "The pacemaker fires but the heart does not respond — spikes appear without the expected QRS following them.",
    rate: "Pacing spikes at the programmed rate — effective ventricular rate lower due to non-captured beats",
    regularity: "Spikes regular — QRS complexes irregular and fewer than expected",
    pWave: "Absent after non-captured spikes — no depolarization follows the electrical stimulus",
    qrs: "Present only on captured beats — absent after non-captured spikes. The flatline after a spike is the defining finding.",
    recognitionCues: [
      "Pacing spike present but not followed by a QRS — the defining abnormality",
      "Flat baseline immediately after the non-captured spike — no P wave, no QRS, nothing",
      "Captured beats (spike followed by QRS) and non-captured beats (spike then flatline) intermixed",
      "Regular spacing of spikes — the pacemaker fires on schedule, but the myocardium does not respond",
    ],
    nursesNotice:
      "The strip shows pacing spikes firing at their usual interval, but some of those spikes are followed by nothing — just flat baseline. A spike without a QRS after it is the alarming finding. The pacemaker is sending the signal, but the heart is not responding. If the patient is pacemaker-dependent (has no reliable intrinsic rhythm), these non-captured beats represent moments where the heart has effectively stopped beating. Do not wait for symptoms to escalate before notifying the provider.",
    confusedWith:
      "Normal paced rhythm: every spike is followed by a QRS — no exceptions. In failure to capture, some spikes are followed by no depolarization at all — just a flatline where the QRS should be. If you see a spike and then nothing, it is failure to capture. Pacemaker failure to sense: spikes fire at inappropriate times but still produce QRS complexes when the myocardium is not refractory. Failure to capture means the spike exists but the QRS does not follow.",
    bedsideRelevance:
      "Failure to capture means the electrical stimulus reached the heart but did not trigger a depolarization. Common causes include lead dislodgement, fibrosis or scar at the electrode tip, electrolyte disturbances (especially hyperkalemia), battery depletion, or a change in the myocardium's pacing threshold. In a pacemaker-dependent patient, non-captured beats mean the heart is not contracting on those cycles — which directly impacts cardiac output. Assess the patient immediately, notify the provider, and prepare for potential pacemaker threshold adjustment or transvenous pacing backup.",
    whenMoreUrgent:
      "Any failure to capture in a pacemaker-dependent patient is a critical finding. A patient with no reliable intrinsic rhythm who is losing pacemaker capture has, effectively, a failing cardiac pacemaker with no backup. Dizziness, near-syncope, hypotension, or altered mental status alongside failure to capture is an emergency. Notify the provider immediately, check electrolytes (especially potassium), and prepare for emergent pacing or reprogramming. Do not delay.",
    urgency: "urgent",
    urgencyLabel: "Urgent",
  },
  {
    id: "pacemaker_failure_sense",
    name: "Pacemaker Failure to Sense",
    shortName: "Fail Sense",
    tagline: "The pacemaker cannot detect the patient's own heartbeats and fires on its timer regardless — spikes land where they should not.",
    rate: "Pacing spikes at programmed rate regardless of native beats — effective rate determined by mix of intrinsic and paced complexes",
    regularity: "Irregular — pacing spikes fire at a fixed interval regardless of native rhythm, causing competition",
    pWave: "Present on native beats — sinus P waves before native QRS complexes. No P before spike-triggered paced beats.",
    qrs: "Mixed — narrow QRS on native beats, wide bizarre QRS on paced beats",
    recognitionCues: [
      "Pacing spikes appear in the wrong place — immediately after a native QRS or during a T wave",
      "Native beats and paced beats compete on the strip — two different QRS morphologies",
      "Spike fires without regard for whether the patient just had a heartbeat",
      "Narrow native QRS complexes alternating with wide paced QRS complexes initiated by spikes",
    ],
    nursesNotice:
      "The strip looks disorganized — some beats are narrow and normal, others are wide and paced, and pacing spikes appear at times that seem wrong. The key is to find a spike sitting right after a native QRS or during a T wave: the pacemaker should have detected that native beat and stayed quiet (been inhibited), but instead it fired on its programmed timer. The pacemaker is competing with the heart's own rhythm because it cannot see what the heart is doing.",
    confusedWith:
      "Normal paced rhythm: every spike fires at the right time and is not competing with a native beat. In failure to sense, spikes appear immediately after native QRS complexes — places where the pacemaker should have been inhibited. Fusion beats (a hybrid between a native and paced beat) can appear when the pacemaker fires very close to a native beat — both fire nearly simultaneously, and the QRS morphology is intermediate. Fusion beats in this context are a sign of undersensing.",
    bedsideRelevance:
      "The most dangerous aspect of failure to sense is the possibility of a pacing spike landing on the T wave of a native beat (R-on-T phenomenon) — a timing that can trigger ventricular fibrillation in a susceptible myocardium. Even if the patient is currently tolerating the rhythm, a spike on T is a safety issue that requires immediate provider notification. Common causes of undersensing include lead dislodgement, poor electrode contact, low signal amplitude from the intrinsic beat, battery depletion, or a change in pacemaker programming.",
    whenMoreUrgent:
      "Any pacing spike falling during the T wave of a native beat is an emergency finding — notify the provider immediately. Even spikes landing immediately after a QRS (without T-wave involvement) represent pacemaker malfunction that needs evaluation. A patient with failure to sense who develops a new arrhythmia, hemodynamic instability, or palpitations requires immediate escalation. Failure to sense in the acute post-implant period suggests lead dislodgement until proven otherwise.",
    urgency: "urgent",
    urgencyLabel: "Urgent",
  },
];

// ─── Practice categories ──────────────────────────────────────────────────

export interface PracticeCategory {
  key: string;
  label: string;
  ids: string[];
}

export const PRACTICE_CATEGORIES: PracticeCategory[] = [
  {
    key: 'all',
    label: 'All rhythms',
    ids: RHYTHMS.map(r => r.id),
  },
  {
    key: 'beginner',
    label: 'Beginner',
    ids: [
      'nsr', 'sinus_bradycardia', 'sinus_tachycardia',
      'afib', 'aflutter', 'svt',
      'vtach', 'vfib_coarse', 'asystole', 'first_degree_avb',
    ],
  },
  {
    key: 'blocks',
    label: 'Blocks & conduction',
    ids: ['first_degree_avb', 'mobitz_i', 'mobitz_ii', 'complete_heart_block', 'rbbb', 'lbbb'],
  },
  {
    key: 'lethal',
    label: 'Lethal rhythms',
    ids: ['complete_heart_block', 'vtach', 'torsades', 'vfib_coarse', 'vfib_fine', 'asystole', 'pea'],
  },
  {
    key: 'paced',
    label: 'Paced rhythms',
    ids: [
      'atrial_paced', 'ventricular_paced', 'av_sequential_paced',
      'pacemaker_failure_capture', 'pacemaker_failure_sense',
    ],
  },
  {
    key: 'ectopy',
    label: 'Ectopy & escape',
    ids: [
      'sinus_arrhythmia', 'pac', 'pvc',
      'junctional_rhythm', 'accelerated_junctional', 'junctional_tachycardia',
      'ventricular_escape', 'idioventricular', 'aivr',
    ],
  },
  {
    key: 'electrolytes',
    label: 'Electrolytes / metabolic',
    ids: ['hyperkalemia_t', 'hyperkalemia_qrs', 'hyperkalemia_sine', 'torsades'],
  },
  {
    key: 'tachy',
    label: 'Tachy rhythms',
    ids: [
      'sinus_tachycardia', 'afib', 'aflutter', 'mat', 'svt',
      'junctional_tachycardia', 'aivr', 'vtach', 'torsades',
    ],
  },
];

// ─── Search aliases ───────────────────────────────────────────────────────────
// Hidden aliases used by the rhythm index filter. Values are lowercased at
// match time so casing here does not matter.
export const RHYTHM_ALIASES: Record<string, string[]> = {
  nsr:                        ['normal sinus', 'sinus rhythm'],
  sinus_bradycardia:          ['brady', 'slow heart rate'],
  sinus_tachycardia:          ['s tachy', 'sinus tachy', 'fast sinus'],
  afib:                       ['af', 'a fib', 'atrial fib', 'fibrillation', 'irregularly irregular'],
  aflutter:                   ['a flutter', 'atrial flutter', 'flutter', 'sawtooth'],
  svt:                        ['supraventricular', 'narrow complex tachy', 'paroxysmal'],
  first_degree_avb:           ['1st degree', 'first degree', 'prolonged pr', 'av block', '1 avb', '1avb'],
  mobitz_i:                   ['wenckebach', 'mobitz 1', '2nd degree type 1', 'second degree type 1', 'av block', 'progressively longer'],
  mobitz_ii:                  ['mobitz 2', '2nd degree type 2', 'second degree type 2', 'av block', 'dropped beat'],
  complete_heart_block:       ['3rd degree', 'third degree', 'chb', 'complete av block', 'av dissociation', '3 avb', '3avb', 'third degree av block'],
  vtach:                      ['vt', 'v tach', 'ventricular tachy', 'wide complex tachy', 'wide complex tachycardia'],
  torsades:                   ['tdp', 'torsade', 'polymorphic vt', 'qt prolongation', 'twisting'],
  vfib_coarse:                ['vf', 'v fib', 'ventricular fib', 'vfib', 'coarse vf', 'cardiac arrest'],
  vfib_fine:                  ['vf', 'fine vf', 'ventricular fib', 'vfib', 'cardiac arrest'],
  asystole:                   ['flatline', 'cardiac arrest', 'no rhythm', 'no activity'],
  pea:                        ['pulseless', 'electrical activity', 'cardiac arrest', 'pulseless electrical'],
  hyperkalemia_t:             ['hyperk', 'hyperkalemia', 'peaked t', 'electrolyte', 'potassium', 'peaked t waves'],
  hyperkalemia_qrs:           ['hyperk', 'hyperkalemia', 'wide qrs', 'electrolyte', 'potassium', 'widened qrs'],
  hyperkalemia_sine:          ['hyperk', 'hyperkalemia', 'sine wave', 'electrolyte', 'potassium', 'sinusoidal'],
  rbbb:                       ['right bundle', 'bundle branch', 'bbb', 'wide qrs', 'rsr prime'],
  lbbb:                       ['left bundle', 'bundle branch', 'bbb', 'wide qrs'],
  atrial_paced:               ['paced', 'pacemaker', 'a paced', 'atrial pacing'],
  ventricular_paced:          ['paced', 'pacemaker', 'v paced', 'ventricular pacing'],
  av_sequential_paced:        ['paced', 'pacemaker', 'dual chamber', 'av paced', 'sequential pacing'],
  pacemaker_failure_capture:  ['paced', 'pacemaker failure', 'failure to capture', 'no capture', 'non capture', 'spike no qrs'],
  pacemaker_failure_sense:    ['paced', 'pacemaker failure', 'failure to sense', 'undersensing', 'oversensing', 'no sense'],
  pac:                        ['premature atrial', 'atrial ectopy', 'early beat', 'ectopic atrial'],
  pvc:                        ['premature ventricular', 'ventricular ectopy', 'early beat', 'ectopic ventricular', 'compensatory pause'],
  junctional_rhythm:          ['junctional', 'jxn', 'av nodal', 'nodal rhythm', 'retrograde p'],
  accelerated_junctional:     ['accelerated junctional', 'jxn', 'nodal', 'retrograde p'],
  junctional_tachycardia:     ['junctional tachy', 'jxn tachy', 'nodal tachycardia'],
  idioventricular:            ['ivr', 'idioventricular', 'ventricular escape rhythm', 'slow ventricular'],
  aivr:                       ['accelerated idioventricular', 'slow vt', 'accelerated ventricular'],
  ventricular_escape:         ['escape beat', 'ventricular escape', 'backup beat', 'escape rhythm'],
  sinus_arrhythmia:           ['sinus variation', 'respiratory sinus', 'irregular sinus', 'breathing cycle'],
  mat:                        ['multifocal', 'multifocal atrial', 'wandering', 'copd rhythm', 'chaotic atrial'],
};

export const URGENCY_COLORS: Record<UrgencyLevel, string> = {
  stable:   "#22c55e",
  monitor:  "#f59e0b",
  urgent:   "#f97316",
  critical: "#ef4444",
};

export const URGENCY_CONTEXT: Record<UrgencyLevel, string> = {
  stable:
    "NSR is the reference point for everything else. Changes away from normal sinus — even subtle ones — are worth noting and trending. Escalation depends on symptoms, perfusion, and local protocol.",
  monitor:
    "The rate or rhythm alone is not enough information. Assessment and clinical context determine urgency. Follow local protocol for escalation criteria and provider notification thresholds.",
  urgent:
    "Notify the provider based on your clinical assessment, the patient's symptoms, and local protocol. The rhythm is one piece of the picture — perfusion, mental status, and the patient's baseline are the others.",
  critical:
    "Correlate with the patient before anything else. The monitor does not tell you whether the patient has a palpable pulse — only a physical assessment does. Follow your local emergency protocol.",
};
