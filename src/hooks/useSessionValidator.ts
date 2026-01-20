import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCookie, getCookieJSON, AUTH_COOKIES } from '@/lib/utils/cookies';

/**
 * Hook that validates the user session by checking cookies periodically.
 * Redirects to login if the session cookies are missing or invalid.
 */
export function useSessionValidator() {
  const navigate = useNavigate();
  const location = useLocation();

  const validateSession = useCallback(() => {
    // Skip validation on public routes
    const publicRoutes = ['/login', '/forgot-password', '/reset-password'];
    if (publicRoutes.some(route => location.pathname.startsWith(route))) {
      return true;
    }

    // Check for essential auth cookies
    const portalUser = getCookieJSON(AUTH_COOKIES.USER);
    const portalToken = getCookie(AUTH_COOKIES.TOKEN);
    const tempToken = getCookie(AUTH_COOKIES.TEMP_TOKEN);

    // User should have either a full session (user + token) or be in school selection flow (user + tempToken)
    const hasValidSession = portalUser && portalToken;
    const isInSchoolSelectionFlow = portalUser && tempToken && location.pathname === '/select-school';

    if (!hasValidSession && !isInSchoolSelectionFlow) {
      console.log('Session invalid or expired, redirecting to login');
      navigate('/login', { replace: true });
      return false;
    }

    return true;
  }, [navigate, location.pathname]);

  useEffect(() => {
    // Validate immediately on mount
    validateSession();

    // Set up periodic validation (every 30 seconds)
    const intervalId = setInterval(validateSession, 30000);

    // Also validate on visibility change (when user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        validateSession();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [validateSession]);

  return { validateSession };
}
