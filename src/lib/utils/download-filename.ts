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

/**
 * Determines season based on month (Spring: Jan-Jun, Fall: Jul-Dec)
 */
function getSeason(date: Date): string {
  const month = date.getMonth();
  return month < 6 ? "Spring" : "Fall";
}

/**
 * Formats date as dd-mm-yyyy
 */
function formatDateForFilename(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Builds fallback filename for BSF reports.
 * Pattern: {eventTypeName}_{city}_{season_year}_{formattedDate}.xlsx
 */
export function buildBSFFallbackFilename(
  eventTypeName: string,
  city: string,
  eventDate: string
): string {
  const date = new Date(eventDate);
  const season = getSeason(date);
  const year = date.getFullYear();
  const formattedDate = formatDateForFilename(date);
  
  const sanitize = (str: string) => str.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
  
  return `${sanitize(eventTypeName)}_${sanitize(city)}_${season}_${year}_${formattedDate}.xlsx`;
}

/**
 * Builds fallback filename for Campus Tour reports.
 * Pattern: {eventTypeName}_{campusName}_{season_year}_{formattedDate}.xlsx
 */
export function buildCampusTourFallbackFilename(
  eventTypeName: string,
  campusName: string,
  eventDate: string
): string {
  const date = new Date(eventDate);
  const season = getSeason(date);
  const year = date.getFullYear();
  const formattedDate = formatDateForFilename(date);
  
  const sanitize = (str: string) => str.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
  
  return `${sanitize(eventTypeName)}_${sanitize(campusName || "Event")}_${season}_${year}_${formattedDate}.xlsx`;
}

/**
 * Builds fallback filename for Masterclass reports.
 * Pattern: SEED_Masterclass_{Month}_{Day}_{Year}.xlsx
 */
export function buildMasterclassFallbackFilename(eventDate: string): string {
  const date = new Date(eventDate);
  const month = date.toLocaleString("en-US", { month: "long" });
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `SEED_Masterclass_${month}_${day}_${year}.xlsx`;
}
