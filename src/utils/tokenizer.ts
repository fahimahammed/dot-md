/**
 * Estimates LLM token usage for a given text using a hybrid word/character heuristic.
 * Works offline, lightweight, and doesn't bloat the bundle size.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  
  const trimmedText = text.trim();
  if (trimmedText === '') return 0;

  const charCount = trimmedText.length;
  
  // Split by whitespace to get words
  const words = trimmedText.split(/\s+/);
  const wordCount = words.length;

  // Count code-like symbols to determine if the text is code-heavy
  // Code is typically tokenized into more tokens per character due to syntax symbols
  const codeSymbols = (trimmedText.match(/[{}[\]()=+\-*/<>;&|`_]/g) || []).length;
  const symbolRatio = codeSymbols / charCount;
  const isCodeHeavy = symbolRatio > 0.08;

  let tokenCount = 0;
  if (isCodeHeavy) {
    // Code blocks usually average around 3 characters per token
    tokenCount = Math.round(charCount / 3.0);
  } else {
    // Standard English text averages 4 characters per token or 1.33 tokens per word
    const charEstimate = charCount / 4.0;
    const wordEstimate = wordCount * 1.33;
    // Average the two estimates for a more robust result
    tokenCount = Math.round((charEstimate + wordEstimate) / 2);
  }

  // Ensure we return at least 1 token if there is text present
  return Math.max(1, tokenCount);
}

/**
 * Returns a warning message if the token count exceeds a threshold (e.g. 15k tokens).
 */
export function getTokenWarning(tokenCount: number): string | null {
  const WARNING_THRESHOLD = 15000;
  if (tokenCount > WARNING_THRESHOLD) {
    return `⚠️ Large content (${tokenCount.toLocaleString()} tokens). This might consume a large portion of your LLM's context window.`;
  }
  return null;
}
