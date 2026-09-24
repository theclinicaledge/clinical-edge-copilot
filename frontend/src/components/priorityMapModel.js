function cleanLines(value) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

export function parsePriorities(content) {
  if (!content) return [];
  const matches = [...content.matchAll(/^###\s*(\d+)\s*[·.\-:]\s*(.+)$/gm)];
  if (!matches.length) {
    const observed = cleanLines(content).filter((line) => /^[-•*›]\s/.test(line)).map((line) => line.replace(/^[-•*›]\s+/, ""));
    return observed.length ? [{ rank: 1, label: "Clinical change", relevance: "Needs clarification", observed: observed.slice(0, 3), interpretation: "", assessNow: [] }] : [];
  }

  return matches.slice(0, 3).map((match, index) => {
    const end = matches[index + 1]?.index ?? content.length;
    const block = content.slice(match.index + match[0].length, end);
    const relevance = block.match(/^Relevance:\s*(.+)$/mi)?.[1]?.trim() || "Important";
    const interpretation = block.match(/^Interpretation:\s*(.+)$/mi)?.[1]?.trim() || "";
    const observedBlock = block.match(/(?:^|\n)Observed:\s*\n([\s\S]*?)(?=\nInterpretation:|\nAssess now:|$)/i)?.[1] || "";
    const assessBlock = block.match(/(?:^|\n)Assess now:\s*\n([\s\S]*?)$/i)?.[1] || "";
    return {
      rank: Number(match[1]) || index + 1,
      label: match[2].trim(),
      relevance,
      observed: cleanLines(observedBlock).filter((line) => /^[-•*›]\s/.test(line)).map((line) => line.replace(/^[-•*›]\s+/, "")).slice(0, 3),
      interpretation,
      assessNow: cleanLines(assessBlock).filter((line) => /^[-•*›]\s/.test(line)).map((line) => line.replace(/^[-•*›]\s+/, "")).slice(0, 3),
    };
  });
}
