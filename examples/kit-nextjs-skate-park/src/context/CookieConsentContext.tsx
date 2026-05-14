"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import {
  CONSENT_COOKIE_NAME,
  CONSENT_EVENT_NAME,
  parseConsentCookie,
} from "lib/cookie-consent";
import type { ConsentPreferences } from "lib/cookie-consent";
export type { ConsentPreferences } from "lib/cookie-consent";
export { CONSENT_COOKIE_NAME, CONSENT_EVENT_NAME };

interface CookieConsentContextValue {
  /** Current saved preferences, null if user has not yet consented */
  preferences: ConsentPreferences | null;
  /** True once the user has made any consent choice */
  hasConsented: boolean;
  /** Save consent with a specific marketing choice and fire the consent event */
  saveConsent: (marketing: boolean) => void;
  acceptAll: () => void;
  rejectOptional: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null,
);

function readConsentCookie(): ConsentPreferences | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CONSENT_COOKIE_NAME}=([^;]*)`),
  );
  return parseConsentCookie(match?.[1]);
}

function writeConsentCookie(prefs: ConsentPreferences): void {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = [
    `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(prefs))}`,
    `expires=${expires.toUTCString()}`,
    "path=/",
    "SameSite=Lax",
  ].join("; ");
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(
    null,
  );

  useEffect(() => {
    setPreferences(readConsentCookie());
  }, []);

  const saveConsent = useCallback((marketing: boolean) => {
    const prefs: ConsentPreferences = { strict: true, marketing };
    writeConsentCookie(prefs);
    setPreferences(prefs);
    window.dispatchEvent(
      new CustomEvent<ConsentPreferences>(CONSENT_EVENT_NAME, {
        detail: prefs,
      }),
    );
    // Reload so the server-side personalize proxy picks up the new consent cookie
    window.location.reload();
  }, []);

  const acceptAll = useCallback(() => saveConsent(true), [saveConsent]);
  const rejectOptional = useCallback(() => saveConsent(false), [saveConsent]);

  return (
    <CookieConsentContext.Provider
      value={{
        preferences,
        hasConsented: preferences !== null,
        saveConsent,
        acceptAll,
        rejectOptional,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext);
  if (!ctx)
    throw new Error(
      "useCookieConsent must be used within CookieConsentProvider",
    );
  return ctx;
}
