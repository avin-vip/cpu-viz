"use client";

import { useReactFlow } from "@xyflow/react";
import { useEffect, useRef } from "react";

interface UseFitViewOptions {
  enabled?: boolean;
  padding?: number;
  deps?: unknown[];
}

export function useFitView({
  enabled = true,
  padding = 0.2,
  deps = [],
}: UseFitViewOptions = {}): void {
  const { fitView } = useReactFlow();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      fitView({ padding, duration: hasFitted.current ? 300 : 0 });
      hasFitted.current = true;
    });

    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps intentionally controlled by caller
  }, [enabled, fitView, padding, ...deps]);
}
