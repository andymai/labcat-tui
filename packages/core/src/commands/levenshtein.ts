/**
 * Standard Levenshtein distance. Used for "did you mean…" suggestions.
 * Adjacent transposition counts as 2 edits (insertion + deletion); good
 * enough for short command names where typos are usually substitutions.
 */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  const curr = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min((curr[j - 1] ?? 0) + 1, (prev[j] ?? 0) + 1, (prev[j - 1] ?? 0) + cost);
    }
    prev = curr.slice();
  }

  return prev[b.length] ?? 0;
}

export function closestMatch(input: string, candidates: readonly string[]): string | null {
  if (candidates.length === 0) return null;
  let best: { name: string; distance: number } | null = null;
  for (const candidate of candidates) {
    const distance = levenshtein(input, candidate);
    if (best === null || distance < best.distance) best = { name: candidate, distance };
  }
  if (!best) return null;
  const maxAcceptable = Math.max(1, Math.floor(input.length / 2));
  return best.distance <= maxAcceptable ? best.name : null;
}
