import { event } from "@sitecore-content-sdk/events";
import { draftMode } from "next/headers";
import Bootstrap from "src/Bootstrap";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ site: string }>;
}) {
  const { site } = await params;
  const { isEnabled } = await draftMode();

  // demandbase
  const req = await fetch("https://api.company-target.com/api/v3/ip.json", {
    body: '{"src":"tag","auth":"SLi1tE4A4gR8IDq5rCfTkwKJvdKxrPtVOfEXp0yg"}',
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
  const body = await req.json();
  // console.log(body);
  // demandbase

  const eventData = {
    type: "demandbase",
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

  event(eventData);

  return (
    <>
      <Bootstrap siteName={site} isPreviewMode={isEnabled} />
      {children}
    </>
  );
}
