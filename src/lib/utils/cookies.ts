// Secure cookie utilities for token storage

interface CookieOptions {
  expires?: number; // days
  path?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

const DEFAULT_OPTIONS: CookieOptions = {
  expires: 7, // 7 days
  path: '/',
  secure: window.location.protocol === 'https:',
  sameSite: 'Strict',
};

/**
 * Set a cookie with secure defaults
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  
  if (opts.expires) {
    const date = new Date();
    date.setTime(date.getTime() + opts.expires * 24 * 60 * 60 * 1000);
    cookieString += `; expires=${date.toUTCString()}`;
  }
  
  if (opts.path) {
    cookieString += `; path=${opts.path}`;
  }
  
  if (opts.secure) {
    cookieString += '; secure';
  }
  
  if (opts.sameSite) {
    cookieString += `; samesite=${opts.sameSite}`;
  }
  
  document.cookie = cookieString;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  
  return null;
}

/**
 * Remove a cookie by name
 */
export function removeCookie(name: string, path: string = '/'): void {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
}

/**
 * Set a JSON object as a cookie
 */
export function setCookieJSON<T>(name: string, value: T, options?: CookieOptions): void {
  setCookie(name, JSON.stringify(value), options);
}

/**
 * Get a JSON object from a cookie
 */
export function getCookieJSON<T>(name: string): T | null {
  const value = getCookie(name);
  if (!value) return null;
  
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

// Cookie names for auth
export const AUTH_COOKIES = {
  USER: 'portal_user',
  TOKEN: 'portal_token',
  TEMP_TOKEN: 'portal_temp_token',
  LOGIN_SCHOOLS: 'portal_login_schools',
  SELECTED_SCHOOL: 'portal_selected_school',
  PERMISSIONS: 'portal_permissions',
  CURRENT_SCHOOL_ID: 'seed_current_school',
} as const;

/**
 * Clear all auth-related cookies
 */
export function clearAuthCookies(): void {
  Object.values(AUTH_COOKIES).forEach(name => removeCookie(name));
}
