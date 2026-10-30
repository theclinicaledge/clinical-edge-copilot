import { configure, pageViewed, syncConsent, trackEvent as captureEvent } from './productAnalytics.js';

export type AnalyticsPayload = Record<string, string | number | boolean>;

export function configureProductAnalytics(): void {
  configure({ token: import.meta.env.VITE_POSTHOG_PROJECT_TOKEN || '', host: import.meta.env.VITE_POSTHOG_HOST || '' });
  syncConsent();
}
export function trackPageView(path: string): void { pageViewed(path); }
export { syncConsent };
export { beginAskAnalytics } from './productAnalytics.js';
export function trackEvent(name: string, properties: AnalyticsPayload = {}): void { captureEvent(name, properties); }
export function promptLengthBucket(text: string): 'short' | 'medium' | 'long' {
  const len = text.trim().length;
  return len < 80 ? 'short' : len < 300 ? 'medium' : 'long';
}
