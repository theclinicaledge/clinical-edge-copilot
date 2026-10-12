const { ipKeyGenerator } = require("express-rate-limit");

// AI cost protection for every route that calls Anthropic.
//
// 1. A global daily budget (AI_DAILY_BUDGET_USD) estimated from the token usage
//    Anthropic returns, priced with AI_INPUT_USD_PER_MTOK / AI_OUTPUT_USD_PER_MTOK.
// 2. A free daily limit on new questions (new Ask questions and new Priority Maps):
//    FREE_DAILY_QUESTIONS per anonymous device ID (the X-CE-Device-Id header, a random
//    UUID the app creates once), plus a per-IP backstop of FREE_DAILY_QUESTIONS_PER_IP
//    keyed like express-rate-limit's apiLimiter. Requests without a valid device ID
//    are limited by the IP backstop only. Follow-up work (Teach Me, SBAR, follow-ups,
//    ABG explanations) is checked against the budget but never counted.
// Both reset at midnight Pacific. State is in memory only (it resets on deploy or
// restart). Device IDs and IPs are never logged; counts are dropped at rollover.

const DEFAULTS = Object.freeze({
  AI_DAILY_BUDGET_USD: 5,
  FREE_DAILY_QUESTIONS: 3,
  FREE_DAILY_QUESTIONS_PER_IP: 50,
  // claude-sonnet-4-6 list prices, USD per million tokens.
  AI_INPUT_USD_PER_MTOK: 3,
  AI_OUTPUT_USD_PER_MTOK: 15,
});
const CACHE_WRITE_MULTIPLIER = 1.25;
const CACHE_READ_MULTIPLIER = 0.1;
const ADMITTED = Symbol("aiCostAdmitted");
const DEVICE_HEADER = "x-ce-device-id";
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const pacificDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit",
});

function dayKey(date) {
  return pacificDay.format(date);
}

function readNumber(env, name, { integer = false } = {}) {
  const raw = env[name];
  if (raw === undefined || raw === null || String(raw).trim() === "") return DEFAULTS[name];
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0 || (integer && !Number.isInteger(value))) return DEFAULTS[name];
  return value;
}

function readConfig(env) {
  return {
    budgetUsd: readNumber(env, "AI_DAILY_BUDGET_USD"),
    freeQuestions: readNumber(env, "FREE_DAILY_QUESTIONS", { integer: true }),
    freeQuestionsPerIp: readNumber(env, "FREE_DAILY_QUESTIONS_PER_IP", { integer: true }),
    inputUsdPerMTok: readNumber(env, "AI_INPUT_USD_PER_MTOK"),
    outputUsdPerMTok: readNumber(env, "AI_OUTPUT_USD_PER_MTOK"),
  };
}

function estimateCostUsd(usage, config) {
  if (!usage) return 0;
  const count = (value) => (Number.isFinite(value) && value > 0 ? value : 0);
  const input = count(usage.input_tokens)
    + count(usage.cache_creation_input_tokens) * CACHE_WRITE_MULTIPLIER
    + count(usage.cache_read_input_tokens) * CACHE_READ_MULTIPLIER;
  return (input * config.inputUsdPerMTok + count(usage.output_tokens) * config.outputUsdPerMTok) / 1e6;
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

  function recordUsage(usage) {
    rollover();
    spentUsd += estimateCostUsd(usage, readConfig(env));
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

  // Wraps an Anthropic client so every messages.create / messages.stream call adds
  // its returned token usage to today's spend, including partial streams.
  function meter(client) {
    if (!client) return client;
    const messages = {
      create: async (...args) => {
        const message = await client.messages.create(...args);
        recordUsage(message?.usage);
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
            recordUsage(usage);
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

  return { admit, meter, recordUsage, snapshot };
}

module.exports = { createAiCostGuard, estimateCostUsd, dayKey, readConfig, deviceIdFrom, DEFAULTS, DEVICE_HEADER };
