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
  const normalized = message
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('en-US')
  if (!normalized) return false

  if (/\b(?:do not|don't|dont|never)\s+(?:remember|save|store|keep|correct|update|replace|change|supersede|forget|delete|remove)\b/
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
