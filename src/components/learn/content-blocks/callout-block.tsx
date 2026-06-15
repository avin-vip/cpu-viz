import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ConceptLinkPopover } from "@/components/learn/concept-link";
import { replaceConceptLinks } from "@/lib/content/resolve-blocks";
import { cn } from "@/lib/utils/cn";
import type { ResolvedCalloutBlockData } from "@/types/content";

export interface CalloutBlockProps {
  data: ResolvedCalloutBlockData;
  conceptDefinitions?: Record<string, string>;
}

const variantStyles = {
  info: "border-primary/40 bg-primary/5",
  warning: "border-amber-500/40 bg-amber-500/5",
  tip: "border-emerald-500/40 bg-emerald-500/5",
} as const;

const variantLabels = {
  info: "Info",
  warning: "Warning",
  tip: "Tip",
} as const;

export function CalloutBlock({ data, conceptDefinitions }: CalloutBlockProps) {
  const markdown = replaceConceptLinks(data.markdown, data.conceptLinks);
  const conceptMap = new Map(data.conceptLinks.map((link) => [link.href, link]));

  return (
    <aside
      className={cn(
        "rounded-lg border-l-4 p-4",
        variantStyles[data.variant],
      )}
    >
      <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {variantLabels[data.variant]}
      </p>
      <div className="prose-cpu text-sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children }) => {
              if (href?.startsWith("/concepts/")) {
                const concept = conceptMap.get(href);
                if (concept) {
                  return (
                    <ConceptLinkPopover
                      concept={concept}
                      definition={conceptDefinitions?.[concept.slug]}
                    />
                  );
                }
              }

              return (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              );
            },
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </aside>
  );
}
