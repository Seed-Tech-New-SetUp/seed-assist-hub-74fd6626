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
 * Supports both flat error structures and nested { error: { code, message } } format.
 */
export function isUnauthorizedError(
  status: number, 
  errorData?: { 
    error?: string | { code?: string; message?: string }; 
    message?: string;
    success?: boolean;
  }
): boolean {
  if (status === 401 || status === 403) {
    return true;
  }
  
  // Check for nested error structure: { success: false, error: { code: "UNAUTHORIZED" } }
  if (errorData?.error && typeof errorData.error === 'object') {
    const errorCode = errorData.error.code?.toUpperCase();
    if (errorCode === 'UNAUTHORIZED' || errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN') {
      return true;
    }
    const nestedMessage = (errorData.error.message || '').toLowerCase();
    if (
      nestedMessage.includes('unauthorized') ||
      nestedMessage.includes('token expired') ||
      nestedMessage.includes('invalid token') ||
      nestedMessage.includes('expired token')
    ) {
      return true;
    }
  }
  
  // Check flat error structure
  const errorMessage = (
    (typeof errorData?.error === 'string' ? errorData.error : '') || 
    errorData?.message || 
    ''
  ).toLowerCase();
  
  return (
    errorMessage.includes("unauthorized") ||
    errorMessage.includes("token expired") ||
    errorMessage.includes("invalid token") ||
    errorMessage.includes("jwt expired") ||
    errorMessage.includes("no authentication token") ||
    errorMessage.includes("authentication required") ||
    errorMessage.includes("not authenticated") ||
    errorMessage.includes("session expired") ||
    errorMessage.includes("expired token")
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
 * Supports nested error structure: { success: false, error: { code, message } }
 */
export function checkSupabaseResponseForAuthError(
  data: { 
    success?: boolean; 
    error?: string | { code?: string; message?: string }; 
    message?: string 
  } | null,
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
  if (data && data.success === false) {
    if (isUnauthorizedError(0, data)) {
      // Extract message from nested or flat structure
      const errorMessage = typeof data.error === 'object' 
        ? data.error.message 
        : (data.error || data.message);
      handleUnauthorized(errorMessage);
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
      const errorMessage = typeof errorData.error === 'object' 
        ? errorData.error.message 
        : (errorData.error || errorData.message);
      handleUnauthorized(errorMessage);
    }
  }

  return response;
}
