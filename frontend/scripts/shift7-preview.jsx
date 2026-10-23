import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import Shift7 from '../src/modules/the-shift/shift7/Shift7.jsx';
import { Library } from '../src/modules/the-shift/ShiftExperience.jsx';
import '../src/styles/tokens.css';
import '../src/modules/the-shift/shift.css';
import '../src/modules/the-shift/shift7/shift7.css';
export default function Preview() {
 const [library, setLibrary] = useState(false);
 const [notice, setNotice] = useState('');
 function navigate(to) {
  if (to === '/learn/shifts/missing-time') {setLibrary(false);setNotice('');window.scrollTo(0,0);}
  else setNotice('This portable preview includes Shift 7. Other shifts remain available in the existing app.');
 }
 return <div onClickCapture={e=>{const a=e.target.closest('a'); if(a?.getAttribute('href')==='/learn/shifts'){e.preventDefault();setLibrary(true);window.scrollTo(0,0);}}}>
 {library ? <><p role="status" style={{padding:'0 24px'}}>{notice}</p><Library navigate={navigate}/></> : <Shift7/>}
 </div>;
}
createRoot(document.getElementById('root')).render(<Preview />);
