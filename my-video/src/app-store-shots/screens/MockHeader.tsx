import React from "react";
import { C, S, SANS, MONO } from "./tokens";

// Header always uses the dark-navy shell — tokens.bgApp is the *content* bg
const HEADER_BG  = "#07142A";
const HEADER_TXT = "#E6F0F5";  // light text on dark header

// ── Status-bar icons ─────────────────────────────────────────────────────────

const SignalBars: React.FC = () => (
  <svg width={17 * S} height={12 * S} viewBox="0 0 17 12" xmlns="http://www.w3.org/2000/svg">
    <rect x="0"    y="7"   width="3" height="5"  rx="0.6" fill="white"/>
    <rect x="4.5"  y="4.5" width="3" height="7.5" rx="0.6" fill="white"/>
    <rect x="9"    y="2"   width="3" height="10" rx="0.6" fill="white"/>
    <rect x="13.5" y="0"   width="3" height="12" rx="0.6" fill="white" fillOpacity="0.30"/>
  </svg>
);

const WifiIcon: React.FC = () => (
  <svg width={16 * S} height={12 * S} viewBox="0 0 16 12" xmlns="http://www.w3.org/2000/svg" fill="white">
    <circle cx="8" cy="10.8" r="1.5"/>
    <path d="M4.2 7.2a5.4 5.4 0 0 1 7.6 0L13.2 5.8a7.6 7.6 0 0 0-10.4 0L4.2 7.2z" opacity="0.75"/>
    <path d="M1 4a10.6 10.6 0 0 1 14 0L16.4 2.6A12.8 12.8 0 0 0-.4 2.6L1 4z" opacity="0.40"/>
  </svg>
);

const BatteryIcon: React.FC = () => (
  <svg width={25 * S} height={12 * S} viewBox="0 0 25 12" xmlns="http://www.w3.org/2000/svg" fill="none">
    <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="white" strokeOpacity="0.35"/>
    <rect x="1.5" y="1.5" width="17.5" height="9" rx="2.5" fill="white"/>
    <path d="M23 4v4c.9-.5 1.4-1.3 1.4-2s-.5-1.5-1.4-2z" fill="white" fillOpacity="0.40"/>
  </svg>
);

// ── Clinical Edge logo ────────────────────────────────────────────────────────

const CELogo: React.FC = () => (
  <svg width={22 * S} height={20 * S} viewBox="0 0 225 200" fill={C.teal} aria-hidden>
    <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z"/>
    <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z"/>
    <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z"/>
    <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z"/>
  </svg>
);

// ── Header component ──────────────────────────────────────────────────────────

export const MockHeader: React.FC = () => (
  <div style={{ background: HEADER_BG }}>

    {/* ── Status bar — Dynamic Island + time + icons ── */}
    <div style={{
      position: "relative",
      height: 19 * S,       // ~57 canvas px — matches iPhone 15 status bar height
      display: "flex",
      alignItems: "flex-end",
      paddingBottom: 3 * S,
      paddingLeft: 12 * S,
      paddingRight: 12 * S,
    }}>
      {/* Dynamic Island pill */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: 44 * S,      // 132 canvas px — ~10% of 1284, proportional to iPhone DI
        height: 13 * S,     // 39 canvas px
        background: "#000",
        borderRadius: `0 0 ${7 * S}px ${7 * S}px`,
      }} />

      {/* Time — left */}
      <span style={{
        color: "rgba(255,255,255,0.92)",
        fontSize: 6 * S,
        fontWeight: 600,
        fontFamily: SANS,
        letterSpacing: "0.01em",
        lineHeight: 1,
      }}>
        9:41
      </span>

      {/* Icons — right */}
      <div style={{
        marginLeft: "auto",
        display: "flex",
        alignItems: "center",
        gap: 2 * S,
      }}>
        <SignalBars />
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>

    {/* ── App nav bar — logo + name ── */}
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10 * S,
      paddingLeft: 16 * S,
      paddingRight: 16 * S,
      paddingTop: 12 * S,
      paddingBottom: 12 * S,
      borderBottom: `1px solid rgba(255,255,255,0.06)`,
    }}>
      <CELogo />
      <div>
        <div style={{
          color: HEADER_TXT,
          fontFamily: SANS,
          fontSize: 15 * S,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          lineHeight: 1.2,
        }}>
          Clinical Edge
        </div>
        <div style={{
          color: C.teal,
          fontFamily: MONO,
          fontSize: 9 * S,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          marginTop: 2 * S,
        }}>
          COPILOT
        </div>
      </div>
    </div>

  </div>
);
