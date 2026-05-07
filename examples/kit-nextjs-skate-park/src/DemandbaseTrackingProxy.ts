import { analyticsPlugin } from "@sitecore-content-sdk/analytics-core";
import { event, eventsPlugin } from "@sitecore-content-sdk/events";
import {
  analyticsProxyAdapter,
  initContentSdk,
} from "@sitecore-content-sdk/nextjs";
import { SitecoreConfig } from "@sitecore-content-sdk/nextjs/config";
import { ProxyBase, ProxyBaseConfig } from "@sitecore-content-sdk/nextjs/proxy";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

export type DemandbaseTrackingProxyConfig = SitecoreConfig["api"]["edge"] &
  Omit<ProxyBaseConfig, "defaultLanguage"> & {
    fetchEvent?: NextFetchEvent;
  };

export class DemandbaseTrackingProxy extends ProxyBase {
  constructor(protected config: DemandbaseTrackingProxyConfig) {
    super(config);
  }

  handle = async (
    req: NextRequest,
    res: NextResponse,
  ): Promise<NextResponse> => {
    try {
      console.log("In DemandbaseTrackingProxy");
      const isDisabled =
        (this.config.skip && this.config.skip(req, res)) || false;
      if (isDisabled) {
        return res;
      }
      if (this.isPreview(req)) {
        return res;
      }

      const demandbaseTracking = async () => {
        await initContentSdk({
          config: {
            contextId: this.config.contextId,
            edgeUrl: this.config.edgeUrl,
            siteName: this.getSite(req, res).name,
          },
          plugins: [
            analyticsPlugin({
              options: {
                enableCookie: true,
              },
              adapter: analyticsProxyAdapter(req, res),
            }),
            eventsPlugin(),
          ],
        });
        const response = await fetch(
          "https://api.company-target.com/api/v3/ip.json",
          {
            body: '{"src":"tag","auth":"SLi1tE4A4gR8IDq5rCfTkwKJvdKxrPtVOfEXp0yg"}',
            method: "POST",
            mode: "cors",
            credentials: "include",
          },
        );
        const body = await response.json();

        const eventData = {
          type: "demandbase_server",
          channel: "web",
          extensionData: {
            access_type: body.access_type,
            company_name: body.company_name,
            company_status: body.company_status,
            company_id: body.company_id,
            city: body.city,
            audience: body.audience,
            business_structure: body.business_structure,
          },
        };
        console.log("Sending demandbase data to event system:", eventData);
        await event(eventData);
      };
      if (this.config.fetchEvent) {
        this.config.fetchEvent.waitUntil(demandbaseTracking());
      } else {
        await demandbaseTracking();
      }

      return res;
    } catch (error) {
      console.error(error);
      return res;
    }
  };
}
