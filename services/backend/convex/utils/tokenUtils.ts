/**
 * Utility functions for generating and validating secure access tokens.
 * Used for anonymous access to review forms via secret links.
 */

/**
 * Generates a cryptographically secure random token.
 * Uses base64url encoding for URL-safe tokens.
 *
 * @param length - Number of random bytes (default: 32, resulting in ~43 char token)
 * @returns A URL-safe random token string
 */
export function generateSecureToken(length = 32): string {
  // Generate random bytes
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  // Convert to base64url (URL-safe base64)
  const base64 = btoa(String.fromCharCode(...array));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Validates token format (basic check for length and characters).
 * Does NOT check if token exists in database.
 *
 * @param token - Token string to validate
 * @returns True if token format is valid
 */
export function isValidTokenFormat(token: string): boolean {
  // Must be at least 32 characters
  if (token.length < 32) return false;

  // Must only contain base64url characters
  const base64urlRegex = /^[A-Za-z0-9_-]+$/;
  return base64urlRegex.test(token);
}

/**
 * Checks if a token has expired.
 *
 * @param expiresAt - Token expiry timestamp (null means never expires)
 * @returns True if token has expired
 */
export function isTokenExpired(expiresAt: number | null): boolean {
  if (expiresAt === null) return false;
  return Date.now() > expiresAt;
}

/**
 * Generates a token expiry timestamp.
 *
 * @param daysFromNow - Number of days until expiry (default: 90 days)
 * @returns Timestamp in milliseconds
 */
export function generateTokenExpiry(daysFromNow = 90): number {
  return Date.now() + daysFromNow * 24 * 60 * 60 * 1000;
}
