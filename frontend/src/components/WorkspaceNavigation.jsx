import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { trackEvent } from "../analytics";
import "../styles/workspace-navigation.css";

import { CHECK_ACTIONS, LEARN_ACTIONS } from "./workspaceActions.js";
const WORKSPACE_PAGES = new Set(["home", "app", "icudrips", "referencehub", "abglab", "brainsheets", "brainsheets-detail"]);

function NavigationSheet({ kind, onClose, navigate }) {
  const panel = useRef(null);
  useEffect(() => {
    const previousFocus = document.activeElement;
    const root = document.getElementById("root");
    const previousInert = root.inert;
    const previousOverflow = document.body.style.overflow;
    root.inert = true;
    document.body.style.overflow = "hidden";
    panel.current.querySelector("button").focus();
    const handleKey = (event) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
      if (event.key !== "Tab") return;
      const items = [...panel.current.querySelectorAll("a[href], button")];
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      root.inert = previousInert;
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [onClose]);
  const go = (event, action) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (action.event) trackEvent(action.event, { source: "workspace_navigation" });
    onClose(); navigate(action.path);
  };
  const links = (actions) => actions.map((action) => <a key={action.path} href={action.path} onClick={(e) => go(e, action)} aria-current={window.location.pathname === action.path ? "page" : undefined}><span><strong>{action.label}</strong>{action.detail && <small>{action.detail}</small>}</span><span aria-hidden="true">&#8594;</span></a>);
  return createPortal(<div className="ce-navigation-backdrop" onClick={onClose}><section ref={panel} className="ce-navigation-sheet" role="dialog" aria-modal="true" aria-labelledby="navigation-sheet-title" onClick={(e) => e.stopPropagation()}><header><div><small>Clinical Edge</small><h2 id="navigation-sheet-title">{kind === "check" ? "Check something" : "More from your workspace"}</h2></div><button type="button" onClick={onClose} aria-label="Close tools" title="Close tools">&#215;</button></header>{kind === "check" ? <div className="ce-navigation-links">{links(CHECK_ACTIONS)}</div> : <><h3>Learn</h3><div className="ce-navigation-links">{links(LEARN_ACTIONS)}</div><h3>Organize</h3><div className="ce-navigation-links">{links([{ label: "Brain Sheets", detail: "Blank printable templates", path: "/brain-sheets" }, { label: "Saved cases", detail: "Explicitly saved on this device", path: "/copilot" }])}</div><div className="ce-navigation-support">{links([{ label: "Privacy", path: "/privacy" }, { label: "Support", path: "/support" }])}</div></>}</section></div>, document.body);
}

export default function WorkspaceNavigation({ page, navigate, scenarioActive = false }) {
  const [sheet, setSheet] = useState(null);
  const closeSheet = useCallback(() => setSheet(null), []);
  useEffect(() => {
    window.addEventListener("popstate", closeSheet);
    return () => window.removeEventListener("popstate", closeSheet);
  }, [closeSheet]);
  if (!WORKSPACE_PAGES.has(page) && !page.startsWith("rhythmlab")) return null;
  const checkActive = ["icudrips", "referencehub", "abglab"].includes(page) || page === "rhythmlab-library";
  const moreActive = page.startsWith("brainsheets") || (page.startsWith("rhythmlab") && page !== "rhythmlab-library");
  const go = (e, path) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault(); navigate(path);
  };
  return <>
    <nav className={"ce-tool-dock ce-workspace-nav" + (scenarioActive && page !== "app" ? " has-active-scenario" : "")} aria-label="Clinical Edge workspace">
      {scenarioActive && page !== "app" && <div className="ce-scenario-return"><span>Shift Brain active</span><a href="/copilot" onClick={(e) => go(e, "/copilot")}>Return <span aria-hidden="true">&#8594;</span></a></div>}
      <div className="ce-tool-dock__inner">
      <a href="/" aria-current={page === "home" ? "page" : undefined} className={"ce-tool-dock__item" + (page === "home" ? " is-active" : "")} onClick={(e) => go(e, "/")}>Home</a>
      <a href="/copilot?capture=rapid" aria-current={page === "app" ? "page" : undefined} className={"ce-tool-dock__item" + (page === "app" ? " is-active" : "")} onClick={(e) => go(e, "/copilot?capture=rapid")}>Shift Brain</a>
      <button type="button" aria-label="Check something" aria-haspopup="dialog" aria-expanded={sheet === "check"} className={"ce-tool-dock__item" + (checkActive ? " is-active" : "")} onClick={() => setSheet("check")}>Check</button>
      <button type="button" aria-label="More tools" aria-haspopup="dialog" aria-expanded={sheet === "more"} className={"ce-tool-dock__item" + (moreActive ? " is-active" : "")} onClick={() => setSheet("more")}>More <span aria-hidden="true">&#183;&#183;&#183;</span></button>
    </div></nav>
    {sheet && <NavigationSheet kind={sheet} onClose={closeSheet} navigate={navigate} />}
  </>;
}
