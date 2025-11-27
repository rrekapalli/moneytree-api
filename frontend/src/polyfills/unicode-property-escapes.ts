/**
 * Polyfill for Unicode property escapes in regular expressions
 * This ensures compatibility with older browsers that don't support \p{} syntax
 */

// Check if Unicode property escapes are supported
function supportsUnicodePropertyEscapes(): boolean {
  try {
    // Test if the browser supports Unicode property escapes
    new RegExp('\\p{L}', 'u');
    return true;
  } catch (e) {
    return false;
  }
}

// If Unicode property escapes are not supported, provide a basic polyfill
if (!supportsUnicodePropertyEscapes()) {
  
  // Store the original RegExp constructor
  const OriginalRegExp = RegExp;
  
  // Override the RegExp constructor to handle basic Unicode property escapes
  (window as any).RegExp = function(pattern: string | RegExp, flags?: string) {
    if (typeof pattern === 'string' && pattern.includes('\\p{')) {
      // Basic replacement for common Unicode property escapes
      pattern = pattern
        .replace(/\\p\{Diacritic\}/g, '[\\u0300-\\u036F\\u1AB0-\\u1AFF\\u1DC0-\\u1DFF\\u20D0-\\u20FF\\uFE20-\\uFE2F]')
        .replace(/\\p\{L\}/g, '[a-zA-Z\\u00C0-\\u024F\\u1E00-\\u1EFF]')
        .replace(/\\p\{N\}/g, '[0-9\\u0660-\\u0669\\u06F0-\\u06F9]');
    }
    
    if (pattern instanceof RegExp) {
      return new OriginalRegExp(pattern.source, flags || pattern.flags);
    }
    
    return new OriginalRegExp(pattern, flags);
  };
  
  // Copy static methods
  Object.setPrototypeOf((window as any).RegExp, OriginalRegExp);
  (window as any).RegExp.prototype = OriginalRegExp.prototype;
}

export {};