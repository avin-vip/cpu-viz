import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ConceptLinkPopover } from "@/components/learn/concept-link";
import { replaceConceptLinks } from "@/lib/content/resolve-blocks";
import type { ResolvedTextBlockData } from "@/types/content";

export interface TextBlockProps {
  data: ResolvedTextBlockData;
  conceptDefinitions?: Record<string, string>;
}

export function TextBlock({ data, conceptDefinitions }: TextBlockProps) {
  const markdown = replaceConceptLinks(data.markdown, data.conceptLinks);
  const conceptMap = new Map(data.conceptLinks.map((link) => [link.href, link]));

  return (
    <div className="prose-cpu">
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
  );
}
