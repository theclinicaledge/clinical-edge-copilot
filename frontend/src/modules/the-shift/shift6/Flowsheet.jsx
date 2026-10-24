import { useRef } from 'react';
import TrendReading from '../components/TrendReading.jsx';

export default function Flowsheet(props) {
  const root = useRef(null);
  const move = direction => {
    const scroll = root.current?.querySelector('.trend-scroll');
    scroll?.scrollBy({ left: direction * scroll.clientWidth * 0.75, behavior: 'instant' });
  };
  return <div ref={root} className="s6-flowsheet">
    <div className="s6-flowsheet-nav"><strong>{props.caption}</strong><div>
      <button type="button" aria-label="View earlier readings" title="View earlier readings" onClick={() => move(-1)}>&#8592;</button>
      <button type="button" aria-label="View later readings" title="View later readings" onClick={() => move(1)}>&#8594;</button>
    </div></div>
    <TrendReading {...props} />
  </div>;
}
