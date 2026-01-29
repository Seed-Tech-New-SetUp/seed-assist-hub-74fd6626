/**
 * Extracts filename from Content-Disposition header.
 * Falls back to provided default if header is missing or malformed.
 */
export function extractFilenameFromHeader(
  response: Response,
  fallbackName: string
): string {
  const contentDisposition = response.headers.get("Content-Disposition");
  
  if (contentDisposition) {
    // Try to match filename*= (RFC 5987) first for UTF-8 encoded names
    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;\s]+)/i);
    if (utf8Match) {
      try {
        return decodeURIComponent(utf8Match[1]);
      } catch {
        // Fall through to standard filename
      }
    }
    
    // Try standard filename="..." or filename=...
    const standardMatch = contentDisposition.match(/filename="?([^";\s]+)"?/i);
    if (standardMatch) {
      return standardMatch[1];
    }
  }
  
  return fallbackName;
}
