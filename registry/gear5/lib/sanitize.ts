/**
 * Security primitive: neutralise the one class of URL that turns "render a
 * link" into "run arbitrary script" — `javascript:` and other executable
 * schemes reaching an `href`/`src` from data the app did not author itself
 * (a CMS field, a query param, a user's own profile link).
 */

const SAFE_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:", "sms:"]);

/**
 * Returns `url` unchanged if its scheme is safe to navigate to, or `"#"`
 * otherwise. Relative URLs (no scheme) are always safe and pass through.
 */
export function sanitizeHref(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "#";

  // Browsers discard tabs and newlines when parsing a URL scheme.
  const schemeProbe = trimmed.replace(/[\t\r\n]/g, "");
  if (!/^[a-z][a-z0-9+.-]*:/i.test(schemeProbe)) return trimmed;

  try {
    const scheme = new URL(trimmed, "https://example.com").protocol;
    return SAFE_SCHEMES.has(scheme) ? trimmed : "#";
  } catch {
    return "#";
  }
}
