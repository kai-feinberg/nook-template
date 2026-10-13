import type { TrendingRepository } from "../state/schema.ts";

export type TrendingFetchResponse =
  | { ok: true; text: string; source: "github" }
  | { ok: false; error: string };

const trendingUrl = "https://github.com/trending";
const noiseLinePatterns = [
  /^sponsor$/i,
  /^built by\b/i,
  /^star$/i,
  /^fork$/i,
  /^today$/i,
  /^this week$/i,
  /^this month$/i
];

function makeRepositoryId(owner: string, name: string) {
  return `${owner}-${name}`.replace(/[^a-z0-9._-]+/gi, "-").toLowerCase();
}

function parseCompactCount(value: string) {
  const normalized = value.trim().replace(/,/g, "").toLowerCase();
  const match = normalized.match(/^([\d.]+)(k|m)?$/);
  if (!match) return undefined;

  const count = Number(match[1]);
  if (!Number.isFinite(count)) return undefined;
  const multiplier = match[2] === "m" ? 1_000_000 : match[2] === "k" ? 1_000 : 1;
  return Math.round(count * multiplier);
}

function isNoiseLine(line: string) {
  return noiseLinePatterns.some((pattern) => pattern.test(line.trim()));
}

function normalizeDescription(lines: string[]) {
  return lines
    .filter((line) => line && !isNoiseLine(line))
    .filter((line) => !/^\w[\w+#.\- ]*\s+[\d,.]+[km]?\s+[\d,.]+[km]?$/i.test(line))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseStatsLine(line: string) {
  const match = line.trim().match(/^(.+?)\s+([\d,.]+[km]?)\s+([\d,.]+[km]?)$/i);
  if (!match) return {};

  return {
    language: match[1].trim(),
    stars: parseCompactCount(match[2]),
    forks: parseCompactCount(match[3])
  };
}

function toRepository(owner: string, name: string, lines: string[]): TrendingRepository {
  const statsLine = [...lines].reverse().find((line) => parseStatsLine(line).stars !== undefined);
  const stats = statsLine ? parseStatsLine(statsLine) : {};

  return {
    id: makeRepositoryId(owner, name),
    owner,
    name,
    description: normalizeDescription(lines) || "No description available.",
    language: stats.language,
    stars: stats.stars,
    url: `${trendingUrl}/${owner}/${name}`.replace("/trending/", "/")
  };
}

export function parseTrendingRepos(text: string): TrendingRepository[] {
  const blocks = text
    .replace(/\r\n/g, "\n")
    .split(/\n(?=##\s+)/g)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.flatMap((block) => {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const heading = lines[0]?.match(/^##\s+(.+?)\s*\/\s*(.+)$/);
    if (!heading) return [];

    const owner = heading[1].replace(/\s+/g, "").trim();
    const name = heading[2].replace(/\s+/g, "").trim();
    if (!owner || !name) return [];

    return [toRepository(owner, name, lines.slice(1))];
  });
}

export async function fetchTrendingText(): Promise<TrendingFetchResponse> {
  if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
    return { ok: false, error: "GitHub Trending can only refresh inside the extension runtime." };
  }

  try {
    const response = (await chrome.runtime.sendMessage({ type: "FETCH_TRENDING" })) as TrendingFetchResponse;
    return response?.ok ? response : { ok: false, error: response?.error ?? "Trending refresh failed." };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Trending refresh failed."
    };
  }
}
