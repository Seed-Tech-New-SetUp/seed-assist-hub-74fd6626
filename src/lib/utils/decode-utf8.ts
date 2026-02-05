/**
 * Decodes HTML entities in a string
 * Handles cases like &#039; -> ' and &amp; -> &
 */
function decodeHTMLEntities(str: string): string {
  if (!str) return str;
  
  // Common HTML entities (case variations)
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&Amp;': '&',
    '&AMP;': '&',
    '&lt;': '<',
    '&Lt;': '<',
    '&LT;': '<',
    '&gt;': '>',
    '&Gt;': '>',
    '&GT;': '>',
    '&quot;': '"',
    '&Quot;': '"',
    '&#039;': "'",
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#47;': '/',
  };
  
  // Replace named and numeric entities
  let decoded = str;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.split(entity).join(char);
  }
  
  // Handle numeric entities (&#NNN;)
  decoded = decoded.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
  
  // Handle hex entities (&#xHHH;)
  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  
  return decoded;
}

/**
 * Fixes common mojibake patterns (UTF-8 interpreted as Windows-1252)
 */
function fixMojibake(str: string): string {
  if (!str) return str;
  
  // Common mojibake patterns: UTF-8 bytes interpreted as Windows-1252
  // Using literal strings that appear in corrupted text
  const mojibakePatterns: Array<[string, string]> = [
    // RIGHT SINGLE QUOTATION MARK (') - various representations
    ['â€™', "'"],
    ['â€˜', "'"],
    // DOUBLE QUOTATION MARKS
    ['â€œ', '"'],
    ['â€', '"'],
    // DASHES
    ['â€"', '–'],
    ['â€"', '—'],
    // BULLET
    ['â€¢', '•'],
    // ELLIPSIS
    ['â€¦', '…'],
    // Also try with character codes for edge cases
    [String.fromCharCode(0xE2, 0x80, 0x99), "'"],
    [String.fromCharCode(0xE2, 0x80, 0x98), "'"],
    [String.fromCharCode(0xE2, 0x80, 0x9C), '"'],
    [String.fromCharCode(0xE2, 0x80, 0x9D), '"'],
    [String.fromCharCode(0xE2, 0x80, 0x93), '–'],
    [String.fromCharCode(0xE2, 0x80, 0x94), '—'],
    // Common accented characters (Windows-1252 misinterpretation of UTF-8)
    ['Ã©', 'é'],
    ['Ã¨', 'è'],
    ['Ã ', 'à'],
    ['Ã¢', 'â'],
    ['Ã®', 'î'],
    ['Ã´', 'ô'],
    ['Ã»', 'û'],
    ['Ã§', 'ç'],
    ['Ã‰', 'É'],
    ['Ã¼', 'ü'],
    ['Ã¶', 'ö'],
    ['Ã¤', 'ä'],
    ['Ã±', 'ñ'],
    ['Ã­', 'í'],
    ['Ã³', 'ó'],
    ['Ãº', 'ú'],
    // Latin-1 supplement characters that get corrupted
    ['Ã¡', 'á'],
    ['Ã¿', 'ÿ'],
    ['Ã', 'Á'],
    // Handle replacement character (�) - often indicates encoding issue
    // When é (U+00E9) gets corrupted, try to preserve context
  ];
  
  let fixed = str;
  for (const [mojibake, correct] of mojibakePatterns) {
    fixed = fixed.split(mojibake).join(correct);
  }
  
  return fixed;
}

/**
 * Fixes incorrectly encoded UTF-8 strings
 * Handles cases where UTF-8 was double-encoded or misinterpreted
 */
export function decodeUTF8(str: string): string {
  if (!str) return str;
  
  // First decode HTML entities
  let decoded = decodeHTMLEntities(str);
  
  // Fix common mojibake patterns
  decoded = fixMojibake(decoded);
  
  // Handle replacement character (U+FFFD) which indicates encoding failure
  // Try to recover known patterns
  const knownPatterns: Array<[RegExp, string]> = [
    [/M\uFFFDridien/gi, 'Méridien'],
    [/caf\uFFFD/gi, 'café'],
    [/resum\uFFFD/gi, 'resumé'],
    [/na\uFFFDve/gi, 'naïve'],
  ];
  
  for (const [pattern, replacement] of knownPatterns) {
    decoded = decoded.replace(pattern, replacement);
  }
  
  try {
    // Try to fix double-encoded UTF-8 (common issue when data goes through multiple encoding steps)
    // This handles cases like "MÃ©ridien" -> "Méridien"
    decoded = decodeURIComponent(escape(decoded));
  } catch {
    // If that fails, try using TextDecoder
    try {
      const bytes = new Uint8Array(decoded.split('').map(c => c.charCodeAt(0)));
      decoded = new TextDecoder('utf-8').decode(bytes);
    } catch {
      // Return decoded string if UTF-8 decoding fails
    }
  }
  
  return decoded;
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
