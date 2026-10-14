// Build-time gate: absent, false and unknown values all exclude the feature.
export const SHIFT_ENABLED = import.meta.env.VITE_SHIFT_ENABLED === 'true';
