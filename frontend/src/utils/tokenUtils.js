/**
 * tokenUtils.js
 * Centralized JWT helpers.
 * Decodes payload client-side (no signature verification).
 *
 * No circular imports: this file does NOT import from useAuth.
 * It reads localStorage directly using the same TOKEN_KEY constant.
 */

// Must match the key in useAuth.js
export const TOKEN_KEY = 'streaks_token';

/**
 * Read the raw token string from localStorage.
 * Safe to call during SSR (returns null).
 */
export function getRawToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Decode the JWT payload without verifying the signature.
 * Returns null if the token is missing or malformed.
 */
export function decodeTokenPayload(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

/**
 * Returns true if the token exists and has not yet expired.
 * Uses a 10-second clock-skew buffer.
 */
export function isTokenValid(token) {
  const payload = decodeTokenPayload(token);
  if (!payload) return false;
  if (!payload.exp) return true; // no expiry claim — assume valid
  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp > nowSeconds + 10;
}

/**
 * Read the token from localStorage and validate it.
 * Returns the token string if valid, null otherwise.
 */
export function getValidToken() {
  const token = getRawToken();
  if (!token) return null;
  return isTokenValid(token) ? token : null;
}

/**
 * Event name dispatched when a 401/403 is received or the token is expired.
 * Providers.jsx listens for this to show a toast and redirect to /auth.
 */
export const SESSION_EXPIRED_EVENT = 'streakz:session-expired';

/**
 * Dispatch the session-expired event.
 * The Providers component handles clearing the token and redirecting.
 */
export function handleSessionExpired() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
}
