const { randomUUID } = require('node:crypto');

function containmentEnabled() {
  return process.env.ASK_SAFETY_CONTAINMENT === 'true';
}

const RESTRICTED_MESSAGE = 'This generated workspace feature is temporarily paused for safety review. Your entered information remains available. Deterministic ABG, Rhythm Lab and reference tools remain available. For patient care, use bedside assessment and your local clinical team; do not wait for this feature.';

function containmentGate(route, appendOperationalLog) {
  return (req, res, next) => {
    if (!containmentEnabled()) return next();
    // This exact boolean selects an existing deterministic branch which returns
    // before every provider path. It is not proof of clinical review or fiction.
    if (req.body?.reassessmentRequest === true) return next();
    const requestId = randomUUID();
    appendOperationalLog({ timestamp: new Date().toISOString(), request_id: requestId,
      route, mode: route === 'SBAR' ? 'communication' : req.body?.learningRequest === true ? 'learning' : 'generation',
      status: 'restricted', containment_active: true, provider_status: 'not_called',
      display_resolution: 'restricted', failure_reason: 'clinical_generation_restricted' });
    return res.status(503).json({ error: true, code: 'clinical_generation_restricted', message: RESTRICTED_MESSAGE, requestId });
  };
}

module.exports = { containmentEnabled, containmentGate, RESTRICTED_MESSAGE };
