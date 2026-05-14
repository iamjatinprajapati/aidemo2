import { analyticsPlugin } from "@sitecore-content-sdk/analytics-core";
import {
  analyticsProxyAdapter,
  initContentSdk,
  personalizeProxyAdapter,
} from "@sitecore-content-sdk/nextjs";
import {
  PersonalizeProxy,
  PersonalizeProxyConfig,
} from "@sitecore-content-sdk/nextjs/proxy";
import { personalizeServerPlugin } from "@sitecore-content-sdk/personalize";
import { NextRequest, NextResponse } from "next/server";
import {
  CONSENT_COOKIE_NAME,
  parseConsentCookie,
} from "lib/cookie-consent";

class ExtendedPersonalizeProxy extends PersonalizeProxy {
  constructor(config: PersonalizeProxyConfig) {
    super(config);
  }

  protected async initPersonalizeServer({
    hostname,
    siteName,
    request,
    response,
  }: {
    hostname: string;
    siteName: string;
    request: NextRequest;
    response: NextResponse;
  }): Promise<void> {
    const hasMarketingConsent = this.readMarketingConsent(request);

    await initContentSdk({
      config: {
        contextId: this.config.contextId,
        edgeUrl: this.config.edgeUrl,
        siteName,
      },
      plugins: [
        analyticsPlugin({
          options: {
            // Only set analytics cookies when the user has consented to marketing cookies
            enableCookie: hasMarketingConsent,
            cookieDomain: hostname,
          },
          adapter: analyticsProxyAdapter(request, response),
        }),
        // Personalization requires marketing consent — skip entirely when not granted
        ...(hasMarketingConsent
          ? [
              personalizeServerPlugin({
                options: {
                  enablePersonalizeCookie: false,
                },
                adapter: personalizeProxyAdapter(request, response),
              }),
            ]
          : []),
      ],
    });
  }

  /** Reads and parses the consent cookie from the incoming request. */
  private readMarketingConsent(request: NextRequest): boolean {
    const raw = request.cookies.get(CONSENT_COOKIE_NAME)?.value;
    return parseConsentCookie(raw)?.marketing === true;
  }
}

export default ExtendedPersonalizeProxy;
