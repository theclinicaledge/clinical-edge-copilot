import { openingReactions } from './openingReactions.js';

export default function OpeningReaction({ choice }) {
  const reaction = openingReactions[choice];
  if (!reaction) return null;
  return <div className="conversation-opening-reaction" data-opening-reaction={choice}>
    <svg viewBox="250 65 180 165" aria-hidden="true" focusable="false">
      <rect x="250" y="65" width="180" height="165" fill="#152A38" />
      <path d="M293 201H430V242H255V228Z" fill="#D9D4C8" />
      <path d="M300 190H430V215H278Z" fill="#F7F3E9" />
      <path d="M356 178C353 144 342 130 322 130C299 130 291 148 288 169L276 202L355 203Z" fill="#6B858B" />
      <g transform={`translate(0 ${reaction.headY})`}><circle cx="324" cy="107" r="23" fill="#B4BEB6" /></g>
      <path d={reaction.arm} stroke="#B4BEB6" strokeWidth="12" strokeLinecap="round" />
      <g transform={reaction.frame}>
        <rect x="362" y="134" width="39" height="49" rx="3" transform="rotate(12 362 134)" fill="#D4A84B" />
        <rect x="368" y="141" width="27" height="35" rx="1" transform="rotate(12 368 141)" fill="#F0EDE6" />
        <circle cx="376" cy="154" r="5" fill="#6B858B" /><path d="M368 168Q376 155 384 171" fill="#6B858B" />
      </g>
    </svg>
    <div><span className="conversation-eyebrow">Room 18 / His reaction</span><p>{reaction.text}</p><small className="conversation-reaction-variation">One possible response. Real patients vary.</small></div>
  </div>;
}
