export function normalizeTitle(title: string): string {
  return title
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenSet(title: string): Set<string> {
  return new Set(normalizeTitle(title).split(' ').filter(Boolean));
}

export function titleSimilarity(a: string, b: string): number {
  const normA = normalizeTitle(a);
  const normB = normalizeTitle(b);
  if (!normA || !normB) {
    return 0;
  }
  if (normA === normB) {
    return 1;
  }
  if (normA.includes(normB) || normB.includes(normA)) {
    return 0.95;
  }

  const tokensA = tokenSet(a);
  const tokensB = tokenSet(b);
  if (tokensA.size === 0 || tokensB.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersection += 1;
    }
  }
  return intersection / Math.max(tokensA.size, tokensB.size);
}

export interface MatchCandidateInput {
  title: string;
  year?: number | null;
}

export interface MatchableWork {
  id: string;
  titleRu: string;
  titleOrig?: string | null;
  yearFirst?: number | null;
}

export interface WorkMatchResult {
  work: MatchableWork;
  score: number;
}

export function findBestWorkMatch(
  candidate: MatchCandidateInput,
  works: MatchableWork[],
  highThreshold: number,
): WorkMatchResult | null {
  let best: WorkMatchResult | null = null;

  for (const work of works) {
    const titleScore = Math.max(
      titleSimilarity(candidate.title, work.titleRu),
      work.titleOrig ? titleSimilarity(candidate.title, work.titleOrig) : 0,
    );

    let score = titleScore;
    if (
      candidate.year != null &&
      work.yearFirst != null &&
      Math.abs(candidate.year - work.yearFirst) <= 1
    ) {
      score = Math.min(1, score + 0.05);
    }

    if (score >= highThreshold && (!best || score > best.score)) {
      best = { work, score };
    }
  }

  return best;
}

export function scoreWorkMatch(
  candidate: MatchCandidateInput,
  work: MatchableWork,
): number {
  const titleScore = Math.max(
    titleSimilarity(candidate.title, work.titleRu),
    work.titleOrig ? titleSimilarity(candidate.title, work.titleOrig) : 0,
  );

  let score = titleScore;
  if (
    candidate.year != null &&
    work.yearFirst != null &&
    Math.abs(candidate.year - work.yearFirst) <= 1
  ) {
    score = Math.min(1, score + 0.05);
  }
  return score;
}

export function findWorkMatchSuggestions(
  candidate: MatchCandidateInput,
  works: MatchableWork[],
  minScore: number,
  limit: number,
): WorkMatchResult[] {
  const matches: WorkMatchResult[] = [];
  for (const work of works) {
    const score = scoreWorkMatch(candidate, work);
    if (score >= minScore) {
      matches.push({ work, score });
    }
  }
  return matches.sort((a, b) => b.score - a.score).slice(0, limit);
}
