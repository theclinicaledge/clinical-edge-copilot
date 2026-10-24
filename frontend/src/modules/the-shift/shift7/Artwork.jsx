export default function Artwork({ compact = false }) {
 return <svg className="s7-art" viewBox="0 0 560 380" role="img" aria-label="Illustrated evidence board: several accounts connected to a timeline, with the onset still unresolved">
  <defs><pattern id="s7-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="currentColor" strokeWidth=".5" opacity=".16" /></pattern></defs>
  <rect width="560" height="380" fill="var(--ce-navy-header)" /><rect width="560" height="380" fill="url(#s7-grid)" />
  <g fill="none" stroke="var(--ce-text-dim)" strokeWidth="1"><path d="M75 270H490"/><path d="M105 268V158M270 268V126M442 268V181" strokeDasharray="4 6" /></g>
  <g fill="var(--ce-navy-700)" stroke="var(--ce-line-navy)"><rect x="45" y="65" width="155" height="97" rx="8" transform="rotate(-5 120 110)"/><rect x="214" y="32" width="150" height="99" rx="8" transform="rotate(4 289 82)"/><rect x="365" y="88" width="150" height="99" rx="8" transform="rotate(-3 440 137)"/></g>
  <g fill="var(--ce-text-light-body)" fontFamily="monospace" fontSize="11"><text x="65" y="95">PATIENT ACCOUNT</text><text x="233" y="64">WITNESS ACCOUNT</text><text x="385" y="120">ARRIVAL REPORT</text></g>
  <g stroke="var(--ce-text-dim)" strokeWidth="3" opacity=".7"><path d="M65 117h104m-104 14h70M234 85h105m-105 14h76M385 143h103m-103 14h74"/></g>
  <g fill="var(--ce-navy-header)" stroke="var(--ce-teal)" strokeWidth="2"><circle cx="105" cy="270" r="6"/><circle cx="270" cy="270" r="6"/><circle cx="442" cy="270" r="6"/></g>
  <circle cx="350" cy="270" r="21" fill="var(--ce-navy-header)" stroke="var(--ce-gold)" strokeDasharray="3 4"/><text x="350" y="277" textAnchor="middle" fill="var(--ce-gold)" fontSize="23" fontFamily="monospace">?</text>
  <g fill="var(--ce-text-light-body)" fontFamily="monospace" fontSize="11"><text x="72" y="305">BASELINE</text><text x="240" y="305">HISTORY</text><text x="416" y="305">DISCOVERY</text></g>
  {!compact && <text x="280" y="350" textAnchor="middle" fill="var(--ce-text-dim)" fontFamily="monospace" fontSize="10" letterSpacing="2">THE STORY BETWEEN THE TIMESTAMPS</text>}
 </svg>;
}
