"use client";

import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";
import type { ConceptLink } from "@/types/content";

export interface ConceptLinkProps {
  concept: ConceptLink;
  definition?: string;
  className?: string;
}

export function ConceptLinkPopover({
  concept,
  definition,
  className,
}: ConceptLinkProps) {
  const [open, setOpen] = useState(false);
  const popoverId = useId();
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <span ref={containerRef} className={cn("relative inline", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={popoverId}
        className="cursor-help border-b border-dotted border-primary/60 font-medium text-primary transition-colors hover:border-primary hover:text-primary/80"
        onClick={() => setOpen((value) => !value)}
      >
        {concept.term}
      </button>

      {open && (
        <span
          id={popoverId}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 rounded-lg border border-border bg-card p-4 shadow-xl shadow-black/40"
        >
          <span className="block text-sm font-semibold text-foreground">
            {concept.term}
          </span>
          <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
            {definition ??
              "A key semiconductor concept. Full glossary entries are coming soon."}
          </span>
          <a
            href={concept.href}
            className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
          >
            Learn more →
          </a>
          <span
            aria-hidden
            className="absolute top-full left-1/2 -mt-px h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-border bg-card"
          />
        </span>
      )}
    </span>
  );
}
