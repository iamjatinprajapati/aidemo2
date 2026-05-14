/** Cookie name used to store the user's consent preferences. */
export const CONSENT_COOKIE_NAME = "cookie_consent";

/** Custom event name dispatched on window when preferences are saved. */
export const CONSENT_EVENT_NAME = "cookie-consent-updated";

export interface ConsentPreferences {
  /** Strictly necessary cookies — always true, cannot be opted out */
  strict: true;
  /** Marketing & analytics cookies — user-controlled */
  marketing: boolean;
}

/**
 * Parses a raw cookie value (URL-encoded JSON) into ConsentPreferences.
 * Returns null if the value is absent, malformed, or invalid.
 */
export function parseConsentCookie(raw: string | undefined): ConsentPreferences | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (typeof parsed?.marketing === "boolean") {
      return parsed as ConsentPreferences;
    }
    return null;
  } catch {
    return null;
  }
}
