"use client";
import { useEffect, useRef, JSX } from "react";
import { initContentSdk } from "@sitecore-content-sdk/nextjs";
import {
  event,
  EventsPlugin,
  eventsPlugin,
} from "@sitecore-content-sdk/events";
import {
  analyticsBrowserAdapter,
  analyticsPlugin,
} from "@sitecore-content-sdk/analytics-core";
import config from "sitecore.config";
import { getCoreContext } from "@sitecore-content-sdk/core";
import {
  useCookieConsent,
  CONSENT_EVENT_NAME,
} from "context/CookieConsentContext";
import type { ConsentPreferences } from "context/CookieConsentContext";
import {
  personalizeBrowserAdapter,
  personalizeBrowserPlugin,
} from "@sitecore-content-sdk/personalize";
import { getDemandbaseData } from "./app/actions";

const Bootstrap = ({
  siteName,
  isPreviewMode,
}: {
  siteName: string;
  isPreviewMode: boolean;
}): JSX.Element | null => {
  const { preferences } = useCookieConsent();
  const initialized = useRef(false);

  const initSdk = async () => {
    if (initialized.current) return;
    if (process.env.NODE_ENV === "development") {
      console.debug(
        "Browser Events SDK is not initialized in development environment",
      );
      return;
    }
    if (isPreviewMode) {
      console.debug(
        "Browser Events SDK is not initialized in edit and preview modes",
      );
      return;
    }
    if (!config.api.edge?.clientContextId) {
      console.error("Client Edge API settings missing from configuration");
      return;
    }

    const marketing = preferences?.marketing ?? false;

    initialized.current = true;
    initContentSdk({
      config: {
        contextId: config.api.edge.clientContextId,
        edgeUrl: config.api.edge.edgeUrl,
        siteName: siteName || config.defaultSite,
      },
      plugins: [
        analyticsPlugin({
          options: {
            enableCookie: true,
            cookieDomain: window.location.hostname.replace(/^www\./, ""),
          },
          adapter: analyticsBrowserAdapter(),
        }),
        eventsPlugin(),
        // Personalization requires marketing consent
        ...(marketing
          ? [
              // personalizeBrowserPlugin({
              //   options: { enablePersonalizeCookie: true },
              //   adapter: personalizeBrowserAdapter(),
              // }),
            ]
          : []),
      ],
    });

    const plugin = getCoreContext().plugins.get("EventsPlugin") as
      | EventsPlugin
      | undefined;
    if (plugin) {
      console.log("events plugin is available in bootstrap");
      event({
        type: "demandbase_data",
        channel: "web",
        extensionData: {
          company: "horizontal",
          industry: "IT",
          audience: "B2B",
          audience_segment: "Tech Buyers",
          annual_sales: "10M-50M",
        },
      });
    }
  };

  // Initialize once marketing consent is granted (either on mount or after consent saved)
  useEffect(() => {
    if (preferences?.marketing) {
      initSdk();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences]);

  // Also listen to the custom event so consent given after initial render triggers init
  useEffect(() => {
    const handler = (e: Event) => {
      const { marketing } = (e as CustomEvent<ConsentPreferences>).detail;
      if (marketing) initSdk();
    };
    window.addEventListener(CONSENT_EVENT_NAME, handler);
    return () => window.removeEventListener(CONSENT_EVENT_NAME, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default Bootstrap;
