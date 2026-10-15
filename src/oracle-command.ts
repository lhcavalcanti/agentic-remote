/** The prompt typed after `/oracle`, or undefined for any other text. */
export function oracleCommand(text: string): { prompt: string } | undefined {
  const match = /^\/oracle(?:\s+([\s\S]*))?$/i.exec(text.trim())
  return match ? { prompt: (match[1] || '').trim() } : undefined
}
