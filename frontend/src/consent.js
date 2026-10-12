// Consent record for third-party AI processing and usage analytics.
//
// App Store Review Guideline 5.1.2(i) requires explicit permission before
// personal data is shared with third-party AI, and 5.1.1(ii) requires consent
// for usage data with an easy way to withdraw it. This module is the single
// source of truth for both choices. It stores only booleans, a version and a
// timestamp on this device; no clinical content is ever written here.
//
// Bump CONSENT_VERSION whenever the AI data flow or the disclosure text
// materially changes, so every user is asked again.

export const CONSENT_VERSION = 1;
export const CONSENT_STORAGE_KEY = 'ce_consent';
const CHANGE_EVENT = 'ce-consent-change';

// Used only when localStorage throws (for example some private modes), so a
// decision still holds for the current page session.
let memoryRecord = null;

function normalize(value) {
  if (!value || typeof value !== 'object' || value.version !== CONSENT_VERSION) return null;
  return { ai: value.ai === true, analytics: value.analytics === true, decidedAt: value.decidedAt || null };
}

export function getConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch {
    // Fall through to the in-memory record.
  }
  return normalize(memoryRecord);
}

export function hasAIConsent() {
  return getConsent()?.ai === true;
}

export function hasAnalyticsConsent() {
  return getConsent()?.analytics === true;
}

export function saveConsent({ ai, analytics }) {
  const record = { version: CONSENT_VERSION, ai: ai === true, analytics: analytics === true, decidedAt: new Date().toISOString() };
  memoryRecord = record;
  try { localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record)); } catch { /* memory only */ }
  try { window.dispatchEvent(new Event(CHANGE_EVENT)); } catch { /* non-browser */ }
  return normalize(record);
}

export function onConsentChange(listener) {
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
}

// Hydration-safe React binding: the server snapshot is "no decision", and the
// client re-renders with the stored choice right after hydration.
export function consentSnapshot() {
  const consent = getConsent();
  return consent ? `${consent.ai ? 1 : 0}${consent.analytics ? 1 : 0}` : 'none';
}

export function parseConsentSnapshot(snapshot) {
  return snapshot === 'none' ? null : { ai: snapshot[0] === '1', analytics: snapshot[1] === '1' };
}
