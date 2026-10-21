import { useRef } from 'react';

const sections = [
  ['Your choices', '.shift-reflections, .monitor-review, .discharge-personal-review, .conversation-reflections, .s5-debrief'],
  ['Takeaways', '.shift-takeaways, .discharge-takeaways, .conversation-takeaways, .s5-takeaways'],
  ['Sources', '.shift-sources, .discharge-sources, .conversation-evidence, .s5-sources'],
  ['Next step', '.shift-next-step, .conversation-further'],
];

export default function DebriefNavigation() {
  const nav = useRef(null);
  function jump(selector) {
    const root = nav.current.closest('.shift-scenario-scroll');
    const target = root.querySelector(selector);
    if (!target) return;
    // Preserve existing disclosures; only expand the requested destination.
    for (let parent = target; parent && parent !== root; parent = parent.parentElement) {
      if (parent.tagName === 'DETAILS') parent.open = true;
    }
    target.querySelectorAll('details').forEach(details => { if (selector.includes('sources')) details.open = true; });
    target.setAttribute('tabindex', '-1');
    target.classList.add('shift-debrief-target');
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  return <nav ref={nav} className="shift-debrief-nav" aria-label="Debrief sections">
    {sections.map(([label, selector]) => <button type="button" key={label} onClick={() => jump(selector)}>{label}</button>)}
  </nav>;
}
