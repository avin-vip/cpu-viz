export const siteConfig = {
  name: "Semiconductor Dependency Explorer",
  description:
    "Interactive map of semiconductor companies, technologies, products, and end markets — built for finance analysts tracing AI supply chain risk.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    github: "https://github.com/innovestx/cpu-viz",
  },
} as const;

export type SiteConfig = typeof siteConfig;
