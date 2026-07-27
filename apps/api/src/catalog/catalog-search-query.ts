/**
 * Builds a safe PostgreSQL prefix tsquery string from user input.
 * Example: "роул" → "роул:*"; "гарри поттер" → "гарри:* & поттер:*"
 *
 * Tokens keep Unicode letters/digits only so to_tsquery operators (& | ! : *)
 * cannot be injected from the query string.
 */
export function buildPrefixTsQuery(raw: string): string | null {
  const tokens = raw
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter((token) => token.length > 0);

  if (tokens.length === 0) {
    return null;
  }

  return tokens.map((token) => `${token}:*`).join(' & ');
}
