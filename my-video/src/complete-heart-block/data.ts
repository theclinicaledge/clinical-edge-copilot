// ─── Complete Heart Block — video scenario data ───────────────────────────────

export interface CHBData {
  hookLine: string;
  hookSub: string;
  anatomySteps: { label: string; detail: string; color: string }[];
  nursingActions: string[];
  closingLine: string;
}

export const completeHeartBlockData: CHBData = {
  hookLine: "This rhythm is a\nmedical emergency.",
  hookSub: "Cardiac Rhythm Series — Complete Heart Block",

  anatomySteps: [
    {
      label: "SA node fires normally",
      detail: "P waves: regular, ~75 bpm",
      color: "#1FBF75",
    },
    {
      label: "AV node is completely blocked",
      detail: "No impulses conduct to the ventricles",
      color: "#e05572",
    },
    {
      label: "Ventricular escape takes over",
      detail: "Wide QRS: slow, ~35 bpm — independent of P waves",
      color: "#F2B94B",
    },
  ],

  nursingActions: [
    "Call for help — this is a code-level rhythm",
    "Obtain 12-lead ECG immediately",
    "Establish IV access × 2",
    "Prepare transcutaneous pacing equipment",
    "Keep atropine and dopamine at bedside",
    "Notify provider and activate response team",
  ],

  closingLine:
    "P waves and QRS complexes marching independently.\nNo relationship. No conduction. No time to wait.",
};
