/**
 * Fixes incorrectly encoded UTF-8 strings
 * Handles cases where UTF-8 was double-encoded or misinterpreted
 */
export function decodeUTF8(str: string): string {
  if (!str) return str;
  
  try {
    // Try to fix double-encoded UTF-8 (common issue when data goes through multiple encoding steps)
    // This handles cases like "MÃ©ridien" -> "Méridien"
    return decodeURIComponent(escape(str));
  } catch {
    // If that fails, try using TextDecoder
    try {
      const bytes = new Uint8Array(str.split('').map(c => c.charCodeAt(0)));
      return new TextDecoder('utf-8').decode(bytes);
    } catch {
      // Return original string if all decoding attempts fail
      return str;
    }
  }
}

/**
 * Recursively decode all string values in an object
 */
export function decodeObjectStrings<T>(obj: T): T {
  if (typeof obj === 'string') {
    return decodeUTF8(obj) as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => decodeObjectStrings(item)) as T;
  }
  
  if (obj !== null && typeof obj === 'object') {
    const decoded: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      decoded[key] = decodeObjectStrings(value);
    }
    return decoded as T;
  }
  
  return obj;
}
