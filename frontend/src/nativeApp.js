// Detects that the site is running inside the Clinical Edge iOS app (the Expo
// WebView wrapper), so App Store promotion can be hidden from people already in it.
//
// The rule lives in one place: an inline script in index.html sets
// <html data-ce-native-app="true"> before first paint, so CSS can hide badges in
// the prerendered HTML without a flash. This module only reads that flag.
//
//   1. The wrapper tags its user agent with "ClinicalEdgeApp/" (applicationNameForUserAgent,
//      added in the next app build).
//   2. Interim, until that build is live: an iOS/iPadOS WKWebView. Safari, Chrome and
//      Firefox on iOS include "Safari/" in the user agent; app web views do not.
//      Instagram, Facebook and TikTok in-app browsers ("Instagram", "FBAN", "FBAV",
//      "FB_IAB", "BytedanceWebview", "musical_ly") are excluded so they keep the badge.
//   "ClinicalEdgeApp/" always wins, even alongside any of those tokens.

export function isNativeApp() {
  return typeof document !== "undefined" && document.documentElement.dataset.ceNativeApp === "true";
}
