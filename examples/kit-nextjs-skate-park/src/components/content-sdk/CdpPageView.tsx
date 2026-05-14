'use client';
import { useEffect, JSX } from 'react';
import { CdpHelper, useSitecore } from '@sitecore-content-sdk/nextjs';
import { pageView } from '@sitecore-content-sdk/events';
import config from 'sitecore.config';
import { useCookieConsent } from 'context/CookieConsentContext';

/**
 * CDP page view component — fires page view events respecting cookie consent.
 * Marketing consent must be granted before events are sent.
 * https://www.npmjs.com/package/@sitecore-cloudsdk/events
 */
const CdpPageView = (): JSX.Element => {
  const {
    page: { layout, siteName, mode },
  } = useSitecore();
  const { route, context } = layout.sitecore;
  const { preferences } = useCookieConsent();

  const disabled = () => {
    if (process.env.NODE_ENV === 'development') return true;
    return !preferences?.marketing;
  };

  useEffect(() => {
    if (!mode.isNormal || !route?.itemId) return;
    if (disabled()) return;

    const language = route.itemLanguage || config.defaultLanguage;
    const scope = config.personalize?.scope;

    const pageVariantId = CdpHelper.getPageVariantId(
      route.itemId,
      language,
      context.variantId as string,
      scope
    );
    pageView({
      channel: 'WEB',
      currency: 'USD',
      page: route.name,
      pageVariantId,
      language,
    }).catch((e) => console.debug(e));
  // preferences is intentionally included so page views fire after consent is granted
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, route, context.variantId, siteName, preferences]);

  return <></>;
};

export default CdpPageView;
