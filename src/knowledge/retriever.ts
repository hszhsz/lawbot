import { loadAllLaws, type LawArticle } from "./loader.js";

let lawCache: LawArticle[] | null = null;

function getLaws(): LawArticle[] {
  if (!lawCache) {
    lawCache = loadAllLaws();
  }
  return lawCache;
}

export interface SearchResult {
  source: string;
  title: string;
  content: string;
  score: number;
}

export async function searchLaw(
  query: string,
  category?: string,
): Promise<SearchResult[]> {
  const laws = getLaws();

  // Filter by category if specified
  const filtered = category
    ? laws.filter((l) => l.category === category)
    : laws;

  // Simple TF-IDF-like keyword scoring
  const queryTerms = tokenize(query);

  const scored = filtered.map((law) => {
    const lawText = `${law.title} ${law.content}`;
    const lawTerms = tokenize(lawText);
    let score = 0;

    for (const qt of queryTerms) {
      // Exact match bonus
      if (lawText.includes(qt)) {
        score += 3;
      }
      // Term frequency in document
      const tf = lawTerms.filter((lt) => lt === qt).length;
      score += tf;
    }

    // Boost title matches
    for (const qt of queryTerms) {
      if (law.title.includes(qt)) {
        score += 5;
      }
    }

    return { source: law.source, title: law.title, content: law.content, score };
  });

  // Return top 5 results with score > 0
  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function tokenize(text: string): string[] {
  // Simple Chinese + English tokenizer
  // Split by non-word characters, keep CJK chars as individual tokens
  const tokens: string[] = [];

  // Extract all CJK characters individually
  const cjk = text.match(/[一-鿿]/g) ?? [];
  tokens.push(...cjk);

  // Extract word-like sequences (English, numbers)
  const words = text.match(/[a-zA-Z0-9]+/g) ?? [];
  tokens.push(...words.map((w) => w.toLowerCase()));

  return tokens;
}
