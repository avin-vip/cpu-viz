import Image from "next/image";

import type { DiagramBlockData } from "@/types/content";

export interface DiagramBlockProps {
  data: DiagramBlockData;
}

export function DiagramBlock({ data }: DiagramBlockProps) {
  return (
    <figure className="my-8">
      <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
        <Image
          src={data.src}
          alt={data.alt}
          width={800}
          height={450}
          className="h-auto w-full"
        />
      </div>
      {data.caption && (
        <figcaption className="mt-3 text-center text-sm text-muted-foreground">
          {data.caption}
        </figcaption>
      )}
    </figure>
  );
}
