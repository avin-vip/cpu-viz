export default function GraphLoading() {
  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex h-12 animate-pulse items-center justify-between rounded-t-lg border border-b-0 border-border bg-muted/30 px-4">
        <div className="h-4 w-40 rounded bg-muted" />
        <div className="h-3 w-32 rounded bg-muted" />
      </div>
      <div className="flex flex-1 animate-pulse items-center justify-center rounded-b-lg border border-border bg-muted/20">
        <div className="h-4 w-48 rounded bg-muted" />
      </div>
    </div>
  );
}
