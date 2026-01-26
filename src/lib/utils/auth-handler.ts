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
    errorMessage.includes("authentication required") ||
    errorMessage.includes("not authenticated") ||
    errorMessage.includes("session expired")
  );
}

/**
 * Check a fetch response for auth errors and handle accordingly.
 * Returns the error data if it's not an auth error.
 */
export async function checkResponseForAuthError(
  response: Response
): Promise<{ isAuthError: boolean; errorData?: Record<string, unknown> }> {
  if (response.ok) {
    return { isAuthError: false };
  }

  const errorData = await response.json().catch(() => ({}));
  
  if (isUnauthorizedError(response.status, errorData)) {
    handleUnauthorized(errorData.error || errorData.message);
  }

  return { isAuthError: false, errorData };
}

/**
 * Check Supabase function invoke response for auth errors.
 */
export function checkSupabaseResponseForAuthError(
  data: { success?: boolean; error?: string; message?: string } | null,
  error: { message?: string; status?: number } | null
): void {
  // Check error object
  if (error) {
    const status = (error as { status?: number }).status || 0;
    if (isUnauthorizedError(status, { error: error.message })) {
      handleUnauthorized(error.message);
    }
  }

  // Check response data
  if (data && !data.success) {
    if (isUnauthorizedError(0, { error: data.error, message: data.message })) {
      handleUnauthorized(data.error || data.message);
    }
  }
}

/**
 * Wrapper for fetch that automatically handles auth errors.
 */
export async function fetchWithAuthHandler(
  url: string,
  options: RequestInit
): Promise<Response> {
  const response = await fetch(url, options);

  if (!response.ok) {
    // Clone response to read body without consuming it
    const clonedResponse = response.clone();
    const errorData = await clonedResponse.json().catch(() => ({}));

    if (isUnauthorizedError(response.status, errorData)) {
      handleUnauthorized(errorData.error || errorData.message);
    }
  }

  return response;
}
