import { useSyncExternalStore } from "react";
import { trackEvent } from "../analytics";
import { isNativeApp } from "../nativeApp.js";
import "../styles/app-store-badge.css";

export const APP_STORE_URL = "https://apps.apple.com/app/id6761643064";

// Apple's official badge artwork (public/badges), unmodified. Apple's guidelines:
// at least 40px tall, clear space of at least a quarter of its height, never inside
// another button or restyled. Hidden inside the iOS app (see nativeApp.js).
const BADGE_ASPECT = 119.66407 / 40;
const subscribe = () => () => {};

export default function AppStoreBadge({ placement, height = 48 }) {
  const inApp = useSyncExternalStore(subscribe, isNativeApp, () => false);
  if (inApp) return null;
  const size = Math.max(40, height);
  return (
    <a
      className="ce-app-store-badge"
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      data-placement={placement}
      // Clear space as padding; the matching negative side margins keep the artwork
      // aligned with surrounding text while the space around it stays empty.
      style={{ padding: size / 4, marginInline: -size / 4 }}
      onClick={() => trackEvent("app_store_badge_clicked", { placement })}
    >
      <img
        src="/badges/download-on-the-app-store.svg"
        alt="Download on the App Store"
        height={size}
        style={{ height: size, aspectRatio: BADGE_ASPECT }}
      />
    </a>
  );
}
