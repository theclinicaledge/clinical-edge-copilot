// Draft gate for SHIFT-006: build-time, off unless VITE_SHIFT_006_PREVIEW=true, which is never
// set for production. The registry, routing and ShiftExperience check the variable inline (not
// through this module) so the bundler folds it away and production contains no SHIFT-006 code.
export const SHIFT6_ENABLED = import.meta.env?.VITE_SHIFT_006_PREVIEW === 'true';
export const SHIFT6_ID = 'stable-number';
