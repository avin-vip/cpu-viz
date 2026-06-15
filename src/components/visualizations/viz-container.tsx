"use client";

import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils/cn";

export interface VizDimensions {
  width: number;
  height: number;
}

interface VizContainerProps {
  children: ReactNode | ((dimensions: VizDimensions) => ReactNode);
  className?: string;
  minHeight?: number;
  loading?: boolean;
  ariaLabel?: string;
  onError?: (error: Error) => void;
}

interface VizErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error) => void;
}

interface VizErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class VizErrorBoundary extends Component<
  VizErrorBoundaryProps,
  VizErrorBoundaryState
> {
  state: VizErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): VizErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Visualization render error:", error, info.componentStack);
    this.props.onError?.(error);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center"
          role="alert"
        >
          <p className="text-sm font-medium text-foreground">
            Unable to render visualization
          </p>
          <p className="max-w-sm text-xs text-muted-foreground">
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

function VizSkeleton({ minHeight }: { minHeight: number }) {
  return (
    <div
      className="animate-pulse rounded-lg border border-border bg-muted/40"
      style={{ minHeight }}
      aria-hidden
    >
      <div className="flex h-full flex-col gap-3 p-6">
        <div className="h-4 w-1/3 rounded bg-muted" />
        <div className="h-32 flex-1 rounded bg-muted/80" />
        <div className="flex gap-2">
          <div className="h-8 w-16 rounded bg-muted" />
          <div className="h-8 w-16 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function VizContainer({
  children,
  className,
  minHeight = 320,
  loading = false,
  ariaLabel = "Interactive visualization",
  onError,
}: VizContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<VizDimensions>({
    width: 0,
    height: minHeight,
  });

  const updateDimensions = useCallback(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const { width, height } = element.getBoundingClientRect();
    setDimensions({
      width: Math.floor(width),
      height: Math.max(Math.floor(height), minHeight),
    });
  }, [minHeight]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    updateDimensions();

    const observer = new ResizeObserver(() => {
      updateDimensions();
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [updateDimensions]);

  const content =
    typeof children === "function" ? children(dimensions) : children;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden rounded-lg border border-border bg-card",
        className,
      )}
      style={{ minHeight }}
      aria-label={ariaLabel}
      aria-busy={loading}
    >
      <div className="sr-only" aria-live="polite">
        {loading ? "Loading visualization" : "Visualization ready"}
      </div>

      {loading ? (
        <VizSkeleton minHeight={minHeight} />
      ) : (
        <VizErrorBoundary onError={onError}>{content}</VizErrorBoundary>
      )}
    </div>
  );
}
