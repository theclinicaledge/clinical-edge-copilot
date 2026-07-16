import { useEffect } from "react";
import { buildSeoTagList } from "./seoTags.js";

export { SITE_URL, SITE_NAME } from "./seoTags.js";

/**
 * Applies a route's SEO tags to the live document for the lifetime of the
 * calling component, restoring the previous values on unmount.
 *
 * This is a client-side fallback / hydration-time sync, not the primary
 * source of SEO-critical markup — prerendered routes already ship these same
 * tags (built from the same buildSeoTagList()) in the initial HTML response.
 * This hook keeps things in sync on client-side navigation and covers routes
 * that aren't prerendered.
 */
export function useSeo(seoArgs) {
  useEffect(() => {
    const tags = buildSeoTagList(seoArgs);
    const prevTitle = document.title;
    const restorers = [];

    for (const tag of tags) {
      if (tag.kind === "title") {
        document.title = tag.content;
        continue;
      }

      if (tag.kind === "meta") {
        let el = document.querySelector(`meta[${tag.attr}="${tag.key}"]`);
        let created = false;
        let prevContent = null;
        if (el) {
          prevContent = el.getAttribute("content");
        } else {
          el = document.createElement("meta");
          el.setAttribute(tag.attr, tag.key);
          document.head.appendChild(el);
          created = true;
        }
        el.setAttribute("content", tag.content);
        restorers.push(() => {
          if (created) el.remove();
          else if (prevContent !== null) el.setAttribute("content", prevContent);
        });
        continue;
      }

      if (tag.kind === "link") {
        let el = document.querySelector(`link[rel="${tag.rel}"]`);
        let created = false;
        let prevHref = null;
        if (el) {
          prevHref = el.getAttribute("href");
        } else {
          el = document.createElement("link");
          el.setAttribute("rel", tag.rel);
          document.head.appendChild(el);
          created = true;
        }
        el.setAttribute("href", tag.href);
        restorers.push(() => {
          if (created) el.remove();
          else if (prevHref !== null) el.setAttribute("href", prevHref);
        });
        continue;
      }

      if (tag.kind === "jsonld") {
        // Fixed id so a prerendered <script id="ce-jsonld"> is updated in
        // place on hydration rather than duplicated.
        let el = document.getElementById(tag.id);
        let created = false;
        let prevText = null;
        if (el) {
          prevText = el.textContent;
        } else {
          el = document.createElement("script");
          el.type = "application/ld+json";
          el.id = tag.id;
          document.head.appendChild(el);
          created = true;
        }
        el.textContent = JSON.stringify(tag.content);
        restorers.push(() => {
          if (created) el.remove();
          else el.textContent = prevText;
        });
      }
    }

    return () => {
      document.title = prevTitle;
      restorers.forEach((restore) => restore());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(seoArgs)]);
}
