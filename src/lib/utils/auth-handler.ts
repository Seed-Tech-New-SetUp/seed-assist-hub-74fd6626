import { clearAuthCookies } from "@/lib/utils/cookies";

/**
 * Handle unauthorized API responses by clearing auth and redirecting to login.
 * Call this when receiving 401/403 or token expired errors.
 */
export function handleUnauthorized(errorMessage?: string): never {
  console.log("Session expired or unauthorized, logging out...", errorMessage);
  
  // Clear all auth cookies
  clearAuthCookies();
  
  // Redirect to login
  window.location.href = "/login";
  
  // Throw to stop further execution
  throw new Error("Session expired");
}

/**
 * Check if an error response indicates an unauthorized/expired token.
 */
export function isUnauthorizedError(status: number, errorData?: { error?: string; message?: string }): boolean {
  if (status === 401 || status === 403) {
    return true;
  }
  
  const errorMessage = (errorData?.error || errorData?.message || "").toLowerCase();
  return (
    errorMessage.includes("unauthorized") ||
    errorMessage.includes("token expired") ||
    errorMessage.includes("invalid token") ||
    errorMessage.includes("jwt expired") ||
    errorMessage.includes("no authentication token") ||
    errorMessage.includes("authentication required")
  );
}
