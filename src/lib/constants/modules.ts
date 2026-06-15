export interface ModuleMeta {
  slug: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  published: boolean;
}

export const MODULES = {
  fundamentals: {
    slug: "fundamentals",
    title: "Semiconductor Fundamentals",
    description:
      "Transistors, logic gates, Moore's Law, and the building blocks of modern chips.",
    icon: "cpu",
    order: 1,
    published: true,
  },
  cpu: {
    slug: "cpu",
    title: "CPU Architecture",
    description:
      "Instruction pipelines, caches, branch prediction, and how processors execute code.",
    icon: "pipeline",
    order: 2,
    published: true,
  },
  memory: {
    slug: "memory",
    title: "Memory Systems",
    description:
      "SRAM, DRAM, cache hierarchies, and the bandwidth-latency tradeoff.",
    icon: "layers",
    order: 3,
    published: false,
  },
  gpu: {
    slug: "gpu",
    title: "GPU Architecture",
    description:
      "SIMT execution, streaming multiprocessors, warps, and parallel compute.",
    icon: "grid",
    order: 4,
    published: false,
  },
  manufacturing: {
    slug: "manufacturing",
    title: "Semiconductor Manufacturing",
    description:
      "Fab flow from design to packaging — lithography, etch, yield, and process nodes.",
    icon: "factory",
    order: 5,
    published: false,
  },
  "hbm-ai": {
    slug: "hbm-ai",
    title: "HBM & AI Infrastructure",
    description:
      "High Bandwidth Memory, advanced packaging, and AI accelerator clusters.",
    icon: "brain",
    order: 6,
    published: false,
  },
  "supply-chain": {
    slug: "supply-chain",
    title: "Supply Chain",
    description:
      "Fabless, foundry, EDA, and equipment — who depends on whom in the industry.",
    icon: "network",
    order: 7,
    published: true,
  },
  companies: {
    slug: "companies",
    title: "Company Profiles",
    description:
      "Deep dives into key semiconductor companies and their dependencies.",
    icon: "building",
    order: 8,
    published: false,
  },
} as const satisfies Record<string, ModuleMeta>;

export type ModuleSlug = keyof typeof MODULES;

export const MODULE_LIST: ModuleMeta[] = Object.values(MODULES).sort(
  (a, b) => a.order - b.order,
);

export function getModuleMeta(slug: string): ModuleMeta | undefined {
  return MODULE_LIST.find((module) => module.slug === slug);
}
