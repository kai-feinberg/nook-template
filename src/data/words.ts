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
