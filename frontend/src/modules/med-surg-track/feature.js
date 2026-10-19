export const TRACK_ENABLED = import.meta.env?.VITE_MED_SURG_TRACK_PREVIEW === 'true';
export const trackRoute = path => path === '/learn/med-surg' ? { kind: 'path' } : /^\/learn\/med-surg\/a[123]$/.test(path) ? { kind: 'assignment', id: path.split('/').at(-1) } : null;
