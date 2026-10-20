import { hasAnalyticsConsent } from './consent.js';

const ID_KEY = 'ce_product_analytics_id';
const EXCLUDE_KEY = 'ce_product_analytics_exclude';
const PLAY_PREFIX = 'ce_product_play_';
const HOSTS = new Set(['https://us.i.posthog.com', 'https://eu.i.posthog.com']);
const SCENARIOS = new Set(['drowsy-patient', 'monitor-alarm', 'discharge-puzzle', 'conversation', 'which-patient-first']);
const DECISION_STAGES = { 'drowsy-patient': [1, 2, 3, 4, 5], 'monitor-alarm': [1, 2, 3, 4, 5, 6], 'discharge-puzzle': [1, 2, 3, 4, 5], conversation: [1, 2, 3, 4, 5], 'which-patient-first': [1, 2, 4, 5, 6] };
const ROUTES = new Set(['/', '/ask', '/copilot', '/learn', '/learn/shifts', '/shifts', '/rhythm-lab', '/rhythm-lab/library', '/rhythm-lab/practice', '/rhythm-lab/compare', '/rhythm-lab/pearls', '/rhythm-lab/sprint', '/abg-lab', '/reference-hub', '/icu-drips', '/brain-sheets', '/landing', '/privacy', '/choices', '/terms', '/support', '/download', '/scenario', '/quickstart', '/blog']);
const EVENTS = new Set(['page_viewed', 'feature_opened', 'core_task_failed', 'ask_submitted', 'ask_succeeded', 'ask_failed', 'tool_started', 'tool_completed', 'tool_failed', 'shift_started', 'shift_resumed', 'shift_step_reached', 'shift_decision_reached', 'shift_completed', 'app_store_badge_clicked']);
const BADGE_PLACEMENTS = new Set(['landing', 'download', 'footer', 'learn']);
const FEATURES = new Set(['ask', 'shift_brain', 'shift_library', 'rhythm_lab', 'abg_lab', 'references', 'icu_drips', 'brain_sheets']);
const TOOLS = new Set(['abg', 'rhythm_practice', 'rhythm_sprint', 'reference_search', 'shift_brain']);
const FAILURES = new Set(['limit', 'network', 'server', 'withheld_or_rejected', 'unavailable']);
const CAMPAIGN_VALUES = {
  utm_source: new Set(['instagram', 'tiktok', 'youtube', 'reddit', 'facebook', 'email', 'friend', 'community', 'student_group', 'qr']),
  utm_medium: new Set(['social', 'email', 'referral', 'community', 'qr', 'paid_social']),
  utm_campaign: new Set(['fl04', 'student_feedback', 'public_beta', 'clinical_edge_learn_test']),
  utm_content: new Set(['who_first_video']),
};
let config = null;
let lastPage = '';
const recentFeatureOpen = new Map();
const pending = new Set();
const store = () => { try { return window.localStorage; } catch { return null; } };
const session = () => { try { return window.sessionStorage; } catch { return null; } };
const safeToken = value => typeof value === 'string' && /^[a-z0-9][a-z0-9_-]{0,63}$/i.test(value) ? value : null;
const safeVersion = value => typeof value === 'string' && /^[0-9][0-9a-z.+-]{0,31}$/i.test(value) ? value : null;
const safeRoute = path => {
  if (ROUTES.has(path)) return path;
  if (/^\/learn\/shifts\/(drowsy-patient|monitor-alarm|discharge-puzzle|conversation|which-patient-first)$/.test(path)) return path;
  if (/^\/brain-sheets\/[a-z0-9-]+$/.test(path)) return '/brain-sheets/detail';
  if (/^\/blog\/[a-z0-9-]+$/.test(path)) return '/blog/detail';
  return '/other';
};
function excluded() {
  if (new URLSearchParams(window.location.search).get('ce_analytics') === 'exclude') store()?.setItem(EXCLUDE_KEY, '1');
  return import.meta.env?.DEV || navigator.webdriver || store()?.getItem(EXCLUDE_KEY) === '1';
}
function allowed() {
  // Private track has no analytics, autocapture or session recording. Learning records stay local.
  if (window.location.pathname === '/learn/med-surg' || window.location.pathname.startsWith('/learn/med-surg/')) return false;
  return !!config && hasAnalyticsConsent() && !excluded();
}
function distinctId() {
  const storage = store();
  if (!storage) return null;
  let id = storage.getItem(ID_KEY);
  if (!id) { id = crypto.randomUUID(); storage.setItem(ID_KEY, id); }
  return id;
}
function propertiesFor(event, props) {
  const result = {};
  if (event === 'page_viewed') {
    result.route = safeRoute(props.route);
    for (const key of Object.keys(CAMPAIGN_VALUES)) if (CAMPAIGN_VALUES[key].has(props[key])) result[key] = props[key];
  }
  else result.route = safeRoute(props.route);
  if (event === 'feature_opened' && FEATURES.has(props.feature)) result.feature = props.feature;
  if (event === 'app_store_badge_clicked' && BADGE_PLACEMENTS.has(props.placement)) result.placement = props.placement;
  if (event === 'core_task_failed') {
    if (FEATURES.has(props.feature)) result.feature = props.feature;
    if (FAILURES.has(props.failure)) result.failure = props.failure;
  }
  if (event.startsWith('ask_')) {
    result.kind = props.kind === 'followup' ? 'followup' : 'question';
    if (event === 'ask_failed' && FAILURES.has(props.failure)) result.failure = props.failure;
  }
  if (event.startsWith('tool_')) {
    if (TOOLS.has(props.tool)) result.tool = props.tool;
    if (event === 'tool_failed' && FAILURES.has(props.failure)) result.failure = props.failure;
  }
  if (event.startsWith('shift_')) {
    if (SCENARIOS.has(props.scenario)) result.scenario = props.scenario;
    if (safeVersion(props.version)) result.version = props.version;
    if (/^[0-9a-f-]{36}$/.test(props.play_id || '')) result.play_id = props.play_id;
    if (Number.isInteger(props.step) && props.step >= 1 && props.step <= 8) result.step = props.step;
  }
  return result;
}
function valid(event, props) {
  if (event === 'feature_opened') return !!props.feature;
  if (event === 'app_store_badge_clicked') return !!props.placement;
  if (event === 'core_task_failed') return !!props.feature && !!props.failure;
  if (event.startsWith('tool_')) return !!props.tool;
  if (event.startsWith('shift_')) return !!props.scenario && !!props.version && !!props.play_id && (!['shift_resumed', 'shift_step_reached', 'shift_decision_reached'].includes(event) || !!props.step);
  return true;
}
export function configure({ token, host }) {
  config = /^phc_[a-zA-Z0-9_]{8,}$/.test(token) && HOSTS.has(host) ? { token, host } : null;
}
export function syncConsent() {
  if (hasAnalyticsConsent() && !excluded()) return;
  pending.forEach(controller => controller.abort());
  pending.clear();
  const storage = store();
  storage?.removeItem(ID_KEY);
  for (let index = (storage?.length || 0) - 1; index >= 0; index--) {
    const key = storage.key(index);
    if (key?.startsWith(PLAY_PREFIX)) storage.removeItem(key);
  }
  const activeSession = session();
  for (let index = (activeSession?.length || 0) - 1; index >= 0; index--) {
    const key = activeSession.key(index);
    if (key?.startsWith(PLAY_PREFIX)) activeSession.removeItem(key);
  }
  lastPage = '';
  recentFeatureOpen.clear();
}
export function capture(event, payload = {}, uuid = crypto.randomUUID()) {
  if (!EVENTS.has(event) || !allowed()) return false;
  const properties = propertiesFor(event, { route: window.location.pathname, ...payload });
  if (!valid(event, properties)) return false;
  const id = distinctId();
  if (!id) return false;
  const controller = new AbortController();
  pending.add(controller);
  try {
    fetch(`${config.host}/i/v0/e/`, { method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer', keepalive: true, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: config.token, event, distinct_id: id, uuid, properties: { ...properties, analytics_origin: 'app', $process_person_profile: false } }), signal: controller.signal })
      .catch(() => {}).finally(() => pending.delete(controller));
  } catch { pending.delete(controller); return false; }
  return true;
}
export function pageViewed(path) {
  const route = safeRoute(path);
  if (lastPage === route) return;
  const params = new URLSearchParams(window.location.search);
  const campaign = {};
  for (const key of Object.keys(CAMPAIGN_VALUES)) if (CAMPAIGN_VALUES[key].has(params.get(key))) campaign[key] = params.get(key);
  if (capture('page_viewed', { route, ...campaign })) lastPage = route;
}
export function trackEvent(name, data = {}) {
  if (name === 'app_store_badge_clicked') return capture(name, { placement: data.placement });
  if (name === 'shift_load_failed') return capture('core_task_failed', { feature: 'shift_library', failure: 'unavailable' });
  const feature = ({ ask_opened: 'ask', copilot_opened: 'shift_brain', copilot_module_opened: 'shift_brain', rhythm_lab_opened: 'rhythm_lab', abg_lab_opened: 'abg_lab', reference_hub_opened: 'references', icu_drips_opened: 'icu_drips', icu_drips_module_opened: 'icu_drips', template_viewed: 'brain_sheets' })[name];
  if (feature) {
    const key = `${safeRoute(window.location.pathname)}:${feature}`;
    if (Date.now() - (recentFeatureOpen.get(key) || 0) < 1500) return false;
    const recorded = capture('feature_opened', { feature });
    if (recorded) recentFeatureOpen.set(key, Date.now());
    return recorded;
  }
  if (name === 'ask_submitted') return capture('ask_submitted', { kind: data.kind });
  if (name === 'ask_answered') return capture('ask_succeeded', { kind: data.kind });
  if (name === 'ask_failed') return capture('ask_failed', { kind: data.kind, failure: data.status === 429 ? 'limit' : data.status === 0 ? 'network' : data.status >= 500 ? 'server' : 'withheld_or_rejected' });
  if (name === 'abg_interpreted') return capture('tool_completed', { tool: 'abg' });
  if (name === 'abg_example_used') return capture('tool_started', { tool: 'abg' });
  if (name === 'rhythm_practice_reveal') return capture('tool_completed', { tool: 'rhythm_practice' });
  if (name === 'rhythm_sprint_completed') return capture('tool_completed', { tool: 'rhythm_sprint' });
  if (name === 'reference_search_used') return capture('tool_started', { tool: 'reference_search' });
  if (name === 'rhythm_practice_opened') return capture('tool_started', { tool: 'rhythm_practice' });
  if (name === 'rhythm_sprint_opened') return capture('tool_started', { tool: 'rhythm_sprint' });
  if (name === 'copilot_prompt_submitted') return capture('tool_started', { tool: 'shift_brain' });
  if (name === 'copilot_response_completed') return capture('tool_completed', { tool: 'shift_brain' });
  if (name === 'copilot_response_error') return capture('tool_failed', { tool: 'shift_brain', failure: data.status === 429 ? 'limit' : 'unavailable' });
  return false;
}
export function resetShiftAnalytics(scenario) {
  if (!SCENARIOS.has(scenario)) return;
  store()?.removeItem(PLAY_PREFIX + scenario);
  session()?.removeItem(PLAY_PREFIX + scenario);
}
export function shiftProgress(scenario, version, previous, current, finalStage) {
  if (!allowed() || !SCENARIOS.has(scenario) || !safeVersion(version) || !Number.isInteger(current?.stage)) return;
  const storage = store();
  if (!storage) return;
  const key = PLAY_PREFIX + scenario;
  let play;
  try { play = JSON.parse(storage.getItem(key) || 'null'); } catch { play = null; }
  if (previous?.stage > 0 && current.stage === 0) { storage.removeItem(key); session()?.removeItem(key); return; }
  if (current.stage === 0) return;
  if (!play) {
    play = { id: crypto.randomUUID(), stage: 0, completed: false };
    if (previous?.stage === 0) capture('shift_started', { scenario, version, play_id: play.id });
    else {
      capture('shift_resumed', { scenario, version, play_id: play.id, step: current.stage + 1 });
      session()?.setItem(key, String(Date.now()));
    }
  }
  if (current.stage > play.stage) {
    play.stage = current.stage;
    capture('shift_step_reached', { scenario, version, play_id: play.id, step: current.stage + 1 });
    if (DECISION_STAGES[scenario].includes(current.stage)) capture('shift_decision_reached', { scenario, version, play_id: play.id, step: current.stage + 1 });
  }
  if (current.stage === finalStage && !play.completed) {
    play.completed = true;
    capture('shift_completed', { scenario, version, play_id: play.id });
  }
  storage.setItem(key, JSON.stringify(play));
}
export function shiftOpened(scenario, version, stage) {
  if (!allowed() || !SCENARIOS.has(scenario) || !safeVersion(version) || !Number.isInteger(stage) || stage < 1) return;
  const key = PLAY_PREFIX + scenario;
  const previousOpen = Number(session()?.getItem(key) || 0);
  if (Date.now() - previousOpen < 10000) return;
  let play;
  try { play = JSON.parse(store()?.getItem(key) || 'null'); } catch { play = null; }
  if (play?.id && !play.completed) {
    capture('shift_resumed', { scenario, version, play_id: play.id, step: stage + 1 });
    session()?.setItem(key, String(Date.now()));
  }
}
export const _testing = { safeRoute, safeToken, propertiesFor, valid };
