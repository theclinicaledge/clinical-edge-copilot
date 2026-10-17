# Analytics App Store release gate

Production analytics must remain off until the installed-iPhone choices check passes for Clinical Edge (App Store ID 6761643064). On October 17, 2026, App Store Connect published the updated Device ID disclosure: Analytics and App Functionality, not linked to identity and not used for tracking. Product Interaction was already disclosed for Analytics. The published Privacy Policy URL, `https://www.theclinicaledge.org/#/privacy`, was verified to redirect to the working `/privacy` page. The optional User Privacy Choices URL is blank; Apple says changing the policy fields requires a new app version. The installed iPhone wrapper intercepts `/privacy` and opens its older native Privacy screen. That screen links to the full website policy in the system browser, but the system browser has separate local storage and cannot withdraw consent granted inside the app WebView.

The frontend candidate therefore exposes the same full updated policy and in-device AI/analytics withdrawal controls at `/choices`, a route that the current native interceptor does not capture. Home's footer and the WebView More menu each retain Privacy and add a separate Choices link. `/privacy` remains the public canonical policy and the native screen's external link. Browser tests cover direct navigation, reload, mobile width and withdrawal. The actual installed iPhone still needs a device check: open Home > Choices (or More > Choices), verify the PostHog disclosure, turn analytics on and then off, and confirm the choice persists inside that app. Separately open the native Privacy page's Full Policy link and verify the current policy loads in Safari. Do not mistake a Safari toggle for the WebView's choice.

## App Store Connect disclosure record

1. On October 17, 2026, the existing label already listed **Usage Data > Product Interaction** for **Analytics** and **Device ID** for **App Functionality**. We added **Analytics** as a Device ID purpose, retained the existing unlinked and non-tracking answers, and verified the publication timestamp and resulting label in App Store Connect.
2. The random device-local analytics ID is separate from Ask's quota ID. No advertising ID, cross-app tracking, account linkage, or clinical text is used. PostHog's discard-client-IP setting is ON, but network delivery still exposes IP transiently.
3. The old policy URL redirects to the current policy. A future native version should refresh the native Privacy summary and can supply a choices URL where Apple permits it; an external Safari choices link must not be represented as withdrawing WebView consent.

Apple references: [Manage app privacy](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy) and [App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/).

## Separate native update (not part of this web deployment)

In the Expo wrapper's `src/app/privacy.tsx`, replace the outdated “Basic analytics may be collected” summary with accurate optional-consent and PostHog language; add an in-app route back to the WebView's `/choices` controls rather than sending withdrawal to Safari. Preserve the native full-policy link. Build and submit that wrapper through its own Apple review process. Do not imply this source change is already in installed iPhones.

## Remaining activation sequence

Deploy the reviewed frontend first **without** PostHog environment variables; this publishes the new policy and `/choices` while collection remains off. On the installed iPhone, verify Home or More > Choices opens inside the WebView, opt in then withdraw, and confirm the final choice persists after reopening the app. Verify the native Privacy page's full-policy link opens the updated policy in Safari. Only then configure the public PostHog project token and US capture host as `VITE_POSTHOG_PROJECT_TOKEN` and `VITE_POSTHOG_HOST` in Vercel and deploy the approved frontend again. Send only explicitly tagged test events with `analytics_origin=test` and `is_test=true`; verify they appear in PostHog Activity but not in the dashboard's `analytics_origin=app` views. Do not submit clinical text. Keep existing backend safety and beta settings unchanged.

Pre-release rollback reference: Vercel deployment `dpl_AzRUPDtT6wRsWPcR7dWQT1hEK9hE`, source `c5cd5452cf8674d197180a462f27c938571fc678`.
