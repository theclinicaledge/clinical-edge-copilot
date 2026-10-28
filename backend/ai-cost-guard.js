const { ipKeyGenerator } = require("express-rate-limit");

// AI cost protection for every route that calls Anthropic.
//
// 1. A global daily budget (AI_DAILY_BUDGET_USD) estimated from the token usage
//    Anthropic returns, priced per call by the model it used (MODEL_RATES).
//    AI_INPUT_USD_PER_MTOK / AI_OUTPUT_USD_PER_MTOK, when set, override the input and
//    output rates for every model.
// 2. A free daily limit on new questions (new Ask questions and new Priority Maps):
//    FREE_DAILY_QUESTIONS per anonymous device ID (the X-CE-Device header, a random
//    UUID the app creates once), plus a per-IP backstop of FREE_DAILY_QUESTIONS_PER_IP
//    keyed like express-rate-limit's apiLimiter. Requests without a valid device ID
//    are limited by the IP backstop only. Follow-up work (Teach Me, SBAR, follow-ups,
//    ABG explanations) is checked against the budget but never counted. A counted
//    question that ends in a server error is released (refunded) on both counters; a
//    safety refusal is refunded on the device counter only, because it still used
//    Anthropic tokens and must keep counting toward the per-IP backstop.
// Both reset at midnight Pacific. State is in memory only (it resets on deploy or
// restart). Device IDs and IPs are never logged; counts are dropped at rollover.

const DEFAULTS = Object.freeze({
  AI_DAILY_BUDGET_USD: 5,
  FREE_DAILY_QUESTIONS: 3,
  FREE_DAILY_QUESTIONS_PER_IP: 50,
});

// Anthropic list prices, USD per million tokens (platform.claude.com/docs/en/about-claude/pricing,
// checked 27 Oct 2026): base input, output, 5-minute cache write and cache read.
// Update this table when a route changes model or Anthropic changes prices.
const MODEL_RATES = Object.freeze({
  "claude-opus-5-5": { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 },
  "claude-opus-5": { input: 5, output: 25, cacheWrite: 6.25, cacheRead: 0.5 },
  "claude-opus-4-8": { input: 5, output: 25, cacheWrite: 6.25, cacheRead: 0.5 },
  "claude-opus-4-7": { input: 5, output: 25, cacheWrite: 6.25, cacheRead: 0.5 },
  "claude-opus-4-6": { input: 5, output: 25, cacheWrite: 6.25, cacheRead: 0.5 },
  "claude-sonnet-5-5": { input: 2, output: 10, cacheWrite: 2.5, cacheRead: 0.1 },
  "claude-sonnet-5": { input: 2, output: 10, cacheWrite: 2.5, cacheRead: 0.2 },
  "claude-sonnet-4-6": { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 },
  "claude-haiku-4-5": { input: 1, output: 5, cacheWrite: 1.25, cacheRead: 0.1 },
});
// A model missing from the table is priced at the highest listed rates, so an
// unpriced model can never make spend look smaller than it is.
const UNKNOWN_MODEL_RATES = Object.freeze({ input: 5, output: 25, cacheWrite: 6.25, cacheRead: 0.5 });
const ADMITTED = Symbol("aiCostAdmitted");
const COUNTED = Symbol("aiCostCounted");
const DEVICE_HEADER = "x-ce-device";
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const pacificDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit",
});

function dayKey(date) {
  return pacificDay.format(date);
}

function readNumber(env, name, { integer = false } = {}) {
  const fallback = DEFAULTS[name] ?? null;
  const raw = env[name];
  if (raw === undefined || raw === null || String(raw).trim() === "") return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0 || (integer && !Number.isInteger(value))) return fallback;
  return value;
}

function readConfig(env) {
  return {
    budgetUsd: readNumber(env, "AI_DAILY_BUDGET_USD"),
    freeQuestions: readNumber(env, "FREE_DAILY_QUESTIONS", { integer: true }),
    freeQuestionsPerIp: readNumber(env, "FREE_DAILY_QUESTIONS_PER_IP", { integer: true }),
    // Optional overrides (null when unset or invalid): replace every model's rate.
    inputUsdPerMTok: readNumber(env, "AI_INPUT_USD_PER_MTOK"),
    outputUsdPerMTok: readNumber(env, "AI_OUTPUT_USD_PER_MTOK"),
  };
}

// Rates for one call: the model's list prices, with any configured override applied.
// An input override also scales that model's cache write and read prices.
function ratesFor(model, config = {}) {
  const base = MODEL_RATES[model] || UNKNOWN_MODEL_RATES;
  const input = config.inputUsdPerMTok ?? base.input;
  const scale = input / base.input;
  return {
    input,
    output: config.outputUsdPerMTok ?? base.output,
    cacheWrite: base.cacheWrite * scale,
    cacheRead: base.cacheRead * scale,
  };
}

function estimateCostUsd(usage, config, model) {
  if (!usage) return 0;
  const rates = ratesFor(model, config);
  const count = (value) => (Number.isFinite(value) && value > 0 ? value : 0);
  return (count(usage.input_tokens) * rates.input
    + count(usage.cache_creation_input_tokens) * rates.cacheWrite
    + count(usage.cache_read_input_tokens) * rates.cacheRead
    + count(usage.output_tokens) * rates.output) / 1e6;
}

const SURFACE_NAMES = { ASK: "Ask", COPILOT: "Shift Brain", TEACH_ME: "Shift Brain", SBAR: "Shift Brain" };
const STILL_AVAILABLE = "Reference tools, Rhythm Lab and ABG interpretation still work.";

function budgetMessage(route) {
  return `${SURFACE_NAMES[route] || "Ask"} is resting until tomorrow. Today's AI capacity is used up and resets at midnight Pacific. ${STILL_AVAILABLE}`;
}

function freeLimitMessage(limit) {
  const questions = limit === 1 ? "1 free AI question" : `${limit} free AI questions`;
  return `You've used today's ${questions}. They reset at midnight Pacific. ${STILL_AVAILABLE}`;
}

function networkLimitMessage() {
  return `Today's free AI questions for this network are used up. They reset at midnight Pacific. ${STILL_AVAILABLE}`;
}

function deviceIdFrom(req) {
  const raw = req.headers?.[DEVICE_HEADER];
  return typeof raw === "string" && UUID_V4.test(raw) ? raw.toLowerCase() : null;
}

function createAiCostGuard({ env = process.env, now = () => new Date(), appendOperationalLog = () => {} } = {}) {
  let day = null;
  let spentUsd = 0;
  let devices = new Map();
  let ips = new Map();

  const rollover = () => {
    const today = dayKey(now());
    if (today !== day) {
      day = today;
      spentUsd = 0;
      devices = new Map();
      ips = new Map();
    }
  };

  const ipKey = (req) => {
    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    try { return ipKeyGenerator(ip); } catch { return ip; }
  };

  function recordUsage(usage, model) {
    rollover();
    spentUsd += estimateCostUsd(usage, readConfig(env), model);
  }

  // Call immediately before the first Anthropic call of a request. Returns null
  // when the call may proceed, or a denial { status, code, message } to send instead.
  // `counts: true` marks a new question (new Ask question or new Priority Map): it is
  // checked against and counted once toward the device and IP free limits. Other AI
  // work only has to fit within the daily budget.
  function admit(req, route, { counts = true } = {}) {
    rollover();
    if (req[ADMITTED]) return null;
    const config = readConfig(env);
    let denial = null;
    if (spentUsd >= config.budgetUsd) {
      denial = { status: 503, code: "ai_daily_budget_reached", message: budgetMessage(route) };
    } else if (counts) {
      const device = deviceIdFrom(req);
      const ip = ipKey(req);
      const deviceUsed = device ? devices.get(device) || 0 : 0;
      const ipUsed = ips.get(ip) || 0;
      if (device && deviceUsed >= config.freeQuestions) {
        denial = { status: 429, code: "free_daily_limit_reached", message: freeLimitMessage(config.freeQuestions), limit: config.freeQuestions };
      } else if (ipUsed >= config.freeQuestionsPerIp) {
        denial = { status: 429, code: "free_daily_limit_reached", message: networkLimitMessage(), limit: config.freeQuestionsPerIp };
      } else {
        if (device) devices.set(device, deviceUsed + 1);
        ips.set(ip, ipUsed + 1);
        req[COUNTED] = { day, device, ip };
      }
    }
    if (!denial) req[ADMITTED] = true;
    if (denial) {
      appendOperationalLog({
        timestamp: new Date().toISOString(), route, status: "limited", provider_status: "not_called",
        display_resolution: "limited", failure_reason: denial.code,
      });
    }
    return denial;
  }

  // Gives back a counted question that did not deliver an answer. `keepIp: true` (safety
  // refusals) refunds the device count only. Safe to call more than once or for
  // uncounted requests.
  function release(req, { keepIp = false } = {}) {
    const counted = req?.[COUNTED];
    if (!counted) return;
    req[COUNTED] = null;
    rollover();
    if (counted.day !== day) return;
    const decrement = (map, key) => {
      const used = map.get(key) || 0;
      if (used <= 1) map.delete(key); else map.set(key, used - 1);
    };
    if (counted.device) decrement(devices, counted.device);
    if (!keepIp) decrement(ips, counted.ip);
  }

  // Wraps an Anthropic client so every messages.create / messages.stream call adds
  // its returned token usage to today's spend, including partial streams.
  function meter(client) {
    if (!client) return client;
    const messages = {
      create: async (...args) => {
        const message = await client.messages.create(...args);
        recordUsage(message?.usage, args[0]?.model);
        return message;
      },
      stream: (...args) => {
        const stream = client.messages.stream(...args);
        const iterate = stream?.[Symbol.asyncIterator];
        if (typeof iterate !== "function") return stream;
        stream[Symbol.asyncIterator] = async function* meteredIterator() {
          const usage = {};
          const merge = (source) => {
            for (const [key, value] of Object.entries(source || {})) if (Number.isFinite(value)) usage[key] = value;
          };
          try {
            for await (const event of { [Symbol.asyncIterator]: () => iterate.call(stream) }) {
              if (event?.type === "message_start") merge(event.message?.usage);
              if (event?.type === "message_delta") merge(event.usage);
              yield event;
            }
          } finally {
            recordUsage(usage, args[0]?.model);
          }
        };
        return stream;
      },
    };
    return new Proxy(client, { get: (target, prop, receiver) => (prop === "messages" ? messages : Reflect.get(target, prop, receiver)) });
  }

  function snapshot() {
    rollover();
    return { day, spentUsd, devices: devices.size, ips: ips.size };
  }

  return { admit, release, meter, recordUsage, snapshot };
}

module.exports = { createAiCostGuard, estimateCostUsd, ratesFor, dayKey, readConfig, deviceIdFrom, DEFAULTS, MODEL_RATES, UNKNOWN_MODEL_RATES, DEVICE_HEADER };
