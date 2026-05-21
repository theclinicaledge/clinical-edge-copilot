// ── Clinical Edge Rhythm Lab — Local Progress Layer ──────────────────────────
// Lightweight localStorage persistence.  No auth, no backend, no external deps.
// Fails silently on quota errors or private-browsing restrictions.

const KEYS = {
  RECENT:            'ce_rl_recent',           // string[]          — up to 6 recent rhythm IDs
  FAVORITES:         'ce_rl_favorites',         // string[]          — favorited rhythm IDs
  LAST_PRACTICE_CAT: 'ce_rl_last_practice_cat', // string            — last-used practice category key
  RECENT_COMPARES:   'ce_rl_recent_compares',   // ComparePair[]     — up to 5 recent compare pairs
  PRACTICE_DAYS:     'ce_rl_practice_days',     // string[]          — ISO dates (YYYY-MM-DD)
} as const;

// ── Generic read / write helpers ─────────────────────────────────────────────

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded or private browsing — fail silently
  }
}

// ── Recently viewed ───────────────────────────────────────────────────────────

/** Returns up to 6 recently-viewed rhythm IDs, newest first. */
export function getRecentRhythms(): string[] {
  return readJSON<string[]>(KEYS.RECENT, []);
}

/** Prepends `id` to the recent list, deduplicating and capping at 6. */
export function addRecentRhythm(id: string): void {
  const prev = getRecentRhythms().filter(x => x !== id);
  writeJSON(KEYS.RECENT, [id, ...prev].slice(0, 6));
}

// ── Favorites ─────────────────────────────────────────────────────────────────

/** Returns all favorited rhythm IDs. */
export function getFavorites(): string[] {
  return readJSON<string[]>(KEYS.FAVORITES, []);
}

/** True if `id` is currently a favorite. */
export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}

/**
 * Toggles the favorite state of `id`.
 * Returns the new state — `true` = now a favorite, `false` = removed.
 */
export function toggleFavorite(id: string): boolean {
  const prev = getFavorites();
  const already = prev.includes(id);
  writeJSON(KEYS.FAVORITES, already ? prev.filter(x => x !== id) : [...prev, id]);
  return !already;
}

// ── Practice category memory ──────────────────────────────────────────────────

/** Returns the last-used practice category key, or `null` if never set. */
export function getLastPracticeCat(): string | null {
  try {
    return localStorage.getItem(KEYS.LAST_PRACTICE_CAT);
  } catch {
    return null;
  }
}

/** Persists the active practice category key. */
export function saveLastPracticeCat(key: string): void {
  try {
    localStorage.setItem(KEYS.LAST_PRACTICE_CAT, key);
  } catch {
    // fail silently
  }
}

// ── Recent compares ───────────────────────────────────────────────────────────

export interface ComparePair {
  aId: string;
  bId: string;
}

/** Returns up to 5 recently-compared pairs, newest first. */
export function getRecentCompares(): ComparePair[] {
  return readJSON<ComparePair[]>(KEYS.RECENT_COMPARES, []);
}

/**
 * Prepends {aId, bId} to the recent-compares list (order-insensitive dedup),
 * capped at 5.  Does nothing if both IDs are the same.
 */
export function addRecentCompare(aId: string, bId: string): void {
  if (aId === bId) return;
  const prev = getRecentCompares().filter(
    p => !((p.aId === aId && p.bId === bId) || (p.aId === bId && p.bId === aId))
  );
  writeJSON(KEYS.RECENT_COMPARES, [{ aId, bId }, ...prev].slice(0, 5));
}

// ── Practice streak ───────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

/** Returns all days the user has practiced, newest first. */
export function getPracticeDays(): string[] {
  return readJSON<string[]>(KEYS.PRACTICE_DAYS, []);
}

/** Records today as a practice day (idempotent — safe to call multiple times). */
export function recordPracticeDay(): void {
  const days = getPracticeDays();
  const t = todayISO();
  if (!days.includes(t)) {
    writeJSON(KEYS.PRACTICE_DAYS, [t, ...days]);
  }
}

/**
 * Returns a short, calm streak string for display, or `null` if no active streak.
 * Examples: "Practiced today", "3-day practice streak"
 * Returns null if the last practice day was more than 1 day ago (streak broken).
 */
export function getStreakText(): string | null {
  const days = getPracticeDays()
    .slice()
    .sort()
    .reverse(); // newest first

  if (days.length === 0) return null;

  const t = todayISO();
  const [latest] = days;
  const latestDate = new Date(latest + 'T00:00:00');
  const todayDate  = new Date(t + 'T00:00:00');
  const diffDays   = Math.round((todayDate.getTime() - latestDate.getTime()) / 86_400_000);

  if (diffDays > 1) return null; // streak broken

  // Count consecutive days backwards from the most-recent entry
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1] + 'T00:00:00');
    const curr = new Date(days[i] + 'T00:00:00');
    const gap  = Math.round((prev.getTime() - curr.getTime()) / 86_400_000);
    if (gap === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak === 1 ? 'Practiced today' : `${streak}-day practice streak`;
}
