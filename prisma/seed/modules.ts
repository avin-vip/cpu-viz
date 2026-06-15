import type { PrismaClient } from "@prisma/client";

import { trackKey, type SeedContext } from "./utils";

type ModuleSeed = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  published: boolean;
  tracks: Array<{
    slug: string;
    title: string;
    description: string;
    order: number;
  }>;
};

const MODULES: ModuleSeed[] = [
  {
    slug: "fundamentals",
    title: "Semiconductor Fundamentals",
    description:
      "Build intuition from silicon crystals and transistors through logic gates and scaling laws — the physics and abstractions every chip story rests on.",
    icon: "atom",
    order: 0,
    published: true,
    tracks: [
      {
        slug: "foundations",
        title: "Foundations",
        description: "Silicon, transistors, and the building blocks of digital logic.",
        order: 0,
      },
      {
        slug: "scaling",
        title: "Scaling & Trends",
        description: "Moore's Law, process nodes, and why density still matters.",
        order: 1,
      },
    ],
  },
  {
    slug: "cpu",
    title: "CPU Architecture",
    description:
      "Follow instructions through fetch, decode, execute, and writeback — and see how caches, branches, and parallelism turn transistors into general-purpose compute.",
    icon: "cpu",
    order: 1,
    published: true,
    tracks: [
      {
        slug: "pipeline",
        title: "Instruction Pipeline",
        description: "Stage-by-stage flow from program counter to retired instructions.",
        order: 0,
      },
      {
        slug: "memory-subsystem",
        title: "Memory Subsystem",
        description: "Caches, TLBs, and the latency wall that shapes microarchitecture.",
        order: 1,
      },
    ],
  },
  {
    slug: "gpu",
    title: "GPU Architecture",
    description:
      "Explore SIMT execution, streaming multiprocessors, and why graphics hardware became the engine of modern AI workloads.",
    icon: "gpu",
    order: 2,
    published: false,
    tracks: [
      {
        slug: "architecture",
        title: "GPU Architecture",
        description: "Warps, SMs, and the throughput-oriented design philosophy.",
        order: 0,
      },
      {
        slug: "programming-model",
        title: "Programming Model",
        description: "Kernels, occupancy, and memory coalescing fundamentals.",
        order: 1,
      },
    ],
  },
  {
    slug: "memory",
    title: "Memory Hierarchy",
    description:
      "From register files to DRAM — bandwidth, latency, and the trade-offs that define system performance.",
    icon: "memory",
    order: 3,
    published: false,
    tracks: [
      {
        slug: "hierarchy",
        title: "Cache Hierarchy",
        description: "L1/L2/L3, inclusivity, and coherence at a conceptual level.",
        order: 0,
      },
      {
        slug: "dram",
        title: "DRAM & Interfaces",
        description: "Rows, banks, channels, and why memory is never 'just storage'.",
        order: 1,
      },
    ],
  },
  {
    slug: "hbm-ai",
    title: "HBM & AI Infrastructure",
    description:
      "High-bandwidth memory stacks, accelerator clusters, and the data-movement constraints behind large-model training and inference.",
    icon: "chip",
    order: 4,
    published: false,
    tracks: [
      {
        slug: "hbm",
        title: "High Bandwidth Memory",
        description: "2.5D stacking, interposers, and bandwidth-per-watt economics.",
        order: 0,
      },
      {
        slug: "ai-infra",
        title: "AI Infrastructure",
        description: "GPU clusters, interconnects, and scaling laws for datacenter AI.",
        order: 1,
      },
    ],
  },
  {
    slug: "manufacturing",
    title: "Semiconductor Manufacturing",
    description:
      "Walk the fab — lithography, deposition, etch, and packaging — to understand yield, nodes, and why leading-edge capacity is scarce.",
    icon: "factory",
    order: 5,
    published: false,
    tracks: [
      {
        slug: "fab-process",
        title: "Fabrication Flow",
        description: "Front-end-of-line steps from wafer start to patterned silicon.",
        order: 0,
      },
      {
        slug: "packaging",
        title: "Advanced Packaging",
        description: "Chiplets, interposers, and heterogeneous integration.",
        order: 1,
      },
    ],
  },
  {
    slug: "supply-chain",
    title: "Global Supply Chain",
    description:
      "Map the ecosystem of foundries, equipment makers, EDA vendors, and fabless designers — and how dependencies ripple through the industry.",
    icon: "network",
    order: 6,
    published: true,
    tracks: [
      {
        slug: "ecosystem",
        title: "Industry Ecosystem",
        description: "Who builds what, and how value flows across the stack.",
        order: 0,
      },
      {
        slug: "geopolitics",
        title: "Geopolitics & Risk",
        description: "Concentration risk, export controls, and regional fab strategies.",
        order: 1,
      },
    ],
  },
  {
    slug: "companies",
    title: "Company Profiles",
    description:
      "Deep dives on the firms shaping semiconductors — business models, flagship products, and strategic positioning.",
    icon: "building",
    order: 7,
    published: false,
    tracks: [
      {
        slug: "profiles",
        title: "Key Players",
        description: "Foundries, fabless leaders, equipment giants, and IP licensors.",
        order: 0,
      },
    ],
  },
];

export async function seedModules(prisma: PrismaClient): Promise<SeedContext> {
  const modules: Record<string, string> = {};
  const tracks: Record<string, string> = {};

  for (const mod of MODULES) {
    const moduleRecord = await prisma.module.upsert({
      where: { slug: mod.slug },
      create: {
        slug: mod.slug,
        title: mod.title,
        description: mod.description,
        icon: mod.icon,
        order: mod.order,
        published: mod.published,
      },
      update: {
        title: mod.title,
        description: mod.description,
        icon: mod.icon,
        order: mod.order,
        published: mod.published,
      },
    });

    modules[mod.slug] = moduleRecord.id;

    for (const track of mod.tracks) {
      const trackRecord = await prisma.track.upsert({
        where: {
          moduleId_slug: {
            moduleId: moduleRecord.id,
            slug: track.slug,
          },
        },
        create: {
          slug: track.slug,
          title: track.title,
          description: track.description,
          order: track.order,
          moduleId: moduleRecord.id,
        },
        update: {
          title: track.title,
          description: track.description,
          order: track.order,
        },
      });

      tracks[trackKey(mod.slug, track.slug)] = trackRecord.id;
    }
  }

  return { modules, tracks, concepts: {}, companies: {} };
}
