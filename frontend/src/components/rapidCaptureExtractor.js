const EMPTY_SNAPSHOT = { signals: ["off"], setting: "", contexts: [], values: {}, optional: {}, units: {}, notes: "" };

const number = String.raw`(-?\d+(?:\.\d+)?)`;
const pressure = String.raw`(\d{2,3}\s*\/\s*\d{2,3})`;

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function addSignal(snapshot, signal) {
  if (!snapshot.signals.includes(signal)) snapshot.signals.push(signal);
}

function setTrend(snapshot, id, earlier, now, signal, suppliedUnit) {
  if (earlier) snapshot.values[`${id}Earlier`] = clean(earlier);
  if (now) snapshot.values[`${id}Now`] = clean(now);
  if (suppliedUnit !== undefined) snapshot.units[id] = suppliedUnit;
  addSignal(snapshot, signal);
}

function suppliedUnit(sentence, pattern) {
  return pattern.test(sentence) ? sentence.match(pattern)?.[0] || "" : "";
}

const SMALL_NUMBERS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19,
};
const TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const NUMBER_WORD = Object.keys({ ...SMALL_NUMBERS, ...TENS, point: 0 }).join("|");

function parseNumberWords(phrase) {
  const tokens = phrase.toLowerCase().split(/[\s-]+/);
  const pointIndex = tokens.indexOf("point");
  const wholeTokens = pointIndex >= 0 ? tokens.slice(0, pointIndex) : tokens;
  let whole = 0;
  for (const token of wholeTokens) {
    if (TENS[token] !== undefined) whole += TENS[token];
    else if (SMALL_NUMBERS[token] !== undefined) whole += SMALL_NUMBERS[token];
    else return null;
  }
  if (pointIndex < 0) return String(whole);
  const decimals = tokens.slice(pointIndex + 1).map((token) => SMALL_NUMBERS[token]);
  if (!decimals.length || decimals.some((value) => value === undefined || value > 9)) return null;
  return `${whole}.${decimals.join("")}`;
}

function normalizeNumberWords(text) {
  return text.replace(new RegExp(String.raw`\b(?:${NUMBER_WORD})(?:[\s-]+(?:${NUMBER_WORD}))*\b`, "gi"), (phrase) => parseNumberWords(phrase) ?? phrase);
}

function normalizeSpokenPressure(text) {
  return text.replace(/\b(\d{2,3})\s+over\s+(\d{2,3})\b/gi, "$1/$2");
}

function normalizeOxygenSupport(value) {
  return clean(value).replace(/\b(\d+(?:\.\d+)?)\s+liters?\b/i, "$1 L");
}

function normalizeClinicalLexicon(text) {
  return text
    .replace(/\bcap(?:illary)?[-\s]+refill\b/gi, "cap refill")
    .replace(/\bchest[-\s]+tube\b/gi, "chest tube");
}

function extractExplicitTemporalPair(sentence, aliases, valuePattern) {
  const variable = String.raw`(?:${aliases})`;
  const value = String.raw`(${valuePattern})`;
  const earlierCue = String.raw`(?:earlier|previously|prior|initial(?:ly)?|at shift change|at handoff)`;
  const currentCue = String.raw`(?:now|currently|latest|repeat)`;
  const patterns = [
    {
      regex: new RegExp(String.raw`\b${variable}\b[^.;]*?\b(?:down|up)\s+to\s*${value}\s+from\s*${value}`, "i"),
      map: (match) => ({ earlier: match[2], now: match[1] }),
    },
    {
      regex: new RegExp(String.raw`\b${currentCue}\s+${variable}\b(?:\s+is)?\s*${value}[^.;]*[;,][^.;]*\b${earlierCue}(?:\s+(?:result|value|reading|index|cuff))?(?:\s+was)?\s*${value}`, "i"),
      map: (match) => ({ earlier: match[2], now: match[1] }),
    },
    {
      regex: new RegExp(String.raw`\b${variable}\b[^.;]*?\b${currentCue}(?:\s+(?:is|was))?\s*${value}[^.;]*[;,][^.;]*\b${earlierCue}(?:\s+(?:result|value|reading|index))?(?:\s+was)?\s*${value}`, "i"),
      map: (match) => ({ earlier: match[2], now: match[1] }),
    },
    {
      regex: new RegExp(String.raw`\b${earlierCue}\s+${variable}\b(?:\s+was)?\s*${value}[^.;]*[;,][^.;]*\b${currentCue}(?:\s+(?:result|value|reading|index|cuff))?(?:\s+is)?\s*${value}`, "i"),
      map: (match) => ({ earlier: match[1], now: match[2] }),
    },
    {
      regex: new RegExp(String.raw`\b${variable}\b[^.;]*?\bwas\s*${value}[^.;]*[;,]\s*${value}\s+${currentCue}\b`, "i"),
      map: (match) => ({ earlier: match[1], now: match[2] }),
    },
    {
      regex: new RegExp(String.raw`\b${variable}\b[^.;]*?${value}\s+${currentCue}[^.;]*?\bwas\s*${value}\s+${earlierCue}\b`, "i"),
      map: (match) => ({ earlier: match[2], now: match[1] }),
    },
  ];
  for (const pattern of patterns) {
    const match = sentence.match(pattern.regex);
    if (match) return pattern.map(match);
  }
  return null;
}

function hasCorrection(sentence) {
  return /\b(?:sorry|correction|actually)\b|\bthat (?:may|might) have been\b/i.test(sentence);
}

function hasUnsafeUncertainty(sentence) {
  return /\b(?:somewhere in|maybe|may have been|might have been|I think|hard to tell|cannot verify|can't verify|not confirmed|haven't confirmed|have not confirmed)\b/i.test(sentence);
}

function isHypothetical(sentence) {
  return /^\s*if\b/i.test(sentence);
}

function isNegatedPressor(sentence) {
  return /\b(?:not (?:on|receiving)|is not running|isn't running|no)\b[^.]*\b(?:pressor|norepinephrine|norepi|levo)\b|\b(?:norepinephrine|norepi|levo)\b[^.]*\b(?:not running|stopped)\b/i.test(sentence);
}

function item(id, label, fields, clearPaths, format) {
  return { id, label, fields, clearPaths, format };
}

function getPath(source, path) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}

export function formatExtractionItem(definition, snapshot) {
  return definition.format(snapshot, getPath);
}

export function setSnapshotPath(snapshot, path, value) {
  const next = structuredClone(snapshot);
  const keys = path.split(".");
  let target = next;
  keys.slice(0, -1).forEach((key) => {
    if (target[key] === undefined) target[key] = /^\d+$/.test(keys[keys.indexOf(key) + 1] || "") ? [] : {};
    target = target[key];
  });
  target[keys.at(-1)] = value;
  return next;
}

export function clearExtractionItem(snapshot, definition) {
  return definition.clearPaths.reduce((next, path) => setSnapshotPath(next, path, ""), snapshot);
}

export function validateExtractionContract(result) {
  const errors = [];
  if (!result || !["ready", "needs_review"].includes(result.status)) errors.push("invalid_status");
  if (!result?.snapshot || !Array.isArray(result.snapshot.signals) || typeof result.snapshot.values !== "object" || typeof result.snapshot.optional !== "object") errors.push("invalid_snapshot");
  if (!Array.isArray(result?.items) || result.items.some((entry) => !entry.id || !entry.label || !Array.isArray(entry.fields) || !Array.isArray(entry.clearPaths))) errors.push("invalid_items");
  if (!Array.isArray(result?.needsReview) || result.needsReview.some((entry) => !entry.id || !entry.text)) errors.push("invalid_needs_review");
  return errors;
}

export function extractRapidCapture(narrative) {
  const text = clean(narrative);
  if (!text) throw new Error("empty_narrative");
  if (text.length > 6000) throw new Error("narrative_too_long");
  const snapshot = structuredClone(EMPTY_SNAPSHOT);
  const items = [];
  const recognizedSentences = new Set();
  const explicitReview = [];
  const sentences = text.split(/(?<=[.!?])\s+/).map(clean).filter(Boolean);
  let bpCarrySentenceIndex = -2;
  const recognize = (sentence) => recognizedSentences.add(sentence);

  const review = (sentence, reason) => {
    recognize(sentence);
    explicitReview.push({ id: `review-explicit-${explicitReview.length + 1}`, text: sentence, reason });
  };

  const pushItem = (definition) => {
    if (!items.some((entry) => entry.id === definition.id)) items.push(definition);
  };

  const simpleTrendItem = (id, label, unit = "") => item(
    id,
    label,
    [{ path: `values.${id}Earlier`, label: "Earlier" }, { path: `values.${id}Now`, label: "Now" }],
    [`values.${id}Earlier`, `values.${id}Now`],
    (s) => [s.values[`${id}Earlier`], s.values[`${id}Now`]].filter(Boolean).join(" → ") + (unit ? ` ${unit}` : ""),
  );

  const labTrendItem = (id, label) => item(
    id,
    label,
    [{ path: `values.${id}Earlier`, label: "Earlier" }, { path: `values.${id}Now`, label: "Now" }],
    [`values.${id}Earlier`, `values.${id}Now`],
    (s) => `${[s.values[`${id}Earlier`], s.values[`${id}Now`]].filter(Boolean).join(" → ")}${s.units[id] ? ` ${s.units[id]}` : " · unit not supplied"}`,
  );

  const setCurrent = (id, value, signal, unit, label) => {
    setTrend(snapshot, id, "", value, signal, unit);
    pushItem(item(
      id,
      label,
      [{ path: `values.${id}Now`, label: "Current" }],
      [`values.${id}Now`],
      (s) => `${s.values[`${id}Now`] || ""}${unit ? ` ${unit}` : ""}`,
    ));
  };

  const addPerfusionFinding = (finding) => {
    snapshot.values.perfusionFindings = [...new Set([...(snapshot.values.perfusionFindings || []), finding])];
    addSignal(snapshot, "perfusion");
    pushItem(item("perfusion", "Perfusion", [{ path: "values.perfusionFindings", label: "Findings", type: "list" }], ["values.perfusionFindings"], (s) => (s.values.perfusionFindings || []).join(" · ")));
  };

  for (const [sentenceIndex, originalSentence] of sentences.entries()) {
    const sentence = normalizeClinicalLexicon(normalizeSpokenPressure(normalizeNumberWords(originalSentence)));
    let match;

    if (hasCorrection(sentence)) {
      review(originalSentence, "Correction or self-revision requires confirmation.");
      continue;
    }
    if (isHypothetical(sentence)) {
      review(originalSentence, "Hypothetical language was not structured as a current finding.");
      continue;
    }
    if (hasUnsafeUncertainty(sentence) && !/\b(?:dose|rate|interval)\b[^.]*\b(?:unknown|unavailable|not provided|not sure)\b/i.test(sentence)) {
      review(originalSentence, "Uncertain or unconfirmed content requires confirmation.");
      continue;
    }

    if (isNegatedPressor(sentence)) recognize(originalSentence);

    const explicitBpTrend = extractExplicitTemporalPair(sentence, "BP|blood pressure|pressure", String.raw`\d{2,3}\s*\/\s*\d{2,3}`);
    match = sentence.match(new RegExp(String.raw`\b(?:BP|blood pressure)\b[^.]*?(?:from|was)\s*${pressure}[^.]*?(?:to|now|latest|repeat(?:\s+(?:is|was))?)\s*(?:it(?:'s| is)?\s*)?${pressure}`, "i"));
    if (explicitBpTrend) {
      setTrend(snapshot, "bp", explicitBpTrend.earlier, explicitBpTrend.now, "perfusion", "mmHg");
      pushItem(simpleTrendItem("bp", "Blood pressure", "mmHg"));
      recognize(originalSentence);
    } else if (match) {
      setTrend(snapshot, "bp", match[1], match[2], "perfusion", "mmHg");
      pushItem(simpleTrendItem("bp", "Blood pressure", "mmHg"));
      recognize(originalSentence);
    } else {
      match = sentence.match(new RegExp(String.raw`\b(?:BP|blood pressure|pressure)(?:\s+(?:is|of))?(?:\s+is\s+softer,?)?\s*${pressure}(?:\s+now)?\b`, "i"));
      if (match) {
        setCurrent("bp", match[1], "perfusion", "mmHg", "Blood pressure");
        recognize(originalSentence);
      }
    }
    match = sentence.match(new RegExp(String.raw`\b(?:BP|blood pressure|pressure)\b[^.]*?\bwas\s*${pressure}\s+(?:at handoff|earlier|at shift change)`, "i"));
    if (match && !snapshot.values.bpEarlier) {
      setTrend(snapshot, "bp", match[1], "", "perfusion", "mmHg");
      pushItem(simpleTrendItem("bp", "Blood pressure", "mmHg"));
      recognize(originalSentence);
      bpCarrySentenceIndex = sentenceIndex;
    }
    if (snapshot.values.bpEarlier && !snapshot.values.bpNow && sentenceIndex === bpCarrySentenceIndex + 1) {
      match = sentence.match(new RegExp(String.raw`^(?:it|the repeat|latest cuff)(?:'s| is)?\s*${pressure}`, "i"));
      if (match) {
        setTrend(snapshot, "bp", snapshot.values.bpEarlier, match[1], "perfusion", "mmHg");
        pushItem(simpleTrendItem("bp", "Blood pressure", "mmHg"));
        recognize(originalSentence);
      }
    }
    if (sentenceIndex > bpCarrySentenceIndex + 1) bpCarrySentenceIndex = -2;

    const explicitMapTrend = extractExplicitTemporalPair(sentence, "MAP", String.raw`-?\d+(?:\.\d+)?`);
    match = sentence.match(new RegExp(String.raw`\bMAP\b[^.]*?(?:was|from)\s*${number}[^.]*?(?:repeat(?:\s+MAP)?|to|now)\s*${number}`, "i"));
    if (explicitMapTrend) {
      setTrend(snapshot, "map", explicitMapTrend.earlier, explicitMapTrend.now, "perfusion", "mmHg");
      pushItem(simpleTrendItem("map", "MAP", "mmHg"));
      recognize(originalSentence);
    } else if (match) {
      setTrend(snapshot, "map", match[1], match[2], "perfusion", "mmHg");
      pushItem(simpleTrendItem("map", "MAP", "mmHg"));
      recognize(originalSentence);
    } else {
      match = sentence.match(new RegExp(String.raw`\bMAP(?:'s|s)?\b(?:\s+(?:is|was|been around))?\s*${number}`, "i"));
    }
    if (match) {
      if (!snapshot.values.mapNow) setCurrent("map", match[1], "perfusion", "mmHg", "MAP");
      recognize(originalSentence);
    }

    const explicitHrTrend = extractExplicitTemporalPair(sentence, "HR|heart rate|pulse", String.raw`-?\d+(?:\.\d+)?`);
    match = sentence.match(new RegExp(String.raw`\b(?:HR|heart rate|pulse)\b[^.]*?(?:from|was)\s*${number}[^.]*?(?:to|now|latest)\s*${number}`, "i"));
    if (explicitHrTrend) {
      setTrend(snapshot, "hr", explicitHrTrend.earlier, explicitHrTrend.now, "heart", "bpm");
      pushItem(simpleTrendItem("hr", "Heart rate", "bpm"));
      recognize(originalSentence);
    } else if (match) {
      setTrend(snapshot, "hr", match[1], match[2], "heart", "bpm");
      pushItem(simpleTrendItem("hr", "Heart rate", "bpm"));
      recognize(originalSentence);
    } else {
      match = sentence.match(new RegExp(String.raw`\b(?:HR|heart rate|pulse)(?:\s+(?:is|of))?\s*${number}(?:\s+now)?\b`, "i"));
      if (match) {
        setCurrent("hr", match[1], "heart", "bpm", "Heart rate");
        recognize(originalSentence);
      }
    }
    match = sentence.match(new RegExp(String.raw`\b(?:HR|heart rate|pulse)\b\s*${number}\s+now[^.]*?\bwas\s*${number}`, "i"));
    if (match) {
      setTrend(snapshot, "hr", match[2], match[1], "heart", "bpm");
      pushItem(simpleTrendItem("hr", "Heart rate", "bpm"));
      recognize(originalSentence);
    }

    match = sentence.match(new RegExp(String.raw`\b(?:RR|resp(?:iratory)? rate|respers|respirations)(?:\s+(?:is|was))?\s*${number}`, "i"));
    if (match) {
      setCurrent("rr", match[1], "breathing", "/min", "Respiratory rate");
      recognize(originalSentence);
    }

    const explicitSpo2Trend = extractExplicitTemporalPair(sentence, "SpO2|sat|sats|saturation", String.raw`-?\d+(?:\.\d+)?`);
    match = sentence.match(new RegExp(String.raw`\b(?:SpO2|sat(?:s|uration)?)\b[^.]*?(?:from|was|went)\s*${number}\s*%?[^.]*?(?:to|now|latest)\s*${number}\s*%?`, "i"));
    if (explicitSpo2Trend) {
      setTrend(snapshot, "spo2", explicitSpo2Trend.earlier, explicitSpo2Trend.now, "breathing", "%");
      pushItem(simpleTrendItem("spo2", "SpO₂", "%"));
      recognize(originalSentence);
    } else if (match) {
      setTrend(snapshot, "spo2", match[1], match[2], "breathing", "%");
      pushItem(simpleTrendItem("spo2", "SpO₂", "%"));
      recognize(originalSentence);
    } else {
      match = sentence.match(new RegExp(String.raw`\b(?:SpO2|sat(?:s|uration)?)\b(?:\s+(?:is|are))?\s*${number}\s*(?:%|percent)?`, "i"));
      if (match) {
        setCurrent("spo2", match[1], "breathing", "%", "SpO₂");
        recognize(originalSentence);
      }
    }
    match = sentence.match(new RegExp(String.raw`\b(?:SpO2|sat(?:s|uration)?)\b[^.;]*?\b(?:stayed|remained|still)\s+(?:at\s+)?${number}\s*(?:%|percent)?`, "i"));
    if (match) {
      setTrend(snapshot, "spo2", match[1], match[1], "breathing", "%");
      pushItem(simpleTrendItem("spo2", "SpO₂", "%"));
      recognize(originalSentence);
    }

    match = sentence.match(/\boxygen(?: support)?\s+(?:increased|went)?\s*from\s*([^,;]+?)\s*(?:to|→)\s*([^,;.]+?)(?:[.;,]|$)/i);
    if (!match) match = sentence.match(/\bhad (?:him|her) on\s*([^,;]+?)\s+earlier[^.]*?now (?:he|she)(?:'s| is)?\s+(?:on|needs?)\s*([^,;.]+?)(?:[.;,]|$)/i);
    if (match) {
      setTrend(snapshot, "oxygen", normalizeOxygenSupport(match[1]), normalizeOxygenSupport(match[2]), "breathing", "");
      pushItem(simpleTrendItem("oxygen", "Oxygen support"));
      recognize(originalSentence);
    } else {
      match = sentence.match(/\b(?:on|needs?|oxygen(?: support)?(?: is)?)\s*((?:\d+(?:\.\d+)?\s*(?:L|liters?)(?:\s+(?:NC|nasal cannula))?)|room air)\b/i);
      if (match) {
        setCurrent("oxygen", normalizeOxygenSupport(match[1]), "breathing", "", "Oxygen support");
        recognize(originalSentence);
      }
    }
    match = sentence.match(/\boxygen(?: requirement| support)?\b[^.;]*?\b(?:unchanged|stable|still)\s+(?:at|on)\s+((?:\d+(?:\.\d+)?\s*(?:L|liters?)(?:\s+(?:NC|nasal cannula))?)|room air)\b/i);
    if (match) {
      const support = normalizeOxygenSupport(match[1]);
      setTrend(snapshot, "oxygen", support, support, "breathing", "");
      pushItem(simpleTrendItem("oxygen", "Oxygen support"));
      recognize(originalSentence);
    }

    if (/\b(?:more drowsy|sleepier)\b/i.test(sentence)) {
      snapshot.values.loc = "More drowsy";
      addSignal(snapshot, "neuro");
      pushItem(item("loc", "Mental status", [{ path: "values.loc", label: "Finding" }], ["values.loc"], (s) => s.values.loc));
      recognize(originalSentence);
    } else if (/\b(?:difficult|harder|hard) to (?:arouse|wake)\b/i.test(sentence)) {
      snapshot.values.loc = "Difficult to arouse";
      addSignal(snapshot, "neuro");
      pushItem(item("loc", "Mental status", [{ path: "values.loc", label: "Finding" }], ["values.loc"], (s) => s.values.loc));
      recognize(originalSentence);
    }
    if (/\b(?:left|right)[ -]sided weakness\b/i.test(sentence)) {
      snapshot.values.focal = "Present";
      addSignal(snapshot, "neuro");
      pushItem(item("focal", "Focal neurologic change", [{ path: "values.focal", label: "Finding" }], ["values.focal"], (s) => s.values.focal));
      review(originalSentence, "Recognition time and onset were kept distinct; onset requires confirmation.");
    }

    if (/\b(?:hands?|feet|fingers?|extremit(?:y|ies))\b[^.;,]*\b(?:cool|cold)\b|\b(?:cool|cold)\s+(?:hands?|feet|fingers?|extremit(?:y|ies))\b/i.test(sentence)) {
      if (/\bcold\b/i.test(sentence)) {
        snapshot.values.skinTemperature = "Cold";
        addSignal(snapshot, "perfusion");
      } else {
        addPerfusionFinding("Cool / clammy");
      }
      recognize(originalSentence);
    }
    match = sentence.match(/\b(?:cap|refill) refill\b[^.;,]*?\b(\d+(?:\.\d+)?)\s*(?:seconds?|sec|-second)/i);
    if (!match) match = sentence.match(/\brefill\b[^.;,]*?\b(\d+(?:\.\d+)?)\s*(?:seconds?|sec|-second)/i);
    if (!match) match = sentence.match(/\b(\d+(?:\.\d+)?)[-\s]*(?:seconds?|sec)\s+cap refill\b/i);
    if (match) {
      snapshot.values.capillaryRefill = match[1];
      addSignal(snapshot, "perfusion");
      pushItem(item("capillaryRefill", "Capillary refill", [{ path: "values.capillaryRefill", label: "Seconds" }], ["values.capillaryRefill"], (s) => `${s.values.capillaryRefill} seconds`));
      recognize(originalSentence);
    } else if (!/\b(?:is not|isn't|not)\s+(?:delayed|sluggish)\b/i.test(sentence) && /\bcap refill\b[^.;,]*\b(?:delayed|sluggish)\b|\b(?:delayed|sluggish)\s+cap refill\b/i.test(sentence)) {
      addPerfusionFinding("Delayed capillary refill");
      recognize(originalSentence);
    }
    if (/\bcap refill\b[^.;,]*\b(?:is not|isn't|not)\s+(?:delayed|sluggish)\b/i.test(sentence)) recognize(originalSentence);
    if (/\bweak\b[^.;,]*\bpulses?\b|\bweak\s+(?:pedal\s+)?pulses?\b/i.test(sentence)) {
      snapshot.values.pulses = /pedal/i.test(sentence) ? "Weak pedal pulses" : "Weak pulses";
      addSignal(snapshot, "perfusion");
      recognize(originalSentence);
    }
    if (/\bno mottling\b/i.test(sentence)) {
      snapshot.values.mottling = "Not observed";
      addSignal(snapshot, "perfusion");
      recognize(originalSentence);
    }

    match = sentence.match(new RegExp(String.raw`\b(?:urine output|UOP|urine out|foley(?: drained| has had)?)\b[^.]*?${number}\s*(?:mL|cc)?[^.]*?(?:over|during|in|past)\s+(?:the\s+)?(?:last\s+|most recent\s+|past\s+)?${number}?\s*(hour|hr|minute|min)s?`, "i"));
    if (!match) match = sentence.match(new RegExp(String.raw`\b(?:only\s+)?${number}\s*(?:mL|cc)?\s+urine(?:\s+out(?:put)?)?\s+(?:over|during|in|this)\s+(?:the\s+)?(?:last\s+|past\s+)?${number}?\s*(hour|hr|minute|min)s?`, "i"));
    if (!match && /\b(?:urine|UOP|foley)\b/i.test(sentence)) {
      match = sentence.match(new RegExp(String.raw`\b(?:only\s+)?${number}\s*(?:mL|cc)?\s+out(?:put)?\s+(?:over|during|in|this)\s+(?:the\s+)?(?:last\s+|past\s+)?${number}?\s*(hour|hr|minute|min)s?`, "i"));
    }
    if (match) {
      snapshot.values.urineAmount = match[1];
      snapshot.values.urineIntervalValue = match[2] || "1";
      snapshot.values.urineIntervalUnit = /min/i.test(match[3]) ? "minute" : "hour";
      addSignal(snapshot, "urine");
      pushItem(item("urine", "Urine output", [{ path: "values.urineAmount", label: "Amount" }, { path: "values.urineIntervalValue", label: "Period" }], ["values.urineAmount", "values.urineIntervalValue", "values.urineIntervalUnit"], (s) => `${s.values.urineAmount} mL over ${s.values.urineIntervalValue} ${s.values.urineIntervalUnit}`));
      recognize(originalSentence);
      if (/\b(?:much less|decreased?|lower) than (?:before|earlier)\b/i.test(sentence)) snapshot.values.urineState = "Decreasing";
    } else if (/\b(?:foley|urine)[^.]*\bno output\b/i.test(sentence)) {
      snapshot.values.urineState = "None";
      addSignal(snapshot, "urine");
      recognize(originalSentence);
    } else {
      match = sentence.match(new RegExp(String.raw`\burine rate\b[^.]*?${number}\s*mL\s*(?:\/|per)\s*hour`, "i"));
      if (match) {
        snapshot.values.urineRate = match[1];
        addSignal(snapshot, "urine");
        recognize(originalSentence);
      }
    }

    if (/\bonly\b[^.]*?\b\d+(?:\.\d+)?\s*(?:mL|cc)?\s+out\s+since\s+\d{3,4}\b/i.test(sentence)) {
      match = sentence.match(/\bonly\s+(\d+(?:\.\d+)?)\s*(?:mL|cc)?\s+out\b/i);
      snapshot.values.urineAmount = match[1];
      addSignal(snapshot, "urine");
      review(originalSentence, "Clock time was preserved for review rather than converted to an interval.");
    }

    for (const lab of [
      { id: "lactate", aliases: "lactate", label: "Lactate", unitPattern: /mmol\s*\/\s*L/i },
      { id: "creatinine", aliases: "creatinine|creat", label: "Creatinine", unitPattern: /mg\s*\/\s*dL/i },
      { id: "potassium", aliases: "potassium", label: "Potassium", unitPattern: /mmol\s*\/\s*L/i },
    ]) {
      const explicitLabTrend = extractExplicitTemporalPair(sentence, lab.aliases, String.raw`-?\d+(?:\.\d+)?`);
      match = sentence.match(new RegExp(String.raw`\b(?:${lab.aliases})\b[^.]*?(?:from|was)\s*${number}[^.]*?(?:to|repeat(?:\s+(?:is|came back))?|now|bumped(?:\s+from)?)\s*${number}`, "i"));
      if (!match) match = sentence.match(new RegExp(String.raw`\b(?:${lab.aliases})\b[^.]*?${number}\s*(?:to|→)\s*${number}`, "i"));
      const unit = suppliedUnit(sentence, lab.unitPattern);
      if (explicitLabTrend) {
        setTrend(snapshot, lab.id, explicitLabTrend.earlier, explicitLabTrend.now, "labs", unit);
        pushItem(labTrendItem(lab.id, lab.label));
        recognize(originalSentence);
      } else if (match) {
        setTrend(snapshot, lab.id, match[1], match[2], "labs", unit);
        pushItem(labTrendItem(lab.id, lab.label));
        recognize(originalSentence);
      } else {
        match = sentence.match(new RegExp(String.raw`\b(?:${lab.aliases})(?:\s+(?:is|of))?\s*${number}`, "i"));
        if (match) {
          setCurrent(lab.id, match[1], "labs", unit, lab.label);
          recognize(originalSentence);
        }
      }
    }
    match = sentence.match(new RegExp(String.raw`\bmagnesium(?:\s+(?:is|of))?\s*${number}`, "i"));
    if (match) {
      snapshot.optional.perfusionLabs = { otherLabs: [{ name: "Magnesium", current: match[1], unit: "unspecified" }] };
      addSignal(snapshot, "labs");
      recognize(originalSentence);
    }

    if (!isNegatedPressor(sentence) && /\b(?:norepinephrine|norepi|levo)\b[^.]*?\b(?:running|infusing|on|receiving|increased)\b|\b(?:on|receiving)\s+(?:norepinephrine|norepi|levo)\b/i.test(sentence)) {
      snapshot.optional.drips = { items: [{ medication: /norepi\b/i.test(sentence) && !/norepinephrine/i.test(sentence) ? "Norepinephrine" : "Norepinephrine" }] };
      addSignal(snapshot, "perfusion");
      match = sentence.match(new RegExp(String.raw`\b(?:from|was)\s*${number}\s*(?:to|now)\s*${number}\s*(mcg\s*\/\s*kg\s*\/\s*min)?`, "i"));
      if (match) Object.assign(snapshot.optional.drips.items[0], { previousDose: match[1], currentDose: match[2], unit: clean(match[3]), direction: "Increased" });
      pushItem(item("norepinephrine", "Support", [{ path: "optional.drips.items.0.medication", label: "Medication" }, { path: "optional.drips.items.0.currentDose", label: "Dose" }], ["optional.drips.items.0.medication", "optional.drips.items.0.currentDose"], (s) => `${s.optional.drips?.items?.[0]?.medication || ""} · ${s.optional.drips?.items?.[0]?.currentDose || "dose not provided"}`));
      recognize(originalSentence);
      if (!snapshot.optional.drips.items[0].currentDose && /\b(?:unknown|unavailable|not provided|don't know|do not know|not sure|do not have)\b/i.test(sentence)) {
        review(originalSentence, "Medication dose was not supplied.");
      }
    }

    for (const hemodynamic of [
      { id: "cvp", aliases: "CVP", label: "CVP", unitPattern: /mmHg/i },
      { id: "ci", aliases: "cardiac index|CI|index", label: "Cardiac index", unitPattern: /L\s*\/\s*min(?:\s*\/\s*m(?:2|²))?/i },
    ]) {
      const explicitHemodynamicTrend = extractExplicitTemporalPair(sentence, hemodynamic.aliases, String.raw`-?\d+(?:\.\d+)?`);
      match = sentence.match(new RegExp(String.raw`\b(?:${hemodynamic.aliases})\b[^.]*?(?:from|was)\s*${number}[^.]*?(?:to|now|latest)\s*${number}`, "i"));
      if (explicitHemodynamicTrend) {
        const unit = suppliedUnit(sentence, hemodynamic.unitPattern);
        setTrend(snapshot, hemodynamic.id, explicitHemodynamicTrend.earlier, explicitHemodynamicTrend.now, "perfusion", unit);
        pushItem(simpleTrendItem(hemodynamic.id, hemodynamic.label, unit));
        recognize(originalSentence);
      } else if (match) {
        const unit = suppliedUnit(sentence, hemodynamic.unitPattern);
        setTrend(snapshot, hemodynamic.id, match[1], match[2], "perfusion", unit);
        pushItem(simpleTrendItem(hemodynamic.id, hemodynamic.label, unit));
        recognize(originalSentence);
      } else {
        match = sentence.match(new RegExp(String.raw`\b(?:${hemodynamic.aliases})\b\s*${number}\s+earlier[^.]*?${number}\s+now`, "i"));
        if (match) {
          const unit = suppliedUnit(sentence, hemodynamic.unitPattern);
          setTrend(snapshot, hemodynamic.id, match[1], match[2], "perfusion", unit);
          pushItem(simpleTrendItem(hemodynamic.id, hemodynamic.label, unit));
          recognize(originalSentence);
          continue;
        }
        match = sentence.match(new RegExp(String.raw`\b(?:${hemodynamic.aliases})(?:\s+(?:is|of))?\s*${number}`, "i"));
        if (match) {
          const unit = suppliedUnit(sentence, hemodynamic.unitPattern);
          setCurrent(hemodynamic.id, match[1], "perfusion", unit, hemodynamic.label);
          recognize(originalSentence);
        }
      }
    }

    const uncertainDrainInterval = /\b(?:not sure|unknown|do not know|don't know|nobody knows)\b[^.]*\b(?:interval|hour|hours?)\b/i.test(sentence);
    match = !uncertainDrainInterval && sentence.match(new RegExp(String.raw`\b(?:chest tube(?: output)?|CT|pleural tube|mediastinal tubes?)\b[^.]*?${number}\s*(mL|cc)?[^.]*?(during\s+(?:the\s+)?(?:(?:most recent|last)\s+)?hour|over\s+(?:the\s+)?(?:last|past)\s+hour|this\s+hour|since\s+(?:the\s+)?last check)`, "i"));
    if (match) {
      const type = /mediastinal/i.test(sentence) ? "Mediastinal tubes" : "Chest tube";
      const timeframe = clean(match[3]).replace(/^during\s+(?:the\s+)?/i, "").replace(/^over\s+(?:the\s+)?/i, "").replace(/^since\s+/i, "since ");
      snapshot.optional.drains = { items: [{ type, currentOutput: `${match[1]}${match[2] ? ` ${match[2]}` : ""}`.trim(), outputTimeframe: timeframe }] };
      const prior = sentence.match(new RegExp(String.raw`\bfrom\s*${number}\s+(?:the\s+)?hour before`, "i"));
      if (prior) snapshot.optional.drains.items[0].previousOutput = prior[1];
      addSignal(snapshot, "bleeding");
      pushItem(item("chest-tube", "Chest tube", [{ path: "optional.drains.items.0.currentOutput", label: "Current output" }, { path: "optional.drains.items.0.outputTimeframe", label: "Timeframe" }], ["optional.drains.items.0.type", "optional.drains.items.0.currentOutput", "optional.drains.items.0.outputTimeframe"], (s) => `${s.optional.drains?.items?.[0]?.currentOutput || ""} during ${s.optional.drains?.items?.[0]?.outputTimeframe || "unspecified interval"} · single measurement`));
      recognize(originalSentence);
    } else {
      match = sentence.match(new RegExp(String.raw`\b(?:chest tube|CT|pleural tube)\b[^.]*?${number}\s*(mL|cc)?\b`, "i"));
      if (match) {
        recognize(originalSentence);
        review(originalSentence, "Drain output interval was not supplied or was uncertain.");
      }
    }

    if (/\b(?:work of breathing|WOB)\b[^.;,]*\b(?:increased|worse|labored)\b/i.test(sentence)) {
      snapshot.values.workOfBreathing = "Increased";
      addSignal(snapshot, "breathing");
      recognize(originalSentence);
    }
    if (/\b(?:monitor|telemetry|rhythm)\b[^.;,]*\birregular\b|\birregular rhythm\b/i.test(sentence)) {
      snapshot.values.rhythm = "Irregular";
      addSignal(snapshot, "heart");
      recognize(originalSentence);
      match = sentence.match(new RegExp(String.raw`\b(?:rate|at)\s*${number}`, "i"));
      if (match) setCurrent("hr", match[1], "heart", "bpm", "Heart rate");
    }
    if (/\bno chest pain(?:\s+now)?\b/i.test(sentence)) {
      snapshot.values.chestPain = "None reported";
      addSignal(snapshot, "heart");
      recognize(originalSentence);
    }
    if (/\bsystolic\s+\d+(?:\.\d+)?\b/i.test(sentence) && !/\b(?:BP|pressure)\b[^.]*\d{2,3}\s*\/\s*\d{2,3}/i.test(sentence)) {
      review(originalSentence, "An incomplete blood-pressure value requires confirmation.");
    }
    if (/\b(?:BP|blood pressure|pressure)\b[^.;]*\b(?:about the same|unchanged|stable)\b/i.test(sentence) && !/\d{2,3}\s*\/\s*\d{2,3}/.test(sentence)) {
      review(originalSentence, "An unchanged blood-pressure statement without a value requires confirmation.");
    }
  }

  const needsReview = [...explicitReview, ...sentences
    .filter((sentence) => !recognizedSentences.has(sentence))
    .map((sentence, index) => ({ id: `review-${index + 1}`, text: sentence, reason: "Could not map confidently without interpretation." }))];
  const result = { status: needsReview.length ? "needs_review" : "ready", snapshot, items, needsReview, uncaptured: needsReview.map((entry) => entry.text) };
  const errors = validateExtractionContract(result);
  if (errors.length) throw new Error(`invalid_extraction:${errors.join(",")}`);
  return result;
}
