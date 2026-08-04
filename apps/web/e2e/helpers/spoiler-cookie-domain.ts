/**
 * Canonical Playwright base URL (see apps/web/playwright.config.ts).
 * Prefer localhost; 127.0.0.1 also works when BASE_URL overrides it —
 * cookie domain must match the page hostname in either case.
 */
export const CANONICAL_E2E_BASE_URL = 'http://localhost:3000';

/**
 * Domain for Playwright addCookies(spoilers_ok).
 * Prefer page URL hostname; when the page is still about:blank
 * (cookie set before goto), use fallbackBaseUrl (BASE_URL).
 */
export function resolveSpoilerCookieDomain(
  pageUrl: string,
  fallbackBaseUrl: string,
): string {
  if (pageUrl && pageUrl !== 'about:blank') {
    try {
      return new URL(pageUrl).hostname;
    } catch {
      /* fall through to BASE_URL */
    }
  }
  return new URL(fallbackBaseUrl).hostname;
}
