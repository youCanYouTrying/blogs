// sensitive-word is a CommonJS module; use require for compatibility
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { sensitiveWords } = require('sensitive-word') as {
  sensitiveWords: (content: string, words: string[]) => string
}

// Default built-in word list — extend as needed
const DEFAULT_WORDS: string[] = []

/**
 * Returns true if the given text contains any sensitive words.
 * The underlying library replaces matches with "***"; if the output
 * differs from the input, at least one sensitive word was found.
 */
export function hasSensitiveWord(text: string): boolean {
  if (!text) return false
  const filtered = sensitiveWords(text, DEFAULT_WORDS)
  return filtered !== text
}
