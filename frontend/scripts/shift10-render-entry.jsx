import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Shift10 from '../src/modules/the-shift/shift10/Shift10.jsx';
import { KEY } from '../src/modules/the-shift/shift10/content.js';
import { savePayload } from '../src/modules/the-shift/shift10/state.js';
export function render(state) {
  const prior = globalThis.localStorage;
  globalThis.localStorage = { getItem: key => key === KEY ? savePayload(state) : null };
  try { return renderToStaticMarkup(createElement(Shift10)); }
  finally { if (prior === undefined) delete globalThis.localStorage; else globalThis.localStorage = prior; }
}
