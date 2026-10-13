/** The question typed after `/ask` or `/btw`, or undefined for any other text. */
export function sideQuestionCommand(text: string): { question: string } | undefined {
  const match = /^\/(ask|btw)(?:\s+([\s\S]*))?$/i.exec(text.trim())
  return match ? { question: (match[2] || '').trim() } : undefined
}
