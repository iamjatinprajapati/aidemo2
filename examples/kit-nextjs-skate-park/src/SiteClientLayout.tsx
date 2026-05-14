'use client';
import type { ReactNode } from 'react';
import { CookieConsentProvider } from 'context/CookieConsentContext';
import { CookieConsent } from 'components/cookie-consent/CookieConsent';
import Bootstrap from './Bootstrap';

export default function SiteClientLayout({
  children,
  siteName,
  isPreviewMode,
}: {
  children: ReactNode;
  siteName: string;
  isPreviewMode: boolean;
}) {
  return (
    <CookieConsentProvider>
      <Bootstrap siteName={siteName} isPreviewMode={isPreviewMode} />
      <CookieConsent />
      {children}
    </CookieConsentProvider>
  );
}
