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
    await initContentSdk({
      config: {
        contextId: this.config.contextId,
        edgeUrl: this.config.edgeUrl,
        siteName,
      },
      plugins: [
        analyticsPlugin({
          options: {
            enableCookie: true,
            cookieDomain: hostname,
          },
          adapter: analyticsProxyAdapter(request, response),
        }),
        personalizeServerPlugin({
          options: {
            enablePersonalizeCookie: false,
          },
          adapter: personalizeProxyAdapter(request, response),
        }),
      ],
    });
  }
}

export default ExtendedPersonalizeProxy;
