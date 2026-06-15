import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { LearnSidebar } from "@/components/layout/learn-sidebar";
import { getAllModules } from "@/lib/content/get-module";

export const dynamic = "force-dynamic";

export default async function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const modules = await getAllModules();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex flex-1">
        <LearnSidebar modules={modules} />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </div>
    </div>
  );
}
