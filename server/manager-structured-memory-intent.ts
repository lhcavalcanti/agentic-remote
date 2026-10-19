export type StructuredMemoryMutationOperation =
  | 'remember'
  | 'correct'
  | 'forget'

const memoryObject =
  String.raw`(?:memory|remembered|preference|fact|procedure|decision|outcome)`

export function hasExplicitStructuredMemoryIntent(
  message: string,
  operation: StructuredMemoryMutationOperation,
): boolean {
  // Apostrophe look-alikes are folded before NFKC, which decomposes some of them.
  const normalized = message
    .replace(/[\u00AD\u200B-\u200D\u2060\uFEFF]/g, '')
    .replace(/[`\u00B4\u02B9\u02BC\u2018\u2019\u201A\u201B\u2032\uFF07]/g, "'")
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('en-US')
  if (!normalized) return false

  // Up to two words may sit between the negation and the verb ("don't ever remember").
  if (/\b(?:do not|don't|dont|never)(?: [\w']+){0,2} (?:remember|save|store|keep|correct|update|replace|change|supersede|forget|delete|remove)\b/
    .test(normalized)) {
    return false
  }

  if (operation === 'remember') {
    return (
      /\bremember\s+(?:that|this|my|the following)\b/.test(normalized) ||
      new RegExp(
        String.raw`\b(?:save|store|keep)\b.{0,60}\b${memoryObject}\b`,
      ).test(normalized) ||
      /\b(?:save|store)\s+(?:this|that|my)\b.{0,60}\b(?:for later|long[- ]term|in (?:your )?memory)\b/
        .test(normalized)
    )
  }
  if (operation === 'correct') {
    return new RegExp(
      String.raw`\b(?:correct|update|replace|change|supersede)\b.{0,60}\b${memoryObject}\b`,
    ).test(normalized)
  }
  return new RegExp(
    String.raw`\b(?:forget|delete|remove)\b.{0,60}\b(?:this |that |the |from (?:your )?)?${memoryObject}\b`,
  ).test(normalized)
}
