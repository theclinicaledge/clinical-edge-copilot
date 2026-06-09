const STEPS = [
  {
    title: 'Rate',
    body: 'Count beats in 6 seconds and multiply by 10, or divide 300 by the number of large boxes between R peaks. Under 60 is slow. Over 100 is fast.',
  },
  {
    title: 'Regularity',
    body: 'Are the RR intervals consistent? Tap them out — a steady beat is regular. If you cannot find a pattern, it is irregular. Irregular rhythms demand closer inspection.',
  },
  {
    title: 'P waves',
    body: 'Is there a P wave before each QRS? Upright and uniform with one P per QRS at a consistent PR interval means sinus origin. No P waves, or P waves that do not relate to the QRS, means something else.',
  },
  {
    title: 'QRS width',
    body: 'Narrow (under 3 small boxes) suggests the impulse traveled normally through the ventricles — supraventricular origin. Wide (3 or more small boxes) suggests ventricular origin until proven otherwise.',
  },
  {
    title: 'P–QRS relationship',
    body: 'Does every P wave produce a QRS? A consistent PR interval means the impulse is conducting normally from atria to ventricles. A variable or absent relationship is the finding that changes the diagnosis.',
  },
];

const QUICK_REF = [
  { tag: 'NSR',     desc: 'Regular · P before every QRS · rate 60–100 · narrow QRS' },
  { tag: 'Sinus Arrhy', desc: 'Same as NSR · irregular RR with breathing · identical P wave every beat' },
  { tag: 'MAT',         desc: 'Fast irregular · ≥3 P-wave shapes · variable PR · narrow QRS · not AFib' },
  { tag: 'PEA',         desc: 'Organized rhythm on monitor · patient has NO pulse · cardiac arrest' },
  { tag: 'Brady',   desc: 'Same as NSR · rate below 60 · more flat baseline between beats' },
  { tag: 'S-Tachy', desc: 'Same as NSR · rate above 100 · P may hide in the T wave' },
  { tag: 'A-Fib',   desc: 'Irregularly irregular · no P waves · chaotic fibrillatory baseline' },
  { tag: 'Flutter', desc: 'Sawtooth F-waves ~300/min · QRS at fixed ratio · rate 75–150' },
  { tag: 'V-Tach',  desc: 'Wide bizarre QRS · fast · regular · correlate with patient immediately' },
  { tag: 'PAC',        desc: 'Early narrow beat · different P wave · non-compensatory pause' },
  { tag: 'PVC',        desc: 'Early wide bizarre beat · no P wave · compensatory pause' },
  { tag: 'Jxn',       desc: 'Slow 40–60 · no upright P · retrograde P in ST · narrow QRS' },
  { tag: 'Accel Jxn', desc: 'Rate 60–100 · looks like NSR · no upright P · narrow QRS' },
  { tag: 'Jxn Tachy', desc: 'Rate 100–130 · no upright P · narrow QRS · slower than SVT' },
  { tag: 'SVT',        desc: 'Fast regular narrow QRS · no P wave · abrupt onset/offset' },
  { tag: 'HyperK-T',    desc: 'Narrow tall tented T · symmetric · T > R height · QRS still normal' },
  { tag: 'HyperK-QRS',  desc: 'Flat P or absent · wide slurred QRS · peaked T merging · conduction failing' },
  { tag: 'HyperK-Sine', desc: 'No P/QRS/T · smooth sinusoidal wave · pre-arrest · correlate with patient now' },
  { tag: 'RBBB',    desc: 'Wide QRS · broad S below baseline · terminal R′ notch · upright T' },
  { tag: 'LBBB',    desc: 'Wide QRS · no Q · broad notched R · no S · inverted T · new = urgent' },
  { tag: '1° AVB',  desc: 'Regular · prolonged constant PR · every P conducts · no drops' },
  { tag: 'Mobitz I', desc: 'Progressive PR lengthening · dropped QRS · grouped beats' },
  { tag: 'Mobitz II', desc: 'Constant PR · sudden QRS drop · no warning · high-risk' },
  { tag: '3° AVB',   desc: 'AV dissociation · slow wide escape · PR varies every beat' },
  { tag: 'IVR',      desc: 'Very slow 20–40 · wide bizarre QRS · no P-QRS relation · ventricular pacemaker' },
  { tag: 'AIVR',     desc: 'Wide QRS · rate 40–100 · slower than VT · often post-reperfusion' },
  { tag: 'V-Escape', desc: 'Late wide beat after pause · ventricle rescues rhythm · opposite of PVC' },
  { tag: 'TdP',      desc: 'Twisting amplitude · polymorphic VT · QT prolongation context · pulseless possible' },
  { tag: 'VFib',     desc: 'Chaotic high-amplitude · no QRS · pulseless · cardiac arrest' },
  { tag: 'Fine VFib',desc: 'Low-amplitude chaotic · nearly flat but active · confirm vs asystole in 2 leads' },
  { tag: 'Asystole', desc: 'Near-flatline · no electrical activity · confirm 2 leads · loose lead rule-out' },
  { tag: 'A-Paced',      desc: 'Spike before every P wave · narrow QRS · normal conduction to ventricles' },
  { tag: 'V-Paced',      desc: 'Spike before every wide QRS · no P wave · discordant T · LBBB morphology' },
  { tag: 'AV-Paced',     desc: 'Two spikes per beat · first before P · second before wide QRS · dual-chamber' },
  { tag: 'Fail Capture', desc: 'Spike present but no QRS follows · flatline after spike · myocardium did not respond' },
  { tag: 'Fail Sense',   desc: 'Spike fires right after native beat · pacemaker competing · spike-on-T risk' },
];

export function RecognitionSidebar() {
  return (
    <>
      <p className="sidebar-title">Strip Reading Guide</p>

      <div className="sidebar-section">
        <p className="sidebar-heading">5 reading steps</p>
        <div className="reading-steps">
          {STEPS.map((step, i) => (
            <div key={step.title} className="reading-step">
              <span className="reading-step__num">{i + 1}</span>
              <div className="reading-step__body">
                <strong>{step.title}</strong>
                <p>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-heading">Quick keys</p>
        <div className="quick-ref">
          {QUICK_REF.map((row) => (
            <div key={row.tag} className="quick-ref-row">
              <span className="quick-ref-tag">{row.tag}</span>
              <span className="quick-ref-desc">{row.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
