/**
 * Utility to extract JSON object from a raw STOMP message/frame string.
 * Handles strings that contain STOMP headers, a JSON body and a trailing null terminator (\u0000).
 * Also works when given a plain JSON string.
 */
export function parseStompMessageToJson(raw: string): any | null {
  if (raw == null) return null;
  try {
    // First try direct JSON parse (typical case when message.body is JSON)
    return JSON.parse(raw);
  } catch {
    try {
      // Remove STOMP null terminator and any leading/trailing whitespace
      const cleaned = raw.replace(/\u0000/g, '').trim();
      // Find the first opening brace and the last closing brace to isolate JSON body
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        const jsonStr = cleaned.substring(start, end + 1);
        return JSON.parse(jsonStr);
      }

      // If body is quoted JSON with escapes, attempt to unescape common sequences
      // e.g., "{\"a\":1}" => {"a":1}
      const quoteStart = cleaned.indexOf('"{');
      const quoteEnd = cleaned.lastIndexOf('}"');
      if (quoteStart !== -1 && quoteEnd !== -1 && quoteEnd > quoteStart) {
        const inner = cleaned.substring(quoteStart + 1, quoteEnd + 1);
        const unescaped = inner
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
        return JSON.parse(unescaped);
      }
    } catch {
      // fall through
    }
  }
  return null;
}
