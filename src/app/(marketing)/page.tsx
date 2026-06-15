import Link from "next/link";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

const EXAMPLE_NODES = [
  "NVIDIA",
  "TSMC",
  "ASML",
  "SK Hynix",
  "HBM3E",
  "CoWoS",
  "EUV",
  "B200",
  "AI Training",
  "Data Centers",
];

const SCENARIOS = [
  "AI Demand Surge",
  "HBM Shortage",
  "EUV Equipment Delays",
  "CoWoS Capacity Expansion",
];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <p className="text-sm font-medium tracking-widest text-primary uppercase">
            Semiconductor Intelligence
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Map semiconductor dependencies for investment decisions
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            {siteConfig.description}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/graph">Open dependency explorer</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              What you can explore
            </h2>
            <ul className="mt-6 space-y-3 text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">→</span>
                Interactive graph of companies, technologies, products, and
                end markets
              </li>
              <li className="flex gap-2">
                <span className="text-primary">→</span>
                Search and inspect node details with upstream/downstream links
              </li>
              <li className="flex gap-2">
                <span className="text-primary">→</span>
                Trace dependency chains across the AI semiconductor stack
              </li>
              <li className="flex gap-2">
                <span className="text-primary">→</span>
                Run scenario simulations for supply chain stress events
              </li>
            </ul>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Example nodes
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {EXAMPLE_NODES.map((name) => (
                  <span
                    key={name}
                    className="rounded-full border border-border bg-card px-3 py-1 text-sm text-foreground"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Example scenarios
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {SCENARIOS.map((name) => (
                  <span
                    key={name}
                    className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-sm text-foreground"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
