import { dailyItem } from "./rotation.ts";
import type { WordEntry } from "../state/schema.ts";

export function normalizeWords(value: unknown): WordEntry[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.slice(0, 100).flatMap((entry, index) => {
    if (!entry || typeof entry.text !== "string") return [];
    let id = typeof entry.id === "string" ? entry.id : `word-${index}`;
    if (seen.has(id)) id = `word-${index}`;
    let suffix = 1;
    while (seen.has(id)) id = `word-${index}-${suffix++}`;
    seen.add(id);
    return [{ id, text: entry.text.slice(0, 400), author: typeof entry.author === "string" ? entry.author.slice(0, 100) : "" }];
  });
}

export function dailyWord(starter: readonly { text: string; author: string }[], personal: readonly WordEntry[], source: "starter" | "personal", date = new Date()) {
  const saved = personal.filter(entry => entry.text.trim());
  return dailyItem(source === "personal" && saved.length ? saved : starter, date);
}

export function parseBulkWords(input: string, existing: readonly WordEntry[] = []) {
  const entries: {text: string; author: string}[] = [];
  const keys = new Set(existing.map(entry => JSON.stringify([entry.text.trim(), entry.author.trim()])));
  let skipped = 0;
  for (const [index, line] of input.split(/\r?\n/).entries()) {
    if (!line.trim()) continue;
    const separator = line.lastIndexOf(" | ");
    const text = (separator === -1 ? line : line.slice(0, separator)).trim();
    const author = separator === -1 ? "" : line.slice(separator + 3).trim();
    if (!text || text.length > 400 || author.length > 100) return { entries: [], skipped, error: `Line ${index + 1}: use a quote up to 400 characters and an author up to 100 characters.` };
    const key = JSON.stringify([text, author]);
    if (keys.has(key)) { skipped++; continue; }
    keys.add(key); entries.push({text, author});
  }
  if (existing.length + entries.length > 100) return { entries, skipped, error: `There is room for ${100 - existing.length} more entries. Nothing will be added until the list fits.` };
  return { entries, skipped, error: "" };
}
