import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Shift10 from '../src/modules/the-shift/shift10/Shift10.jsx';
import { KEY } from '../src/modules/the-shift/shift10/content.js';
import { saveSession, normalizeMoment } from '../src/modules/the-shift/shift10/flow.js';
export function render(state, moment) {
  const prior = globalThis.localStorage;
  globalThis.localStorage = { getItem: key => key === KEY ? saveSession({ state, moment: normalizeMoment(state, moment) }) : null };
  try { return renderToStaticMarkup(createElement(Shift10)); }
  finally { if (prior === undefined) delete globalThis.localStorage; else globalThis.localStorage = prior; }
}
