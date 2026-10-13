const githubTrendingUrl = "https://github.com/trending";

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]+>/g, " "));
}

function htmlTrendingToText(html: string) {
  const articles = html.match(/<article\b[\s\S]*?<\/article>/g) ?? [];
  return articles
    .map((article) => {
      const repoMatch = article.match(/href="\/([^"\/]+)\/([^"\/]+)"/);
      if (!repoMatch) return "";

      const owner = decodeHtml(repoMatch[1]);
      const name = decodeHtml(repoMatch[2]);
      const description = stripTags(article.match(/<p\b[^>]*class="[^"]*col-9[^"]*"[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? "");
      const language = stripTags(article.match(/<span\b[^>]*itemprop="programmingLanguage"[^>]*>([\s\S]*?)<\/span>/)?.[1] ?? "");
      const starMatches = [...article.matchAll(/href="\/[^"]+\/stargazers"[^>]*>([\s\S]*?)<\/a>/g)];
      const forkMatches = [...article.matchAll(/href="\/[^"]+\/forks"[^>]*>([\s\S]*?)<\/a>/g)];
      const stars = stripTags(starMatches[0]?.[1] ?? "");
      const forks = stripTags(forkMatches[0]?.[1] ?? "");
      const stats = [language, stars, forks].filter(Boolean).join(" ");

      return [`## ${owner} / ${name}`, description, stats, "Star"].filter(Boolean).join("\n");
    })
    .filter(Boolean)
    .join("\n\n");
}

async function fetchFromGitHub() {
  const response = await fetch(githubTrendingUrl, {
    headers: {
      accept: "text/html"
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub Trending request failed with ${response.status}.`);
  }

  return htmlTrendingToText(await response.text());
}

async function fetchTrendingText() {
  return { text: await fetchFromGitHub(), source: "github" as const };
}

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if (!message || typeof message !== "object" || (message as { type?: unknown }).type !== "FETCH_TRENDING") {
    return false;
  }

  void fetchTrendingText()
    .then(({ text, source }) => sendResponse({ ok: true, text, source }))
    .catch((error: unknown) => {
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : "Could not refresh GitHub Trending."
      });
    });

  return true;
});
