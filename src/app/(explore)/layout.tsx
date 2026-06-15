import Link from "next/link";

import { exploreNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <Link
          href="/"
          className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
        >
          {siteConfig.name}
        </Link>

        <nav className="flex items-center gap-1">
          {exploreNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors",
                "hover:bg-accent hover:text-foreground",
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </header>

      <main className="min-h-0 flex-1">{children}</main>
    </div>
  );
}
