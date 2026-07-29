/**
 * Character n-gram text featurization.
 *
 * Turns real strings into real vectors: the classic bag-of-character-bigrams
 * representation used for fuzzy string matching and as a cheap, tokenizer-free
 * text feature. Every number downstream is computed from the input text — there
 * is nothing random or hand-placed in here, so the same corpus always produces
 * the same vectors.
 */

/**
 * Lowercases, collapses everything non-alphanumeric to a single space, and pads
 * with boundary spaces so word starts/ends become their own features.
 */
export function characterBigrams(text: string): string[] {
  const normalized = ` ${text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
  const grams: string[] = [];
  for (let i = 0; i < normalized.length - 1; i++) {
    grams.push(normalized.slice(i, i + 2));
  }
  return grams;
}

export type TermMatrix = {
  /** One L2-normalized term-frequency row per document. */
  vectors: number[][];
  /** Feature order, sorted so the layout is reproducible across loads. */
  vocabulary: string[];
};

/**
 * Builds an L2-normalized term-frequency matrix over character bigrams.
 *
 * `minDocumentFrequency` drops bigrams that appear in fewer than N documents —
 * standard practice (scikit-learn calls it `min_df`), and it matters here
 * because a feature occurring in exactly one document contributes nothing to
 * covariance structure while still costing a dimension.
 */
export function buildTermMatrix(
  documents: string[],
  minDocumentFrequency = 2,
): TermMatrix {
  const perDocument = documents.map(characterBigrams);

  const documentFrequency = new Map<string, number>();
  for (const grams of perDocument) {
    for (const gram of new Set(grams)) {
      documentFrequency.set(gram, (documentFrequency.get(gram) ?? 0) + 1);
    }
  }

  const vocabulary = [...documentFrequency.entries()]
    .filter(([, count]) => count >= minDocumentFrequency)
    .map(([gram]) => gram)
    .sort();

  const index = new Map(vocabulary.map((gram, i) => [gram, i]));

  const vectors = perDocument.map((grams) => {
    const row = new Array<number>(vocabulary.length).fill(0);
    for (const gram of grams) {
      const i = index.get(gram);
      if (i !== undefined) row[i] += 1;
    }
    // L2 normalize so long documents don't dominate purely by length.
    const magnitude = Math.sqrt(row.reduce((sum, v) => sum + v * v, 0));
    return magnitude > 0 ? row.map((v) => v / magnitude) : row;
  });

  return { vectors, vocabulary };
}
