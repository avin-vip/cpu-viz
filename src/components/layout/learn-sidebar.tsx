"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { learnNav } from "@/config/navigation";
import { MODULES } from "@/lib/constants/modules";
import { cn } from "@/lib/utils/cn";
import type { ModuleWithTracks } from "@/types/content";

export interface LearnSidebarProps {
  modules: ModuleWithTracks[];
}

export function LearnSidebar({ modules }: LearnSidebarProps) {
  const pathname = usePathname();

  const activeModuleSlug = modules.find((module) =>
    pathname.startsWith(`/${module.slug}`),
  )?.slug;

  const activeModule = modules.find((module) => module.slug === activeModuleSlug);

  return (
    <aside className="hidden w-72 shrink-0 border-r border-border bg-muted/20 lg:block">
      <div className="sticky top-14 flex h-[calc(100vh-3.5rem)] flex-col overflow-y-auto p-4">
        <p className="mb-3 px-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Learning Path
        </p>

        <nav className="space-y-1">
          {learnNav.map((item) => {
            const meta = MODULES[item.href.slice(1) as keyof typeof MODULES];
            const isPublished = meta?.published ?? false;
            const isActive = activeModuleSlug === item.href.slice(1);
            const lessonCount = modules
              .find((module) => `/${module.slug}` === item.href)
              ?.tracks.reduce((count, track) => count + track.lessons.length, 0);

            if (!isPublished) {
              return (
                <div
                  key={item.href}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground/50"
                  title="Coming soon"
                >
                  <span>{item.title}</span>
                  <span className="text-xs">Soon</span>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <span>{item.title}</span>
                {lessonCount !== undefined && lessonCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {lessonCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {activeModule && (
          <div className="mt-6 border-t border-border pt-4">
            <p className="mb-3 px-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {activeModule.title}
            </p>
            <div className="space-y-4">
              {activeModule.tracks.map((track) => (
                <div key={track.id}>
                  <p className="mb-1 px-2 text-xs font-medium text-muted-foreground">
                    {track.title}
                  </p>
                  <ul className="space-y-0.5">
                    {track.lessons.map((lesson) => {
                      const href = `/${activeModule.slug}/${lesson.slug}`;
                      const isLessonActive = pathname === href;

                      return (
                        <li key={lesson.id}>
                          <Link
                            href={href}
                            className={cn(
                              "block rounded-md px-3 py-1.5 text-sm transition-colors",
                              isLessonActive
                                ? "bg-accent font-medium text-foreground"
                                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                            )}
                          >
                            {lesson.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
