import { draftMode } from "next/headers";
import SiteClientLayout from "src/SiteClientLayout";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ site: string }>;
}) {
  const { site } = await params;
  const { isEnabled } = await draftMode();

  return (
    <SiteClientLayout siteName={site} isPreviewMode={isEnabled}>
      {children}
    </SiteClientLayout>
  );
}
