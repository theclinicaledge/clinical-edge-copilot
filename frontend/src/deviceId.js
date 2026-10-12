// Anonymous device ID used only to apply the backend's daily free-question limit.
//
// A random UUID created on the first AI request and kept in localStorage on this
// device. It is sent only to our backend AI routes (never to analytics or the AI
// provider), is not linked to identity, and the server keeps it in memory for the
// current day only. If storage is unavailable it lasts for this page session.

export const DEVICE_ID_STORAGE_KEY = 'ce_device_id';
export const DEVICE_ID_HEADER = 'X-CE-Device';
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let memoryId = null;

function randomUUID() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function getDeviceId() {
  try {
    const stored = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (stored && UUID_V4.test(stored)) return stored;
  } catch {
    // Fall through to the in-memory ID.
  }
  memoryId = memoryId || randomUUID();
  try { localStorage.setItem(DEVICE_ID_STORAGE_KEY, memoryId); } catch { /* memory only */ }
  return memoryId;
}

// Headers for requests to the backend AI routes.
export function aiRequestHeaders() {
  return { 'Content-Type': 'application/json', [DEVICE_ID_HEADER]: getDeviceId() };
}
