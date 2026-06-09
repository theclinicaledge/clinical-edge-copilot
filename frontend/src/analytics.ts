/**
 * Clinical Edge — centralised analytics helper
 *
 * Backed by Vercel Analytics (already wired in main.jsx via <Analytics />).
 * All events go through this module so privacy rules are enforced in one place.
 *
 * PRIVACY NOTE: Never pass clinical free text, user-entered prompts, patient data,
 * names, MRNs, dates of birth, or any personally-identifying information.
 * Only pass: event names, module/page identifiers, rhythm/drip IDs, mode labels,
 * urgency levels, category names, boolean flags, and bucketed numeric values.
 *
 * Backend persistence: Vercel Analytics (frontend-only, no custom backend endpoint).
 */

import { track } from '@vercel/analytics';

const isDev = import.meta.env.DEV;

export type AnalyticsPayload = Record<string, string | number | boolean>;

/**
 * Fire a named analytics event with an optional payload.
 *
 * - Development: logs to console.debug only — no network traffic.
 * - Production:  forwards to Vercel Analytics via track().
 * - Never throws — all failures are silently swallowed so the UI is never blocked.
 */
export function trackEvent(eventName: string, payload: AnalyticsPayload = {}): void {
  try {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.debug('[analytics]', eventName, payload);
      return;
    }
    track(eventName, payload);
  } catch {
    // Intentionally swallowed — analytics must never affect the user experience.
  }
}

/**
 * Convert a free-text prompt into a length bucket so we can understand
 * prompt complexity without ever transmitting the actual content.
 *
 * Buckets:  short < 80 chars  |  medium < 300 chars  |  long ≥ 300 chars
 */
export function promptLengthBucket(text: string): 'short' | 'medium' | 'long' {
  const len = text.trim().length;
  if (len < 80)  return 'short';
  if (len < 300) return 'medium';
  return 'long';
}
