import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { configure, capture, pageViewed, resetShiftAnalytics, shiftProgress, syncConsent, trackEvent, _testing } from '../src/productAnalytics.js';
import { saveConsent } from '../src/consent.js';

function storage() {
  const data = new Map();
  return {
    get length() { return data.size; },
    key(index) { return [...data.keys()][index] ?? null; },
    getItem(key) { return data.get(key) ?? null; },
    setItem(key, value) { data.set(key, String(value)); },
    removeItem(key) { data.delete(key); },
    clear() { data.clear(); },
  };
}
let sent;
beforeEach(() => {
  const local = storage();
  globalThis.localStorage = local;
  globalThis.window = { localStorage: local, sessionStorage: storage(), location: { search: '', pathname: '/ask' }, dispatchEvent() {} };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { webdriver: false } });
  sent = [];
  globalThis.fetch = (url, options) => { sent.push({ url, ...JSON.parse(options.body), signal: options.signal }); return Promise.resolve({ ok: true }); };
  saveConsent({ ai: true, analytics: false });
  syncConsent();
  configure({ token: 'phc_testing_not_a_real_project_token', host: 'https://us.i.posthog.com' });
});

test('nothing is stored or transmitted without opt-in', () => {
  assert.equal(capture('ask_submitted', { question: 'private text' }), false);
  pageViewed('/ask');
  assert.equal(sent.length, 0);
  assert.equal(localStorage.getItem('ce_product_analytics_id'), null);
});

test('only allowlisted event fields leave the device', () => {
  saveConsent({ ai: true, analytics: true });
  assert.equal(capture('ask_failed', { kind: 'followup', failure: 'server', question: 'sensitive', status: 500, patient: 'private' }), true);
  assert.equal(sent.length, 1);
  assert.deepEqual(Object.keys(sent[0].properties).sort(), ['$process_person_profile', 'analytics_origin', 'failure', 'kind', 'route']);
  assert.equal(sent[0].properties.analytics_origin, 'app');
  assert.equal(sent[0].properties.kind, 'followup');
  assert.equal(capture('unknown_event', { question: 'private' }), false);
  assert.equal(_testing.safeRoute('/ask?question=sensitive'), '/other');
});

test('consent withdrawal clears analytics-owned identifiers and stops capture', () => {
  saveConsent({ ai: true, analytics: true });
  capture('ask_submitted', {});
  localStorage.setItem('ce_product_play_drowsy-patient', 'test');
  saveConsent({ ai: true, analytics: false });
  syncConsent();
  assert.equal(localStorage.getItem('ce_product_analytics_id'), null);
  assert.equal(localStorage.getItem('ce_product_play_drowsy-patient'), null);
  assert.equal(capture('ask_succeeded', {}), false);
  assert.equal(sent.length, 1);
});

test('Shift progress distinguishes start, step, completion and replay without answers', () => {
  saveConsent({ ai: true, analytics: true });
  shiftProgress('which-patient-first', '0.4', { stage: 0 }, { stage: 1, answers: { private: 'choice' } }, 7);
  shiftProgress('which-patient-first', '0.4', { stage: 1 }, { stage: 1, answers: { private: 'changed' } }, 7);
  shiftProgress('which-patient-first', '0.4', { stage: 1 }, { stage: 7 }, 7);
  shiftProgress('which-patient-first', '0.4', { stage: 7 }, { stage: 7 }, 7);
  assert.deepEqual(sent.map(item => item.event), ['shift_started', 'shift_step_reached', 'shift_decision_reached', 'shift_step_reached', 'shift_completed']);
  assert.equal(sent[0].properties.version, '0.4');
  assert.equal(sent[0].properties.play_id, sent[4].properties.play_id);
  assert.equal(JSON.stringify(sent).includes('private'), false);
  resetShiftAnalytics('which-patient-first');
  shiftProgress('which-patient-first', '0.4', { stage: 0 }, { stage: 1 }, 7);
  assert.notEqual(sent[0].properties.play_id, sent[5].properties.play_id);
});

test('campaign values and routes are sanitized', () => {
  saveConsent({ ai: true, analytics: true });
  window.location.search = '?utm_source=community&utm_campaign=hello%20private';
  pageViewed('/ask');
  assert.equal(sent[0].properties.route, '/ask');
  assert.equal(sent[0].properties.utm_source, 'community');
  assert.equal(sent[0].properties.utm_campaign, undefined);
});

test('App Store badge interest retains only an approved placement', () => {
  saveConsent({ ai: true, analytics: true });
  assert.equal(trackEvent('app_store_badge_clicked', { placement: 'footer', question: 'private' }), true);
  assert.equal(trackEvent('app_store_badge_clicked', { placement: 'unapproved', question: 'private' }), false);
  assert.equal(sent.length, 1);
  assert.deepEqual(Object.keys(sent[0].properties).sort(), ['$process_person_profile', 'analytics_origin', 'placement', 'route']);
  assert.equal(sent[0].properties.placement, 'footer');
  assert.equal(trackEvent('app_store_badge_clicked', { placement: 'learn', question: 'private' }), true);
  assert.equal(sent.at(-1).properties.placement, 'learn');
  assert.equal('question' in sent.at(-1).properties, false);
});

test('approved Instagram ad labels require consent and arrive together', () => {
  window.location.pathname = '/learn';
  window.location.search = '?utm_source=instagram&utm_medium=paid_social&utm_campaign=clinical_edge_learn_test&utm_content=who_first_video';
  pageViewed('/learn');
  assert.equal(sent.length, 0);
  saveConsent({ ai: false, analytics: true });
  pageViewed('/learn');
  assert.deepEqual(sent[0].properties, {
    route: '/learn', utm_source: 'instagram', utm_medium: 'paid_social',
    utm_campaign: 'clinical_edge_learn_test', utm_content: 'who_first_video',
    analytics_origin: 'app', $process_person_profile: false,
  });
  saveConsent({ ai: false, analytics: false });
  syncConsent();
  pageViewed('/learn');
  assert.equal(sent.length, 1);
});

test('unapproved campaign and creative values never leave the device', () => {
  saveConsent({ ai: false, analytics: true });
  window.location.search = '?utm_source=private&utm_medium=secret&utm_campaign=private%20text&utm_content=private%20text&question=private';
  pageViewed('/learn');
  assert.deepEqual(sent[0].properties, { route: '/learn', analytics_origin: 'app', $process_person_profile: false });
  assert.deepEqual(_testing.propertiesFor('page_viewed', { route: '/learn', utm_content: 'unknown', utm_campaign: 'unknown' }), { route: '/learn' });
  assert.deepEqual(_testing.propertiesFor('feature_opened', { route: '/learn', feature: 'shift_library', utm_content: 'who_first_video' }), { route: '/learn', feature: 'shift_library' });
});
